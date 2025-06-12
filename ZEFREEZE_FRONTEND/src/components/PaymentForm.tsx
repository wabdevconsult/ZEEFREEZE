import React, { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { makePayment } from "../services/paymentService";

interface PaymentFormProps {
  userId: string;
  paymentId: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ userId, paymentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("Carte introuvable.");
      setLoading(false);
      return;
    }

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (stripeError || !paymentMethod) {
      setError(stripeError?.message || "Erreur lors de la création du paiement.");
      setLoading(false);
      return;
    }

    try {
      const res = await makePayment({
        userId,
        paymentId,
        paymentMethodId: paymentMethod.id,
      });

      if (res.status === 200) {
        setSuccess(true);
      } else {
        setError("Paiement échoué.");
      }
    } catch (err) {
      setError("Erreur serveur pendant le paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-3 border border-gray-300 rounded-md" />
      <button
        type="submit"
        disabled={!stripe || loading || success}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {loading ? "Paiement en cours..." : success ? "Paiement réussi !" : "Payer"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default PaymentForm;
