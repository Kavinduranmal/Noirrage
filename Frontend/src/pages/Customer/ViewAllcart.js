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
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();
  const [productImageState, setProductImageState] = useState({});

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login");
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await axios.get(
          "http://51.21.127.196:5000/api/cart/view",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCartItems(
          Array.isArray(response.data)
            ? response.data
            : response.data.items || []
        );
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  const handleRemoveFromCart = async (itemId) => {
    if (!token) {
      return;
    }

    try {
      await axios.delete(
        `http://51.21.127.196:5000/api/cart/remove/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Item removed from cart!");
      setCartItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemId)
      );
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to remove item.");
    }
  };

  const handleOrderNow = (productId) => {
    navigate("/CustomerOrder", { state: { productId } });
  };

  const handleImageHover = (itemtId, hover) => {
    setProductImageState((prevState) => ({
      ...prevState,
      [itemtId]: hover ? 1 : 0, // 1 for hover image, 0 for default image
    }));
  };

  return (
    <Box sx={{ padding: "40px", minHeight: "100vh" }}>
      <Typography
        variant="h3"
        textAlign="center"
        mb={4}
        sx={{
          fontFamily: "'Raleway', sans-serif",
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
            fontSize: "22px",
            fontWeight: "bold",
            color: "#aaa",
          }}
        >
          Your cart is empty.
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {cartItems.map((item) => (
            <Grid item xs={12} key={item._id}>
              <Card
                sx={{
                  boxShadow: "0px 12px 20px rgb(0, 0, 0)",
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #232526, #414345)",
                  transition: "all 0.2s ease",
                  border: "0.5px solid rgba(100, 100, 100, 0.41)",
                  "&:hover": {
                    border: "1px solid rgba(171, 170, 170, 0.7)",
                    transform: "scale(1)",
                    boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.9)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" }, // Column for mobile, row for larger screens
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px",
                  }}
                >
                  {item.product ? (
                    <>
                      {/* Product Image */}
                      <Card
                        sx={{
                          
                          maxWidth: { xs: "100%", sm: 210 }, // Full width on mobile, fixed width on larger screens
                          perspective: "1000px",
                          mb: { xs: 2, sm: 0 }, // Margin bottom for mobile
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="280"
                          width="250"
                          image={`http://51.21.127.196:5000${
                            item.product?.images[
                              productImageState[item._id] || 0
                            ]
                          }`}
                          alt={item.product?.name}
                          id={`image-${item._id}`}
                          sx={{
                            transition: "transform 1.2s ease",
                            transformStyle: "preserve-3d",
                            ":hover": {
                              transform: "rotateY(180deg)",
                            },
                          }}
                          onMouseEnter={() => handleImageHover(item._id, true)}
                          onMouseLeave={() => handleImageHover(item._id, false)}
                        />
                      </Card>

                      {/* Product Details */}
                      <Box
                        sx={{
                          flex: 1,
                          ml: { xs: 0, sm: 3 }, // No margin on mobile, margin on larger screens
                          textAlign: { xs: "center", sm: "left" }, // Center text on mobile
                        }}
                      >
                        <Typography
                          variant="h4"
                          mb={2}
                          sx={{
                            fontSize: { xs: "16px", sm: "25px", md: "35px" }, // Smaller on mobile
                            fontFamily: "'Raleway', sans-serif",
                            color: "#f1c40f",
                          }}
                        >
                          {item.product?.name}
                        </Typography>
                        <Typography
                          variant="h7"
                          sx={{
                            fontSize: { xs: "10px", sm: "14px", md: "16px" },
                            color: "white",
                            opacity: 0.8,
                          }}
                        >
                          {item.product?.description}
                        </Typography>
                        <Typography
                          mt={2}
                          variant="h6"
                          sx={{
                            fontWeight: "700",
                            fontSize: { xs: "12px", sm: "16px", md: "18px" },
                            color: "white",
                          }}
                        >
                          Rs: {item.product?.price}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "20px",
                        color: "red",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      Product is no longer in production.
                    </Typography>
                  )}
                </CardContent>

                {/* Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2, // Space between buttons
                    mb: 3,
                    flexDirection: { xs: "column", sm: "row" }, // Column for mobile, row for larger screens
                    alignItems: "center",
                  }}
                >
                  {item.product ? (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        bgcolor: "black",
                        color: "white",
                        fontWeight: "bold",
                        "&:hover": { bgcolor: "gray" },
                        width: { xs: "80%", sm: "auto" }, // Full width on mobile, auto on larger screens
                      }}
                      onClick={() => handleOrderNow(item.product?._id)}
                    >
                      <Typography
                                                sx={{
                                                  color: "white",
                                                  fontSize: { xs: "10px", sm: "14px", md: "16px" },
                                                }}
                                              >
                      Order Now</Typography>
                    </Button>
                  ) : null}

                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      bgcolor: "gold",
                      color: "black",
                      fontSize: { xs: "10px", sm: "14px", md: "16px" },
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "red" },
                      width: { xs: "80%", sm: "auto" }, // Full width on mobile, auto on larger screens
                    }}
                    onClick={() => handleRemoveFromCart(item._id)}
                  >
                     <Typography
                                                sx={{
                                                 fontWeight:"bold",
                                                  fontSize: { xs: "10px", sm: "14px", md: "16px" },
                                                }}
                                              >
                    Remove <DeleteIcon sx={{
                                                mb:-0.5, 
                                                 fontSize: { xs: "15px", sm: "14px", md: "20px" },
                                               }}/>
                    </Typography>
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Cart;
