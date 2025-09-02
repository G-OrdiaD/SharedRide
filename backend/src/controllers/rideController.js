const Ride = require('../models/Ride');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');
const RideManagementSystem = require('../services/RideManagementSystem');

exports.requestRide = async (req, res) => {
  try {
    const { origin, destination, rideType } = req.body;

    const errors = {};
    if (!origin?.locationString) errors.origin = "Missing origin description";
    if (!destination?.locationString) errors.destination = "Missing destination description";
    if (!origin?.location?.coordinates) errors.originCoords = "Missing origin coordinates";
    if (!destination?.location?.coordinates) errors.destinationCoords = "Missing destination coordinates";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const originLng = parseFloat(origin.location.coordinates[0]);
    const originLat = parseFloat(origin.location.coordinates[1]);
    const destLng = parseFloat(destination.location.coordinates[0]);
    const destLat = parseFloat(destination.location.coordinates[1]);

    const fareStrategy = getFareStrategy(rideType || 'standard');
    const fare = fareStrategy.calculate([originLat, originLng], [destLat, destLng]);

    const ride = new Ride({
      passenger: req.user.id,
      origin: {
        locationString: origin.locationString,
        location: { type: 'Point', coordinates: [originLng, originLat] }
      },
      destination: {
        locationString: destination.locationString,
        location: { type: 'Point', coordinates: [destLng, destLat] }
      },
      rideType: rideType || 'standard',
      status: 'requested',
      fare
    });

    await ride.save();
    res.status(201).json(ride);

  } catch (error) {
    console.error('Ride request error:', error);
    res.status(500).json({ error: "Failed to process ride request" });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const rideManager = RideManagementSystem.getInstance();
    let ride = await rideManager.assignDriver(req.params.rideId, req.user.id);

    if (!ride.fare) {
      const originCoords = [ride.origin.location.coordinates[1], ride.origin.location.coordinates[0]];
      const destCoords = [ride.destination.location.coordinates[1], ride.destination.location.coordinates[0]];
      const fareStrategy = getFareStrategy(ride.rideType || 'standard');
      ride.fare = fareStrategy.calculate(originCoords, destCoords);
      await ride.save();
    }

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

exports.completeRide = async (req, res) => {
  try {
    const rideManager = RideManagementSystem.getInstance();
    const ride = await rideManager.completeRide(req.params.rideId);

    if (!ride.fare) {
      const originCoords = [ride.origin.location.coordinates[1], ride.origin.location.coordinates[0]];
      const destCoords = [ride.destination.location.coordinates[1], ride.destination.location.coordinates[0]];
      const fareStrategy = getFareStrategy(ride.rideType || 'standard');
      ride.fare = fareStrategy.calculate(originCoords, destCoords);
      await ride.save();
    }

    res.json(ride);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to complete ride" });
  }
};

exports.getNewRides = async (req, res) => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const rides = await Ride.find({
      status: 'requested',
      driver: { $exists: false },
      requestedAt: { $gte: tenMinutesAgo }
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