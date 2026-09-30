const { EVENT_TYPES } = require('../models');

function buildFilter(query) {
  const filter = {};

  if (query.eventType && EVENT_TYPES.includes(query.eventType)) {
    filter.eventType = query.eventType;
  }

  if (query.state) {
    filter['location.state'] = String(query.state);
  }

  if (query.city) {
    filter['location.city'] = String(query.city);
  }

  const dateRange = {};

  if (query.from) {
    const fromDate = new Date(query.from);

    if (!Number.isNaN(fromDate.getTime())) {
      dateRange.$gte = fromDate;
    }
  }

  if (query.to) {
    const toDate = new Date(query.to);

    if (!Number.isNaN(toDate.getTime())) {
      dateRange.$lte = toDate;
    }
  }

  if (Object.keys(dateRange).length > 0) {
    filter.eventDateTime = dateRange;
  }

  return filter;
}

function parseLimit(value, defaultLimit = 100, maxLimit = 500) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultLimit;
  }

  return Math.min(parsed, maxLimit);
}

module.exports = {
  buildFilter,
  parseLimit,
};