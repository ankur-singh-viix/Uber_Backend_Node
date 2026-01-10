const driverService = require('../services/driverService');

const updateLocation = async (req, res) => {
  try {
    // 🔐 Role check
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only drivers can update location',
      });
    }

    const { latitude, longitude } = req.body;

    // 🧪 Validation
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Latitude and longitude must be numbers',
      });
    }

    // ✅ CORRECT call (with await & correct args)
    await driverService.updateLocation(req.user._id, { latitude, longitude });


    // 🎉 Success response
    res.status(200).json({
      success: true,
      error: null,
      message: 'Driver location updated successfully',
      data: {
        driverId: req.user._id,
        latitude,
        longitude,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

module.exports = { updateLocation };
