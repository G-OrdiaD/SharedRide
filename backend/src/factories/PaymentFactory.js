const PaymentFactory = {
  /**
   * Creates a payment processor instance
   * @param {string} paymentType - 'card', 'crypto_wallet', or 'cash'
   * @param {string} rideId - Associated ride ID
   * @param {number} amount - Payment amount
   * @returns {object} Processor instance with process() method
   * @throws {Error} For invalid payment types
   */
  create: (paymentType, rideId, amount) => {
    // Validate input
    const validTypes = ['card', 'crypto_wallet', 'cash'];
    if (!validTypes.includes(paymentType)) {
      throw new Error(`Invalid payment type: ${paymentType}. Valid types are: ${validTypes.join(', ')}`);
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}. Must be positive number`);
    }

    console.log(`[PaymentFactory] Creating ${paymentType} processor for ride ${rideId}, amount: $${amount.toFixed(2)}`);

    // Return appropriate processor
    switch (paymentType) {
      case 'card':
        return {
          process: async () => {
            console.log(`[CreditCard] Processing $${amount} payment for ride ${rideId}`);
            await simulateProcessing(1500);
            return { 
              success: true, 
              transactionId: `cc_${Date.now()}`,
              receiptUrl: `https://payments.example.com/receipts/${rideId}`
            };
          }
        };

      case 'crypto_wallet':
        return {
          process: async () => {
            console.log(`[Crypto] Processing ${amount} BTC payment for ride ${rideId}`);
            await simulateProcessing(2000); // Crypto takes longer
            return {
              success: true,
              txHash: `0x${randomHexString(64)}`,
              confirmationUrl: `https://blockchain.example.com/tx/${rideId}`
            };
          }
        };

      case 'cash':
        return {
          process: async () => {
            console.log(`[Cash] Marking $${amount} cash payment for ride ${rideId}`);
            await simulateProcessing(500); // Faster processing
            return {
              success: true,
              transactionId: `cash_${Date.now()}`,
              instructions: 'Payment to be collected in person'
            };
          }
        };

      default:
      
        throw new Error(`Unhandled payment type: ${paymentType}`);
    }
  }
};

// Helper functions
const simulateProcessing = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomHexString = (length) => Array.from({length}, () => Math.floor(Math.random() * 16).toString(16)).join('');

module.exports = PaymentFactory;