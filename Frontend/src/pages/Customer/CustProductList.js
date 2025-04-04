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
        "http://13.49.246.175:3000/api/products/"
      );
      setProducts(response.data);
      console.log("this are the products that have in store",response.data)
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
          Our Products
        </Typography>
      </motion.div>
      {/* Custom styled progress bar for initial loading */}
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

      {/* Display skeletons while loading */}
      {loading ? (
        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          {renderSkeletons()}
        </Grid>
      ) : (
        <Grid
          container
          spacing={2}
          sx={{
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
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
                sm={5}
                md={3}
                key={product._id}
                component={motion.div}
                initial={{ opacity: 0, y: 50 }}
                animate={animate ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: { xs: "auto", sm: "90%" }, // Auto height on mobile for content flexibility
                    width: { xs: "90%", sm: "90%" }, // Full width on mobile, 90% on larger screens
                    border: "1px solid rgba(175, 175, 175, 0.34)",
                    display: "flex",
                    flexDirection: "column",
                    padding: { xs: "2px", sm: "4px" }, // Reduced padding on mobile
                    margin: { xs: "4px", sm: "10px" }, // Smaller margins on mobile
                    background: "linear-gradient(45deg, #232526, #414345)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.6)",
                    transition: "all 0.4s cubic-bezier(0.65, 0, 0.35, 1)",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 2,
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)",
                      pointerEvents: "none",
                    },
                  }}
                >
                  {/* Out of Stock Label */}
                  {!product.inStock && (
                    <Chip
                      label="Out of Stock"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: { xs: 6, sm: 8 }, // Slightly adjusted for mobile
                        left: { xs: 6, sm: 8 },
                        zIndex: 10,
                        bgcolor: "rgba(255,0,0,0.7)",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: { xs: 9, sm: 12 }, // Smaller font on mobile
                        border: "1px solid rgba(255,255,255,0.3)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    />
                  )}

                  {/* Image Section */}
                  <Box
                    sx={{
                      height: { xs: 170, sm: 250, md: 350 }, // Smaller image height on mobile
                      width: { xs: "85%", sm: "85%" }, // Full width on mobile
                      margin: { xs: "4px auto", sm: 3 }, // Centered with less margin on mobile
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 1,
                      bgcolor: "white",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="100%"
                      image={`http://13.49.246.175:5000${
                        product.images[productImageState[product._id] || 0]
                      }`}
                      alt={product.name}
                      sx={{
                        width: "100%", // Ensure image scales properly
                        objectFit: "cover", // Maintain aspect ratio
                        transition: "transform 1.2s ease",
                        transformStyle: "preserve-3d",
                        ":hover": {
                          transform: {
                            xs: "scale(1.05)",
                            sm: "rotateY(180deg)",
                          }, // Scale on mobile instead of rotate
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
                      padding: { xs: "6px", sm: "16px" }, // Reduced padding on mobile
                      textAlign: "center",
                      width: "100%",
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
                        fontSize: { xs: "16px", sm: "22px", md: "24px" }, // Smaller title on mobile
                        color: "rgb(255, 255, 255)",
                        fontWeight: "bold",
                        mb: { xs: 0.5, sm: 1 },
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
                        fontSize: { xs: "12px", sm: "14px", md: "16px" }, // Adjusted font size
                        mt: { xs: 0.5, sm: 0 },
                        mb: { xs: 1, sm: 1.5 },
                        color: "#d0d0d0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: { xs: "24px", sm: "40px" }, // Adjusted min height
                      }}
                    >
                      {product.description}
                    </Typography>

                    {/* Price */}
                    <Typography
                      variant="h6"
                      component={motion.div}
                      whileHover={{ scale: 1.05 }}
                      sx={{
                        mt: { xs: 0.5, sm: 1 },
                        color: "#ffcc00",
                        fontSize: { xs: "14px", sm: "20px", md: "22px" }, // Smaller price on mobile
                        display: "inline-block",
                        padding: { xs: "2px 8px", sm: "4px 12px" }, // Reduced padding
                        borderRadius: "4px",
                        background: "rgba(0,0,0,0.3)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        margin: "0 auto",
                        mb: { xs: 1, sm: 2 },
                      }}
                    >
                      Rs. {product.price.toLocaleString()}
                    </Typography>

                    {/* Buttons */}
                    <Grid
                      container
                      spacing={1}
                      sx={{
                        mt: { xs: 0.5, sm: 1 },
                        justifyContent: "center",
                      }}
                    >
                      <Grid item xs={7} sm={8}>
                        {" "}
                        {/* Adjusted width for better mobile fit */}
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            bgcolor: product.inStock
                              ? "black"
                              : "rgba(128,128,128,0.7)",
                            color: "white",
                            fontWeight: "bold",
                            border: !product.inStock
                              ? "2px solid rgba(255,0,0,0.5)"
                              : "2px solid rgba(255,215,0,0.5)",
                            "&:hover": {
                              bgcolor: product.inStock
                                ? "rgba(0,0,0,0.8)"
                                : "rgba(128,128,128,0.7)",
                              transform: product.inStock
                                ? "translateY(-2px)"
                                : "none",
                              boxShadow: product.inStock
                                ? "0 4px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.5)"
                                : "none",
                            },
                            padding: { xs: "6px", sm: "10px" }, // Smaller padding on mobile
                            borderRadius: "6px",
                            transition:
                              "all 0.3s cubic-bezier(0.65, 0, 0.35, 1)",
                            textTransform: "none",
                            position: "relative",
                            overflow: "hidden",
                            "&::after": product.inStock
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  background:
                                    "linear-gradient(45deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0) 100%)",
                                  opacity: 0,
                                  transition: "opacity 0.3s ease",
                                }
                              : {},
                            "&:hover::after": { opacity: 1 },
                          }}
                          onClick={() => handleOrderNow(product._id)}
                          disabled={!product.inStock}
                        >
                          <Typography
                            sx={{
                              color: "white",
                              fontSize: { xs: "10px", sm: "14px", md: "16px" }, // Smaller text
                              fontFamily: "'Raleway', sans-serif",
                            }}
                          >
                            {product.inStock ? "Order Now" : "Out of Stock"}
                          </Typography>
                        </Button>
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        {" "}
                        {/* Adjusted width */}
                        <Button
                          id={`cart-icon-${product._id}`}
                          sx={{
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "gold",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,215,0,0.3)",
                            height: "100%",
                            minWidth: { xs: "40px", sm: "auto" }, // Fixed min width on mobile
                            padding: { xs: 0.5, sm: 1 }, // Reduced padding
                            transition:
                              "all 0.3s cubic-bezier(0.65, 0, 0.35, 1)",
                            "&:hover": {
                              color: "white",
                              bgcolor: "rgba(0,0,0,0.8)",
                              border: "1px solid rgba(255,255,255,0.5)",
                              transform: "translateY(-2px)",
                            },
                            "&.cart-animation": {
                              animation: "pulse 0.8s ease-in-out",
                            },
                            "@keyframes pulse": {
                              "0%": { transform: "scale(1)" },
                              "50%": { transform: "scale(1.2)" },
                              "100%": { transform: "scale(1)" },
                            },
                          }}
                          onClick={() => handleAddToCart(product._id)}
                          disabled={!product.inStock}
                        >
                          <ShoppingCartIcon
                            sx={{
                              fontSize: { xs: 18, sm: 24 }, // Smaller icon on mobile
                              transition: "transform 0.3s ease",
                              "&:hover": { transform: "rotate(10deg)" },
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

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </Box>
  );
};

export default CustProductList;
