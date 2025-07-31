const Ride = require('../models/Ride');
const { User, Passenger, Driver } = require('../models/User');
const PaymentFactory = require('../factories/PaymentFactory'); 
const RideManagementSystem = require('../services/RideManagementSystem').getInstance();

/**
 * Handles a new ride request from a passenger.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.requestRide = async (req, res, next) => {
  try {
    // Extract necessary data from the request body
    const { origin, destination, type } = req.body;

    // Assuming req.user is populated by an authentication middleware
    // and contains the authenticated user's ID and role.
    // Use the Passenger discriminator model to find the passenger by ID.
    const passenger = await Passenger.findById(req.user._id);

    // If the passenger is not found, return a 404 error.
    if (!passenger) {
      return res.status(404).json({ error: 'Passenger not found' });
    }

    // Create a new ride using the RideManagementSystem.
    // Ensure createRide method in RideManagementSystem accepts these arguments
    // and returns a Mongoose Ride document.
    const ride = RideManagementSystem.createRide(
      passenger._id, // Pass the passenger's ID
      origin,
      destination,
      type
    );

    // Save the newly created ride to the database.
    // The pre-save hook in Ride.js will calculate the fare here.
    await ride.save();

    // Emit an event to notify subscribed drivers about the new ride request.
    // This assumes RideManagementSystem has an event emitter.
    RideManagementSystem.emit('rideRequested', ride);

    // Respond with the created ride details and a 201 Created status.
    res.status(201).json(ride);
  } catch (err) {
    // Pass any errors to the next middleware (e.g., an error handling middleware)
    console.error('Error requesting ride:', err.message);
    next(err);
  }
};

/**
 * Handles the completion of a ride.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.completeRide = async (req, res, next) => {
  try {
    // Find the ride by its ID from the request parameters.
    const ride = await Ride.findById(req.params.rideId);

    // If the ride is not found, return a 404 error.
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Update the ride status to 'COMPLETED'.
    ride.status = 'COMPLETED';
    // Save the updated ride status to the database.
    await ride.save();

    // Create a payment instance using the PaymentFactory.
    // Ensure PaymentFactory.create accepts paymentType, rideId, and fare.
    const payment = PaymentFactory.create(req.body.paymentType, ride._id, ride.fare);

    // Process the payment.
    // Ensure payment.process() method exists and handles the payment logic.
    await payment.process();

    // Respond with success status and the fare amount.
    res.json({ success: true, amount: ride.fare });
  } catch (err) {
    // Pass any errors to the next middleware.
    console.error('Error completing ride:', err.message);
    next(err);
  }
};
