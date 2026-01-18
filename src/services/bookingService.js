const bookingRepository = require('../repositories/bookingRepository');
const locationService = require('./locationService');
const {haversineDistance } = require('../utils/distance');

const BASIC_FARE = 50;
const RATE_PER_KM = 12;

const createBooking = async({passengerId, source, destination}) => {

    const distance = haversineDistance(source.latitude, source.longitude, destination.latitude, destination.longitude);
    const fare = BASIC_FARE * (distance * RATE_PER_KM);
    const bookingData = {
        passenger: passengerId,
        source,
        destination,
        fare,
        status: 'pending',
        distance
    };

    const booking = await bookingRepository.createBooking(bookingData);
    return booking;
}

const findNearbyDrivers = async (location, radius = 5) => {
    const longitude = parseFloat(location.longitude);
    const latitude = parseFloat(location.latitude);
    const radiusKm = parseFloat(radius);
  
    const nearbyDrivers = await locationService.findNearbyDrivers(longitude, latitude, radiusKm);
    if (isNaN(longitude) || isNaN(latitude) || isNaN(radiusKm)) {
      throw new Error('Invalid coordinates or radius');
    }
    //  console.log('Raw drivers from Redis:', nearbyDrivers );
     // ✅ EXTRACT DRIVER IDS
  const driverIds = nearbyDrivers.map(d => d[0]);


  // console.log('Searching drivers near:', {
  //   longitude,latitude,radiusKm,driverIds,});


    return driverIds;
  };


async function notifyDrivers(io, driverIds, rideData) {
  for (const driverId of driverIds) {
    const socketId = await locationService.getDriverSocket(driverId);
    if (socketId) {
      io.to(socketId).emit('ride-request', rideData);
    }
  }
}



const assignDriver = async (bookingId, driverId) => {
  const booking = await bookingRepository.updateBookingStatus(
    bookingId,
    driverId
  );

  if (!booking) {
    return {
      success: false,
      reason: 'ALREADY_ACCEPTED or NOT_FOUND',
    };
  }

  return {
    success: true,
    booking,
  };
};



module.exports = {createBooking, findNearbyDrivers, assignDriver, notifyDrivers};