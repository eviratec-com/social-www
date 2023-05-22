
const API_KEY = 'sk_test_51N4MyIK0rKl89eyeKfxzfRsFYdrxlD3uxYgHOtzj8ik0XUFzVAFl0jfo60ElGYCdgzgH0zAfzhvSCS5h1w0bKTtI00c4VszTS9';//process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(API_KEY);

const createCard = require('./functions/payments/stripe/createCard')(stripe);

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
  number: 4242424242424242,
  exp_month: 12,
  exp_year: 34,
  cvc: 567,
};



stripe
  .customers
  .createSource('cus_Nw48ZFwLUA3P16', {source: 'tok_mastercard'})
  .then(source => {
    console.log(source)
  })
  .catch(err => {
    console.log(err);
  })
