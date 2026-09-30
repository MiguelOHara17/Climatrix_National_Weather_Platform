const jwt = require('jsonwebtoken');

function sign(user) {
  return jwt.sign(
    {
      id: String(user._id),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '12h',
    }
  );
}

function verify(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function requireRole(...roles) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ')
      ? header.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    try {
      const payload = verify(token);

      if (roles.length > 0 && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Insufficient role' });
      }

      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = {
  sign,
  verify,
  requireRole,
};