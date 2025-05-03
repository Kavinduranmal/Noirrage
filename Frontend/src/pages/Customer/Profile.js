import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Typography,
  Card,
  TextField,
  Button,
  CardMedia,
  CardContent,
  Divider,
  Checkbox,
  IconButton,
  Box,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { styled } from "@mui/system";
import { Person, Email } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Delete, Close } from "@mui/icons-material";
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

// Constants
const STRIPE_PUBLIC_KEY =
  "pk_test_51QvbnMRqDKD7gCFBoXQPbCKeKKaWNneQKpfcTMa0nKiC6dsUTO9Y4ilSLBPu74BJFDeXltxYMGwGYppzdo7m2tBx0027lVqT11";
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const FullWidthSection = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(5, 0),
}));

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
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
  const [productImageState, setProductImageState] = useState({});

  const stripe = useStripe();
  const elements = useElements();

  // Memoized values
  const subtotal = useMemo(() => {
    return cartItems
      .filter((item) => selectedCartItems.includes(item._id))
      .reduce(
        (total, item) => total + (item.product?.price || 0) * item.qty,
        0
      );
  }, [cartItems, selectedCartItems]);

  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => selectedCartItems.includes(item._id));
  }, [cartItems, selectedCartItems]);

  // API call functions
  const fetchProfile = useCallback(async () => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login");
      return;
    }

    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/auth/profileview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
    } catch (error) {
      console.error("Error fetching profile:", error.response || error);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch profile. Please try again."
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate("/user/Login");
      }
    }
  }, [token, navigate]);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login");
      return;
    }

    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/orders/byid`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders. Please try again.");
    }
  }, [token, navigate]);

  const fetchCart = useCallback(async () => {
    if (!token) {
      toast.error("Please log in to continue");
      navigate("/user/Login");
      return;
    }

    try {
      const cartResponse = await axios.get(`${API_BASE_URL}/api/cart/view`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cartResponse.data.items && cartResponse.data.items.length > 0) {
        setCartItems(cartResponse.data.items);
        setSelectedCartItems(cartResponse.data.items.map((item) => item._id));
      } else {
        toast.error("Your cart is empty");
        navigate("/CustProductList");
      }
    } catch (error) {
      toast.error("Failed to load cart");
      navigate("/CustProductList");
    }
  }, [token, navigate]);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProfile(), fetchOrders(), fetchCart()]);
      } catch (error) {
        console.error("Initial data loading error:", error);
      } finally {
        setTimeout(() => setLoading(false), 2000);
      }
    };

    loadData();
  }, [fetchProfile, fetchOrders, fetchCart]);

  // Event handlers
  const handleImageHover = useCallback((productId, hover) => {
    if (productId) {
      setProductImageState((prevState) => ({
        ...prevState,
        [productId]: hover ? 1 : 0,
      }));
    }
  }, []);

  const handleCancelOrder = useCallback(
    async (orderId, orderStatus, event) => {
      event.preventDefault();
      if (orderStatus === "Shipped") {
        toast.error("Order has already been shipped and cannot be canceled.");
        return;
      }
      try {
        await axios.delete(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Order canceled successfully!");
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId)
        );
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error(error.response?.data?.message || "Failed to cancel order.");
      }
    },
    [token]
  );

  const handleRemove = useCallback(
    async (itemId) => {
      try {
        await axios.delete(`${API_BASE_URL}/api/cart/remove/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Item removed from cart!");
        setCartItems((prev) => prev.filter((i) => i._id !== itemId));
        setSelectedCartItems((prev) => prev.filter((id) => id !== itemId));
      } catch (error) {
        toast.error("Error removing item from cart");
      }
    },
    [token]
  );

  const handleCheckboxChange = useCallback((itemId) => {
    setSelectedCartItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleProceedToCheckout = useCallback(
    (e) => {
      e.preventDefault();
      if (selectedCartItems.length === 0) {
        toast.error("Please select at least one item to checkout");
        return;
      }
      setStep(2);
    },
    [selectedCartItems.length]
  );

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

  const handleShippingDetailChange = useCallback((field, value) => {
    setShippingDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Memoized components
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

  const renderProfileCard = useMemo(() => {
    if (loading) {
      return (
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress
            sx={{
              backgroundColor: "black",
              borderRadius: 10,
              "& .MuiLinearProgress-bar": { backgroundColor: "gold" },
            }}
          />
        </Box>
      );
    }

    return user ? (
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          p: { xs: 1 },
          mb: { xs: 2, sm: 5 },
          bgcolor: "transparent",
          background: "rgba(255, 255, 0, 0.15)",
          borderRadius: { xs: 3, sm: 20 },
          color: "white",
          border: "1px solid rgba(255, 215, 0, 0.4)",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.22)",
          transition: "all 0.3s ease",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1, sm: 3 },
            flexGrow: 1,
            width: "100%",
            textAlign: { xs: "left", sm: "left" },
            padding: { xs: "8px !important", sm: "16px !important" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: 40, sm: 50 },
              height: { xs: 40, sm: 50 },
              bgcolor: "rgba(255, 215, 0, 0.2)",
              borderRadius: "50%",
              mr: { xs: 1, sm: 2 },
            }}
          >
            <Person sx={{ color: "gold", fontSize: { xs: 24, sm: 30 } }} />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                letterSpacing: 0.5,
                color: "gold",
                fontSize: { xs: "14px", sm: "18px" },
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Person sx={{ color: "gold", fontSize: { xs: 16, sm: 20 } }} />
              {user.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: "medium",
                letterSpacing: 0.5,
                color: "gold",
                fontSize: { xs: "12px", sm: "16px" },
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: { xs: 0.5, sm: 0 },
              }}
            >
              <Email sx={{ color: "gold", fontSize: { xs: 16, sm: 20 } }} />
              {user.email}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    ) : (
      <Typography sx={{ color: "#fff", textAlign: "center" }}>
        No profile data found.
      </Typography>
    );
  }, [loading, user]);

  const renderOrders = useMemo(
    () => (
      <Box sx={{ mt: 4 }}>
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
              mt: { xs: 3, md: 3 },
              mb: { xs: 3, md: 3 },
              fontSize: { xs: "1.8rem", md: "3rem" },
              textShadow: "0 2px 10px rgba(255, 215, 0, 0.3)",
              letterSpacing: "1px",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -10,
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
            My Orders
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
            px: { xs: 2, md: 0 },
          }}
        >
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                productImageState={productImageState}
                handleImageHover={handleImageHover}
                handleCancelOrder={handleCancelOrder}
              />
            ))
          ) : (
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                textAlign: "center",
                py: 2,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              No orders found.
            </Typography>
          )}
        </Box>
      </Box>
    ),
    [orders, productImageState, handleImageHover, handleCancelOrder]
  );

  const renderCartItems = useMemo(
    () =>
      cartItems.map((item, index) => (
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
          <CartItemCard
            item={item}
            isSelected={selectedCartItems.includes(item._id)}
            onCheckboxChange={handleCheckboxChange}
            onRemove={handleRemove}
          />
        </motion.div>
      )),
    [cartItems, selectedCartItems, handleCheckboxChange, handleRemove]
  );

  const renderCheckoutForm = useMemo(
    () => (
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
                  content: '""',
                  position: "absolute",
                  bottom: -10,
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
            { id: "addressLine1", label: "Address Line 1", required: true },
            { id: "addressLine2", label: "Address Line 2 (Optional)" },
            { id: "addressLine3", label: "City" },
            { id: "postalCode", label: "Postal Code" },
            { id: "email", label: "Email", required: true },
            { id: "contactNumber", label: "Contact Number", required: true },
          ].map((field, index) => (
            <ShippingField
              key={field.id}
              field={field}
              value={shippingDetails[field.id] || ""}
              onChange={handleShippingDetailChange}
              index={index}
            />
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {PaymentSection}
          </motion.div>

          <CheckoutButtons
            onBack={() => setStep(1)}
            processing={processing}
            stripe={stripe}
            elements={elements}
          />
        </Box>
      </form>
    ),
    [
      handleOrderSubmit,
      shippingDetails,
      handleShippingDetailChange,
      PaymentSection,
      processing,
      stripe,
      elements,
    ]
  );

  return (
    <Container maxWidth={false}>
      <FullWidthSection>
        {renderProfileCard}

        {/* Orders Section */}
        <Container maxWidth={false} sx={{ p: 0 }}>
          <FullWidthSection>{renderOrders}</FullWidthSection>
        </Container>

        <Divider
          sx={{
            border: "1px solid black",
            backgroundColor: "#FFD700",
            height: "0.8px",
           mt: { xs: 0, md: 1 },
           mb: { xs: 7, md: 8 },
          }}
        />

        {/* Cart Section */}
        <Container maxWidth={false} sx={{ mb:  { xs: 9, md: 1 }, mt: 2 }}>
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
                                  ? `http://localhost:5000${item.product.images[0]}`
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
      </FullWidthSection>
    </Container>
  );
};

// Extracted Components for better readability and performance

const OrderCard = React.memo(
  ({ order, productImageState, handleImageHover, handleCancelOrder }) => (
    <Card
      sx={{
        width: { xs: "90%", sm: "45%", md: "30%" },
        maxWidth: "400px",
        borderRadius: 2,
        m: 3,
        background: "linear-gradient(135deg, #232526, #414345)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.8)",
        border: "1px solid rgba(193, 193, 193, 0.3)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
        },
      }}
    >
      <CardContent
        sx={{
          padding: { xs: "15px", md: "20px" },
          color: "#fff",
        }}
      >
        {/* Product List */}
        <Box sx={{ mb: 2 }}>
          {order.products.map((item) => (
            <Box
              key={item.product?._id || item._id}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                gap: 2,
              }}
            >
              <CardMedia
                component="img"
                image={
                  item.product?.images?.length > 0
                    ? `${API_BASE_URL}${
                        item.product.images[
                          productImageState[item.product._id] || 0
                        ]
                      }`
                    : `${API_BASE_URL}/default-image.jpg`
                }
                alt={item.product?.name || "Product Image"}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                  ":hover": { transform: "scale(1.05)" },
                }}
                onMouseEnter={() => handleImageHover(item.product?._id, true)}
                onMouseLeave={() => handleImageHover(item.product?._id, false)}
              />
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: "1rem",
                    color: "#fff",
                  }}
                >
                  {item.product?.name || "Unknown Product"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "0.9rem",
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  Qty: {item.quantity} | Size: {item.size} | Color: {item.color}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Order Details */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1rem",
              color: "#fff",
              mb: 1,
            }}
          >
            Total: <span style={{ color: "gold" }}>Rs {order.totalPrice + 475}</span>
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1rem",
              color: "#fff",
              mb: 1,
            }}
          >
            Status:{" "}
            <span
              style={{
                color: order.status === "Shipped" ? "#00cc00" : "#ff4444",
                fontWeight: 600,
              }}
            >
              {order.status}
            </span>
            <Box
              component="span"
              sx={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor:
                  order.status === "Shipped" ? "#00cc00" : "#ff4444",
                ml: 1,
                verticalAlign: "middle",
              }}
            />
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "0.9rem",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            Ordered on: {new Date(order.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        <center>
          <Button
            variant="contained"
            sx={{
              bgcolor: "gold",
              color: "black",
             
                            fontSize:{ xs: "0.6rem",  md: "0.9rem" },
                            borderRadius: "8px",
                            fontWeight:"bold",
              fontFamily: "'Poppins', sans-serif",
          
              mt: 2,
              width: "50%",
              "&:hover": {
                bgcolor: order.status === "Shipped" ? "gold" : "red",
                transform: "scale(1.02)",
              },
              "&:disabled": {
                bgcolor: "#666",
                color: "#999",
              },
              transition: "all 0.3s ease",
            }}
            onClick={(event) =>
              handleCancelOrder(order._id, order.status, event)
            }
            disabled={order.status === "Shipped"}
          >
            {order.status === "Shipped" ? "Shipped" : "Cancel Order"}
          </Button>
        </center>
      </CardContent>
    </Card>
  )
);

const CartItemCard = React.memo(
  ({ item, isSelected, onCheckboxChange, onRemove }) => (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        background: "linear-gradient(145deg, #1f1f1f, #292929)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.5)",
        flexDirection: { xs: "column", sm: "row" },
        textAlign: { xs: "center", sm: "left" },
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.7)",
        },
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={isSelected}
            onChange={() => onCheckboxChange(item._id)}
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
              ? `${API_BASE_URL}${item.product.images[0]}`
              : `${API_BASE_URL}/default-image.jpg`
          }
          alt={item.product?.name || "Product Image"}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          color: "#fff",
          px: 1,
          py: 1,
        }}
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
        onClick={() => onRemove(item._id)}
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
  )
);

const ShippingField = React.memo(({ field, value, onChange, index }) => (
  <motion.div
    initial={{ x: -30, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <TextField
      label={field.label}
      fullWidth
      value={value}
      onChange={(e) => onChange(field.id, e.target.value)}
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
));

const CheckoutButtons = React.memo(
  ({ onBack, handleOrderSubmit,processing, stripe, elements }) => (
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
          onClick={onBack}
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
              <span className="processing-text">Processing</span>
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
  )
);

const CartActions = React.memo(({ onProceed, onContinueShopping }) => (
  <form onSubmit={onProceed}>
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
        onClick={onContinueShopping}
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
));

const SubtotalDisplay = React.memo(({ subtotal }) => {
  const deliveryFee = 475;
  const total = subtotal + deliveryFee;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Box sx={{ textAlign: "end", mt: 3, mr: 3 }}>
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
            {subtotal}.00
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
            {total}.00
          </span>
        </Typography>
      </Box>
    </motion.div>
  );
});
const WrappedAddToCartOrderForm = () => (
  <Elements stripe={stripePromise}>
    <Profile />
  </Elements>
);

export default WrappedAddToCartOrderForm;
