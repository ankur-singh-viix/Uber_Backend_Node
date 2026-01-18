const bookingService = require('../services/bookingService');
const axios = require('axios');
const locationService = require('../services/locationService');


const createBooking = async (req, res,next) => {

    try{
        const  {source, destination} = req.body;
        const booking = await bookingService.createBooking({passengerId: req.user._id, source, destination});    
        // const driverIds = await bookingService.findNearbyDrivers(source);

        // console.log('Driver IDs to notify:', driverIds);

        const nearbyDrivers = await bookingService.findNearbyDrivers(source);     
        // const driverIds = nearbyDrivers.map(driver => driver[0]);   

           
        console.log("near :", nearbyDrivers);

        const driverIds = await bookingService.findNearbyDrivers(source); 

        const rideInfo = {
            source,
            destination,
            passengerId: req.user._id,
            estimatedFare: booking.fare, 
            distance: booking.distance,
            pickupTime: new Date().toISOString()
        };
        
        try {
            const notificationResponse = await axios.post('http://localhost:3001/api/v1/notifications/notify-drivers', {
                rideId: booking._id.toString(),
                rideInfo,
                driverIds
            });
            await locationService.storeNotifiedDrivers(booking._id, driverIds);
            console.log('Notification sent successfully:', notificationResponse.data);
            
        } 
        catch (notificationError) {
            console.error('Failed to notify drivers:', notificationError.message);
        }
        
        res.status(201).send({
        success: true,
        message: "Successfully created the booking",
        error: null,
        data: {
            bookingId: booking._id,
            passengerId: booking.passenger,   // ✅ MAP passenger → passengerId
            driver: booking.driver || null,
            source: booking.source,
            destination: booking.destination,
            fare: booking.fare,
            distance: booking.distance,
            status: booking.status
        }
 });

    }catch(error) {
        res.status(400).send(error.message);
    }
}

module.exports = {createBooking};