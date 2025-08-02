const Ride = require('../models/Ride');

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

    await ride.save();

    // Broadcast to drivers in the 'drivers' room
    if (req.io) {
      req.io.to('drivers').emit('newRide', { // Emit only to sockets in the 'drivers' room
        rideId: ride._id,
        origin: ride.origin,
        destination: ride.destination,
        rideType: ride.rideType,
        passengerId: ride.passenger // Include passenger ID for potential future use
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
      // Optional: Notify other drivers that this ride is no longer available
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

    if (req.io) {
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
