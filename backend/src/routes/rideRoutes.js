const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const protect = require('../middleware/authMiddleware');

// Define ride-related routes
router.post('/request', protect, rideController.requestRide);
router.put('/:rideId/complete', protect, rideController.completeRide);
router.put('/:rideId/accept', protect, rideController.acceptRide); // Ensure acceptRide route is present


module.exports = router;