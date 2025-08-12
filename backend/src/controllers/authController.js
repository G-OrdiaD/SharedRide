const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User'); // Ensure User model is correctly imported

// Register User
exports.register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Validation
  if (!name || !email || !password || !phone || !role) {
    console.log(`[AUTH DEBUG] Registration failed: Missing fields for email: ${email}`);
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log(`[AUTH DEBUG] Registration failed: Email already exists for ${email}`);
      return res.status(400).json({ error: "Email already exists" });
    }

    user = new User({
      name,
      email,
      password: password, 
      phone,
      role
    });

    await user.save();

    const token = user.generateJWT(); 
    
    console.log(`[AUTH DEBUG] Registration successful for user: ${user.email}, Role: ${user.role}`);
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
    console.error(`[AUTH DEBUG] Server error during registration for ${email}:`, err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log(`[AUTH DEBUG] Login attempt: Missing email or password for ${email}`);
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    console.log(`[AUTH DEBUG] Login attempt for email: ${email}`);
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      console.log(`[AUTH DEBUG] Login failed: User not found for email: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`[AUTH DEBUG] User found: ${user.email}. Attempting password verification.`);
    const isMatch = await user.verifyPassword(password);

    if (!isMatch) {
      console.log(`[AUTH DEBUG] Login failed: Password mismatch for email: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = user.generateJWT(); 
    
    console.log(`[AUTH DEBUG] Login successful for user: ${user.email}, Role: ${user.role}`);
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
    console.error(`[AUTH DEBUG] Server error during login for email ${email}:`, err.message);
    res.status(500).json({ error: "Server error during login" });
  }
};

// Placeholder for getMe if needed (e.g., for fetching current user profile)
exports.getMe = async (req, res) => {
  if (!req.user) {
    console.log(`[AUTH DEBUG] getMe failed: No token found or token is invalid.`);
    return res.status(401).json({ error: 'Not authorized' });
  }

  try {
    // req.user is populated by authMiddleware
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      console.log(`[AUTH DEBUG] getMe failed: User not found for ID: ${req.user.id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`[AUTH DEBUG] getMe successful for user: ${user.email}`);
    res.json(user);
  } catch (err) {
    console.error(`[AUTH DEBUG] Server error fetching user data for ID ${req.user.id}:`, err.message);
    res.status(500).json({ error: 'Server error fetching user data' });
  }
};


exports.getUserProfile = async (req, res, next) => {
  try {
    // req.user is populated by authMiddleware
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};