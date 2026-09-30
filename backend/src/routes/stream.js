const router = require('express').Router();

const { verify } = require('../middleware/auth');
const { addClient, removeClient } = require('../services/sseHub');

router.get('/', (req, res) => {
  let isAdmin = false;

  if (req.query.token) {
    try {
      const payload = verify(String(req.query.token));

      isAdmin = ['admin', 'moderator'].includes(payload.role);
    } catch {
      return res.status(401).json({
        error: 'Invalid token',
      });
    }
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.flushHeaders();

  const clientId = addClient(res, isAdmin);

  res.write(
    `event: connected\ndata: ${JSON.stringify({
      clientId,
      role: isAdmin ? 'admin' : 'public',
    })}\n\n`
  );

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(clientId);
  });
});

module.exports = router;