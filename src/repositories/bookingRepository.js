const Booking = require('../models/booking')
const mongoose = require('mongoose');


const createBooking = async (bookingData) => {

    const booking = new Booking(bookingData);
    await booking.save();
    return booking;
}

const updateBookingStatus = async (bookingId, driverId) => {
  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      status: 'pending',   // 🔥 ATOMIC LOCK
    },
    {
      driver: driverId,
      status: 'confirmed',
    },
    {
      new: true,
    }
  );
};

module.exports = {
  updateBookingStatus,
  createBooking
};

