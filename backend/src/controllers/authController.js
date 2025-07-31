const User = require('../models/User.js'); // Ensure .js extension and correct casing

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'passenger'
    });

    const token = user.getSignedJwtToken();
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

  } catch (error) {
    console.error('Error during user registration:', error.message);
    res.status(500).json({ success: false, message: 'Server Error during registration' });
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

  } catch (error) {
    console.error('Error during user login:', error.message);
    res.status(500).json({ success: false, message: 'Server Error during login' });
  }
};

// @desc    Get current logged in user (example protected route)
// @route   GET /api/auth/me
// @access  Private (requires authentication)
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json({ success: true, user });
};