const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');
const rateLimit = require('express-rate-limit');
const RideManagementSystem = require('../services/RideManagementSystem');


const rideRequestLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many ride requests from this IP, please try again later'
});


router.post('/request', rideRequestLimiter, async (req, res) => {
  try {
    const { origin, destination, rideType } = req.body;
    
    // Enhanced validation
    if (!origin?.location || !destination?.location) {
      return res.status(400).json({ 
        error: "Invalid location data",
        details: {
          origin: !origin?.location ? "Missing origin location" : null,
          destination: !destination?.location ? "Missing destination location" : null
        }
      });
    }

    // Validate coordinates are numbers
    const { lat: originLat, lng: originLng } = origin.location;
    const { lat: destLat, lng: destLng } = destination.location;
    
    if ([originLat, originLng, destLat, destLng].some(coord => 
      typeof coord !== 'number' || isNaN(coord))) {
      return res.status(400).json({ 
        error: "Invalid coordinates",
        details: {
          origin: {
            lat: typeof originLat,
            lng: typeof originLng
          },
          destination: {
            lat: typeof destLat,
            lng: typeof destLng
          }
        }
      });
    }

    const rideManager = RideManagementSystem.getInstance();
    const ride = await rideManager.createRide(
      req.user.id,
      {
        locationString: origin.locationString || '',
        coordinates: [originLng, originLat]
      },
      {
        locationString: destination.locationString || '',
        coordinates: [destLng, destLat]
      },
      rideType
    );

    res.status(201).json(await ride.getDecryptedLocations());
  } catch (error) {
    console.error('Ride request error:', error);
    res.status(500).json({ 
      error: "Failed to process ride request",
      debug: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Event logging
router.post('/:rideId/accept', async (req, res) => {
  try {
    const rideManager = RideManagementSystem.getInstance();
    const ride = await rideManager.assignDriver(req.params.rideId, req.user.id);
    
    // Log event
    ride.events.push({
      type: 'driver_accepted',
      timestamp: new Date(),
      data: { driverId: req.user.id }
    });
    await ride.save();

    res.json(ride);
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({ error: error.message });
  }
});


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

    res.json(ride);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to accept ride" });
  }
};

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

    res.json(ride);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to complete ride" });
  }
};

exports.getNewRides = async (req, res) => {
  try {
    const tenMintuesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const rides = await Ride.find({
      status: 'REQUESTED',
      driver: { $exists: false },
      requestedAt: { $gte: tenMintuesAgo }
    })
      .populate('passenger', 'name phone')
      .select('-__v')
      .sort({ requestedAt: -1 });
    
    res.json(rides);
  } catch (err) {
    console.error('Get new rides error:', err.message);
    res.status(500).json({ error: "Failed to fetch new rides" });
  }
};
