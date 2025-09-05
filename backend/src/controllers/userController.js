const bcrypt = require('bcryptjs');
const Ride = require('../models/Ride');
const PaymentFactory = require('../path/to/PaymentFactory');
const { User, Passenger, Driver } = require('../models/User'); // Destructure User, Passenger, Driver

exports.getUserProfile = async (req, res, next) => {
  try {
    // Assuming req.user is populated by authMiddleware
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getWallet = async (req, res, next) => {
  try {
    if (req.user.role !== 'passenger') {
      return res.status(403).json({ error: 'Access denied. Passengers only.' });
    }
    // Find the passenger and only select the walletBalance field
    const passenger = await Passenger.findById(req.user.id).select('walletBalance');
    res.json({ balance: passenger.walletBalance });
  } catch (err) {
    next(err);
  }
};

exports.topUpWallet = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body; // e.g., paymentMethod: 'card'

    if (req.user.role !== 'passenger') {
      return res.status(403).json({ error: 'Access denied. Passengers only.' });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive.' });
    }

    // Use PaymentFactory to process the external payment
    const topUpId = `topup_${req.user.id}_${Date.now()}`;
    const processor = PaymentFactory.create(paymentMethod, topUpId, amount);

    const paymentResult = await processor.process();

    if (!paymentResult.success) {
      return res.status(402).json({ error: 'Payment failed', details: paymentResult });
    }

    // If payment successful, update the passenger's wallet
    const updatedPassenger = await Passenger.findByIdAndUpdate(
      req.user.id,
      { $inc: { walletBalance: amount } }, // Increment the balance
      { new: true } // Return the updated document
    ).select('walletBalance');

    res.json({
      message: 'Wallet topped up successfully',
      newBalance: updatedPassenger.walletBalance,
      transactionDetails: paymentResult
    });

  } catch (err) {
    next(err);
  }
};

exports.getEarnings = async (req, res, next) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Access denied. Drivers only.' });
    }

    const driverId = req.user.id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Aggregation Pipeline: Calculate total and today's earnings
    const earnings = await Ride.aggregate([
      {
        $match: {
          driver: mongoose.Types.ObjectId(driverId),
          status: 'completed',
          completedAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$fare' },
          todayEarnings: {
            $sum: {
              $cond: [{ $gte: ['$completedAt', startOfToday] }, '$fare', 0]
            }
          }
        }
      }
    ]);

    // If no rides found, aggregation returns empty array
    const result = earnings.length > 0
      ? { total: earnings[0].totalEarnings, today: earnings[0].todayEarnings }
      : { total: 0, today: 0 };

    res.json(result);

  } catch (err) {
    next(err);
  }
};

exports.getUserRatings = async (req, res, next) => {
  try {
    // If :userId is provided, use it. Otherwise, get ratings for the logged-in user.
    const targetUserId = req.params.userId || req.user.id;
    const targetUser = await User.findById(targetUserId).select('role');

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    let matchCondition;
    let ratingField;

    if (targetUser.role === 'driver') {
      matchCondition = { driver: targetUserId, status: 'completed', 'driverRating.score': { $exists: true } };
      ratingField = 'driverRating';
    } else if (targetUser.role === 'passenger') {
      matchCondition = { passenger: targetUserId, status: 'completed', 'passengerRating.score': { $exists: true } };
      ratingField = 'passengerRating';
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    const ratingsData = await Ride.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          averageRating: { $avg: `$${ratingField}.score` },
          allFeedback: { $push: `$${ratingField}` }
        }
      }
    ]);

    const result = ratingsData.length > 0
      ? {
          averageRating: Math.round(ratingsData[0].averageRating * 10) / 10 || 0, // Round to 1 decimal place
          feedbackList: ratingsData[0].allFeedback.filter(fb => fb.feedback) // Filter out entries without feedback
        }
      : { averageRating: 0, feedbackList: [] };

    res.json(result);

  } catch (err) {
    next(err);
  }
};