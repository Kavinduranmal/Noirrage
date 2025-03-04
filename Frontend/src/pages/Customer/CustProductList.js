import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CardMedia,
  Box,
  Button,
  IconButton,
  Divider,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CustProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [animate, setAnimate] = useState(false); // For animation
  const navigate = useNavigate();
  const [productImageState, setProductImageState] = useState({});

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    fetchProducts();
    // Trigger animation after a slight delay
    setTimeout(() => {
      setAnimate(true);
    }, 500); // Delay animation for 500ms
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://16.170.141.231:5000/api/products/"
      );
      setProducts(response.data);
    } catch (error) {
      toast.error(error.response?.data.message || "Error fetching products");
    } finally {
      // Simulate a longer loading time for the animation (2 seconds)
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const handleOrderNow = (productId) => {
    navigate("/CustomerOrder", { state: { productId } });
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login");
      return;
    }
    navigate("/AddToCartOrderForm", { state: { productId } });
  };

  const handleImageHover = (productId, hover) => {
    setProductImageState((prevState) => ({
      ...prevState,
      [productId]: hover ? 1 : 0,
    }));
  };

  return (
    <Box sx={{ mb: 8 }}>
      {loading && (
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress
            sx={{
              backgroundColor: "black",
              borderRadius: 10,
              "& .MuiLinearProgress-bar": { backgroundColor: "gold" },
            }}
          />
        </Box>
      )}

      <Grid container spacing={2} sx={{ justifyContent: "center" }}>
        {!loading && products.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ width: "100%", textAlign: "center" }}
          >
            No products available.
          </Typography>
        ) : (
          products.map((product) => (
            <Grid
              item
              xs={6} // 2 items per row on mobile
              sm={5} // Unchanged for laptop
              md={3} // Unchanged for laptop
              key={product._id}
            >
              <Card
                sx={{
                  height: { xs: "auto", sm: "90%" }, // Auto height on mobile for flexibility
                  width: { xs: "88%", sm: "90%" },
                  border: "1px solid rgba(175, 175, 175, 0.34)",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "column" }, // Always column for consistency
                  padding: "4px",
                  margin: { xs: "5px", sm: "10px" },
                  background: "linear-gradient(45deg, #232526, #414345)", // Keep your existing theme
                  boxShadow: "0 4px 10px rgb(39, 38, 38)",
                  transition:
                    "transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease", // Added opacity for animation
                  opacity: animate ? 1 : 0, // Fade-in animation
                  transform: animate ? "translateY(0)" : "translateY(20px)", // Slight slide-up animation
                }}
              >
                {/* Image Section */}
                <Box
                  sx={{
                    height: { xs: 200, sm: 250, md: 350 },
                    width: "85%", // Full width on all screens
                    margin: { xs: 1.6, sm: 3 },
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 1,
                    bgcolor: "white", // White background for the image container
                  }}
                >
                  <CardMedia
                    component="img"
                    height="100%"
                    image={`http://16.170.141.231:5000${
                      product.images[productImageState[product._id] || 0]
                    }`}
                    alt={product.name}
                    sx={{
                      transition: "transform 1.2s ease",
                      transformStyle: "preserve-3d",
                      ":hover": {
                        transform: { xs: "none", sm: "rotateY(180deg)" },
                      },
                    }}
                    onMouseEnter={() => handleImageHover(product._id, true)}
                    onMouseLeave={() => handleImageHover(product._id, false)}
                  />
                </Box>

                {/* Content Section */}
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: { xs: "8px", sm: "10px" },
                    textAlign: "center", // Center-align on all screens
                    width: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: { xs: "14px", sm: "25px", md: "30px" },
                      color: "rgb(255, 255, 255)", // Keep your theme
                      fontWeight: "bold",
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="#d0d0d0" // Keep your theme
                    sx={{
                      fontSize: { xs: "10px", sm: "14px", md: "16px" },
                      mt: { xs: 0.5, sm: 0 },
                    }}
                  >
                    {product.description}
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: { xs: 1, sm: 1 },
                      color: "#fff", // Keep your theme
                      fontSize: { xs: "12px", sm: "16px", md: "18px" },
                      fontWeight: "bold",
                    }}
                  >
                    Rs. {product.price.toLocaleString()}
                  </Typography>

                  {/* Buttons */}
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      mt: { xs: 1, sm: 1 },
                      justifyContent: "center",
                    }}
                  >
                    <Grid item xs={8} sm={8}>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          bgcolor: product.inStock ? "black" : "gray",
                          color: "white",
                          fontWeight: "bold",
                          border: !product.inStock ? "2px solid red" : "none",
                          "&:hover": {
                            bgcolor: product.inStock ? "gray" : "gray",
                          },
                          padding: { xs: "4px", sm: "6px" },
                        }}
                        onClick={() => handleOrderNow(product._id)}
                        disabled={!product.inStock}
                      >
                        <Typography
                          sx={{
                            color: "white",
                            fontSize: { xs: "10px", sm: "14px", md: "16px" },
                          }}
                        >
                          {product.inStock ? "Order Now" : "Out of Stock"}
                        </Typography>
                      </Button>
                    </Grid>
                    <Grid item xs={2} sm={2}>
                      <Button
                        sx={{
                          bgcolor: "#00000000",
                          color: "gold", // Keep your theme
                          "&:hover": { color: "lightgray" },
                          minWidth: "auto",
                        }}
                        onClick={() => handleAddToCart(product._id)}
                        disabled={!product.inStock}
                      >
                        <ShoppingCartIcon
                          sx={{ fontSize: { xs: 20, sm: 24 } }}
                        />
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default CustProductList;
