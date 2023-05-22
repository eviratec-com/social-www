module.exports = function (stripe) {
  return async function createSubscription (customer, source, plan, user, site) {
    const subscription = await stripe.subscriptions.create({
      customer: customer,
      default_payment_method: source,
      items: [
        {
          price: plan,
          metadata: {
            esp_user_id: user,
            esp_site: site,
          }
        },
      ],
    });

    return subscription;
  }
}
