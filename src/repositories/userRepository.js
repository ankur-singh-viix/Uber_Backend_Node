const User = require('../models/user'); // ✅ FIXED

async function create(userData) {
  const user = await User.create(userData);
  return user;
}
 

async function findByEmail(email) {
  // password is select:false in schema, so explicitly include it
  return User.findOne({ email }).select('+password');
}

const updateDriverLocation = async (driverId, location) => {
  return User.findByIdAndUpdate(
    driverId,
    { location },
    { new: true }
  );
};


module.exports = {
  create,
  findByEmail,
  updateDriverLocation,
};
