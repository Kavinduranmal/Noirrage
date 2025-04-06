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
  Chip,
  Skeleton,
  Fade,
  Zoom,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarIcon from "@mui/icons-material/Star";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";

const CustProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();
  const [productImageState, setProductImageState] = useState({});
  const [favorites, setFavorites] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    fetchProducts();
    // Loading animation progress
    const timer = setInterval(() => {
      setLoadingProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);

    // Staggered animation for cards
    setTimeout(() => {
      setAnimate(true);
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://16.170.141.231:5000/api/products/"
      );
      setProducts(response.data);
      console.log("this are the products that have in store", response.data);
    } catch (error) {
      toast.error(error.response?.data.message || "Error fetching products", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
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
      toast.error("Unauthorized! Please log in.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/user/Login");
      return;
    }

    // Add cart animation
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

  // Render skeleton loaders while loading
  const renderSkeletons = () => {
    return Array.from(new Array(8)).map((_, index) => (
      <Grid item xs={6} sm={5} md={3} key={`skeleton-${index}`}>
        <Skeleton
          variant="rectangular"
          width="90%"
          height={350}
          animation="wave"
          sx={{
            margin: "10px",
            bgcolor: "rgba(70, 70, 70, 0.3)",
            borderRadius: 2,
          }}
        />
      </Grid>
    ));
  };

  return (
    <Box
      sx={{
        mb: 8,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "200px",
          zIndex: 0,
          pointerEvents: "none",
        },
      }}
    >
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
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: "80px",
              height: "3px",

              borderRadius: "2px",
            },
          }}
        >
          Our Products
        </Typography>
      </motion.div>

      {loading && (
        <Box sx={{ width: "100%", mb: 4, mt: 2 }}>
          <LinearProgress
            sx={{
              backgroundColor: "black",
              "& .MuiLinearProgress-bar": { backgroundColor: "gold" },
            }}
          />
        </Box>
      )}

      {loading ? (
        <Grid container spacing={2} justifyContent="center">
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid key={i} item xs={10} sm={6} md={3}>
              <Box height={300} bgcolor="#2c2c2c" borderRadius={2} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid
          container
          spacing={{ xs: 1, sm: 2, md: 3 }}
          justifyContent="center"
        >
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
                sx={{
                  color: "white",
                  textAlign: "center",
                  fontFamily: "'Raleway', sans-serif",
                  mb: 2,
                }}
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
            products.map((product, index) => (
              <Grid
                item
                xs={6}
                sm={6}
                md={3}
                sx={{ px: 1, mb: 3 }}
                key={product._id}
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div>
                  <Card
                    sx={{
                      pt: "10px",
                      width: "100%",
                      border: "1px solid rgba(175, 175, 175, 0.34)",
                      display: "flex",
                      flexDirection: "column",
                      background: "linear-gradient(45deg, #232526, #414345)",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.6)",
                      transition: "all 0.4s ease",
                      position: "relative",
                      overflow: "hidden",
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
                          border: "1px solid rgba(255,255,255,0.3)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        }}
                      />
                    )}

                    {/* Flip Image Section */}
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
                    </Box>

                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        px: 2,
                        pt: 1,
                        pb: 2,
                        textAlign: "center",
                        position: "relative",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "10%",
                          width: "80%",
                          height: "1px",
                          background:
                            "linear-gradient(90deg, rgba(255,215,0,0) 0%, rgba(255,215,0,0.5) 50%, rgba(255,215,0,0) 100%)",
                        },
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
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          textShadow: "0px 1px 3px rgba(0,0,0,0.5)",
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "12px", sm: "14px" },
                          color: "#d0d0d0",
                          mb: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
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

                      <Grid container spacing={1} justifyContent="center">
                        <Grid item xs={8}>
                          <Button
                            fullWidth
                            variant="contained"
                            sx={{
                              bgcolor: product.inStock
                                ? "black"
                                : "rgba(128,128,128,0.7)",
                              color: "white",
                              fontWeight: "bold",
                              border: product.inStock
                                ? "2px solid rgba(255,215,0,0.5)"
                                : "2px solid rgba(255,0,0,0.5)",
                              ":hover": {
                                bgcolor: product.inStock
                                  ? "#111"
                                  : "rgba(128,128,128,0.7)",
                                transform: product.inStock
                                  ? "translateY(-2px)"
                                  : "none",
                                boxShadow: product.inStock
                                  ? "0 4px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.5)"
                                  : "none",
                              },
                              px: 2,
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
                                border: "1px solid rgba(255,255,255,0.5)",
                                transform: "translateY(-2px)",
                              },
                            }}
                            onClick={() => handleAddToCart(product._id)}
                            disabled={!product.inStock}
                          >
                            <ShoppingCartIcon
                              sx={{ fontSize: { xs: 18, sm: 24 } }}
                            />
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
};

export default CustProductList;
