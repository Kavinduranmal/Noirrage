import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CardMedia,
  Box,
  LinearProgress,
  Checkbox,
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51QvbnMRqDKD7gCFBoXQPbCKeKKaWNneQKpfcTMa0nKiC6dsUTO9Y4ilSLBPu74BJFDeXltxYMGwGYppzdo7m2tBx0027lVqT11"
);



const CheckoutForm = ({ selectedItems, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("userToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Create order with selected cart items
      const { data } = await axios.post(
        "http://localhost:5000/api/orders/create",
        {
          cartItemIds: selectedItems.map((item) => item._id),
          shippingDetails: {
            email: "customer@example.com",
            address: "123 Main St",
            contactNumber: "123-456-7890",
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const orderId = data.order._id;
  
      // Create payment intent
      const { data: paymentData } = await axios.post(
        "http://localhost:5000/api/stripe/create-payment-intent",
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const { clientSecret } = paymentData;
      // ... rest of the payment logic
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#fff",
              "::placeholder": { color: "#aab7c4" },
            },
            invalid: { color: "#9e2146" },
          },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!stripe || loading}
        sx={{
          mt: 2,
          bgcolor: "#fdc200",
          color: "black",
          fontWeight: "bold",
          "&:hover": { bgcolor: "#e0a800" },
          width: "100%",
        }}
      >
        {loading ? "Processing..." : `Pay Rs ${totalPrice}`}
      </Button>
    </form>
  );
};

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login");
      setLoading(false);
      return;
    }

    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/cart/view", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data.items || []);
    } catch (error) {
      toast.error("Failed to fetch cart items.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item removed from cart!");
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      setSelectedItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item.");
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItems((prev) =>
      prev.some((i) => i._id === item._id)
        ? prev.filter((i) => i._id !== item._id)
        : [...prev, item]
    );
  };

  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  const handlePaymentSuccess = () => {
    setSelectedItems([]);
    fetchCart(); // Refresh cart after successful order
  };

  return (
    <Box sx={{ padding: { xs: "20px", md: "40px" }, minHeight: "100vh" }}>
      <Typography
        variant="h3"
        textAlign="center"
        mb={{ xs: 3, md: 4 }}
        sx={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: { xs: "2rem", md: "3rem" },
          color: "#fff",
        }}
      >
        My Cart
      </Typography>

      {loading ? (
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress
            sx={{
              backgroundColor: "black",
              borderRadius: 10,
              "& .MuiLinearProgress-bar": { backgroundColor: "gold" },
            }}
          />
        </Box>
      ) : cartItems.length === 0 ? (
        <Typography
          sx={{
            textAlign: "center",
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            fontWeight: "bold",
            color: "#aaa",
          }}
        >
          Your cart is empty.{" "}
          <Button
            onClick={() => navigate("/CustProductList")}
            sx={{ color: "#fdc200" }}
          >
            Start Shopping
          </Button>
        </Typography>
      ) : (
        <>
          <Grid container spacing={7} justifyContent="center">
            {cartItems.map((item) => (
              <Grid item xs={12} sm={5} md={3.5} key={item._id}>
                <Card
                  sx={{
                    boxShadow: "0px 12px 20px rgba(0, 0, 0, 0.8)",
                    background: "linear-gradient(135deg, #232526, #414345)",
                    border: "1px solid rgba(100, 100, 100, 0.5)",
                  }}
                >
                  <CardContent
                    sx={{
                      height: 500,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: { xs: "15px", md: "20px" },
                    }}
                  >
                    <Checkbox
                      checked={selectedItems.some((i) => i._id === item._id)}
                      onChange={() => handleSelectItem(item)}
                      sx={{ color: "white", "&.Mui-checked": { color: "#fdc200" } }}
                    />
                    <Card
                      sx={{
                        width: { xs: 250, md: 270 },
                        height: { xs: 250, md: 270 },
                        mb: 2,
                        overflow: "hidden",
                        borderRadius: "8px",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={`http://localhost:5000${item.product.images[0]}`}
                        alt={item.product.name}
                        sx={{ objectFit: "cover" }}
                      />
                    </Card>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: { xs: "1.2rem", md: "1.5rem" },
                          fontFamily: "'Raleway', sans-serif",
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      >
                        {item.product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "0.9rem", md: "1rem" },
                          color: "rgba(255, 255, 255, 0.8)",
                          mt: 1,
                        }}
                      >
                        Size: {item.size} | Color: {item.color} | Qty: {item.qty}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: "1rem", md: "1.2rem" },
                          fontWeight: "700",
                          color: "white",
                          mt: 1,
                        }}
                      >
                        Rs {item.product.price * item.qty}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => handleRemoveFromCart(item._id)}
                      sx={{
                        bgcolor: "#FFEB3B",
                        color: "#1a1a1a",
                        fontWeight: "bold",
                        fontFamily: "'Raleway', sans-serif",
                        borderRadius: "8px",
                        px: 3,
                        py: 1,
                        width: "100%",
                        "&:hover": { bgcolor: "red" },
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      Remove
                      <DeleteIcon sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }} />
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {selectedItems.length > 0 && (
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ color: "#fff", mb: 2 }}
              >
                Total: Rs {totalPrice}
              </Typography>
              <Box sx={{ maxWidth: 400, mx: "auto" }}>
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    selectedItems={selectedItems}
                    totalPrice={totalPrice}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Cart;