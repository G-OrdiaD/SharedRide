const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

// Public: registration & login
router.post('/register', userController.register);
router.post('/login',    userController.login);

// PROTECTED ROUTES (require valid JWT token)
router.use(protect); // All routes below this line are protected

router.get('/profile', userController.getUserProfile); // General (for both passenger and driver profiles)

// Passenger-specific
router.get('/wallet', userController.getWallet);
router.post('/wallet/top-up', userController.topUpWallet);
// Driver-specific
router.get('/earnings', userController.getEarnings);

// General (for both passenger and driver profiles)
router.get('/ratings', userController.getUserRatings); // Gets ratings for the logged-in user
router.get('/:userId/ratings', userController.getUserRatings); // Gets ratings for any user by ID

module.exports = router;