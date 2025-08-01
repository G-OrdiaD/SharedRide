const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');

// directly exports the 'protect' function via `module.exports = protect;`.
const protect = require('../middleware/authMiddleware');

// Define ride-related routes
// Apply the 'protect' middleware directly to routes that require authentication.
router.post('/request', protect, rideController.requestRide);
router.put('/:rideId/complete', protect, rideController.completeRide);

module.exports = router;