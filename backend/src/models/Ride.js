const mongoose = require('mongoose');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');

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
  // Origin to include locationString, lat, and lng
  origin:      {
    locationString: { type: String, required: true }, // Stores the user's input string (address/postcode)
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  // Destination to include locationString, lat, and lng
  destination: {
    locationString: { type: String, required: true }, // Stores the user's input string (address/postcode)
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
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

// Pre-save hook for fare calculation
RideSchema.pre('save', function(next) {
  if (this.isNew && (this.fare === undefined || this.fare === null)) {
    try {
      const strategy = getFareStrategy(this.rideType);

      if (strategy && typeof strategy.calculate === 'function') {
        // Placeholder for fare calculation. In a real app, you'd calculate
        // distance/time using mapping APIs (e.g., Google Distance Matrix)
        // and then pass it to the strategy.
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
