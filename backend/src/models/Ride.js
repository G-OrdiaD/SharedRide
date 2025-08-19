const mongoose = require('mongoose');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');
const crypto = require('crypto');
const config = require('../config/db');


// Encryption utilities directly in the model file
function encryptCoordinates(coords) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', 
    Buffer.from(config.locationEncryptionKey), iv);
  let encrypted = cipher.update(JSON.stringify(coords));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  };
}

function decryptCoordinates(encrypted) {
  const iv = Buffer.from(encrypted.iv, 'hex');
  const content = Buffer.from(encrypted.content, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', 
    Buffer.from(config.locationEncryptionKey), iv);
  let decrypted = decipher.update(content);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
}

const PointSchema = new mongoose.Schema({ // Schema for storing geospatial points
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: mongoose.Schema.Types.Mixed, // Mixed type for encrypted coordinates
    required: true
  },
  encrypted: {
    type: Boolean,
    default: false
  }
});


const RideSchema = new mongoose.Schema({ // Schema for ride requests

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
        type: [Number], // [lng, lat]
        required: true
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
        type: [Number], // [lng, lat]
        required: true
      }
    }
  },
  status: {
    type: String,
    enum: ['REQUESTED', 'MATCHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    default: 'REQUESTED'
  },
});

// Pre-save hook to encrypt coordinates
RideSchema.pre('save', function(next) {
   // Validate coordinates before encrypting
  const validatecoords = (coords) => {
    if (!Array.isArray(coords)) return false;
    return coords.every(coord => typeof coord === 'number' && !isNaN(coord));
  };

  if (this.isModified('origin.location.coordinates') && !this.origin.location.encrypted) {
    const encrypted = encryptCoordinates(this.origin.location.coordinates);
    this.origin.location.coordinates = encrypted;
    this.origin.location.encrypted = true;
  }
  
  if (this.isModified('destination.location.coordinates') && !this.destination.location.encrypted) {
    const encrypted = encryptCoordinates(this.destination.location.coordinates);
    this.destination.location.coordinates = encrypted;
    this.destination.location.encrypted = true;
  }
  next();
});

// Method to decrypt location data when needed
RideSchema.methods.getDecryptedLocations = function() {
  const ride = this.toObject();
  
  if (ride.origin.location.encrypted) {
    ride.origin.location.coordinates = decryptCoordinates(ride.origin.location.coordinates);
    ride.origin.location.encrypted = false;
  }
  
  if (ride.destination.location.encrypted) {
    ride.destination.location.coordinates = decryptCoordinates(ride.destination.location.coordinates);
    ride.destination.location.encrypted = false;
  }
  
  return ride;
};

module.exports = mongoose.model('Ride', RideSchema); // Export the Ride model