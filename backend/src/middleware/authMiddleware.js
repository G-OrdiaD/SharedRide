const jwt = require('jsonwebtoken');
const { User } = require('../models/User'); // Import the base User model

//Middleware to protect routes and populate req.user.
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token payload and attach to request
      // Select('-passwordHash') prevents sending password hash to client
      req.user = await User.findById(decoded.id).select('-passwordHash');

      // Ensure the user exists and has a role (important for discriminators)
      if (!req.user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

module.exports = protect;
