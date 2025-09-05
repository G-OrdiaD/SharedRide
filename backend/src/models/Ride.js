const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../config/db');
const { locationEncryptionKey } = require('../config/db');

// Encryption utilities
function encryptCoordinates(coords) {
  if (!coords || !Array.isArray(coords)) {
    throw new Error(`Cannot encrypt coordinates: Invalid input. Received: ${typeof coords}`);
  }

  const algorithm = 'aes-256-cbc';
  
  
  if (!config.locationEncryptionKey) {
    throw new Error('Encryption key is not configured');
  }

  let key;
  try {
    // Convert hex string to buffer
    key = Buffer.from(config.locationEncryptionKey, 'hex');
    
    // Verify it's 32 bytes (64 hex characters should become 32 bytes)
    if (key.length !== 32) {
      throw new Error(`Key must be 32 bytes after hex decoding. Got: ${key.length} bytes`);
    }
    
  } catch (error) {
    throw new Error(`Invalid encryption key: ${error.message}. Key: ${config.locationEncryptionKey}`);
  }
  
  const iv = crypto.randomBytes(16);

  try {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(coords), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      iv: iv.toString('hex'),
      content: encrypted
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

function decryptCoordinates(encrypted) {
  const algorithm = 'aes-256-cbc';
  
  if (!config.locationEncryptionKey) {
    throw new Error('Encryption key is not configured');
  }

  let key;
  try {
    key = Buffer.from(config.locationEncryptionKey, 'hex');
    
    if (key.length !== 32) {
      throw new Error(`Key must be 32 bytes after hex decoding. Got: ${key.length} bytes`);
    }
  } catch (error) {
    throw new Error(`Invalid encryption key: ${error.message}`);
  }
  
  const iv = Buffer.from(encrypted.iv, 'hex');

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

// Ride schema definition
const RideSchema = new mongoose.Schema({ 
  passenger: { // Reference to Passenger user
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: { // Reference to Driver user
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
   passengerRating: { // Rating FROM driver TO passenger
    score: { type: Number, min: 1, max: 5 },
    feedback: String,
    submittedAt: Date
  },
  driverRating: { // Rating FROM passenger TO driver
    score: { type: Number, min: 1, max: 5 },
    feedback: String,
    submittedAt: Date
  },
  origin: {
    locationString: { 
      type: String, 
      required: true 
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // Store as simple array of numbers
        required: true
      },
      encrypted: {
        type: Boolean,
        default: false
      }
    }
  },
  destination: {
    locationString: { 
      type: String, 
      required: true 
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      },
      encrypted: {
        type: Boolean,
        default: false
      }
    }
  },
  rideType: {
    type: String,
    enum: ['standard', 'pool', 'luxury', 'xl'],
    default: 'standard'
  },
  status: {
    type: String,
    enum: ['requested', 'driver_assigned', 'matched', 'ongoing', 'completed', 'cancelled',],
    default: 'requested'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  fare: Number,
  distance: Number,
  duration: Number,
  events: [{
    type: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Pre-save hook to encrypt coordinates before saving
RideSchema.pre('save', function(next) {
  if (this.isModified('origin.location.coordinates') && 
      !this.origin.location.encrypted &&
      Array.isArray(this.origin.location.coordinates) &&
      this.origin.location.coordinates.length === 2) {
    try {
      const encrypted = encryptCoordinates(this.origin.location.coordinates);
      this.origin.location.coordinates = encrypted;
      this.origin.location.encrypted = true;
    } catch (error) {
      return next(error);
    }
  }
  
  if (this.isModified('destination.location.coordinates') && 
      !this.destination.location.encrypted &&
      Array.isArray(this.destination.location.coordinates) &&
      this.destination.location.coordinates.length === 2) {
    try {
      const encrypted = encryptCoordinates(this.destination.location.coordinates);
      this.destination.location.coordinates = encrypted;
      this.destination.location.encrypted = true;
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Method to decrypt location data for frontend use 
RideSchema.methods.getDecryptedLocations = function() {
  const rideObj = this.toObject();
  
  if (rideObj.origin.location.encrypted) {
    rideObj.origin.location.coordinates = decryptCoordinates(rideObj.origin.location.coordinates);
    rideObj.origin.location.encrypted = false;
  }
  
  if (rideObj.destination.location.encrypted) {
    rideObj.destination.location.coordinates = decryptCoordinates(rideObj.destination.location.coordinates);
    rideObj.destination.location.encrypted = false;
  }
  
  return rideObj;
};

// Index for geospatial queries
RideSchema.index({ 'origin.location.coordinates': '2dsphere' });
RideSchema.index({ 'destination.location.coordinates': '2dsphere' });
RideSchema.index({ status: 1, requestedAt: -1 });
RideSchema.index({ passenger: 1, requestedAt: -1 });
RideSchema.index({ driver: 1, status: 1 });

module.exports = mongoose.model('Ride', RideSchema);