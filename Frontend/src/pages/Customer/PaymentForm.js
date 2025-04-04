// PaymentForm.js
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, Typography, Box } from "@mui/material";
import { toast } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Load your Stripe public key (ensure it's the same one)
const stripePromise = loadStripe("pk_test_51QvbnMRqDKD7gCFBoXQPbCKeKKaWNneQKpfcTMa0nKiC6dsUTO9Y4ilSLBPu74BJFDeXltxYMGwGYppzdo7m2tBx0027lVqT11");

const PaymentForm = ({ onSuccessfulPayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);


  const handleSuccessfulPayment = (paymentMethod) => {
    console.log("Payment successful:", paymentMethod);
    setPaymentSuccess(true);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    // Create a payment method using card details
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
      return;
    }

    // In a real application, you may get these from your app's state or props.
    // For demonstration, we use hard-coded values.
    const order_id = "order123"; // This should be unique for each order.
    const user_id = "6273b2a8c2a1f437f0f3eabc"; // Replace with the actual user id.
    const amount = 50; // For example, $50

    // Request backend to create a PaymentIntent
    try {
      const response = await fetch("https://noirrage.com/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, order_id, user_id }),
      });

      const data = await response.json();
      console.log(data);
      if (data.error) {
        toast.error(data.error);
        setProcessing(false);
        return;
      }
      // Use the client secret to confirm the card payment
      const confirmResult = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmResult.error) {
        toast.error(confirmResult.error.message);
      } else {
        if (confirmResult.paymentIntent.status === "succeeded") {
          toast.success("Payment successful!");
          onSuccessfulPayment(paymentMethod);
        }
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }

    setProcessing(false);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
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
      {/* Wrap PaymentForm with Elements */}
      <Elements stripe={stripePromise}>
            <PaymentForm onSuccessfulPayment={handleSuccessfulPayment} />
          </Elements>
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

export default PaymentForm;
