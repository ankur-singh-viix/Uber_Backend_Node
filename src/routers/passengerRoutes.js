const express = require('express');
const { createBooking } = require('../controllers/passengerController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/ride', authMiddleware, createBooking);
console.log('authmiddleware:', typeof authMiddleware); 
console.log('createBooking:', typeof createBooking);

module.exports = router;
