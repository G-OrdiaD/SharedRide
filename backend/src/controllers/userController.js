const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Passenger = require('../models/Passenger');
const Driver = require('../models/Driver');

exports.register = async (req, res, next) => {
  try {
    const { name, phone, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);

    let user;
    if (role === 'driver') {
      user = new Driver({ name, phone, passwordHash });
    } else {
      user = new Passenger({ name, phone, passwordHash });
    }

    await user.save();
    const token = user.generateJWT();
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await user.verifyPassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = user.generateJWT();
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
