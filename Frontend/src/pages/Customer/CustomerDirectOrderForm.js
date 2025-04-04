import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  LinearProgress,
  IconButton,
  CardMedia,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Add, Remove, Close } from "@mui/icons-material";
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

const CustomerDirectOrderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [shippingDetails, setShippingDetails] = useState({
    email: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    postalCode: "",
    contactNumber: "",
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem("userToken");
  const productId = location.state?.productId || null;


  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup when component unmounts
    };
  }, []);

  const handlePayHerePayment = () => {
    if (window.payhere) {
      const payment = {
        sandbox: true,
        merchant_id: "YOUR_MERCHANT_ID",
        return_url: "http://localhost:3000/payment-success",
        cancel_url: "http://localhost:3000/payment-cancel",
        notify_url: "http://your-backend-url.com/payhere-notify",
        order_id: "ORDER_001",
        items: "Clothing Order",
        amount: "2500.00",
        currency: "LKR",
        first_name: "John",
        last_name: "Doe",
        email: "johndoe@example.com",
        phone: "0771234567",
        address: "123, Colombo, Sri Lanka",
        city: "Colombo",
        country: "Sri Lanka",
      };

      window.payhere.startPayment(payment);
    } else {
      alert("PayHere script not loaded. Please try again.");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to continue");
      navigate("/user/Login");
      return;
    }

    const fetchUserId = async () => {
      try {
        const response = await axios.get(
          "/api/auth/profileview",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserId(response.data._id);
      } catch (error) {
        toast.error("Failed to fetch user details");
        navigate("/user/Login");
      }
    };

    fetchUserId();

    if (productId) {
      fetchProduct();
    }
  }, [productId, token, navigate]);

  useEffect(() => {
    if (availableColors.length > 0) {
      setColor(availableColors[0]);
    }
  }, [availableColors]);

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSize(availableSizes[0]);
    }
  }, [availableSizes]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get("/api/products");
      const product = data.find((p) => p._id === productId);
      if (product) {
        setSelectedProduct(product);
        setAvailableColors(product.colors || []);
        setAvailableSizes(product.sizes || []);
      } else {
        toast.error("Product not found");
        navigate("/CustProductList");
      }
    } catch (error) {
      toast.error("Failed to load product details");
      navigate("/CustProductList");
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (event, newColor) => {
    if (newColor) setColor(newColor);
  };

  const handleSizeChange = (event, newSize) => {
    if (newSize) setSize(newSize);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (!size || !color) {
        toast.error("Please select a size and color");
        return;
      }
      if (
        !shippingDetails.email ||
        !shippingDetails.addressLine1 ||
        !shippingDetails.contactNumber
      ) {
        toast.error("Please fill in all required shipping details");
        return;
      }
      setStep(2);
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

    const orderData = {
      products: [
        {
          product: selectedProduct._id,
          quantity,
          size,
          color,
        },
      ],
      totalPrice: selectedProduct.price * quantity,
      shippingDetails: {
        email: shippingDetails.email,
        address: fullAddress,
        contactNumber: shippingDetails.contactNumber,
      },
    };

    try {
      // Create the order
      const { data } = await axios.post(
        "/api/orders/create",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const orderId = data.order._id;

      // Create payment intent
      const paymentResponse = await axios.post(
        "/api/stripe/create-payment-intent",
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { clientSecret } = paymentResponse.data;

      // Confirm payment
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

  if (loading || !selectedProduct || !userId) {
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
    <Container maxWidth="lg" sx={{ my: 3 }}>
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          position: "relative",
          boxShadow: "0px 12px 20px rgba(0, 0, 0, 0.88)",
          borderRadius: 2,
          background: "linear-gradient(90deg, #232526, #414345)",
        }}
      >
        <IconButton
          onClick={() => navigate("/CustProductList")}
          sx={{ position: "absolute", top: 8, right: 8, color: "red" }}
        >
          <Close />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "35%" }, textAlign: "center" }}>
            <Card sx={{ boxShadow: 3, p: 2 }}>
              <CardMedia
                component="img"
                image={`https://noirrage.com${selectedProduct.images[selectedImageIndex]}`}
                alt={selectedProduct.name}
                sx={{
                  borderRadius: "10px",
                  mb: 2,
                  width: "100%",
                  height: "auto",
                }}
              />
            </Card>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              {selectedProduct.images.map((img, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    minWidth: 50,
                    height: 50,
                    backgroundImage: `url(https://noirrage.com${img})`,
                    backgroundSize: "cover",
                    border:
                      selectedImageIndex === index
                        ? "2px solid gold"
                        : "1px solid black",
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "60%" },
              p: { xs: 2, md: 3 },
              display: "flex",
              justifyContent: "center",
            }}
          >
            <form
              onSubmit={handleOrderSubmit}
              style={{ width: "100%", maxWidth: "600px" }}
            >
              {step === 1 && (
                <>
                  <Typography
                    variant="h4"
                    color="#fdc200"
                    sx={{
                      mb: 4,
                      fontFamily: "'Raleway', sans-serif",
                      textAlign: { xs: "center", md: "left" },
                    }}
                  >
                    {selectedProduct.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: "lightgray",
                      pb: 3,
                      fontSize: "1.7rem",
                      textAlign: { xs: "center", md: "left" },
                    }}
                  >
                    Rs {selectedProduct.price}.00
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 3,
                      justifyContent: "space-between",
                      mb: 4,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        color="white"
                        variant="subtitle1"
                        fontWeight="bold"
                      >
                        Quantity
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <IconButton
                          onClick={() =>
                            setQuantity((prev) => Math.max(prev - 1, 1))
                          }
                          sx={{
                            color: "white",
                            border: "1px solid #ccc",
                            borderRadius: "50%",
                          }}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(Math.max(Number(e.target.value), 1))
                          }
                          inputProps={{
                            min: 1,
                            style: { color: "white", textAlign: "center" },
                          }}
                          sx={{ width: "60px" }}
                        />
                        <IconButton
                          onClick={() => setQuantity((prev) => prev + 1)}
                          sx={{
                            color: "white",
                            border: "1px solid #ccc",
                            borderRadius: "50%",
                          }}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        color="white"
                        variant="subtitle1"
                        fontWeight="bold"
                      >
                        Pick a Color
                      </Typography>
                      <ToggleButtonGroup
                        value={color}
                        exclusive
                        onChange={handleColorChange}
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        {availableColors.map((colorOption, index) => (
                          <ToggleButton
                            key={index}
                            value={colorOption}
                            sx={{
                              backgroundColor: colorOption.toLowerCase(),
                              color: "white",
                              border: "1px solid black",
                              "&.Mui-selected": {
                                border: "2px solid gold",
                                color: "white",
                              },
                              minWidth: "40px",
                              height: "40px",
                            }}
                          >
                            {colorOption}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography
                        color="white"
                        variant="subtitle1"
                        fontWeight="bold"
                      >
                        Available Sizes
                      </Typography>
                      <ToggleButtonGroup
                        value={size}
                        exclusive
                        onChange={handleSizeChange}
                        sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                      >
                        {availableSizes.map((sizeOption, index) => (
                          <ToggleButton
                            key={index}
                            value={sizeOption}
                            sx={{
                              color: "black",
                              backgroundColor: "#c6c6c6",
                              border: "1px solid #ccc",
                              "&.Mui-selected": {
                                border: "2px solid gold",
                                color: "white",
                              },
                            }}
                          >
                            {sizeOption}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>
                  </Box>
                  

                  <Typography
                    color="#d7d7d7"
                    variant="h5"
                    gutterBottom
                    sx={{ textAlign: { xs: "center", md: "left" } }}
                  >
                    Shipping Details
                  </Typography>
                  

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {[
                      {
                        id: "addressLine1",
                        label: "Address Line 1",
                        required: true,
                      },
                      {
                        id: "addressLine2",
                        label: "Address Line 2 (Optional)",
                      },
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
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 3,
                      bgcolor: "#fdc200",
                      color: "black",
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "#e0a800" },
                      width: { xs: "100%", sm: "auto" },
                    }}
                    type="submit"
                  >
                    Next
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Typography
                    variant="h4"
                    color="#fdc200"
                    sx={{
                      mb: 2,
                      fontFamily: "'Raleway', sans-serif",
                      textAlign: { xs: "center", md: "left" },
                    }}
                  >
                    Confirm Your Order
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      color="white"
                      sx={{
                        fontWeight: 500,
                        textAlign: { xs: "center", md: "left" },
                      }}
                    >
                      Total: Rs {selectedProduct.price * quantity}.00
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      color="#fdc200"
                      sx={{ mb: 1, fontFamily: "'Raleway', sans-serif" }}
                    >
                      Order Summary
                    </Typography>
                    <Box sx={{ color: "white" }}>
                      <Typography>
                        {selectedProduct.name} - {quantity} x Rs{" "}
                        {selectedProduct.price}
                      </Typography>
                      <Typography>Size: {size}</Typography>
                      <Typography>Color: {color}</Typography>
                      <Typography>
                        Shipping to:{" "}
                        {[
                          shippingDetails.addressLine1,
                          shippingDetails.addressLine2,
                          shippingDetails.addressLine3,
                          shippingDetails.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </Typography>
                      <Typography>Email: {shippingDetails.email}</Typography>
                      <Typography>
                        Contact: {shippingDetails.contactNumber}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" color="#fdc200" sx={{ mb: 1 }}>
                      Payment
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
                      <Typography color="error" mt={2}>
                        {paymentError}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{ display: "flex", gap: 2, justifyContent: "center" }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => setStep(1)}
                      sx={{
                        color: "white",
                        borderColor: "white",
                        "&:hover": { borderColor: "#fdc200", color: "#fdc200" },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={processing || !stripe}
                      sx={{
                        bgcolor: "#fdc200",
                        color: "black",
                        fontWeight: "bold",
                        "&:hover": { bgcolor: "#e0a800" },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      {processing ? "Processing..." : "Pay & Order"}
                    </Button>
                    <Button onClick={handlePayHerePayment}>Pay Now</Button>
                  </Box>
                </>
              )}
            </form>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

const WrappedOrderForm = () => (
  <Elements stripe={stripePromise}>
    <CustomerDirectOrderForm />
  </Elements>
);

export default WrappedOrderForm;
