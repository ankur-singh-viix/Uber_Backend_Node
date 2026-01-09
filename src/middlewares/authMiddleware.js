const jwt = require('jsonwebtoken');
const User = require('../models/user');
// const Booking = require('../models/booking');


const authMidlleware =  async (req, res, next) => {
     
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided',
            data: null,
            error: 'Unauthorized',
        });
    }
    try {
    //    console.log(token , process.env.JWT_SECRET);
       const verified = jwt.verify(token, process.env.JWT_SECRET);
    //    console.log(verified);
       const user = await User.findById(verified.id);
       console.log("token verified");

            req.user = { id: user._id, email: user.email, role: user.role };
            console.log(req.user);
        next();
    } catch {
        return res.status(400).json({
            success: false,
            message: 'Invalid token',
            data: null,
            error: 'Unauthorized',
        });
    }
    }
   
module.exports = authMidlleware;