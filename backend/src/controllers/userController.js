const bcrypt = require('bcryptjs');
const { User, Passenger, Driver } = require('../models/User'); // Destructure User, Passenger, Driver


// Example of a user-specific controller function (if needed, e.g., for profile updates)
exports.getUserProfile = async (req, res, next) => {
  try {
    // Assuming req.user is populated by authMiddleware
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};