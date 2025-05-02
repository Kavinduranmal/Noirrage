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
          "https://16.170.141.231:5000/api/auth/profileview",
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
          "https://16.170.141.231:5000/api/cart/view",
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
        // toast.error("Failed to load cart or user details");
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
        `https://16.170.141.231:5000/api/cart/remove/${itemId}`,
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
        "httpss://16.170.141.231:5000/api/orders/create",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order placed successfully!");
      const updatedCart = cartItems.filter(
        (item) => !selectedCartItems.includes(item._id)
      );
      setCartItems(updatedCart);
      setSelectedCartItems([]);
      navigate("/userorders");
    } catch (error) {
      setPaymentError(
        error.response?.data?.message || "Failed to submit order"
      );
      toast.error(error.response?.data?.message || "Failed to submit order");
    } finally {
      setProcessing(false);
    }
  };

  // const PaymentSection = useMemo(
  //   () => (
  //     <Box sx={{ mb: 4 }}>
  //       <Typography
  //         sx={{
  //           color: "gold",
  //           fontSize: { xs: "1.2rem", md: "1.5rem" },
  //           fontWeight: 600,
  //           mb: 1,
  //         }}
  //       >
  //         Payment Details
  //       </Typography>
  //       <CardElement
  //         options={{
  //           style: {
  //             base: {
  //               fontSize: "16px",
  //               color: "#ffffff",
  //               "::placeholder": { color: "#aab7c4" },
  //             },
  //             invalid: { color: "#ffvolution444" },
  //           },
  //         }}
  //       />
  //       {paymentError && (
  //         <Typography sx={{ color: "#ff4d4d", mt: 2 }}>
  //           {paymentError}
  //         </Typography>
  //       )}
  //     </Box>
  //   ),
  //   [paymentError]
  // );

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
              "linear-gradient(135deg, rgba(20, 20, 20, 0.44) 0%, rgba(30, 30, 30, 0.46) 100%)",
            borderRadius: 2,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            overflow: "hidden",
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
            {/* Left - Items List */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Box
                sx={{
                  display: { xs: "block", md: "flex" },
                  gap: 4,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                {/* Left - Items List */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      pb: 2,
                    }}
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
                            background:
                              "linear-gradient(145deg, #1f1f1f, #292929)",
                            borderRadius: 2,
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.5)",
                            flexDirection: { xs: "column", sm: "row" },
                            textAlign: { xs: "center", sm: "left" },
                            transition:
                              "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.7)",
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
                                }}
                              />
                            }
                            label=""
                          />
                          <Box
                            sx={{
                              width: { xs: 120, sm: 150 },
                              height: { xs: 120, sm: 150 },
                              borderRadius: 2,
                              overflow: "hidden",
                              flexShrink: 0,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                              mr: { sm: 3 },
                              mb: { xs: 2, sm: 0 },
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={
                                item.product?.images?.length > 0
                                  ? `https://16.170.141.231:5000${item.product.images[0]}`
                                  : "/default-image.jpg"
                              }
                              alt={item.product?.sname || "Product Image"}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>

                          <Box
                            sx={{ flexGrow: 1, color: "#fff", px: 1, py: 1 }}
                          >
                            <Typography
                              sx={{
                                fontSize: { xs: "18px", sm: "22px" },
                                fontWeight: 700,
                                color: "#FFD700",
                                mb: 1,
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              {item.product?.name || "Unknown Product"}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                fontSize: "14px",
                                mb: 1,
                              }}
                            >
                              <Typography>
                                Qty: <strong>{item.qty}</strong>
                              </Typography>
                              <Typography>
                                Size: <strong>{item.size}</strong>
                              </Typography>
                              <Typography>
                                Color: <strong>{item.color}</strong>
                              </Typography>
                            </Box>

                            <Typography
                              sx={{
                                fontSize: "18px",
                                fontWeight: 600,
                                color: "white",
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
                              mt: { xs: 2, sm: 0 },
                              ml: { sm: 2 },
                              bgcolor: "gold",
                              color: "black",
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 2,
                              "&:hover": {
                                bgcolor: "red",
                                color: "white",
                              },
                            }}
                          >
                            Remove <Delete sx={{ ml: 1 }} />
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </Box>

                  {/* Subtotal Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Box sx={{ textAlign: "end", mt: 3 ,mr:3}}>
  {/* Subtotal */}
  <Typography
    sx={{

      color: "white",
      fontSize: { xs: "1.2rem", md: "1.2rem" },
      textShadow: "0 2px 4px rgba(0,0,0,0.6)",
    }}
  >
    Subtotal: Rs{" "}
    <span style={{ display: "inline-block", minWidth: "80px" }}>
      {cartItems
        .filter((item) => selectedCartItems.includes(item._id))
        .reduce(
          (total, item) => total + (item.product?.price || 0) * item.qty,
          0
        )}
      .00
    </span>
  </Typography>

  {/* Delivery Fee */}
  <Typography
    sx={{
      color: "white",
      fontSize: { xs: "1.2rem", md: "1.1rem" },
      mt: 1,
    }}
  >
    Delivery Fee: Rs 475.00
  </Typography>

  {/* Total */}
  <Typography
    sx={{
      color: "#fdc200",
     
      fontSize: { xs: "1.6rem", md: "1.5rem" },
      mt: 1,
      textShadow: "0 2px 6px rgba(0,0,0,0.6)",
    }}
  >
    Total: Rs{" "}
    <span style={{ display: "inline-block", minWidth: "80px" }}>
      {cartItems
        .filter((item) => selectedCartItems.includes(item._id))
        .reduce(
          (total, item) => total + (item.product?.price || 0) * item.qty,
          0
        ) + 475}
      .00
    </span>
  </Typography>
</Box>

                  </motion.div>
                </motion.div>

                {/* Right Side (e.g., Checkout button / form) */}
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
                            "&:hover": {
                              bgcolor: "#222",
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
                            "&:hover": {
                              borderColor: "#ffcc00",
                              color: "#ffcc00",
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

                        {/* <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                        >
                          {PaymentSection}
                        </motion.div> */}

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
                            {/* <Button
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
                            </Button> */}
                            <Button
                              variant="outlined"
                              onClick={handleOrderSubmit}
                              disabled={processing}
                              sx={{
                                borderRadius: 3,
                                bgcolor: "black",
                                color: "white",
                                fontSize: { xs: "1rem", md: "1rem" },
                                borderColor: "black",
                                "&:hover": {
                                  bgcolor: "gold",
                                  borderColor: "black",
                                  color: "black",
                                  fontWeight: "bold",
                                },
                                width: { xs: "100%", sm: "auto" },
                              }}
                            >
                              Cash on Delivery
                            </Button>
                          </Box>
                        </motion.div>
                      </Box>
                    </form>
                  )}
                  {/* Additional checkout step form goes here (if step === 2) */}
                </motion.div>
              </Box>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {/* <Typography
                  sx={{
                    color: "gold",
                    textAlign: "right",
                    mt: 3,
                    fontSize: { xs: "1.4rem", md: "1.8rem" },
                    textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                  }}
                >
                  Subtotal: Rs{" "}
                  <span style={{ display: "inline-block", minWidth: "80px" }}>
                    {cartItems
                      .filter((item) => selectedCartItems.includes(item._id))
                      .reduce(
                        (total, item) =>
                          total + (item.product?.price || 0) * item.qty,
                        0
                      )}
                    .00
                  </span>
                </Typography> */}
              </motion.div>
            </motion.div>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

const WrappedAddToCartOrderForm = () => (
  <Elements stripe={stripePromise}>
    <AddToCartOrderForm />
  </Elements>
);

export default WrappedAddToCartOrderForm;
