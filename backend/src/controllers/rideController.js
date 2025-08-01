const Ride = require('../models/Ride');

exports.requestRide = async (req, res) => {
  const { origin, destination, rideType } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: "Origin and destination required" });
  }

  try {
    const ride = new Ride({
      passenger: req.user.id,
      origin,
      destination,
      rideType,
      status: 'REQUESTED' // Ensure status matches enum in Ride.js
    });

    await ride.save();

    // Broadcast to drivers
    // NOTE: req.io needs to be attached to the request object,
    // typically done in app.js if using middleware or directly in route setup.
    // Assuming req.io is correctly available here.
    if (req.io) {
      req.io.emit('newRide', {
        rideId: ride._id,
        origin,
        destination,
        rideType
      });
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
    res.status(500).json({ error: "Failed to request ride" });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Ensure only a driver can accept a ride and it's in 'REQUESTED' status
    if (ride.status !== 'REQUESTED') {
      return res.status(400).json({ error: "Ride is not in a requested state" });
    }
    if (ride.driver) {
      return res.status(400).json({ error: "Ride already has a driver" });
    }

    ride.driver = req.user.id; // Assign the accepting driver's ID
    ride.status = 'MATCHED'; // Update status to 'MATCHED' or 'ACCEPTED'
    await ride.save();

    // Notify the passenger that their ride has been accepted
    if (req.io) {
      req.io.to(ride.passenger.toString()).emit('rideAccepted', {
        rideId: ride._id,
        driverId: req.user.id, // Send driver's ID
        driverName: req.user.name // Assuming req.user has name from authMiddleware
      });
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

    // Ensure only the assigned driver can complete the ride
    // And the ride is in an 'ONGOING' or 'MATCHED' state
    if (ride.driver.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to complete this ride" });
    }
    if (ride.status !== 'ONGOING' && ride.status !== 'MATCHED') {
      return res.status(400).json({ error: "Ride cannot be completed in its current state" });
    }

    ride.status = 'COMPLETED'; // Set status to completed
    ride.endTime = new Date(); // Record completion time
    // You might want to calculate final fare here if it wasn't done on request
    // or if it needs adjustment based on actual trip details.
    // For now, assuming fare was set on request.

    await ride.save();

    // Optionally, trigger payment processing here or in a separate service
    // const Payment = require('../models/Payment');
    // const payment = new Payment({
    //   ride: ride._id,
    //   amount: ride.fare,
    //   passenger: ride.passenger,
    //   type: 'credit', // Or based on passenger's default payment method
    //   status: 'PENDING'
    // });
    // await payment.save();
    // await payment.process(); // Mark payment as paid

    // Notify passenger that the ride is completed
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