const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token },
      error: null,
    });
  } catch (error) {
    next(error); // ✅ this is why we need `next`
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: { user, token },
      error: null,
    });
  } catch (error) {
    next(error); // ✅
  }
};

module.exports = {
  register,
  login,
};
