const { User, Passenger, Driver } = require('../models/User'); // Destructure User, Passenger, Driver
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER USER
exports.register = async (req, res) => {
  const { name, email, password, phone, role, licenseNumber, vehicle } = req.body;

  // Validation
  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    let user;

    if (role === 'driver') {
      // Validate driver-specific fields
      if (!licenseNumber || !vehicle || !vehicle.make || !vehicle.model || !vehicle.licensePlate || !vehicle.color) {
        return res.status(400).json({ error: "Driver registration requires license number and complete vehicle info" });
      }

      user = new Driver({
        name,
        email,
        passwordHash: password,
        phone,
        role,
        licenseNumber,
        vehicle,
        isAvailable: true
      });
    } else if (role === 'passenger') {
      user = new Passenger({
        name,
        email,
        passwordHash: password,
        phone,
        role
      });
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    await user.save();

    const token = user.generateJWT();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(`[AUTH DEBUG] Registration error: ${err.message}`);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.verifyPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = user.generateJWT();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(`[AUTH DEBUG] Login error: ${err.message}`);
    res.status(500).json({ error: "Server error during login" });
  }
};

// GET CURRENT USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authorized' });

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(`[AUTH DEBUG] getUserProfile error: ${err.message}`);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
};