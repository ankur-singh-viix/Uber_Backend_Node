const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      error: 'Unauthorized',
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(verified.id).select('_id email role');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'Unauthorized',
      });
    }

    // ✅ IMPORTANT FIX HERE
    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'Unauthorized',
    });
  }
};

module.exports = authMiddleware;
