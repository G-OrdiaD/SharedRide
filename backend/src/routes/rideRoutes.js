const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const rateLimit = require('express-rate-limit');
const protect = require('../middleware/authMiddleware');


const rideRequestLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many ride requests from this IP, please try again later'
});

router.post('/request', protect, rideController.requestRide);
router.get('/new-rides', protect, rideController.getNewRides);
router.put('/:rideId/accept', protect, rideController.acceptRide);
router.put('/:rideId/complete', protect, rideController.completeRide);

module.exports = router;