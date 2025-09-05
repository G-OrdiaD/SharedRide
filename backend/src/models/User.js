const mongoose = require('mongoose'); // Mongoose for MongoDB
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT generation

// Base User Schema
const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  phone:      { type: String, required: true, unique: true },
  role:       { type: String, enum: ['passenger', 'driver'], required: true },
  passwordHash: { type: String, required: true, select: false }
}, {
  discriminatorKey: 'role',
  timestamps: true
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// Verify password
UserSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Generate JWT
UserSchema.methods.generateJWT = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } 
  );
};

const User = mongoose.model('User', UserSchema);

// Passenger discriminator
const PassengerSchema = new mongoose.Schema({
  walletBalance: { type: Number, default: 0 },
  paymentMethods: [{
    type: String,
    details: String
  }]
});
const Passenger = User.discriminator('passenger', PassengerSchema);

// Driver discriminator
const DriverSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true },
  vehicle: {
    make: String,
    model: String,
    color: String,
    licensePlate: { type: String, unique: true, sparse: true }
  },
  isAvailable: { type: Boolean, default: true },
  currentLocation: { lat: Number, lng: Number }
});
const Driver = User.discriminator('driver', DriverSchema);

module.exports = { User, Passenger, Driver };