const redisClient = require('../utils/redisClient');

class LocationService {

  async addDriverLocation(driverId, longitude, latitude) {
    // 🔐 SAFETY CHECKS
    if (!driverId) {
      throw new Error('Driver ID is missing');
    }

    if (latitude == null || longitude == null) {
      throw new Error('Latitude or Longitude missing');
    }

    try {
      await redisClient.sendCommand([
        'GEOADD',
        'drivers',
        longitude.toString(), // Redis expects: lon first
        latitude.toString(),
        driverId.toString(),
      ]);
    } catch (error) {
      console.error('Cannot add to redis', error);
      throw error;
    }
  }

  async findNearbyDrivers(longitude, latitude, radiusKm) {
    if (longitude == null || latitude == null || radiusKm == null) {
      throw new Error('Invalid geo search parameters');
    }

    const nearbyDrivers = await redisClient.sendCommand([
      'GEORADIUS',
      'drivers',
      longitude.toString(),
      latitude.toString(),
      radiusKm.toString(),
      'km',
      'WITHCOORD',
    ]);

    return nearbyDrivers;
  }

  async storeNotifiedDrivers(bookingId, driverIds) {
    if (!bookingId || !Array.isArray(driverIds)) {
      throw new Error('Invalid bookingId or driverIds');
    }

    for (const driverId of driverIds) {
      await redisClient.sAdd(
        `notifiedDrivers:${bookingId}`,
        driverId.toString()
      );
    }
  }

  async getNotifiedDrivers(bookingId) {
    if (!bookingId) {
      throw new Error('Booking ID missing');
    }

    return redisClient.sMembers(`notifiedDrivers:${bookingId}`);
  }
}

module.exports = new LocationService();
