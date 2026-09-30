const router = require('express').Router();
const mongoose = require('mongoose');

const {
  Report,
  AdminReview,
  User,
  REPORT_STATUSES,
} = require('../models');

const { requireRole } = require('../middleware/auth');
const { publishReport } = require('../services/sseHub');
const { buildFilter, parseLimit } = require('../utils/filters');

router.use(requireRole('admin', 'moderator'));

router.get('/reports', async (req, res, next) => {
  try {
    const filter = buildFilter(req.query);

    if (
      req.query.status &&
      REPORT_STATUSES.includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(parseLimit(req.query.limit))
      .populate('reportedBy', 'name email reputationScore')
      .populate('source', 'name trustScore isOfficial')
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
    const rows = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const byStatus = Object.fromEntries(
      REPORT_STATUSES.map((status) => [status, 0])
    );

    rows.forEach((row) => {
      byStatus[row._id] = row.count;
    });

    return res.json({
      total: Object.values(byStatus).reduce(
        (sum, value) => sum + value,
        0
      ),
      byStatus,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/reports/:id/review', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, reason, duplicateOf } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid report id' });
    }

    if (
      !['verified', 'rejected', 'flagged', 'duplicate'].includes(
        decision
      )
    ) {
      return res.status(400).json({ error: 'Invalid decision' });
    }

    if (
      decision === 'duplicate' &&
      (!mongoose.isValidObjectId(duplicateOf) ||
        String(duplicateOf) === id)
    ) {
      return res.status(400).json({
        error:
          'duplicateOf must be a valid different report id',
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const previousStatus = report.status;

    report.status = decision;
    report.duplicateOf =
      decision === 'duplicate' ? duplicateOf : null;

    await report.save();

    await AdminReview.create({
      report: report._id,
      reviewer: req.user.id,
      decision,
      reason,
      previousStatus,
    });

    if (
      decision === 'verified' &&
      previousStatus !== 'verified' &&
      report.reportedBy
    ) {
      await User.findByIdAndUpdate(report.reportedBy, {
        $inc: {
          reportsVerified: 1,
          reputationScore: 2,
        },
      });
    }

    publishReport('report_updated', report);

    return res.json(report);
  } catch (error) {
    next(error);
  }
});

module.exports = router;