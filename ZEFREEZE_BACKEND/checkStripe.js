require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

(async () => {
  const balance = await stripe.balance.retrieve();
  console.log(balance);
})();