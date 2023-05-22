
const API_KEY = 'sk_test_51N4MyIK0rKl89eyeKfxzfRsFYdrxlD3uxYgHOtzj8ik0XUFzVAFl0jfo60ElGYCdgzgH0zAfzhvSCS5h1w0bKTtI00c4VszTS9';//process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(API_KEY);

const PLANS = {
  LITE: 'price_1NAApTK0rKl89eyeewomgfK9',//process.env.STRIPE_ESP_LITE_PLAN,
  STANDARD: 'price_1NAApoK0rKl89eye1V5hKGPM',//process.env.STRIPE_ESP_STANDARD_PLAN,
  PREMIUM: 'price_1NAAq9K0rKl89eye4WPTVDyD',//process.env.STRIPE_ESP_PREMIUM_PLAN,
};

const subscribe = require('./functions/payments/stripe/subscribe')(stripe, PLANS);

const customer = {
  email: 'callanpmilne@gmail.com',
  user: 100000000,
  name: 'Callan Milne',
  site: 'milne.eviratecsocial.life'
};

const address = {
  line1: '21 Castor Street',
  line2: '',
  city: 'Clifton Beach',
  state: 'Queensland',
  zip: '4879',
  country: 'AU',
};

const card = {
  name: 'Callan Milne',
  number: '424242424242424242',
  exp_month: '12',
  exp_year: '34',
  cvc: '567',
};

const plan = 'STANDARD';

subscribe(customer, address, card, plan)
  .then(subscription => {
    console.log(subscription)
  })
  .catch(err => {
    console.log(err);
  })
