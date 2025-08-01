const mongoose = require('mongoose');
// Corrected: Destructure 'getFareStrategy' from the factory module.
// This assumes your 'fareStrategyFactory.js' exports it as:
// module.exports = { getFareStrategy: ... };
// NOTE: This file assumes you have a strategies/fareStrategyFactory.js file.
const { getFareStrategy } = require('../strategies/fareStrategyFactory');

const RideSchema = new mongoose.Schema({
  passenger:   {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Ensure you have a 'User' model defined for this reference to work
    required: true
  },
  driver:      {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Optional: Driver might not be assigned immediately
  },
  // Corrected: Define lat and lng as required within the origin object
  origin:      {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  // Corrected: Define lat and lng as required within the destination object
  destination: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  type:        {
    type: String,
    enum: ['standard', 'pool', 'luxury'], // Enforce specific ride types
    default: 'standard'
  },
  status:      {
    type: String,
    enum: ['REQUESTED', 'MATCHED', 'ONGOING', 'COMPLETED', 'CANCELLED'], // Enforce specific ride statuses
    default: 'REQUESTED'
  },
  fare:        Number, // Fare will be calculated and stored here
  requestedAt: {
    type: Date,
    default: Date.now // Automatically set creation timestamp
  }
}, {
  timestamps: true // Optional but recommended: Adds `createdAt` and `updatedAt` fields
});

// Calculate fare before saving a new ride
// This pre-save hook runs before a document is saved to the database.
RideSchema.pre('save', function(next) {
  // Check if it's a new document AND if the fare has not been explicitly set yet.
  // This prevents recalculating fare on updates or if a fare was manually provided.
  if (this.isNew && (this.fare === undefined || this.fare === null)) {
    try {
      // Corrected: Call 'getFareStrategy' directly as it's destructured from the import.
      // This function should return an object that has a 'calculate' method.
      const strategy = getFareStrategy(this.type);

      // Ensure the strategy and its calculate method exist before calling
      if (strategy && typeof strategy.calculate === 'function') {
        // NOTE: Fare calculation typically needs distance and time.
        // For simplicity, this example passes origin/destination.
        // You might need to add logic to calculate distance/time here
        // or ensure it's passed from the frontend/another service.
        this.fare = strategy.calculate(this.origin, this.destination); 
      } else {
        // Log a warning or throw an error if no valid strategy is found
        console.warn(`No valid fare strategy found for type: ${this.type}. Fare not calculated.`);
        // Optionally, you could set a default fare or throw an error to prevent save
        // this.fare = 0; // Or some default
        // return next(new Error(`Fare calculation strategy missing for type: ${this.type}`));
      }
    } catch (error) {
      console.error('Error during fare calculation in pre-save hook:', error);
      // Propagate the error to prevent the save operation if fare calculation fails
      return next(error);
    }
  }
  next(); // Continue with the save operation
});

// Export the Mongoose model
module.exports = mongoose.model('Ride', RideSchema);
