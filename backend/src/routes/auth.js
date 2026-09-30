const router = require('express').Router();
const bcrypt = require('bcryptjs');

const { User } = require('../models');
const { sign } = require('../middleware/auth');

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'email and password are required',
      });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase(),
    }).select('+passwordHash');

    const isValid =
      user &&
      !user.isBanned &&
      (await bcrypt.compare(String(password), user.passwordHash));

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    return res.json({
      token: sign(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;