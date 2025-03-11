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
import { motion } from "framer-motion";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CreditCard from "@mui/icons-material/CreditCard";

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
          "http://16.170.141.231:5000/api/auth/profileview",
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
          "http://16.170.141.231:5000/api/cart/view",
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
      await axios.delete(
        `http://16.170.141.231:5000/api/cart/remove/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
        "http://16.170.141.231:5000/api/orders/create",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const orderId = data.order._id;

      const paymentResponse = await axios.post(
        "http://16.170.141.231:5000/api/stripe/create-payment-intent",
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
    <Container maxWidth={false} sx={{ mb: 9, mt: 2 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            position: "relative",
            p: { xs: 2, md: 4 },
            background:
              "linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%)",
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            overflow: "hidden",
            position: "relative",
            "&::before": {
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background:
                "linear-gradient(90deg, transparent, gold, transparent)",
              animation: "shimmer 2s infinite linear",
            },
          }}
        >
          <IconButton
            onClick={() => navigate("/CustProductList")}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "#ff4d4d",
              background: "rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "rotate(90deg)",
                background: "rgba(255,0,0,0.2)",
              },
            }}
          >
            <Close />
          </IconButton>

          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Typography
              variant="h3"
              sx={{
                color: "gold",
                fontFamily: "'Poppins', sans-serif",
                textAlign: "center",
                mb: { xs: 3, md: 5 },
                fontSize: { xs: "1.8rem", md: "3rem" },

                textShadow: "0 2px 10px rgba(255, 215, 0, 0.3)",
                letterSpacing: "1px",
                position: "relative",
                "&::after": {
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80px",
                  height: "3px",
                  background:
                    "linear-gradient(90deg, transparent, gold, transparent)",
                  borderRadius: "2px",
                },
              }}
            >
              {step === 1 ? "My Cart" : "Checkout"}
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: { xs: "block", md: "flex" },
              gap: 4,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Left Side - Item List */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ flex: 1, minWidth: 0 }}
            >
              {cartItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    delay: index * 0.1 + 0.3,
                  }}
                >
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      mb: 3,
                      background:
                        "linear-gradient(135deg, #252525 0%, #2a2a2a 100%)",
                      borderRadius: 3,
                      border: "1px solid rgba(142, 142, 142, 0.2)",
                      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.8)",
                      flexDirection: { xs: "column", sm: "row" },
                      textAlign: { xs: "center", sm: "left" },
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",

                        pointerEvents: "none",
                      },
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
                            "& svg": {
                              transition: "transform 0.3s ease",
                              "&:hover": { transform: "scale(1.2)" },
                            },
                          }}
                        />
                      }
                      label=""
                    />
                    <Box
                      sx={{
                        position: "relative",
                        width: { xs: 120, sm: 160 },
                        height: { xs: 120, sm: 160 },
                        mr: { sm: 3 },
                        mb: { xs: 2, sm: 0 },
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 6px 12px rgba(0,0,0,0.4)",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={
                          item.product?.images?.length > 0
                            ? `http://16.170.141.231:5000${item.product.images[0]}`
                            : "http://16.170.141.231:5000/default-image.jpg"
                        }
                        alt={item.product?.name || "Product Image"}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        flexGrow: 1,
                        color: "#fff",
                        px: 2,
                        py: 1,
                        position: "relative",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: { xs: "16px", sm: "20px", md: "24px" },
                          fontWeight: 600,
                          color: "gold",
                          mb: 1,
                          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "translateX(5px)",
                          },
                        }}
                      >
                        {item.product?.name || "Unknown Product"}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: { xs: "13px", sm: "14px", md: "16px" },
                            color: "rgba(255, 255, 255, 0.9)",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            background: "rgba(255,255,255,0.1)",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          Qty:{" "}
                          <span style={{ fontWeight: 600 }}>{item.qty}</span>
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: { xs: "13px", sm: "14px", md: "16px" },
                            color: "rgba(255, 255, 255, 0.9)",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            background: "rgba(255,255,255,0.1)",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          Size:{" "}
                          <span style={{ fontWeight: 600 }}>{item.size}</span>
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: { xs: "13px", sm: "14px", md: "16px" },
                            color: "rgba(255, 255, 255, 0.9)",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            background: "rgba(255,255,255,0.1)",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          Color:{" "}
                          <span style={{ fontWeight: 600 }}>{item.color}</span>
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: { xs: "16px", sm: "18px", md: "22px" },
                          fontWeight: 600,
                          color: "white",
                          mt: 1,
                          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                          animation: "pulse 2s infinite ease-in-out",
                        }}
                      >
                        Rs {(item.product?.price || 0) * item.qty}.00
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
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
                        py: 1,
                        borderRadius: 3,
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                        "&:hover": {
                          bgcolor: "red",
                          color: "white",
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 12px rgba(255,0,0,0.4)",
                        },
                        "&:active": {
                          transform: "translateY(1px)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        },
                      }}
                    >
                      Remove{" "}
                      <Delete
                        sx={{
                          ml: 1,
                          animation: "wiggle 1s infinite ease-in-out",
                        }}
                      />
                    </Button>
                  </Card>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Typography
                  sx={{
                    color: "gold",
                    textAlign: "right",
                    mt: 3,
                    fontSize: { xs: "1.4rem", md: "1.8rem" },

                    textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                    position: "relative",
                    "&::after": {
                      right: 0,
                      width: "100px",
                      height: "3px",
                      background: "gold",
                      borderRadius: "2px",
                    },
                  }}
                >
                  Subtotal: Rs{" "}
                  <span
                    className="subtotal-amount"
                    style={{
                      display: "inline-block",
                      minWidth: "80px",
                      animation: "fadeIn 0.5s ease-in-out",
                    }}
                  >
                    {cartItems
                      .filter((item) => selectedCartItems.includes(item._id))
                      .reduce(
                        (total, item) =>
                          total + (item.product?.price || 0) * item.qty,
                        0
                      )}
                    .00
                  </span>
                </Typography>
              </motion.div>
            </motion.div>

            {/* Right Side - Buttons/Form */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ flex: 1, minWidth: 0 }}
            >
              {step === 1 && (
                <form onSubmit={handleProceedToCheckout}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      mt: { xs: 4, md: 6 },
                      justifyContent: "center",
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Button
                      variant="contained"
                      type="submit"
                      startIcon={<ArrowForward />}
                      sx={{
                        bgcolor: "black",
                        color: "#fff",

                        px: 2,
                        py: 1.5,
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        borderRadius: 3,
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.4s ease",
                        boxShadow: "0 6px 15px rgba(0,0,0,0.4)",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)",
                          transition: "all 0.6s ease",
                        },
                        "&:hover": {
                          bgcolor: "#222",
                          transform: "translateY(-5px)",
                          boxShadow: "0 10px 20px rgba(0,0,0,0.6)",
                        },
                        "&:hover::before": {
                          left: "100%",
                        },
                        "&:active": {
                          transform: "translateY(2px)",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                        },
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
                        px: 4,
                        py: 1.5,
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        borderRadius: 3,
                        borderWidth: "2px",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "#ffcc00",
                          color: "#ffcc00",
                          transform: "translateX(5px)",
                        },
                        "&:active": {
                          transform: "translateX(2px)",
                        },
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
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Typography
                        sx={{
                          color: "gold",
                          textAlign: "left",
                          mb: 3,
                          fontSize: { xs: "1.5rem", md: "2rem" },

                          position: "relative",
                          "&::after": {
                            left: 0,
                            width: "60px",
                            height: "3px",
                            background: "gold",
                            borderRadius: "2px",
                          },
                        }}
                      >
                        Shipping Details
                      </Typography>
                    </motion.div>

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
                    ].map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                        }}
                      >
                        <TextField
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
                            "& input": {
                              color: "white",
                              fontSize: "1rem",
                              padding: "12px",
                            },
                            "& label": {
                              color: "gray",
                              fontSize: "1rem",
                              "&.Mui-focused": {
                                color: "gold",
                              },
                            },
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s ease",
                              "& fieldset": {
                                borderColor: "gray",
                                borderWidth: "2px",
                              },
                              "&:hover fieldset": {
                                borderColor: "white",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#fdc200",
                                borderWidth: "2px",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 0 8px rgba(255,215,0,0.4)",
                              },
                            },
                          }}
                        />
                      </motion.div>
                    ))}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      {PaymentSection}
                    </motion.div>

                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          justifyContent: "center",
                          flexDirection: { xs: "column", sm: "row" },
                          mt: 4,
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={() => setStep(1)}
                          startIcon={<ArrowBack />}
                          sx={{
                            color: "gray",
                            borderColor: "gray",
                            borderWidth: "2px",
                            px: 4,
                            py: 1.2,
                            fontSize: { xs: "0.9rem", md: "1rem" },
                            borderRadius: 3,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: "#ffcc00",
                              color: "#ffcc00",
                              transform: "translateX(-5px)",
                            },
                          }}
                        >
                          Back to Cart
                        </Button>
                        <Button
                          variant="contained"
                          type="submit"
                          disabled={processing || !stripe || !elements}
                          startIcon={<CreditCard />}
                          sx={{
                            bgcolor: "black",
                            color: "white",
                            fontWeight: 600,
                            px: 4,
                            py: 1.2,
                            fontSize: { xs: "0.9rem", md: "1rem" },
                            borderRadius: 3,
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            boxShadow: "0 6px 15px rgba(0,0,0,0.4)",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: "-100%",
                              width: "100%",
                              height: "100%",
                              background:
                                "linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)",
                              transition: "all 0.6s ease",
                            },
                            "&:not(:disabled):hover": {
                              color: "black",
                              bgcolor: "gold",
                              transform: "translateY(-5px)",
                              boxShadow: "0 10px 20px rgba(255,215,0,0.3)",
                            },
                            "&:not(:disabled):hover::before": {
                              left: "100%",
                            },
                            "&:disabled": {
                              bgcolor: "rgba(0,0,0,0.5)",
                              color: "rgba(255,255,255,0.5)",
                            },
                          }}
                        >
                          {processing ? (
                            <>
                              <span className="processing-text">
                                Processing
                              </span>
                              <span className="dot-animation">...</span>
                            </>
                          ) : (
                            "Pay & Complete Order"
                          )}
                        </Button>
                      </Box>
                    </motion.div>
                  </Box>
                </form>
              )}
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
            transform: scale(1.03);
          }
          100% {
            opacity: 0.9;
          }
        }

        @keyframes wiggle {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(5deg);
          }
          50% {
            transform: rotate(0deg);
          }
          75% {
            transform: rotate(-5deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dot-animation {
          display: inline-block;
          animation: dotAnimation 1.5s infinite;
        }

        @keyframes dotAnimation {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
      `}</style>
    </Container>
  );
};

const WrappedAddToCartOrderForm = () => (
  <Elements stripe={stripePromise}>
    <AddToCartOrderForm />
  </Elements>
);

export default WrappedAddToCartOrderForm;
