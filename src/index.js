require('dotenv').config();
const express = require('express');
const http = require('http');
const { connectDB } = require('./utils/db');
const redisClient = require('./utils/redisClient');
const authRoutes = require('./routers/authRoutes');
const passengerRoutes = require('./routers/passengerRoutes');
const driverRoutes = require('./routers/driverRoutes');


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

app.use(express.json());

// routes
app.use('/api/v1/auth', authRoutes );
app.use('/api/v1/passenger', passengerRoutes );
app.use('/api/v1/driver', driverRoutes );


// ❗ global error handler — MUST be last
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null,
    error: err.message,
  });
});

const startServer = async () => {
  await connectDB();
  await redisClient.connect();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
