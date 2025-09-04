const EventEmitter = require('events');
const Ride = require('../models/Ride');
const { Driver } = require('../models/User');
const { getFareStrategy } = require('../strategies/fareStrategyFactory');

// Singleton Ride Management System
class RideManagementSystem extends EventEmitter {
  constructor() {
    super();
    if (RideManagementSystem.instance) {
      return RideManagementSystem.instance;
    }
    RideManagementSystem.instance = this;
    this.activeRides = new Map();
    console.log('RideManagementSystem initialized.');
  }

  static getInstance() {
    if (!RideManagementSystem.instance) {
      RideManagementSystem.instance = new RideManagementSystem();
    }
    return RideManagementSystem.instance;
  }

  async createRide(passengerId, origin, destination, rideType = 'standard') {  // Create a new ride request
    try {
      // Calculate fare
      const fareStrategy = getFareStrategy(rideType);
      const fare = fareStrategy.calculate([origin.lat, origin.lng], [destination.lat, destination.lng]);

      const newRide = new Ride({
        passenger: passengerId,
        origin: { coordinates: [origin.lng, origin.lat], address: origin.address || '' },
        destination: { coordinates: [destination.lng, destination.lat], address: destination.address || '' },
        rideType,
        status: 'requested',
        requestedAt: new Date(),
        fare
      });

      await newRide.save();
      this.activeRides.set(newRide._id.toString(), newRide);
      this.emit('ride:created', newRide);
      return newRide;
    } catch (error) {
      console.error('[RideManagement] Error creating ride:', error);
      throw error;
    }
  }

  async findAvailableDrivers(originCoordinates, rideType, maxDistance = 5000) { // 5 km default
    try {
      return await Driver.find({
        isAvailable: true,
        isActive: true,
        vehicleType: rideType === 'xl' ? 'xl' : { $in: ['standard', 'xl'] },
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: originCoordinates },
            $maxDistance: maxDistance
          }
        }
      }).select('-password -__v');
    } catch (error) {
      console.error('[RideManagement] Error finding drivers:', error);
      throw error;
    }
  }

  async assignDriver(rideId, driverId) { // Assign a driver to a ride
    try {
      const ride = await Ride.findById(rideId);
      if (!ride) throw new Error('Ride not found');

      const driver = await Driver.findById(driverId);
      if (!driver) throw new Error('Driver not found');

      ride.driver = driverId;
      ride.status = 'driver_assigned';
      ride.assignedAt = new Date();

      // Recalculate fare if needed
      if (!ride.fare) {
        const originCoords = [ride.origin.location.coordinates[1], ride.origin.location.coordinates[0]];
        const destCoords = [ride.destination.location.coordinates[1], ride.destination.location.coordinates[0]];
        const fareStrategy = getFareStrategy(ride.rideType);
        ride.fare = fareStrategy.calculate(originCoords, destCoords);
      }

      driver.isAvailable = false;

      await Promise.all([ride.save(), driver.save()]);
      this.emit('driver:assigned', ride, driver);
      return ride;
    } catch (error) {
      console.error('[RideManagement] Error assigning driver:', error);
      throw error;
    }
  }

  async completeRide(rideId) { // Mark ride as completed
    try {
      const ride = await Ride.findById(rideId);
      if (!ride) throw new Error('Ride not found');

      ride.status = 'completed';
      ride.completedAt = new Date();

      if (!ride.fare) {
        const originCoords = [ride.origin.location.coordinates[1], ride.origin.location.coordinates[0]];
        const destCoords = [ride.destination.location.coordinates[1], ride.destination.location.coordinates[0]];
        const fareStrategy = getFareStrategy(ride.rideType);
        ride.fare = fareStrategy.calculate(originCoords, destCoords);
      }

      if (ride.driver) {
        await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
      }

      await ride.save();
      this.activeRides.delete(ride._id.toString());
      this.emit('rideCompleted', ride);
      return ride;
    } catch (error) {
      console.error('[RideManagement] Error completing ride:', error);
      throw error;
    }
  }

  async cancelRide(rideId, reason) { // Cancel a ride
    try {
      const ride = await Ride.findById(rideId);
      if (!ride) throw new Error('Ride not found');

      ride.status = 'cancelled';
      ride.cancelledAt = new Date();
      ride.cancellationReason = reason;

      if (ride.driver) {
        await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
      }

      await ride.save();
      this.activeRides.delete(ride._id.toString());
      this.emit('rideCancelled', ride);
      return ride;
    } catch (error) {
      console.error('[RideManagement] Error cancelling ride:', error);
      throw error;
    }
  }

  async getRideStatus(rideId) { // Get current status of a ride
    try {
      const ride = await Ride.findById(rideId)
        .populate('passenger', 'name phone')
        .populate('driver', 'name phone vehicle');

      if (!ride) throw new Error('Ride not found');
      return ride;
    } catch (error) {
      console.error('[RideManagement] Error getting ride status:', error);
      throw error;
    }
  }
}

module.exports = RideManagementSystem; // Export the singleton instance