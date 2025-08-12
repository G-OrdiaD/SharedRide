const mongoose = require('mongoose');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');

// Define a reusable GeoJSON Point schema
const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
});

const RideSchema = new mongoose.Schema({
  passenger:   {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver:      {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Use the GeoJSON Point schema for origin and destination
  origin:      {
    locationString: { type: String, required: true },
    location: PointSchema
  },
  destination: {
    locationString: { type: String, required: true },
    location: PointSchema
  },
  rideType:    {
    type: String,
    enum: ['standard', 'pool', 'luxury'],
    default: 'standard'
  },
  status:      {
    type: String,
    enum: ['REQUESTED', 'MATCHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    default: 'REQUESTED'
  },
  fare:        Number,
  requestedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// IMPORTANT: Create a 2dsphere index on the location field for fast geospatial queries
RideSchema.index({ "origin.location": "2dsphere" });

// Pre-save hook for fare calculation
RideSchema.pre('save', function(next) {
  if (this.isNew && (this.fare === undefined || this.fare === null)) {
    try {
      const strategy = getFareStrategy(this.rideType);

      if (strategy && typeof strategy.calculate === 'function') {
        this.fare = this.fare || 0;
      } else {
        console.warn(`No valid fare strategy found for type: ${this.rideType}. Fare not calculated by strategy.`);
        this.fare = this.fare || 0;
      }
    } catch (error) {
      console.error('Error during fare calculation in pre-save hook:', error);
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Ride', RideSchema);