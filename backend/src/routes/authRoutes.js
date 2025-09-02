const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Auth controller
const authMiddleware = require('../middleware/authMiddleware'); // Auth middleware

// Public routes
router.post('/register', authController.register); // Register passenger or driver
router.post('/login', authController.login);       // Login user

// Protected routes
router.get('/me', authMiddleware, authController.getUserProfile); // Get current user profile

module.exports = router;