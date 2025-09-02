const Ride = require('../models/Ride');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');
const RideManagementSystem = require('../services/RideManagementSystem');

exports.requestRide = async (req, res) => {
  try {
    // Detailed request logging
    console.log('=== RIDE REQUEST RECEIVED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Authenticated user ID:', req.user.id);

    const { origin, destination, rideType } = req.body;

    // Validate required fields with detailed error messages
    const errors = {};
    if (!origin?.locationString) errors.origin = "Missing origin description";
    if (!destination?.locationString) errors.destination = "Missing destination description";
    if (!origin?.location?.coordinates) errors.originCoords = "Missing origin coordinates";
    if (!destination?.location?.coordinates) errors.destinationCoords = "Missing destination coordinates";

    // Validate coordinate arrays
    if (origin?.location?.coordinates && (!Array.isArray(origin.location.coordinates) || origin.location.coordinates.length !== 2)) {
      errors.originCoords = "Origin coordinates must be an array of [longitude, latitude]";
    }

    if (destination?.location?.coordinates && (!Array.isArray(destination.location.coordinates) || destination.location.coordinates.length !== 2)) {
      errors.destinationCoords = "Destination coordinates must be an array of [longitude, latitude]";
    }

    // Validate coordinate values are numbers
    if (origin?.location?.coordinates) {
      const [lng, lat] = origin.location.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
        errors.originCoords = "Origin coordinates must be valid numbers";
      }
    }

    if (destination?.location?.coordinates) {
      const [lng, lat] = destination.location.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
        errors.destinationCoords = "Destination coordinates must be valid numbers";
      }
    }

    if (Object.keys(errors).length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({
        error: "Validation failed",
        details: errors
      });
    }

    // Parse and validate coordinates
    const originLng = parseFloat(origin.location.coordinates[0]);
    const originLat = parseFloat(origin.location.coordinates[1]);
    const destLng = parseFloat(destination.location.coordinates[0]);
    const destLat = parseFloat(destination.location.coordinates[1]);

    if (isNaN(originLng) || isNaN(originLat) || isNaN(destLng) || isNaN(destLat)) {
      return res.status(400).json({
        error: "Invalid coordinate values",
        details: {
          originCoords: "Coordinates must be valid numbers",
          destinationCoords: "Coordinates must be valid numbers"
        }
      });
    }

    // Create ride with properly formatted data
    const ride = new Ride({
      passenger: req.user.id,
      origin: {
        locationString: origin.locationString,
        location: {
          type: 'Point',
          coordinates: [originLng, originLat]
        }
      },
      destination: {
        locationString: destination.locationString,
        location: {
          type: 'Point',
          coordinates: [destLng, destLat]
        }
      },
      rideType: rideType || 'standard',
      status: 'REQUESTED'
    });

    console.log('Ride object created:', JSON.stringify(ride, null, 2));

    // Save the ride
    await ride.save();
    
    console.log('Ride saved successfully with ID:', ride._id);
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