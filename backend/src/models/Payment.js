const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  ride:        { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  amount:      { type: Number, required: true },
  type:        { type: String, enum: ['credit','wallet','cash'], required: true },
  status:      { type: String, enum: ['PENDING','PAID','FAILED'], default: 'PENDING' },
  processedAt: Date
}, {
  timestamps: true
});

// Mark as paid
PaymentSchema.methods.process = async function() {
  this.status = 'PAID';
  this.processedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Payment', PaymentSchema);