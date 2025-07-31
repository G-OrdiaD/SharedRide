const PaymentFactory = {
      /**
       * Creates a payment processor based on the payment type.
       * @param {string} paymentType - e.g., 'credit_card', 'paypal'
       * @param {string} rideId - The ID of the ride.
       * @param {number} amount - The amount to process.
       * @returns {Object} A payment processor object with a 'process' method.
       */
      create: (paymentType, rideId, amount) => {
        // In a real application, you'd have actual payment processing logic
        // based on the paymentType.
        switch (paymentType) {
          case 'credit_card':
            return {
              process: async () => {
                console.log(`Processing Credit Card payment for ride ${rideId}, amount: $${amount}`);
                // Simulate async payment processing
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('Credit Card payment successful.');
                return { success: true, transactionId: 'cc_trans_123' };
              }
            };
          case 'paypal':
            return {
              process: async () => {
                console.log(`Processing PayPal payment for ride ${rideId}, amount: $${amount}`);
                // Simulate async payment processing
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('PayPal payment successful.');
                return { success: true, transactionId: 'pp_trans_456' };
              }
            };
          default:
            console.error(`Unsupported payment type: ${paymentType}`);
            throw new Error(`Unsupported payment type: ${paymentType}`);
        }
      }
    };

    module.exports = PaymentFactory;
    