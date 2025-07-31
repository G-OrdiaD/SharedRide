const EventEmitter = require('events'); // Node.js built-in event emitter
const Ride = require('../models/Ride'); // Import the Ride model
// Import User, Passenger, and Driver models using destructuring
// from the models/User.js file.
const { User, Passenger, Driver } = require('../models/User');

class RideManagementSystem extends EventEmitter {
  constructor() {
    super();
    // This part ensures only one instance is ever created
    if (RideManagementSystem.instance) {
      return RideManagementSystem.instance;
    }
    RideManagementSystem.instance = this;
    console.log('RideManagementSystem initialized.');
  }

  /**
   * Static method to get the singleton instance of RideManagementSystem.
   * This is what `require(...).getInstance()` will call.
   * @returns {RideManagementSystem} The singleton instance.
   */
  static getInstance() {
    if (!RideManagementSystem.instance) {
      RideManagementSystem.instance = new RideManagementSystem();
    }
    return RideManagementSystem.instance;
  }

  /**
   * Creates a new ride document.
   * @param {string} passengerId - ID of the passenger.
   * @param {Object} origin - Origin coordinates {lat, lng}.
   * @param {Object} destination - Destination coordinates {lat, lng}.
   * @param {string} type - Type of ride (e.g., 'standard', 'pool').
   * @returns {mongoose.Document} A new Mongoose Ride document.
   */
  createRide(passengerId, origin, destination, type) {
    console.log(`RideManagementSystem: Creating new ride for passenger ${passengerId}`);
    const newRide = new Ride({
      passenger: passengerId,
      origin: origin,
      destination: destination,
      type: type,
      status: 'REQUESTED' // Initial status
    });
    // The actual save() will happen in the controller,
    // which will trigger the pre-save fare calculation.
    return newRide;
  }

  // Example: A method that might use the Driver model
  async findAvailableDrivers(origin) {
    console.log(`RideManagementSystem: Finding available drivers near ${JSON.stringify(origin)}`);
    // Example: Find drivers with role 'driver' who are available
    const availableDrivers = await Driver.find({
      isAvailable: true,
      // Add logic for proximity based on 'origin' here later
    });
    return availableDrivers;
  }
}

// Export the class itself.
// The `getInstance()` static method will be used by other modules to get the single instance.
module.exports = RideManagementSystem;
