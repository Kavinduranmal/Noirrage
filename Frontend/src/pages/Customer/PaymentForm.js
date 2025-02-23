// PaymentForm.js
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, Typography, Box } from "@mui/material";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    const cardElement = elements.getElement(CardElement);

    // Create a payment method with card details
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      setError(null);
      // In a real-world scenario, send paymentMethod.id to your backend
      console.log("PaymentMethod:", paymentMethod);
      setPaymentSuccess(true);
      setProcessing(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, margin: "auto", mt: 3 }}
    >
      <Typography variant="h5" gutterBottom>
        Enter Payment Details
      </Typography>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": { color: "#aab7c4" },
            },
            invalid: { color: "#9e2146" },
          },
        }}
      />
      {error && (
        <Typography variant="body2" color="error" mt={2}>
          {error}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={!stripe || processing}
        sx={{ mt: 2 }}
        fullWidth
      >
        {processing ? "Processing..." : "Pay Now"}
      </Button>
      {paymentSuccess && (
        <Typography variant="body1" color="success.main" mt={2}>
          Payment successful!
        </Typography>
      )}
    </Box>
  );
};

export default CheckoutForm;
