const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
// Corrected: Directly import the 'protect' function from the middleware file.
// This assumes your middleware file (src/middleware/authMiddleware.js)
// directly exports the 'protect' function via `module.exports = protect;`.
const protect = require('../middleware/authMiddleware');

// Define ride-related routes
// Apply the 'protect' middleware directly to routes that require authentication.
router.post('/request', protect, rideController.requestRide);
router.put('/:rideId/complete', protect, rideController.completeRide);

// You might have other ride-related routes here, e.g.,
// router.get('/:rideId', rideController.getRideDetails);
// router.put('/:rideId/accept', protect, rideController.acceptRide);

module.exports = router;