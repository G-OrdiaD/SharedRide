const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User'); // Ensure User model is correctly imported

// Register User
exports.register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Validation
  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create a new User instance. The pre-save hook in User.js will hash the password.
    user = new User({
      name,
      email,
      // The password field in the request body maps to passwordHash in the schema.
      // The pre-save hook in User.js handles the hashing.
      passwordHash: password, // Pass plain password, schema pre-save hook hashes it
      phone,
      role
    });

    await user.save();

    const token = user.generateJWT(); // Generate JWT using the method defined in User model
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    // Select('+passwordHash') is needed because passwordHash is set to select: false by default
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password using the method defined in User model
    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = user.generateJWT(); // Generate JWT using the method defined in User model
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during login" });
  }
};

// Placeholder for getMe if needed (e.g., for fetching current user profile)
exports.getMe = async (req, res) => {
  try {
    // req.user is populated by authMiddleware
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching user data' });
  }
};