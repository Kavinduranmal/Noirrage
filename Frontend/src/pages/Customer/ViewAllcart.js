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
import { Delete, Close } from "@mui/icons-material";
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
    try {
      await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item removed from cart!");
      onItemRemoved(itemId);
    } catch (error) {
      toast.error("Error removing item from cart");
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
        navigate("/userorders");
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

  const PaymentSection = useMemo(
    () => (
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            color: "gold",
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            fontWeight: 600,
            mb: 1,
          }}
        >
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
              invalid: { color: "#ffvolution444" },
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
    [paymentError]
  );

  if (loading || cartItems.length === 0) {
    return (
      <Box sx={{ width: "100%", m: 2 }}>
        <LinearProgress
          sx={{
            backgroundColor: "black",
            "& .MuiLinearProgress-bar": { backgroundColor: "gold" },
          }}
        />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ my: 2 }}>
      <Box sx={{ position: "relative", p: { xs: 1, md: 4 } }}>
        <IconButton
          onClick={() => navigate("/CustProductList")}
          sx={{ position: "absolute", top: 8, right: 8, color: "#ff4d4d" }}
        >
          <Close />
        </IconButton>

        <Typography
          variant="h3"
          sx={{
            color: "gold",
            fontFamily: "'Poppins', sans-serif",
            textAlign: "center",
            mb: { xs: 2, md: 4 },
            fontSize: { xs: "1.8rem", md: "3rem" },
          }}
        >
          {step === 1 ? "My Cart" : "Checkout"}
        </Typography>

        <Box
          sx={{
            display: { xs: "block", md: "flex" },
            gap: 4,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Left Side - Item List */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {cartItems.map((item) => (
              <Card
                key={item._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1,
                  mb: 2,
                  background:
                    "linear-gradient(135deg, #2a2a2a 0%, #333333 100%)",
                  borderRadius: 2,
                  border: "1px solid rgba(142, 142, 142, 0.2)",
                  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.8)",
                  flexDirection: { xs: "column", sm: "row" },
                  textAlign: { xs: "center", sm: "left" },
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
                        mr: { sm: 1 },
                        mb: { xs: 1, sm: 0 },
                      }}
                    />
                  }
                  label=""
                />
                <CardMedia
                  component="img"
                  image={
                    item.product?.images?.length > 0
                      ? `http://localhost:5000${item.product.images[0]}`
                      : "http://localhost:5000/default-image.jpg"
                  }
                  alt={item.product?.name || "Product Image"}
                  sx={{
                    width: { xs: 100, sm: 150 },
                    height: { xs: 100, sm: 150 },
                    borderRadius: 2,
                    objectFit: "cover",
                    mr: { sm: 3 },
                    mb: { xs: 1, sm: 0 },
                  }}
                />
                <Box sx={{ flexGrow: 1, color: "#fff", px: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: { xs: "14px", sm: "18px", md: "24px" },
                      fontWeight: 600,
                      color: "gold",
                      mb: 0.5,
                    }}
                  >
                    {item.product?.name || "Unknown Product"}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: { xs: "12px", sm: "14px", md: "18px" },
                      color: "rgba(255, 255, 255, 0.9)",
                      mb: 0.3,
                    }}
                  >
                    Qty: {item.qty}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: { xs: "12px", sm: "14px", md: "18px" },
                      color: "rgba(255, 255, 255, 0.9)",
                      mb: 0.3,
                    }}
                  >
                    Size: {item.size}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: { xs: "12px", sm: "14px", md: "18px" },
                      color: "rgba(255, 255, 255, 0.9)",
                      mb: 0.3,
                    }}
                  >
                    Color: {item.color}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: { xs: "14px", sm: "16px", md: "20px" },
                      fontWeight: 500,
                      color: "white",
                    }}
                  >
                    Rs {(item.product?.price || 0) * item.qty}.00
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
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
                  sx={{
                    mt: { xs: 1, sm: 0 },
                    ml: { sm: 2 },
                    bgcolor: "gold",
                    color: "black",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    px: { xs: 2, sm: 3 },
                    py: 0.5,
                    "&:hover": { bgcolor: "red", color: "black" },
                  }}
                >
                  Remove <Delete fontSize="small" />
                </Button>
              </Card>
            ))}
            <Typography
              sx={{
                color: "gold",
                textAlign: "right",
                mt: 2,
                fontSize: { xs: "1.2rem", md: "1.7rem" },
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

          {/* Right Side - Buttons/Form */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {step === 1 && (
              <form onSubmit={handleProceedToCheckout}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mt: { xs: 2, md: 4 },
                    justifyContent: "center",
                    flexDirection: { xs: "column", sm: "row" },
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
                      py: 1,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/CustProductList")}
                    sx={{
                      color: "gray",
                      borderColor: "gray",
                      "&:hover": { borderColor: "#ffcc00", color: "#ffcc00" },
                      px: 4,
                      py: 1,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Keep Shopping
                  </Button>
                </Box>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOrderSubmit}>
                <Box sx={{ py: 2 }}>
                  <Typography
                    sx={{
                      color: "gold",
                      textAlign: "left",
                      mb: 2,
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
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
                        mb: 3,
                        "& input": { color: "white" },
                        "& label": { color: "gray" },
                        "& label.Mui-focused": { color: "white" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "gray" },
                          "&:hover fieldset": { borderColor: "white" },
                          "&.Mui-focused fieldset": {
                            borderColor: "#fdc200",
                          },
                        },
                      }}
                     
                    />
                  ))}
                  {PaymentSection}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      justifyContent: "center",
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => setStep(1)}
                      sx={{
                        color: "gray",
                        borderColor: "gray",
                        "&:hover": { borderColor: "#ffcc00", color: "#ffcc00" },
                        px: 4,
                        py: 1,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={processing || !stripe || !elements}
                      sx={{
                        bgcolor: "black",
                        color: "white",
                        fontWeight: 600,
                        "&:hover": { color: "black", bgcolor: "gold" },
                        px: 4,
                        py: 1,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                    >
                      {processing ? "Processing..." : "Pay & Order"}
                    </Button>
                  </Box>
                </Box>
              </form>
            )}
          </Box>
        </Box>
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
