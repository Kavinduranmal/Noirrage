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

const OrderForm = () => {
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
  const [userId, setUserId] = useState(null); // State to hold user ID

  const token = localStorage.getItem("userToken");
  const productId = location.state?.productId || null;

  // Fetch user ID when component mounts
  useEffect(() => {
    if (!token) {
      toast.error("Please log in to continue");
      navigate("/user/Login");
      return;
    }

    const fetchUserId = async () => {
      try {
        const response = await axios.get(
          "http://16.170.141.231:5000/api/auth/profileview",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserId(response.data._id); // Assuming the endpoint returns user object with _id
      } catch (error) {
        toast.error("Failed to fetch user details");
        console.error("Error fetching user ID:", error);
        navigate("/user/Login"); // Redirect to login if token is invalid
      }
    };

    fetchUserId();

    if (productId) {
      fetchProduct();
    }
  }, [productId, token, navigate]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(
        "http://16.170.141.231:5000/api/products"
      );
      const product = data.find((p) => p._id === productId);
      if (product) {
        setSelectedProduct(product);
        setAvailableColors(product.colors || []);
        setAvailableSizes(product.sizes || []);
      }
    } catch (error) {
      toast.error("Failed to load product details");
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!stripe || !elements || !userId) return;

    setProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);
    const amount = selectedProduct.price * quantity * 100; // Convert to cents
    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      const paymentResponse = await axios.post(
        "http://16.170.141.231:5000/api/stripe/create-payment-intent",
        {
          amount,
          order_id: orderId,
          user_id: userId, // Use fetched user ID
          currency: "usd",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { clientSecret } = paymentResponse.data;

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
        setProcessing(false);
        return false;
      }

      if (paymentResult.paymentIntent.status === "succeeded") {
        return true;
      }
      return false;
    } catch (error) {
      setPaymentError("Payment processing failed. Please try again.");
      toast.error("Payment processing failed");
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
      return;
    }

    const paymentSuccessful = await handlePayment();
    if (!paymentSuccessful) return;

    // Concatenate address fields into a single string for backend
    const fullAddress = [
      shippingDetails.addressLine1,
      shippingDetails.addressLine2,
      shippingDetails.addressLine3,
      shippingDetails.postalCode,
    ]
      .filter(Boolean) // Remove empty fields
      .join(", ");

    const orderData = {
      user: userId, // Pass the fetched user ID to match Order model
      products: [
        {
          product: selectedProduct?._id,
          quantity,
          size,
          color,
          images: selectedProduct?.images || [],
        },
      ],
      totalPrice: selectedProduct?.price * quantity,
      shippingDetails: {
        email: shippingDetails.email,
        address: fullAddress,
        contactNumber: shippingDetails.contactNumber,
      },
      paymentStatus: "completed", // Add this if your backend accepts it, though not in schema
    };

    try {
      await axios.post("http://16.170.141.231:5000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order placed successfully!");
      navigate("/CustProductList");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
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
    <Container maxWidth="xl" sx={{ my: 3 }}>
      <Box
        sx={{
          p: 3,
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
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "35%" }, textAlign: "center" }}>
            <Card sx={{ boxShadow: 3, p: 2 }}>
              <CardMedia
                component="img"
                image={`http://16.170.141.231:5000${selectedProduct.images[selectedImageIndex]}`}
                alt={selectedProduct.name}
                sx={{ borderRadius: "10px", mb: 2 }}
              />
            </Card>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}
            >
              {selectedProduct.images.map((img, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    minWidth: 50,
                    height: 50,
                    backgroundImage: `url(http://16.170.141.231:5000${img})`,
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

          <Box sx={{ width: { xs: "100%", md: "60%" }, p: 3 }}>
            <form onSubmit={handleOrderSubmit}>
              {step === 1 && (
                <>
                  <Typography variant="h4" color="#fdc200" sx={{ mb: 4, fontFamily: "'Raleway', sans-serif", }}>
                    Fill Order Details of {selectedProduct.name}
                  </Typography>
                  <Typography
                    sx={{ color: "lightgray", pb: 3, fontSize: "1.7rem" }}
                  >
                    Rs {selectedProduct.price}.00
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: 4,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
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
                        }}
                      >
                        <IconButton
                          onClick={() =>
                            setQuantity((prev) => Math.max(prev - 1, 1))
                          }
                          sx={{
                            color: "white",
                            border: "1px solid #ccc",
                            borderRadius: "500px",
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
                          sx={{ width: "50px" }}
                        />
                        <IconButton
                          onClick={() => setQuantity((prev) => prev + 1)}
                          sx={{
                            color: "white",
                            border: "1px solid #ccc",
                            borderRadius: "500px",
                          }}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box>
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
                        onChange={(e) => setColor(e.target.value)}
                        aria-label="color selection"
                        sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                      >
                        {availableColors.map((color, index) => (
                          <ToggleButton
                            key={index}
                            value={color}
                            sx={{
                              backgroundColor: color.toLowerCase(),
                              color: "white",
                              border: "1px solid black",
                              "&.Mui-selected": { border: "2px solid gold" },
                            }}
                          >
                            {color}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
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
                        onChange={(e) => setSize(e.target.value)}
                        aria-label="size selection"
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
                                backgroundColor: "black",
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
                  
                  <br />
                  <Typography color="#d7d7d7" mt={3} variant="h5" gutterBottom>
                    Shipping Details
                  </Typography>
                  <br />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {/* Row 1: Address Line 1 and Address Line 2 */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      {[
                        { id: "addressLine1", label: "Address Line 1" },
                        {
                          id: "addressLine2",
                          label: "Address Line 2 (Optional)",
                        },
                      ].map((field) => (
                        <TextField
                          key={field.id}
                          label={field.label}
                          fullWidth
                          margin="normal"
                          value={shippingDetails[field.id] || ""}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              [field.id]: e.target.value,
                            })
                          }
                          required={field.id === "addressLine1"}
                          sx={{
                            "& input": { color: "white" },
                            "& label": { color: "gray" },
                            "& label.Mui-focused": { color: "white" },
                            flex: 1,
                          }}
                        />
                      ))}
                    </Box>

                    {/* Row 2: City and Postal Code */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      {[
                        { id: "addressLine3", label: "City (Optional)" },
                        { id: "postalCode", label: "Postal Code (Optional)" },
                      ].map((field) => (
                        <TextField
                          key={field.id}
                          label={field.label}
                          fullWidth
                          margin="normal"
                          value={shippingDetails[field.id] || ""}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              [field.id]: e.target.value,
                            })
                          }
                          required={false}
                          sx={{
                            "& input": { color: "white" },
                            "& label": { color: "gray" },
                            "& label.Mui-focused": { color: "white" },
                            flex: 1,
                          }}
                        />
                      ))}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      {/* Email and Contact Number */}
                      {[
                        { id: "email", label: "Email" },
                        { id: "contactNumber", label: "Contact Number" },
                      ].map((field) => (
                        <TextField
                          key={field.id}
                          label={field.label}
                          fullWidth
                          margin="normal"
                          value={shippingDetails[field.id] || ""}
                          onChange={(e) =>
                            setShippingDetails({
                              ...shippingDetails,
                              [field.id]: e.target.value,
                            })
                          }
                          required
                          sx={{
                            "& input": { color: "white" },
                            "& label": { color: "gray" },
                            "& label.Mui-focused": { color: "white" },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      bgcolor: "black",
                      "&:hover": { bgcolor: "gold", color: "black" },
                    }}
                    type="submit"
                  >
                    Next
                  </Button>
                </>
              )}

{step === 2 && (
  <>
   <Typography variant="h4" color="#fdc200" sx={{ mb: 2 , fontFamily: "'Raleway', sans-serif",}}>
                    Fill Order Details of {selectedProduct.name}
                  </Typography>
    {/* Section 1: Total Amount */}
    <Box sx={{ mb: 3 }}>

      <Typography
        variant="h5"
        color="white"
        sx={{ fontWeight: 500 }}
      >
      Total Amount  Rs {selectedProduct.price * quantity}.00
      </Typography>
    </Box>

    {/* Section 2: Payment Details (Order Summary) */}
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        color="#fdc200"
        sx={{  mb: 2, fontFamily: "'Raleway', sans-serif", fontSize:"1.6rem"}}
      >
        Payment Details
      </Typography>
      <Box sx={{ color: "white" }}>
        <Typography variant="body1"  sx={{ fontSize:"1.3rem" }}>
          {selectedProduct.name} - {quantity} x Rs {selectedProduct.price} = Rs {selectedProduct.price * quantity}
        </Typography>
        <Typography  sx={{  mb: 1, fontSize:"1.3rem"}} variant="body1">Size: {size || "Not Selected"}</Typography>
        <Typography sx={{  fontSize:"1.3rem"}} variant="body1">Color: {color || "Not Selected"}</Typography>
        <Typography sx={{  fontSize:"1.3rem"}} variant="body1">
          Shipping to:{" "}
          {[
            shippingDetails.addressLine1,
            shippingDetails.addressLine2,
            shippingDetails.addressLine3,
            shippingDetails.postalCode,
          ]
            .filter(Boolean)
            .join(", ") || "Not Specified"}
        </Typography>
      </Box>
    </Box>

    {/* Section 3: Card Entry */}
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h5"
        color="#fdc200"
        sx={{  mb: 1, fontFamily: "'Raleway', sans-serif", }}
        
      >
        Enter Your Visa Card Number
      </Typography>
      <br/>
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
    <br/>

    {/* Buttons */}
    <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
      <Button
        variant="contained"
        onClick={() => setStep(1)}
        sx={{
          bgcolor: "grey.700",
          "&:hover": { bgcolor: "grey.600" },
        }}
      >
        Back
      </Button>
      <Button
        variant="contained"
        type="submit"
        disabled={processing || !stripe}
        sx={{
          color: "black",
          fontweight:"bold",
          background: "linear-gradient(90deg, #FFD200, #F7971E)",
        }}
      >
        {processing ? "Processing...." : "Pay and Order"}
      </Button>
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
    <OrderForm />
  </Elements>
);

export default WrappedOrderForm;
