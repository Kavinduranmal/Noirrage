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

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(2); // Track API requests
  const navigate = useNavigate();

  const token = localStorage.getItem("userToken"); // Get token once

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login");
      return;
    }
    const getUserOrders = async () => {
      try {
        const { data } = await axios.get(
          "http:///16.170.141.231:5000/api/orders/byid",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (!orders) {
          toast.error("Unauthorized! Please log in.");
          return;
        }
      } finally {
        setPendingRequests((prev) => prev - 1);
      }
    };

    getUserOrders();
  }, [token]);

  // Set loading to false when all requests complete
  useEffect(() => {
    if (pendingRequests === 0) {
      setLoading(false);
    }
  }, [pendingRequests]);

  const handleCancelOrder = async (orderId, orderStatus, event) => {
    event.preventDefault(); // Prevent default behavior

    // Prevent cancellation if order is already shipped
    if (orderStatus === "Shipped") {
      toast.error("Order has already been shipped and cannot be canceled.");
      return;
    }

    if (!token) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `http://16.170.141.231:5000/api/orders/${orderId}/deleted`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order canseled successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error.response?.data?.message || "Failed to delete order.");
    }
  };

  const FullWidthSection = styled(Box)({
    width: "100%", // Ensures full width
    padding: "40px 0", // Adds spacing on top and bottom
  });

  // State to keep track of image index for each product (0: default, 1: hover)
  const [productImageState, setProductImageState] = useState({});

  const handleImageHover = (productId, hover) => {
    setProductImageState((prevState) => ({
      ...prevState,
      [productId]: hover ? 1 : 0, // 1 for hover image, 0 for default image
    }));
  };

  return (
    <Container maxWidth={false} sx={{ width: "100%", p: 0 }}>
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
          mb={4}
          sx={{
            fontFamily: "'Raleway', sans-serif",
          }}
        >
          My Orders
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap", // Ensures cards move to the next row when needed
            gap: 3, // Adds spacing between cards
            justifyContent: "center", // Centers cards in the container
          }}
        >
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <Card
                key={order._id}
                sx={{
                  width: { xs: "100%", sm: "550px" }, // Full width on mobile, fixed width on larger screens
                  border: "0.5px solid rgba(100, 100, 100, 0.41)",
                  background: "linear-gradient(135deg, #232526, #414345)",
                  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.7)",
                  borderRadius: "15px",
                  p: 1,
                  m: { xs: 1, sm: 2 }, // Smaller margin on mobile
                  textAlign: "center",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <CardContent>
                  {/* Product Name Centered */}
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: "16px", sm: "25px", md: "35px" }, // Smaller on mobile
                      color: "rgb(255, 255, 255);",

                      textAlign: "left",
                      fontFamily: "'Raleway', sans-serif",
                    }}
                  >
                    {order.products[0]?.product?.name}
                  </Typography>
                  <Divider
                    sx={{
                      mt: 3,
                      backgroundColor: "gray",
                      height: "0.2px",
                    }}
                  />
                  {/* Image on Left, Details on Right */}
                  <Box
                    mt={2}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" }, // Column for mobile, row for larger screens
                      alignItems: { xs: "center", sm: "flex-start" }, // Center on mobile, align left on larger screens
                      color: "#fff",
                      gap: 2,
                    }}
                  >
                    {/* Image on Left */}
                    {order?.products?.map((item) => (
                      <Card
                        key={item?.product?._id}
                        sx={{
                          maxWidth: { xs: "100%", sm: 210 }, // Full width on mobile, fixed width on larger screens
                          perspective: "1000px",
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="210"
                          image={`http://16.170.141.231:5000${
                            item?.images[
                              productImageState[item?.product?._id] || 0
                            ]
                          }`} // Dynamic image index for each product
                          alt={item?.product?.name}
                          id={`image-${item?.product?._id}`}
                          sx={{
                            transition: "transform 1.2s ease", // Slow down the rotation effect (1 second)
                            transformStyle: "preserve-3d",
                            ":hover": {
                              transform: "rotateY(180deg)", // Rotate right to left
                            },
                          }}
                          onMouseEnter={() =>
                            handleImageHover(item?.product?._id, true)
                          } // Hover image
                          onMouseLeave={() =>
                            handleImageHover(item?.product?._id, false)
                          } // Default image
                        />
                      </Card>
                    ))}

                    {/* Details in a Column */}
                    <Box
                      sx={{
                        ml: { xs: 0, sm: 5 }, // No margin on mobile, margin on larger screens
                        mt: { xs: 0, sm: 4 }, 
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        textAlign: { xs: "center", sm: "left" }, // Center text on mobile
                      }}
                    >
                      <Typography
                        variant="h6"
                        display="flex"
                        alignItems="center"
                        justifyContent={{ xs: "center", sm: "flex-start" }} // Center on mobile, align left on larger screens
                      >
                        Status:
                        <Typography
                          component="span" // Use span to keep it inline
                          sx={{
                            fontSize: { xs: "12px", sm: "16px", md: "20px" },
                            color: order.status === "Shipped" ? "green" : "red",
                            ml: 1,
                          }} // Apply color & spacing
                        >
                          {order.status}
                        </Typography>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor:
                              order.status === "Shipped" ? "green" : "red",
                            ml: 1, // Adds spacing between text and dot
                          }}
                        />
                      </Typography>

                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: { xs: "12px", sm: "16px", md: "18px" },
                        }}
                      >
                        Price: ${order.totalPrice}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "12px", sm: "16px", md: "18px" },
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
                      fontWeight: "bold",
                      color: "black",
                      background: "gold",
                      mt: 2,
                      "&:hover": { background: "red" },
                    }}
                    onClick={(event) =>
                      handleCancelOrder(order._id, order.status, event)
                    }
                  >
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: "15px", sm: "14px", md: "18px" },
                      }}
                    >
                      Cancel Order
                    </Typography>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography
              variant="h6"
              sx={{ color: "#fff", textAlign: "center" }}
            >
              No orders found.
            </Typography>
          )}
        </Box>
      </FullWidthSection>
    </Container>
  );
};

export default Profile;
