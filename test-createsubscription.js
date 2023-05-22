
const API_KEY = 'sk_test_51N4MyIK0rKl89eyeKfxzfRsFYdrxlD3uxYgHOtzj8ik0XUFzVAFl0jfo60ElGYCdgzgH0zAfzhvSCS5h1w0bKTtI00c4VszTS9';//process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(API_KEY);

const PLANS = {
  LITE: 'price_1NAApTK0rKl89eyeewomgfK9',//process.env.STRIPE_ESP_LITE_PLAN,
  STANDARD: 'price_1NAApoK0rKl89eye1V5hKGPM',//process.env.STRIPE_ESP_STANDARD_PLAN,
  PREMIUM: 'price_1NAAq9K0rKl89eye4WPTVDyD',//process.env.STRIPE_ESP_PREMIUM_PLAN,
};

const createSubscription = require('./functions/payments/stripe/createSubscription')(stripe);

createSubscription('cus_Nw48ZFwLUA3P16', 'card_1NACAoK0rKl89eyeH47HnVHf', PLANS['PREMIUM'])
  .then(subscription => {
    console.log(subscription)
  })
  .catch(err => {
    console.log(err);
  })
