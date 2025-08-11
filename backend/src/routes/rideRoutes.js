const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const protect = require('../middleware/authMiddleware');

// Define ride-related routes
router.post('/request', protect, rideController.requestRide); // Route to request a ride
router.get('/new-rides', protect, rideController.getNewRides); // Route to get new ride requests
router.put('/:rideId/accept', protect, rideController.acceptRide); // Ensure acceptRide route is present
router.put('/:rideId/complete', protect, rideController.completeRide); 


module.exports = router;