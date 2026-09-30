const PUBLIC_STATUSES = ['verified', 'auto_verified'];

const clients = new Map();

function addClient(res, isAdmin) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  clients.set(id, {
    res,
    isAdmin,
  });

  return id;
}

function removeClient(id) {
  clients.delete(id);
}

function clientCount() {
  return clients.size;
}

function toPlainObject(report) {
  if (typeof report.toObject === 'function') {
    return report.toObject();
  }

  return { ...report };
}

function sanitizeForPublic(report) {
  const safeReport = { ...report };

  delete safeReport.mlMeta;
  delete safeReport.reportedBy;
  delete safeReport.duplicateOf;
  delete safeReport.__v;

  return safeReport;
}

function send(client, event, payload, id) {
  try {
    client.res.write(
      `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`
    );
  } catch {
    clients.delete(id);
  }
}

function publishReport(event, report) {
  const fullReport = toPlainObject(report);

  const isPublicReport = PUBLIC_STATUSES.includes(
    fullReport.status
  );

  for (const [id, client] of clients.entries()) {
    if (client.isAdmin) {
      send(client, event, fullReport, id);
      continue;
    }

    if (isPublicReport) {
      send(client, event, sanitizeForPublic(fullReport), id);
      continue;
    }

    if (event === 'report_updated') {
      send(client, 'report_removed', { _id: fullReport._id }, id);
    }
  }
}

module.exports = {
  PUBLIC_STATUSES,
  addClient,
  removeClient,
  clientCount,
  publishReport,
};
