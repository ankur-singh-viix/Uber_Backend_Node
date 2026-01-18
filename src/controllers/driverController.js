const driverService = require('../services/driverService');
const bookingService = require('../services/bookingService');
const locationService = require('../services/locationService');
const axios = require('axios');



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
    await driverService.updateLocation(req.user.id, { latitude, longitude });


    // 🎉 Success response
    res.status(200).json({
      success: true,
      error: null,
      message: 'Driver location updated successfully',
      data: {
        driverId: req.user.id,
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


const confirmBooking = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers allowed',
      });
    }

    const { bookingId } = req.body;
    const driverId = req.user._id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    const result = await bookingService.assignDriver(
      bookingId,
      driverId
    );

    if (!result.success) {
      return res.status(409).json({
        success: false,
        message: 'Ride already accepted by another driver',
      });
    }

    const booking = result.booking;

    console.log(`Driver ${driverId} confirmed booking ${bookingId}`);

    const notifiedDriverIds =
      await locationService.getNotifiedDrivers(bookingId);

    const otherDriverIds = notifiedDriverIds.filter(
      (id) => id.toString() !== driverId.toString()
    );

    try {
      await axios.post(
        'http://localhost:3001/api/v1/notifications/remove-ride-notification',
        {
          rideId: bookingId,
          driverIds: notifiedDriverIds,
        }
      );
    } catch (err) {
      console.error(
        'Error notifying WebSocket server:',
        err.message
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Ride confirmed',
      data: booking,
      error: null,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
      error: 'Internal Server Error',
    });
  }
};


module.exports = { updateLocation , confirmBooking };
