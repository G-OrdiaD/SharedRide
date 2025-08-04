const Ride = require('../models/Ride');
const {getFareStrategy} = require('../strategies/fareStrategyFactory');
const Driver = require('../models/User').Driver; // Import Driver model
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

    // Calculate fare based on ride type and (dummy) distance
    const fareStrategy = getFareStrategy(ride.rideType);
    if (fareStrategy && typeof fareStrategy.calculate === 'function') {
        ride.fare = fareStrategy.calculate(
            ride.origin.lat, ride.origin.lng,
            ride.destination.lat, ride.destination.lng
        );
    } else {
        console.warn(`No valid fare strategy found for type: ${ride.rideType}. Setting fare to 0.`);
        ride.fare = 0; // Fallback
    }

    await ride.save();

    // Broadcast to all drivers that are currently in the 'drivers' room
    if (req.io) {
      req.io.to('drivers').emit('newRide', {
        rideId: ride._id,
        origin: ride.origin,
        destination: ride.destination,
        rideType: ride.rideType,
        fare: ride.fare, // Include fare in the emitted data
        passengerId: ride.passenger
      });
      console.log(`Emitted newRide to 'drivers' room for ride ID: ${ride._id}`);
    } else {
      console.warn('Socket.IO instance (req.io) not available in rideController.requestRide');
    }

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
    // ... (existing acceptRide function - no changes needed here for the new alternative) ...
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

        // Notify the passenger that their ride has been accepted
        if (req.io) {
            // IMPORTANT: Emit to the passenger's specific room using their ID
            // Make sure passenger's socket joins their room (e.g., in auth middleware or on passenger screen)
            req.io.to(ride.passenger.toString()).emit('rideAccepted', {
                rideId: ride._id,
                driverId: req.user.id,
                driverName: req.user.name,
                rideDetails: {
                    origin: ride.origin,
                    destination: ride.destination,
                    rideType: ride.rideType,
                    fare: ride.fare
                }
            });
            // Notify other drivers that this ride is no longer available
            // This is crucial for the "pull" method to keep all driver screens updated
            req.io.to('drivers').emit('rideRemoved', { rideId: ride._id });
        } else {
            console.warn('Socket.IO instance (req.io) not available in rideController.acceptRide');
        }

        res.json(ride);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to accept ride" });
    }
};

exports.completeRide = async (req, res) => {
    // ... (existing completeRide function - no changes needed here) ...
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

        if (req.io) {
            // Notify the specific passenger
            req.io.to(ride.passenger.toString()).emit('rideCompleted', {
                rideId: ride._id,
                fare: ride.fare,
                status: ride.status
            });
        } else {
            console.warn('Socket.IO instance (req.io) not available in rideController.completeRide');
        }

        res.json(ride);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to complete ride" });
    }
};

// NEW: Controller function to fetch all new, unaccepted ride requests
exports.getNewRides = async (req, res) => {
    try {
        // Find rides that are 'REQUESTED' and don't have a driver assigned
        // Sort by requestedAt to show the newest requests first
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