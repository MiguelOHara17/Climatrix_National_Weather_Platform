const router = require('express').Router();

const { Report, EVENT_TYPES } = require('../models');
const ml = require('../services/mlClient');
const {
  publishReport,
  PUBLIC_STATUSES,
} = require('../services/sseHub');

const DEFAULT_SOURCE_TRUST = 40;

function toPythonIso(date) {
  return date.toISOString().replace('Z', '');
}

router.post('/', async (req, res, next) => {
  try {
    const {
      eventType,
      description = '',
      location,
      eventDateTime,
      media = [],
    } = req.body || {};

    if (!EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid eventType' });
    }

    if (
      !location ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        error: 'location.coordinates must be [longitude, latitude]',
      });
    }

    const [longitude, latitude] = location.coordinates.map(Number);

    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      Math.abs(longitude) > 180 ||
      Math.abs(latitude) > 90
    ) {
      return res.status(400).json({
        error: 'Coordinates out of range',
      });
    }

    const reportTime = eventDateTime
      ? new Date(eventDateTime)
      : new Date();

    if (Number.isNaN(reportTime.getTime())) {
      return res.status(400).json({
        error: 'Invalid eventDateTime',
      });
    }

    const text = String(description).slice(0, 1000);

    const nearbyReports = await Report.find({
      eventType,
      status: { $ne: 'duplicate' },
      eventDateTime: {
        $gte: new Date(reportTime.getTime() - 3 * 60 * 60 * 1000),
        $lte: new Date(reportTime.getTime() + 3 * 60 * 60 * 1000),
      },
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: 5000,
        },
      },
    })
      .limit(20)
      .lean();

    const hasMedia = Array.isArray(media) && media.length > 0;

    const [classification, duplicateResult, fakeResult] =
      await Promise.all([
        ml.classifyEvent(text),
        nearbyReports.length
          ? ml.duplicateCheck({
              new_text: text,
              new_lon: longitude,
              new_lat: latitude,
              new_time: toPythonIso(reportTime),
              candidates: nearbyReports.map((report) => ({
                id: String(report._id),
                text: report.description || '',
                lon: report.location.coordinates[0],
                lat: report.location.coordinates[1],
                eventDateTime: toPythonIso(
                  new Date(report.eventDateTime)
                ),
              })),
            })
          : Promise.resolve(null),
        ml.fakeScore({
          text,
          hasMedia,
          sourceTrustScore: DEFAULT_SOURCE_TRUST,
        }),
      ]);

    const fakeProbability = fakeResult
      ? fakeResult.fakeProbability
      : null;

    const credibilityResult = await ml.credibility({
      sourceTrustScore: DEFAULT_SOURCE_TRUST,
      corroborationCount: nearbyReports.length,
      fakeProbability: fakeProbability ?? 50,
    });

    let status = 'pending';
    let duplicateOf = null;

    if (duplicateResult?.isDuplicate) {
      status = 'duplicate';
      duplicateOf = duplicateResult.matchId;
    } else if (
      credibilityResult &&
      ['auto_verified', 'flagged', 'pending'].includes(
        credibilityResult.suggestedStatus
      )
    ) {
      status = credibilityResult.suggestedStatus;
    }

    const report = await Report.create({
      eventType,
      description: text,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        city: location.city,
        state: location.state,
      },
      eventDateTime: reportTime,
      media: hasMedia ? media : [],
      status,
      duplicateOf,
      credibilityScore: credibilityResult
        ? credibilityResult.credibilityScore
        : 0,
      corroborationCount: nearbyReports.length,
      mlMeta: {
        fakeProbability,
        duplicateSimilarity: duplicateResult
          ? duplicateResult.similarity
          : null,
        autoClassifiedEventType: classification
          ? classification.eventType
          : null,
        processedAt: new Date(),
      },
    });

    if (duplicateOf) {
      await Report.updateOne(
        { _id: duplicateOf },
        { $inc: { corroborationCount: 1 } }
      );
    }

    publishReport('new_report', report);

    const output = report.toObject();
    delete output.mlMeta;

    return res.status(201).json({
      ...output,
      publiclyVisible: PUBLIC_STATUSES.includes(status),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;