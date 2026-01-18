require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');

const { connectDB } = require('./utils/db');
const redisClient = require('./utils/redisClient');

const authRoutes = require('./routers/authRoutes');
const passengerRoutes = require('./routers/passengerRoutes');
const driverRoutes = require('./routers/driverRoutes');

const initSocket = require('./utils/socket');

const app = express();
const PORT = process.env.PORT || 4000;

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());

// ✅ HTTP CORS (VERY IMPORTANT)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* =======================
   ROUTES
======================= */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/passenger', passengerRoutes);
app.use('/api/v1/driver', driverRoutes);

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null,
    error: err.message,
  });
});

/* =======================
   SERVER + SOCKET
======================= */
const startServer = async () => {
  await connectDB();

  // ✅ SAFE REDIS CONNECT
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }

  // ✅ CREATE SERVER ONCE
  const server = http.createServer(app);

  // ✅ ATTACH SOCKET.IO
  const io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // ✅ INIT SOCKET LOGIC
  initSocket(io);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
