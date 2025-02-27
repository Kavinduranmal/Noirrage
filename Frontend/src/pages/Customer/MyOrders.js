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

const MyOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(1); // Reduced to 1 since only one API call
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
          "http://localhost:5000/api/orders/byid", // Fixed typo in URL (removed extra slashes)
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders. Please try again.");
      } finally {
        setPendingRequests((prev) => prev - 1);
      }
    };

    getUserOrders();
  }, [token, navigate]);

  useEffect(() => {
    if (pendingRequests === 0) {
      setLoading(false);
    }
  }, [pendingRequests]);

  const handleCancelOrder = async (orderId, orderStatus, event) => {
    event.preventDefault();

    if (orderStatus === "Shipped") {
      toast.error("Order has already been shipped and cannot be canceled.");
      return;
    }

    if (!token) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    setProductImageState((prevState) => ({
      ...prevState,
      [productId]: hover ? 1 : 0,
    }));
  };

  return (
    <Container maxWidth={false} sx={{ p: 0 }}>
      <FullWidthSection>
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
        ) : (
          <Typography></Typography>
        )}

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
          My Orders
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
          }}
        >
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <Card
                key={order._id}
                sx={{
                  width: { xs: "80%", sm: "26%" },
                  m:2.5,
                  maxWidth: "600px",
                  border: "1px solid rgba(100, 100, 100, 0.5)",
                  background: "linear-gradient(135deg, #232526, #414345)",
                  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.7)",
                
                  transition: "all 0.3s ease",
                 
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: { xs: "15px", md: "20px" },
                  }}
                >
                  <Typography
    variant="h5"
    sx={{
        fontSize: { xs: "1.2rem", md: "1.5rem" },
        color: "#fff",
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 600,
        mb: 2,
        textAlign: "center",
    }}
>
    {order.products && order.products.length > 0 ? order.products[0].product?.name || "Unknown Product" : "No Product"}
</Typography>

              

                  <Divider
                    sx={{
                      width: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      mb: 2,
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                      gap: 2,
                    }}
                  >
                    {/* Product Image */}
                    {order?.products?.map((item) => (
    <Card
        key={item?.product?._id}
        sx={{
            maxWidth: { xs: 250, md: 250 },
            maxHeight: { xs: 250, md: 270 },
            borderRadius: "8px",
            overflow: "hidden",
        }}
    >
        <CardMedia
            component="img"
            image={`http://localhost:5000${
                item?.images && item.images.length > 0
                    ? item.images[productImageState[item?.product?._id] || 0]
                    : "/default-image.jpg"
            }`}
            alt={item?.product?.name || "Product Image"}
            sx={{
                transition: "transform 1.2s ease",
                transformStyle: "preserve-3d",
                ":hover": {
                    transform: "rotateY(180deg)",
                },
            }}
            onMouseEnter={() => handleImageHover(item?.product?._id, true)}
            onMouseLeave={() => handleImageHover(item?.product?._id, false)}
        />
    </Card>
))}


                    {/* Order Details */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        textAlign: "center",
                        color: "#fff",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: "1rem", md: "1.3rem" } }}
                      >
                        Status:{" "}
                        <Typography
                          component="span"
                          sx={{
                            color:
                              order.status === "Shipped"
                                ? "#00cc00"
                                : "#ff4444",
                            fontWeight: 500,
                            fontSize: "1.3rem",
                          }}
                        >
                          {order.status}
                        </Typography>
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
                        variant="h6"
                        sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }}
                      >
                        Price:{" "}
                        <span style={{ color: "white" }}>
                          ${order.totalPrice}
                        </span>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "0.9rem", md: "1rem" },
                          color: "rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        Ordered on:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#FFEB3B",
                      color: "#1a1a1a",
                      fontWeight: "bold",
                      fontFamily: "'Raleway', sans-serif",
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                      mt: 2,
                      width: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        bgcolor: "red",
                        transform: "scale(1.02)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onClick={(event) =>
                      handleCancelOrder(order._id, order.status, event)
                    }
                  >
                    Cancel Order
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography
              variant="h6"
              sx={{ color: "#fff", textAlign: "center", py: 2 }}
            >
              No orders found.
            </Typography>
          )}
        </Box>
      </FullWidthSection>
    </Container>
  );
};

export default MyOrders;
