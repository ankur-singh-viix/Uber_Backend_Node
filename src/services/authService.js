const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      issuer: process.env.JWT_ISSUER || 'uber-backend',
      audience: process.env.JWT_AUDIENCE || 'uber-clients',
    }
  );
}

async function register(userData) {
  // optional: check duplicate email here
  const user = await userRepo.create(userData);

  const token = signToken(user._id.toString());

  return {
    user,
    token,
  };
}

async function login(email, password) {
  const user = await userRepo.findByEmail(email);

  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = signToken(user._id.toString());

  return {
    user,
    token,
  };
}

module.exports = {
  register,
  login,
};
