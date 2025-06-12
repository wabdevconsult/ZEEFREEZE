import React, { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

const ClientPaymentPage = () => {
  useEffect(() => {
    // any additional logic if needed
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Paiement sécurisé</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 mb-4">Formulaire de paiement à implémenter</p>
        {/* <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements> */}
      </div>
    </div>
  );
};

export default ClientPaymentPage;