import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  IconButton,
  CardMedia,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Close } from "@mui/icons-material";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51QvbnMRqDKD7gCFBoXQPbCKeKKaWNneQKpfcTMa0nKiC6dsUTO9Y4ilSLBPu74BJFDeXltxYMGwGYppzdo7m2tBx0027lVqT11"
);

const AddToCartOrderForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const [shippingDetails, setShippingDetails] = useState({
    email: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    postalCode: "",
    contactNumber: "",
  });
  const [paymentError, setPaymentError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem("userToken");

  // Debug multiple mounts
  useEffect(() => {
    console.log("AddToCartOrderForm mounted");
    return () => console.log("AddToCartOrderForm unmounted");
  }, []);

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to continue");
      navigate("/user/Login");
      return;
    }

    const fetchUserDataAndCart = async () => {
      try {
        const userResponse = await axios.get(
          "http://localhost:5000/api/auth/profileview",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const user = userResponse.data;
        setShippingDetails((prev) => ({
          ...prev,
          email: user.email || "",
          addressLine1: user.address?.line1 || "",
          addressLine2: user.address?.line2 || "",
          addressLine3: user.address?.city || "",
          postalCode: user.address?.postalCode || "",
          contactNumber: user.contactNumber || "",
        }));

        const cartResponse = await axios.get(
          "http://localhost:5000/api/cart/view",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Cart Response:", cartResponse.data);
        if (cartResponse.data.items && cartResponse.data.items.length > 0) {
          setCartItems(cartResponse.data.items);
          setSelectedCartItems(cartResponse.data.items.map((item) => item._id));
        } else {
          toast.error("Your cart is empty");
          navigate("/CustProductList");
        }
      } catch (error) {
        toast.error("Failed to load cart or user details");
        navigate("/CustProductList");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndCart();
  }, [token, navigate]);

  const handleRemove = async (itemId, onItemRemoved) => {
    const token = localStorage.getItem("userToken");
    try {
      await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Item removed from cart!");
      onItemRemoved(itemId);
    } catch (error) {
      toast.error("Error removing item from cart");
      console.error(
        "Error removing item:",
        error.response?.data || error.message
      );
    }
  };

  const handleCheckboxChange = (itemId) => {
    setSelectedCartItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    if (selectedCartItems.length === 0) {
      toast.error("Please select at least one item to checkout");
      return;
    }
    setStep(2);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (
      !shippingDetails.email ||
      !shippingDetails.addressLine1 ||
      !shippingDetails.contactNumber
    ) {
      toast.error("Please fill in all required shipping details");
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    const fullAddress = [
      shippingDetails.addressLine1,
      shippingDetails.addressLine2,
      shippingDetails.addressLine3,
      shippingDetails.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    const selectedItems = cartItems.filter((item) =>
      selectedCartItems.includes(item._id)
    );

    const orderData = {
      products: selectedItems.map((item) => ({
        product: item.product._id,
        quantity: item.qty,
        size: item.size,
        color: item.color,
      })),
      totalPrice: selectedItems.reduce(
        (total, item) => total + (item.product?.price || 0) * item.qty,
        0
      ),
      shippingDetails: {
        email: shippingDetails.email,
        address: fullAddress,
        contactNumber: shippingDetails.contactNumber,
      },
    };

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/orders/create",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const orderId = data.order._id;

      const paymentResponse = await axios.post(
        "http://localhost:5000/api/stripe/create-payment-intent",
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { clientSecret } = paymentResponse.data;

      const cardElement = elements.getElement(CardElement);
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: shippingDetails.email,
            address: {
              line1: shippingDetails.addressLine1,
              line2: shippingDetails.addressLine2,
              city: shippingDetails.addressLine3,
              postal_code: shippingDetails.postalCode,
            },
            phone: shippingDetails.contactNumber,
          },
        },
      });

      if (paymentResult.error) {
        setPaymentError(paymentResult.error.message);
        toast.error(paymentResult.error.message);
      } else if (paymentResult.paymentIntent.status === "succeeded") {
        toast.success("Order placed successfully!");
        const updatedCart = cartItems.filter(
          (item) => !selectedCartItems.includes(item._id)
        );
        setCartItems(updatedCart);
        setSelectedCartItems([]);
        navigate("/CustProductList");
      }
    } catch (error) {
      setPaymentError(
        error.response?.data?.message || "Failed to process order"
      );
      toast.error(error.response?.data?.message || "Failed to process order");
    } finally {
      setProcessing(false);
    }
  };

  // Memoized CardElement to ensure single instance
  const PaymentSection = useMemo(
    () => (
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: "#ff9900", fontWeight: 600, mb: 1 }}>
          Payment Details
        </Typography>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#ffffff",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#ff4444" },
            },
          }}
        />
        {paymentError && (
          <Typography sx={{ color: "#ff4d4d", mt: 2 }}>
            {paymentError}
          </Typography>
        )}
      </Box>
    ),
    [paymentError] // Only re-render if paymentError changes
  );

  if (loading || cartItems.length === 0) {
    return (
      <Box sx={{ width: "100%", m: 2 }}>
        <LinearProgress
          sx={{
            backgroundColor: "#1a1a1a",
            "& .MuiLinearProgress-bar": { backgroundColor: "#ff9900" },
          }}
        />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          position: "relative",
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.9)",
          borderRadius: 3,
          background: "linear-gradient(135deg, #1a1a1a 0%, #333333 100%)",
          border: "1px solid gold",
        }}
      >
        <IconButton
          onClick={() => navigate("/CustProductList")}
          sx={{ position: "absolute", top: 12, right: 12, color: "#ff4d4d" }}
        >
          <Close />
        </IconButton>

        <Typography
          variant="h3"
          sx={{
            color: "gold",
            fontFamily: "'Poppins', sans-serif",
            textAlign: "center",
            mb: 4,
          }}
        >
          {step === 1 ? "Your Cart" : "Checkout"}
        </Typography>

        {step === 1 && (
          <form onSubmit={handleProceedToCheckout}>
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              {cartItems.map((item) => (
                <Card
                  key={item._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    mb: 2,
                    backgroundColor: "#2a2a2a",
                    borderRadius: 2,
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.7)",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCartItems.includes(item._id)}
                        onChange={() => handleCheckboxChange(item._id)}
                        sx={{
                          color: "#ff9900",
                          "&.Mui-checked": { color: "#ff9900" },
                        }}
                      />
                    }
                    label=""
                  />
                  <CardMedia
                    component="img"
                    image={
                      item.product &&
                      item.product.images &&
                      item.product.images.length > 0
                        ? `http://localhost:5000${item.product.images[0]}`
                        : "http://localhost:5000/default-image.jpg"
                    }
                    alt={item.product?.name || "Product Image"}
                    sx={{ width: 100, height: 100, borderRadius: 1, mr: 2 }}
                  />
                  <Box sx={{ color: "#ccc", flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>
                      {item.product?.name || "Unknown Product"}
                    </Typography>
                    <Typography>Quantity: {item.qty}</Typography>
                    <Typography>Size: {item.size}</Typography>
                    <Typography>Color: {item.color}</Typography>
                    <Typography>
                      Price: Rs {(item.product?.price || 0) * item.qty}.00
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="medium"
                    onClick={() =>
                      handleRemove(item._id, (removedId) => {
                        setCartItems((prev) =>
                          prev.filter((i) => i._id !== removedId)
                        );
                        setSelectedCartItems((prev) =>
                          prev.filter((id) => id !== removedId)
                        );
                      })
                    }
                    sx={{ ml: 2 }}
                  >
                    Remove
                  </Button>
                </Card>
              ))}
              <Typography
                sx={{
                  color: "#ff9900",
                  fontWeight: 600,
                  textAlign: "right",
                  mt: 2,
                }}
              >
                Subtotal: Rs{" "}
                {cartItems
                  .filter((item) => selectedCartItems.includes(item._id))
                  .reduce(
                    (total, item) =>
                      total + (item.product?.price || 0) * item.qty,
                    0
                  )}
                .00
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 4,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                type="submit"
                sx={{
                  bgcolor: "black",
                  color: "#fff",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "gray" },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/CustProductList")}
                sx={{
                  color: "#ff9900",
                  borderColor: "#ff9900",
                  "&:hover": { borderColor: "#ffcc00", color: "#ffcc00" },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Keep Shopping
              </Button>
            </Box>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOrderSubmit}>
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              <Typography
                variant="h5"
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  mb: 3,
                  textAlign: "center",
                }}
              >
                Order Summary
              </Typography>
              <Box sx={{ mb: 4 }}>
                {cartItems
                  .filter((item) => selectedCartItems.includes(item._id))
                  .map((item) => (
                    <Card
                      key={item._id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        mb: 2,
                        backgroundColor: "#2a2a2a",
                        borderRadius: 2,
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={
                          item.product &&
                          item.product.images &&
                          item.product.images.length > 0
                            ? `http://localhost:5000${item.product.images[0]}`
                            : "http://localhost:5000/default-image.jpg"
                        }
                        alt={item.product?.name || "Product Image"}
                        sx={{ width: 80, height: 80, borderRadius: 1, mr: 2 }}
                      />
                      <Box sx={{ color: "#ccc" }}>
                        <Typography sx={{ fontWeight: 500 }}>
                          {item.product?.name || "Unknown Product"}
                        </Typography>
                        <Typography>Qty: {item.qty}</Typography>
                        <Typography>Size: {item.size}</Typography>
                        <Typography>Color: {item.color}</Typography>
                        <Typography>
                          Rs {(item.product?.price || 0) * item.qty}.00
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          width: "75%",
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          size="medium"
                          onClick={() =>
                            handleRemove(item._id, (removedId) => {
                              setCartItems((prev) =>
                                prev.filter((i) => i._id !== removedId)
                              );
                              setSelectedCartItems((prev) =>
                                prev.filter((id) => id !== removedId)
                              );
                            })
                          }
                          sx={{ ml: 2 }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Card>
                  ))}
                <Typography
                  sx={{ color: "#ff9900", fontWeight: 600, textAlign: "right" }}
                >
                  Total: Rs{" "}
                  {cartItems
                    .filter((item) => selectedCartItems.includes(item._id))
                    .reduce(
                      (total, item) =>
                        total + (item.product?.price || 0) * item.qty,
                      0
                    )}
                  .00
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography sx={{ color: "#ff9900", fontWeight: 600, mb: 2 }}>
                  Shipping Details
                </Typography>
                {[
                  {
                    id: "addressLine1",
                    label: "Address Line 1",
                    required: true,
                  },
                  { id: "addressLine2", label: "Address Line 2 (Optional)" },
                  { id: "addressLine3", label: "City" },
                  { id: "postalCode", label: "Postal Code" },
                  { id: "email", label: "Email", required: true },
                  {
                    id: "contactNumber",
                    label: "Contact Number",
                    required: true,
                  },
                ].map((field) => (
                  <TextField
                    key={field.id}
                    label={field.label}
                    fullWidth
                    value={shippingDetails[field.id] || ""}
                    onChange={(e) =>
                      setShippingDetails({
                        ...shippingDetails,
                        [field.id]: e.target.value,
                      })
                    }
                    required={field.required}
                    sx={{
                      mb: 2,
                      "& input": { color: "white" },
                      "& label": { color: "gray" },
                      "& label.Mui-focused": { color: "white" },
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#2a2a2a",
                        "& fieldset": { borderColor: "gray" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#fdc200",
                        },
                      },
                    }}
                  />
                ))}
              </Box>

              {PaymentSection}

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setStep(1)}
                  sx={{
                    color: "#ff9900",
                    borderColor: "#ff9900",
                    "&:hover": { borderColor: "#ffcc00", color: "#ffcc00" },
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={processing || !stripe || !elements}
                  sx={{
                    bgcolor: "#ff9900",
                    color: "#fff",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#ffcc00" },
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  {processing ? "Processing..." : "Pay & Order"}
                </Button>
              </Box>
            </Box>
          </form>
        )}
      </Box>
    </Container>
  );
};

const WrappedAddToCartOrderForm = () => (
  <Elements stripe={stripePromise}>
    <AddToCartOrderForm />
  </Elements>
);

export default WrappedAddToCartOrderForm;
