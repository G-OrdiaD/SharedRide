const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const protect = require('../middleware/authMiddleware');

router.post('/request', protect, rideController.requestRide);
router.get('/new-rides', protect, rideController.getNewRides);
router.put('/:rideId/accept', protect, rideController.acceptRide);
router.put('/:rideId/complete', protect, rideController.completeRide);

module.exports = router;