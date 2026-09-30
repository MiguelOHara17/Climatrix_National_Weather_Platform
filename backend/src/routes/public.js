const router = require('express').Router();

const { Report } = require('../models');
const { PUBLIC_STATUSES } = require('../services/sseHub');
const {
  buildFilter,
  parseLimit,
} = require('../utils/filters');

const PUBLIC_HIDDEN_FIELDS =
  '-mlMeta -reportedBy -duplicateOf -__v';

router.get('/reports', async (req, res, next) => {
  try {
    const filter = {
      ...buildFilter(req.query),
      status: {
        $in: PUBLIC_STATUSES,
      },
    };

    const reports = await Report.find(filter)
      .sort({ eventDateTime: -1, _id: -1 })
      .limit(parseLimit(req.query.limit))
      .select(PUBLIC_HIDDEN_FIELDS)
      .lean();

    return res.json({
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/nearby', async (req, res, next) => {
  try {
    const longitude = Number.parseFloat(req.query.lon);
    const latitude = Number.parseFloat(req.query.lat);

    const radiusKm = Math.min(
      Number.parseFloat(req.query.radiusKm) || 25,
      500
    );

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return res.status(400).json({
        error: 'lon and lat are required numbers',
      });
    }

    const reports = await Report.find({
      status: {
        $in: PUBLIC_STATUSES,
      },
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusKm * 1000,
        },
      },
    })
      .limit(100)
      .select(PUBLIC_HIDDEN_FIELDS)
      .lean();

    return res.json({
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const match = {
      ...buildFilter(req.query),
      status: {
        $in: PUBLIC_STATUSES,
      },
    };

    const [byEvent, byState, total] = await Promise.all([
      Report.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
          },
        },
      ]),

      Report.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$location.state',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Report.countDocuments(match),
    ]);

    return res.json({
      total,
      byEvent,
      byState,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;