// Initialize Stripe only if API key is provided
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

module.exports = {
  createPaymentIntent: async (amount, currency) => {
    if (!stripe) {
      console.warn('Stripe not configured. Payment integration disabled.');
      throw new Error('Payment integration not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ['card', 'promptpay'],
      });
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // More Stripe functions will be added here
};
