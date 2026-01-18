const locationService = require('../services/locationService');

function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 New socket connected:', socket.id);

    // DRIVER REGISTRATION
    socket.on('registerDriver', async (driverId) => {
      if (!driverId) {
        console.error('❌ Driver ID missing during socket registration');
        return;
      }

      try {
        await locationService.setDriverSocket(driverId, socket.id);
        console.log('✅ Driver registered:', driverId, socket.id);
      } catch (err) {
        console.error('Socket registration failed:', err);
      }
    });

    // DISCONNECT
    socket.on('disconnect', async () => {
      try {
        const driverId = await locationService.findDriverIdBySocket(socket.id);

        if (driverId) {
          await locationService.deleteDriverSocket(socket.id);
          console.log('❌ Driver socket removed:', driverId);
        } else {
          console.log('❌ Socket disconnected:', socket.id);
        }
      } catch (err) {
        console.error('Disconnect error:', err);
      }
    });
  });
}

module.exports = initSocket;
