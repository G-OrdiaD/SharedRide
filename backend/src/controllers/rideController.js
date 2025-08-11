const Ride = require('../models/Ride');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');
const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;

/**
 * Helper function to geocode a location string (address or postcode) into lat/lng.
 * Uses native Node.js fetch.
 * @param {string} locationString - Can be a full address or a postcode.
 * @returns {object} { lat, lng } or throws an error
 */
const geocodeAddress = async (locationString) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationString)}&key=${GOOGLE_GEOCODING_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error('Geocoding API error:', data.status, data.error_message);
      throw new Error(`Could not find coordinates for: "${locationString}". Please check the address/postcode.`);
    }
  } catch (error) {
    console.error('Error calling Geocoding API:', error.message);
    throw new Error('Failed to convert address to coordinates. Please try again.');
  }
};


exports.requestRide = async (req, res) => {
  const { origin, destination, rideType } = req.body;

  if (!origin || typeof origin !== 'string' || !destination || typeof destination !== 'string') {
    return res.status(400).json({ error: "Origin and destination locations are required as strings." });
  }

  try {
    const geocodedOrigin = await geocodeAddress(origin);
    const geocodedDestination = await geocodeAddress(destination);

    const ride = new Ride({
      passenger: req.user.id,
      origin: {
        locationString: origin,
        lat: geocodedOrigin.lat,
        lng: geocodedOrigin.lng
      },
      destination: {
        locationString: destination,
        lat: geocodedDestination.lat,
        lng: geocodedDestination.lng
      },
      rideType: rideType,
      status: 'REQUESTED'
    });

    const fareStrategy = getFareStrategy(ride.rideType);
    if (fareStrategy && typeof fareStrategy.calculate === 'function') {
        ride.fare = fareStrategy.calculate(
            ride.origin.lat, ride.origin.lng,
            ride.destination.lat, ride.destination.lng
        );
    } else {
        console.warn(`No valid fare strategy found for type: ${ride.rideType}. Setting fare to 0.`);
        ride.fare = 0;
    }

    await ride.save();

    // Removed: Broadcast to drivers in the 'drivers' room via Socket.IO
    // Removed: if (req.io) { req.io.to('drivers').emit('newRide', { ... }); }

    res.status(201).json({
      _id: ride._id,
      status: ride.status,
      passenger: ride.passenger,
      origin: ride.origin,
      destination: ride.destination,
      fare: ride.fare
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message || "Failed to request ride" });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.status !== 'REQUESTED') {
      return res.status(400).json({ error: "Ride is not in a requested state" });
    }
    if (ride.driver) {
      return res.status(400).json({ error: "Ride already has a driver" });
    }

    ride.driver = req.user.id;
    ride.status = 'MATCHED';
    await ride.save();

    // Removed: Notify the passenger that their ride has been accepted via Socket.IO
    // Removed: if (req.io) { req.io.to(ride.passenger.toString()).emit('rideAccepted', { ... }); }
    // Removed: if (req.io) { req.io.to('drivers').emit('rideRemoved', { ... }); }

    res.json(ride);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to accept ride" });
  }
};

/**
 * @desc Complete a ride (typically called by driver)
 * @route PUT /api/rides/:rideId/complete
 * @access Private (Driver)
 */
exports.completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.driver.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to complete this ride" });
    }
    if (ride.status !== 'ONGOING' && ride.status !== 'MATCHED') {
      return res.status(400).json({ error: "Ride cannot be completed in its current state" });
    }

    ride.status = 'COMPLETED';
    ride.endTime = new Date();

    await ride.save();

    // Removed: Notify passenger via Socket.IO
    // Removed: if (req.io) { req.io.to(ride.passenger.toString()).emit('rideCompleted', { ... }); }

    res.json(ride);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to complete ride" });
  }
};

// NEW: Controller function to fetch all new, unaccepted ride requests
exports.getNewRides = async (req, res) => {
  try {
    const newRides = await Ride.find({
      status: 'REQUESTED',
      driver: { $exists: false }
    }).sort({ requestedAt: -1 });

    res.json(newRides);
  } catch (err) {
    console.error('Error fetching new rides:', err.message);
    res.status(500).json({ error: "Failed to fetch new rides" });
  }
};
