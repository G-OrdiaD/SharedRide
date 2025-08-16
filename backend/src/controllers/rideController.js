const Ride = require('../models/Ride');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');


exports.requestRide = async (req, res) => {
  const { origin, destination, rideType } = req.body;

  // Validate that the required data exists and has the correct structure.
  if (!origin || !destination || !origin.location || !destination.location) {
    return res.status(400).json({ error: "Invalid origin or destination location data." });
  }

  try {
    const ride = new Ride({
      passenger: req.user.id,
      origin: {
        locationString: origin.locationString,
        // The location field should be a GeoJSON object as per your model
        location: {
          type: 'Point',
          coordinates: [origin.location.lng, origin.location.lat]
        }
      },
      destination: {
        locationString: destination.locationString,
        location: {
          type: 'Point',
          coordinates: [destination.location.lng, destination.location.lat]
        }
      },
      rideType: rideType,
      status: 'REQUESTED'
    });

    const fareStrategy = getFareStrategy(ride.rideType);

    if (!fareStrategy) {
       throw new Error(`Invalid ride type: ${ride.rideType}`); // Ensure fareStrategy is defined
    }
   
    if (!fareStrategy || typeof fareStrategy.calculate !== 'function') {
      console.warn(`No valid fare strategy found for type: ${ride.rideType}. Setting fare to 0.`);
      ride.fare = 0;
    } else {

      // Calculate fare using the strategy's calculate method
      ride.fare = fareStrategy.calculate( // Pass GeoJSON coordinates to the fare strategy
        ride.origin.location.coordinates,
        ride.destination.location.coordinates
      );
    }
    

    await ride.save();

    res.status(201).json({
      _id: ride._id,
      status: ride.status,
      passenger: ride.passenger,
      origin: ride.origin,
      destination: ride.destination,
      fare: ride.fare
    });
  } catch (err) {
    console.error(`Error in requestRide: ${err.message}`);
    res.status(500).json({ error: "Failed to request ride" });
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
