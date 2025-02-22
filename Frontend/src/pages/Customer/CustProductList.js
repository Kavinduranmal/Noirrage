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
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const navigate = useNavigate();
  const [productImageState, setProductImageState] = useState({});

  const token = localStorage.getItem("userToken"); // Get token from localStorage

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://51.21.127.196:5000/api/products/"
      );
      setProducts(response.data);
    } catch (error) {
      toast.error(error.response?.data.message || "Error fetching products");
    } finally {
      setLoading(false);
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

    try {
      await axios.post(
        "http://51.21.127.196:5000/api/cart/add",
        { productId, qty: quantity, size, color }, // Use productId
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to Cart Successfully!");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart.");
    }
  };

  const handleImageHover = (productId, hover) => {
    setProductImageState((prevState) => ({
      ...prevState,
      [productId]: hover ? 1 : 0, // 1 for hover image, 0 for default image
    }));
  };

  return (
    <Box>
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
              xs={10.5} // Full width on mobile for single-column rows
              sm={5} // Original 2 cards per row on small screens
              md={3} // Original 4 cards per row on medium screens
              key={product._id}
            >
              <Card
                sx={{
                  width: { xs: "100%", sm: "80%" }, // Full width on mobile, 80% on larger screens
                  border: "1px solid rgba(109, 109, 109, 0.34)",
                  display: "flex",
                  flexDirection: { xs: "row", sm: "column" }, // Row on mobile, column on larger screens
                  padding: "5px",
                  margin: { sm: "30px" }, // Reduced margin on mobile
                  borderRadius: 2,
                  background: "linear-gradient(45deg, #232526, #414345)",
                  boxShadow: "0 4px 10px rgb(39, 38, 38)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                {/* Image Section */}
                <Box
                  sx={{
                    height: { xs: 200, sm: 250, md: 350 }, // Smaller on mobile
                    width: { xs: "40%", sm: "100%" }, // 40% width on mobile, full on larger screens
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 1,
                  }}
                >
                  <Card sx={{ maxWidth: { xs: 120, sm: 210 }, perspective: "1000px" }}>
                    <CardMedia
                      component="img"
                      height="100%"
                      image={`http://51.21.127.196:5000${
                        product.images[productImageState[product._id] || 0]
                      }`}
                      alt={product.name}
                      id={`image-${product._id}`}
                      sx={{
                        transition: "transform 1.2s ease",
                        transformStyle: "preserve-3d",
                        ":hover": {
                          transform: { xs: "none", sm: "rotateY(180deg)" }, // No hover effect on mobile
                        },
                      }}
                      onMouseEnter={() => handleImageHover(product._id, true)}
                      onMouseLeave={() => handleImageHover(product._id, false)}
                    />
                  </Card>
                </Box>

                {/* Content Section */}
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: { xs: "8px", sm: "10px" }, // Tighter padding on mobile
                    textAlign: { xs: "left", sm: "center" }, // Left-align on mobile, center on larger screens
                    width: { xs: "60%", sm: "100%" }, // 60% width on mobile next to image
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: { xs: "16px", sm: "25px", md: "35px" }, // Smaller on mobile
                      fontWeight: 500,
                      color: "#fdc200",
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2" // Smaller variant for mobile
                    color="#d0d0d0"
                    sx={{
                      fontSize: { xs: "10px", sm: "14px", md: "16px" },
                      mt: { xs: 0.5, sm: 0 }, // Small margin on mobile
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mt: { xs: 1, sm: 1 },
                      color: "#fff",
                      fontSize: { xs: "12px", sm: "16px", md: "18px" },
                    }}
                  >
                    Rs: {product.price}
                  </Typography>

                  {/* Buttons */}
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      mt: { xs: 1, sm: 1 },
                      justifyContent: { xs: "flex-start", sm: "center" }, // Left-align on mobile
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
                          "&:hover": { bgcolor: product.inStock ? "gray" : "gray" },
                          padding: { xs: "4px", sm: "6px" }, // Smaller on mobile
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
                          color: "gold",
                          "&:hover": { color: "lightgray" },
                          minWidth: "auto",
                        }}
                        onClick={() => handleAddToCart(product._id)}
                      >
                        <ShoppingCartIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
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

export default ProductList;