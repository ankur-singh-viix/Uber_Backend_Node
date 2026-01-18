const locationService = require('../services/locationService');
const userRepository = require('../repositories/userRepository');

const updateLocation = async (driverId, { latitude, longitude }) => {

  if (!driverId) {
    throw new Error('Driver ID missing');
  }

  if (latitude == null || longitude == null) {
    throw new Error('Latitude or longitude missing');
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error('Latitude and longitude must be numbers');
  }

  try {
    // Redis
    await locationService.addDriverLocation(driverId, lon, lat);

    // MongoDB
    await userRepository.updateDriverLocation(driverId, {
      type: 'Point',
      coordinates: [lon, lat],
    });

    return {
      status: 'success',
      message: 'Location updated successfully',
    };

  } 
  catch (error) {
    console.error('DriverService.updateLocation error:', error);
    throw new Error('Could not update driver location');
  }
};

module.exports = { updateLocation };
