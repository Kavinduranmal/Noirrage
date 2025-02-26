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
          "http://16.170.141.231:5000/api/cart/view",
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
        toast.error("Failed to fetch cart items.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token, navigate]);

  const handleRemoveFromCart = async (itemId) => {
    if (!token) return;

    try {
      await axios.delete(
        `http://16.170.141.231:5000/api/cart/remove/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Item removed from cart!");
      setCartItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemId)
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item.");
    }
  };

  const handleOrderNow = (productId) => {
    navigate("/CustomerOrder", { state: { productId } });
  };

  const handleImageHover = (itemId, hover) => {
    setProductImageState((prevState) => ({
      ...prevState,
      [itemId]: hover ? 1 : 0,
    }));
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
          Your cart is empty.
        </Typography>
      ) : (
        <Grid container spacing={7} justifyContent="center">
          {cartItems.map((item) => (
            <Grid item xs={12} sm={5} md={3.5} key={item._id}>
              <Card
                sx={{
                  boxShadow: "0px 12px 20px rgba(0, 0, 0, 0.8)",

                  background: "linear-gradient(135deg, #232526, #414345)",
                  border: "1px solid rgba(100, 100, 100, 0.5)",
                  transition: "all 0.3s ease",
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
                  {item.product ? (
                    <>
                      {/* Product Image */}
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
                          image={`http://16.170.141.231:5000${
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
                          {item.product?.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: "0.9rem", md: "1rem" },
                            color: "rgba(255, 255, 255, 0.8)",
                            mt: 1,
                            maxWidth: "300px",
                          }}
                        >
                          {item.product?.description}
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
                          Rs {item.product?.price}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "1.2rem",
                        color: "red",
                        textAlign: "center",
                        py: 2,
                      }}
                    >
                      Product is no longer in production.
                    </Typography>
                  )}

                  {/* Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                      width: "100%",
                      
                      justifyContent: "center",
                    }}
                  >
                    {item.product ? (
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: "#1a1a1a",
                          color: "#fff",
                          fontWeight: "bold",
                          fontFamily: "'Raleway', sans-serif",
                          borderRadius: "8px",
                          px: 3,
                          py: 1,
                          width: { xs: "100%", sm: "auto" },
                          "&:hover": {
                            bgcolor: "gray",
                            transform: "scale(1.02)",
                          },
                          transition: "all 0.3s ease",
                        }}
                        onClick={() => handleOrderNow(item.product?._id)}
                      >
                        Order Now
                      </Button>
                    ) : null}
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
                        width: { xs: "100%", sm: "auto" },
                        "&:hover": {
                          bgcolor: "red",
                          transform: "scale(1.02)",
                        },
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                      onClick={() => handleRemoveFromCart(item._id)}
                    >
                      Remove
                      <DeleteIcon
                        sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }}
                      />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Cart;
