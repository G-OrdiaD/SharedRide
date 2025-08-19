const Ride = require('../models/Ride');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');
const RideManagementSystem = require('../services/RideManagementSystem');

exports.requestRide = async (req, res) => {
  try {
    const { origin, destination, rideType } = req.body;

    // Validate required fields
    const errors = {};
    if (!origin?.locationString) errors.origin = "Missing origin description";
    if (!destination?.locationString) errors.destination = "Missing destination description";
    if (!origin?.location?.coordinates) errors.originCoords = "Missing origin coordinates";
    if (!destination?.location?.coordinates) errors.destinationCoords = "Missing destination coordinates";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors
      });
    }

    // Create ride with properly formatted data
    const ride = new Ride({
      passenger: req.user.id,
      origin: {
        locationString: origin.locationString,
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(origin.location.coordinates[0]), // lng
            parseFloat(origin.location.coordinates[1])  // lat
          ]
        }
      },
      destination: {
        locationString: destination.locationString,
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(destination.location.coordinates[0]), // lng
            parseFloat(destination.location.coordinates[1])  // lat
          ]
        }
      },
      rideType: rideType || 'standard',
      status: 'REQUESTED' // Explicitly set to match enum
    });

    await ride.save();
    res.status(201).json(ride);

  } catch (error) {
    console.error('Ride request error:', error);
    res.status(500).json({
      error: "Failed to process ride request",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const rideManager = RideManagementSystem.getInstance();
    const ride = await rideManager.assignDriver(req.params.rideId, req.user.id);
    
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
};

exports.acceptRideLegacy = async (req, res) => {
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