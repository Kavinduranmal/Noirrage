import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Box,
  LinearProgress,
  CardMedia,
  styled,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
const MyOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login");
      return;
    }

    const getUserOrders = async () => {
      try {
        const { data } = await axios.get(
          "https://noirrage.com/api/orders/byid",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched Orders:", data);
        setOrders(data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("No orders Found");
        setLoading(false);
      }
    };

    getUserOrders();
  }, [token, navigate]);

  const handleCancelOrder = async (orderId, orderStatus, event) => {
    event.preventDefault();
    if (orderStatus === "Shipped") {
      toast.error("Order has already been shipped and cannot be canceled.");
      return;
    }
    try {
      await axios.delete(`https://noirrage.com/api/orders/${orderId}/cancel`, {
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
  };

  const FullWidthSection = styled(Box)({
    width: "100%",
    padding: { xs: "20px 0", md: "40px 0" },
  });

  const [productImageState, setProductImageState] = useState({});

  const handleImageHover = (productId, hover) => {
    if (productId) {
      setProductImageState((prevState) => ({
        ...prevState,
        [productId]: hover ? 1 : 0,
      }));
    }
  };

  return (
    <Container maxWidth={false} sx={{ pb: 8 }}>
      <FullWidthSection>
        {loading ? (
          <Box sx={{ width: "100%", mb: { xs: 8, md: 3 } }}>
            <LinearProgress
              sx={{
                backgroundColor: "black",
                borderRadius: 10,
                "& .MuiLinearProgress-bar": { backgroundColor: "gold" },
              }}
            />
          </Box>
        ) : (
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
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <Card
                    key={order._id}
                    sx={{
                      width: { xs: "90%", sm: "45%", md: "30%" },
                      maxWidth: "400px",
                      borderRadius: 2,
                      m: 3,
                      background: "linear-gradient(135deg, #232526, #414345)",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(193, 193, 193, 0.3)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
                                item.product &&
                                item.product.images &&
                                item.product.images.length > 0
                                  ? `https://noirrage.com${
                                      item.product.images[
                                        productImageState[item.product._id] || 0
                                      ]
                                    }`
                                  : "/default-image.jpg"
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
                              onMouseEnter={() =>
                                handleImageHover(item.product?._id, true)
                              }
                              onMouseLeave={() =>
                                handleImageHover(item.product?._id, false)
                              }
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
                                Qty: {item.quantity} | Size: {item.size} |
                                Color: {item.color}
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
                          Total:{" "}
                          <span style={{ color: "gold" }}>
                            Rs {order.totalPrice + 475}
                          </span>
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
                              color:
                                order.status === "Shipped"
                                  ? "#00cc00"
                                  : "#ff4444",
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
                                order.status === "Shipped"
                                  ? "#00cc00"
                                  : "#ff4444",
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
                          Ordered on:{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
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
        )}
      </FullWidthSection>
    </Container>
  );
};

export default MyOrders;
