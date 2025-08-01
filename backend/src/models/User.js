const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT generation

// Define the base User Schema
const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  phone:      { type: String, required: true, unique: true },
  
  // The 'role' field will be used by Mongoose as the discriminator key.
  // which specific schema (Passenger, Driver) to apply.
  role:       { type: String, enum: ['passenger', 'driver'], required: true },
  passwordHash: { type: String, required: true, select: false } 
}, {
  discriminatorKey: 'role', // This tells Mongoose to use the 'role' field to differentiate sub-models
  timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to hash password before saving (only if passwordHash is modified or new)
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's new or has been modified
  if (this.isModified('passwordHash')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// Method to verify a plain-text password against the stored hash
UserSchema.methods.verifyPassword = async function(password) {
  // Use await because bcrypt.compare is asynchronous
  return await bcrypt.compare(password, this.passwordHash);
};

// Method to generate a JWT for this user
UserSchema.methods.generateJWT = function() {
  // Ensure process.env.JWT_SECRET is set in your .env file
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// ----------------------------------------------------------------------
// Define the Base User Model
// This is the model that other models will "discriminate" from.
const User = mongoose.model('User', UserSchema);
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// Define Discriminators for Passenger and Driver
// These schemas extend the base UserSchema and add specific fields.
// Mongoose automatically handles the 'role' field based on the discriminator.

// Passenger Schema (discriminator)
const PassengerSchema = new mongoose.Schema({
  // Passenger-specific fields
  paymentMethods: [{
    type: String, // Example: 'credit_card', 'paypal', etc.
    details: String // Example: last 4 digits, email
  }],
  // You might add other passenger-specific fields here
});

// Driver Schema (discriminator)
const DriverSchema = new mongoose.Schema({
  // Driver-specific fields
  vehicle: {
    make: String,
    model: String,
    licensePlate: { type: String, unique: true, sparse: true }, // sparse allows nulls but enforces uniqueness for non-nulls
    color: String
  },
  isAvailable: { type: Boolean, default: true },
  currentLocation: { lat: Number, lng: Number }, // Drivers often have dynamic locations
  // You might add other driver-specific fields here
});

// ----------------------------------------------------------------------
// Create Discriminator Models
// These are your actual Passenger and Driver Mongoose models.
// When you save a document with role: 'passenger', it will use PassengerSchema.
// When you save a document with role: 'driver', it will use DriverSchema.
const Passenger = User.discriminator('passenger', PassengerSchema);
const Driver = User.discriminator('driver', DriverSchema);
// ----------------------------------------------------------------------

// Export the base User model AND the discriminator models
// This allows other files to import User, Passenger, or Driver as needed.
module.exports = { User, Passenger, Driver };
