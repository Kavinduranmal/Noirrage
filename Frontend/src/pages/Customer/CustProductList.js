import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Grid,
  CardMedia,
  Box,
  Button,
  LinearProgress,
  Chip,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { motion } from "framer-motion";

const CustProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState("");
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();
  const [productImageState, setProductImageState] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const token = localStorage.getItem("userToken");

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const applyFilters = () => {
    const filteredProducts = products.filter((product) => {
      const priceCondition =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const sizeCondition = size ? product.size === size : true;
      return priceCondition && sizeCondition;
    });
    setProducts(filteredProducts);
  };

  useEffect(() => {
    fetchProducts();
    const timer = setInterval(() => {
      setLoadingProgress((prevProgress) =>
        prevProgress + 10 >= 100 ? 100 : prevProgress + 10
      );
    }, 200);
    setTimeout(() => setAnimate(true), 500);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://16.170.141.231:5000/api/products/"
      );
      setProducts(response.data);
    } catch (error) {
      toast.error(error.response?.data.message || "Error fetching products", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setTimeout(() => setLoading(false), 2000);
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

    const cartIcon = document.getElementById(`cart-icon-${productId}`);
    if (cartIcon) {
      cartIcon.classList.add("cart-animation");
      setTimeout(() => {
        cartIcon.classList.remove("cart-animation");
        navigate("/AddToCartOrderForm", { state: { productId } });
      }, 800);
    } else {
      navigate("/AddToCartOrderForm", { state: { productId } });
    }
  };

  const handleImageHover = (productId, hover) => {
    setProductImageState((prevState) => ({
      ...prevState,
      [productId]: hover ? 1 : 0,
    }));
  };

  return (
    <Box sx={{ mb: 8, mt: 3 }}>
      {/* Horizontal Filter Bar */}
      {/* <Box
        sx={{
          width: { xs: "80%", sm: "80%" }, // Make it 90% on mobile, 80% on larger screens
          borderRadius: { xs: 10, sm: 50 },
          bgcolor: "rgba(244, 203, 0, 0.19)",
          px: { xs: 2, sm: 4, md: 6 },
          py: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile, row on larger screens
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "'Raleway', sans-serif",
          borderBottom: "1px solid rgba(255, 215, 0, 0.2)",
          mb: 3,
          border: "1px solid rgb(246, 193, 0)",
          margin: "0 auto", // Center the bar horizontally
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "gold",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: "bold",
            mb: { xs: 2, sm: 0 },
            minWidth: "150px",
          }}
        >
          Filter Products By Price
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
            alignItems: "center",
            flex: 1,
            maxWidth: 500,
            mx: { xs: 0, sm: 3 },
          }}
        >
          <Typography
            sx={{
              mr: 2,
              fontWeight: "bold",
              color: "gold",
              fontStyle: "italic", // Makes the text italic
              mb: { xs: 1, sm: 0 }, // Margin bottom on mobile for spacing
            }}
          >
            From
          </Typography>

          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `Rs. ${value}`}
            min={0}
            max={6000}
            step={50}
            sx={{
              color: "gold", // Track color
              height: 2, // Track height
              "& .MuiSlider-thumb": {
                backgroundColor: "gold", // Thumb color
                width: 15, // Thumb size
                height: 15, // Thumb size
                borderRadius: "50%", // Circular thumb
              },
              "& .MuiSlider-track": {
                borderRadius: 5, // Rounded track corners
                height: 2, // Track height
                background:
                  "linear-gradient(90deg, rgba(255, 215, 0, 0.5) 0%, rgba(255, 215, 0, 0.9) 100%)", // Custom track gradient
              },
              "& .MuiSlider-rail": {
                backgroundColor: "rgba(255, 215, 0, 0.2)", // Subtle color for the rail
                height: 2, // Rail height
              },
              "& .MuiSlider-valueLabel": {
                fontSize: 14, // Value label font size
                backgroundColor: "black", // Background color for value label
                color: "gold", // Text color for the label
                borderRadius: 1, // Rounded corners for value label
                padding: "4px 6px", // Padding inside value label
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Shadow effect
                "& .MuiSlider-valueLabelLabel": {
                  fontSize: "12px", // Smaller label text size
                },
              },
              "&:hover .MuiSlider-thumb": {
                backgroundColor: "rgb(255, 215, 0)", // Thumb color on hover
              },
            }}
          />

          <Typography
            sx={{
              fontWeight: "bold",
              ml: { xs: 0, sm: 2 },
              color: "gold",
              fontStyle: "italic", // Makes the text italic
              mb: { xs: 1, sm: 0 }, // Margin bottom on mobile for spacing
            }}
          >
            To
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={applyFilters}
          sx={{
            borderRadius: 50,
            bgcolor: "gold",
            color: "black",
            py: 1,
            mt: { xs: 2, sm: 0 },
            width: "100%", // Full width on mobile
            maxWidth: 150, // Limit the button width on larger screens
            "&:hover": {
              bgcolor: "black",
              color: "white",
            },
          }}
        >
          Apply Filters
        </Button>
      </Box> */}

      {/* Title */}
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
            mt: 2,
            mb: 3,
            fontSize: { xs: "1.8rem", md: "3rem" },
            textShadow: "0 2px 10px rgba(255, 215, 0, 0.3)",
            letterSpacing: "1px",
          }}
        >
          Our Products
        </Typography>
      </motion.div>

      {/* Loading Bar */}
      {loading && (
        <Box sx={{ width: "100%", mb: 4 }}>
          <LinearProgress
            sx={{
              backgroundColor: "black",
              "& .MuiLinearProgress-bar": { backgroundColor: "gold" },
            }}
          />
        </Box>
      )}

      {/* Product Grid */}
      {loading ? (
        <Grid container spacing={2} justifyContent="center">
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid key={i} item xs={10} sm={6} md={3}>
              <Box height={300} bgcolor="#2c2c2c" borderRadius={2} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {products.length === 0 ? (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
              }}
            >
              <Typography
                variant="h5"
                sx={{ color: "white", textAlign: "center", mb: 2 }}
              >
                No products available at the moment
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  color: "gold",
                  borderColor: "gold",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                  },
                }}
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </Box>
          ) : (
            products.map((product) => (
              <Grid
                item
                xs={6}
                sm={6}
                md={3}
                key={product._id}
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card
                  sx={{
                    pt: "10px",
                    border: "1px solid rgba(175, 175, 175, 0.34)",
                    background: "linear-gradient(45deg, #232526, #414345)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.6)",
                    borderRadius: 2,
                  }}
                >
                  {!product.inStock && (
                    <Chip
                      label="Out of Stock"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        zIndex: 10,
                        bgcolor: "rgba(255,0,0,0.7)",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    />
                  )}

                  {/* Flip Image */}
                  <Box
                    sx={{
                      perspective: "1000px",
                      width: "100%",
                      height: { xs: 250, sm: 350, md: 500 }, // responsive height!
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        transformStyle: "preserve-3d",
                        transition: "transform 1s",
                        "&:hover": {
                          transform: "rotateY(180deg)",
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={`http://16.170.141.231:5000${product.images[0]}`}
                        alt={product.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          backfaceVisibility: "hidden",
                        }}
                      />
                    </Box>
                    <CardMedia
                      component="img"
                      image={`http://16.170.141.231:5000${product.images[1]}`}
                      alt={`${product.name} Back`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      px: 2,
                      pt: 1,
                      pb: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "'Raleway', sans-serif",
                        fontSize: { xs: "16px", sm: "20px" },
                        color: "white",
                        fontWeight: "bold",
                        mb: 1,
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* 🔓 Full Product Description (no cut-off) */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: "12px", sm: "14px" },
                        color: "#d0d0d0",
                        mb: 2,
                        whiteSpace: "normal", // allow wrapping
                        overflowWrap: "break-word",
                      }}
                    >
                      {product.description}
                    </Typography>

                    <Typography
                      variant="h6"
                      component={motion.div}
                      whileHover={{ scale: 1.05 }}
                      sx={{
                        color: "#ffcc00",
                        fontSize: { xs: "14px", sm: "18px" },
                        px: 2,
                        py: 1,
                        borderRadius: "4px",
                        background: "rgba(0,0,0,0.3)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        mb: 2,
                      }}
                    >
                      Rs. {product.price.toLocaleString()}
                    </Typography>

                    {/* Buttons */}
                    <Grid container spacing={1} justifyContent="center">
                      <Grid item xs={8}>
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor: product.inStock
                              ? "black"
                              : "rgba(128,128,128,0.7)",
                            color: "white",
                            fontSize: { xs: "0.7rem", sm: "1rem" },
                            border: product.inStock
                              ? "1px solid rgba(255,215,0,0.5)"
                              : "1px solid rgba(255,0,0,0.5)",
                            ":hover": {
                              bgcolor: product.inStock ? "#111" : undefined,
                              transform: product.inStock
                                ? "translateY(-2px) scale(1.02)"
                                : "none",
                              boxShadow: product.inStock
                                ? "0 4px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.5)"
                                : "none",
                              transition:
                                "transform 0.3s ease, box-shadow 0.3s ease",
                            },
                            px: { xs: 2, sm: 7 },
                            py: 1,
                            borderRadius: "6px",
                            textTransform: "none",
                          }}
                          onClick={() => handleOrderNow(product._id)}
                          disabled={!product.inStock}
                        >
                          {product.inStock ? "Order Now" : "Out of Stock"}
                        </Button>
                      </Grid>
                      <Grid item xs={4}>
                        <Button
                          sx={{
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "gold",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,215,0,0.3)",
                            height: "100%",
                            minWidth: "40px",
                            transition: "all 0.3s ease",
                            ":hover": {
                              color: "white",
                              bgcolor: "rgba(0,0,0,0.8)",
                            },
                          }}
                          onClick={() => handleAddToCart(product._id)}
                          disabled={!product.inStock}
                        >
                          <ShoppingCartIcon
                            sx={{
                              fontSize: { xs: 18, sm: 24 },
                              transition: "transform 0.3s ease",
                              ":hover": {
                                transform: "translateY(-2px) rotate(15deg)",
                              },
                            }}
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
      )}
    </Box>
  );
};

export default CustProductList;
