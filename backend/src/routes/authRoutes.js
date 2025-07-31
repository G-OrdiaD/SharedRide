const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Your auth controller
const authMiddleware = require('../middleware/authMiddleware'); // Your auth middleware

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Example of a protected route using the middleware
router.get('/me', authMiddleware, authController.getMe); // authMiddleware populates req.user

module.exports = router;