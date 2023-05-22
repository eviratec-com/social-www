module.exports = function (stripe) {
  return async function createPaymentIntent (amount) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'aud',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  }
}
