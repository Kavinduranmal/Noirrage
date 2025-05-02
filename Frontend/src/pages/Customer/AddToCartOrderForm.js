import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  LinearProgress,
  IconButton,
  CardMedia,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Add, Remove, Close } from "@mui/icons-material";

const AddToCartOrderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const token = localStorage.getItem("userToken");
  const productId = location.state?.productId || null;

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to continue");
      navigate("/user/Login");
      return;
    }

    if (productId) {
      fetchProduct();
    } else {
      toast.error("No product selected");
      navigate("/CustProductList"); // Redirect to product list if no productId
    }
  }, [productId, token, navigate]);

  useEffect(() => {
    if (availableColors.length > 0) {
      setColor(availableColors[0]);
    }
  }, [availableColors]);

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSize(availableSizes[0]);
    }
  }, [availableSizes]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(
        "https://16.170.141.231:5000/api/products"
      );
      const product = data.find((p) => p._id === productId);
      if (product) {
        setSelectedProduct(product);
        setAvailableColors(product.colors || []);
        setAvailableSizes(product.sizes || []);
      } else {
        toast.error("Product not found");
        navigate("/CustProductList");
      }
    } catch (error) {
      toast.error("Failed to load product details");
      navigate("/CustProductList");
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (event, newColor) => {
    if (newColor) setColor(newColor);
  };

  const handleSizeChange = (event, newSize) => {
    if (newSize) setSize(newSize);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!size || !color) {
      toast.error("Please select a size and color");
      return;
    }

    const cartData = {
      productId: selectedProduct._id,
      qty: quantity,
      size,
      color,
    };

    try {
      await axios.post("https://16.170.141.231:5000/api/cart/add", cartData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item added to cart!");
      navigate("/CustProductList");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading || !selectedProduct) {
    return (
      <Box sx={{ width: "100%", m: 2 }}>
        <LinearProgress
          sx={{
            backgroundColor: "black",
            "& .MuiLinearProgress-bar": { backgroundColor: "gold" },
          }}
        />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3,mb:{ xs:10 ,md: 3 } }}>
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          position: "relative",
          boxShadow: "0px 12px 20px rgba(0, 0, 0, 0.88)",
          borderRadius: 2,
          background: "linear-gradient(90deg, #232526, #414345)",
        }}
      >
        <IconButton
          onClick={() => navigate("/CustProductList")}
          sx={{ position: "absolute", top: 8, right: 8, color: "red" }}
        >
          <Close />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "35%" }, textAlign: "center" }}>
            <Card sx={{ boxShadow: 3, p: 2 }}>
              <CardMedia
                component="img"
                image={`https://16.170.141.231:5000${selectedProduct.images[selectedImageIndex]}`}
                alt={selectedProduct.name}
                sx={{
                  borderRadius: "10px",
                  mb: 2,
                  width: "100%",
                  height: "auto",
                }}
              />
            </Card>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              {selectedProduct.images.map((img, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    minWidth: 50,
                    height: 50,
                    backgroundImage: `url(https://16.170.141.231:5000${img})`,
                    backgroundSize: "cover",
                    border:
                      selectedImageIndex === index
                        ? "2px solid gold"
                        : "1px solid black",
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "60%" },
              p: { xs: 2, md: 3 },
              display: "flex",
              justifyContent: "center",
            }}
          >
            <form
              onSubmit={handleAddToCart}
              style={{ width: "100%", maxWidth: "600px" }}
            >
              <Typography
                variant="h4"
                color="#fdc200"
                sx={{
                  mb: 4,
                  fontFamily: "'Raleway', sans-serif",
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                {selectedProduct.name}
              </Typography>
              <Typography
                sx={{
                  color: "lightgray",
                  pb: 3,
                  fontSize: "1.7rem",
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                Rs {selectedProduct.price}.00
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 3,
                  justifyContent: "space-between",
                  mb: 4,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    color="white"
                    variant="subtitle1"
                    fontWeight="bold"
                  >
                    Quantity
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <IconButton
                      onClick={() =>
                        setQuantity((prev) => Math.max(prev - 1, 1))
                      }
                      sx={{
                        color: "white",
                        border: "1px solid #ccc",
                        borderRadius: "50%",
                      }}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(Number(e.target.value), 1))
                      }
                      inputProps={{
                        min: 1,
                        style: { color: "white", textAlign: "center" },
                      }}
                      sx={{ width: "60px" }}
                    />
                    <IconButton
                      onClick={() => setQuantity((prev) => prev + 1)}
                      sx={{
                        color: "white",
                        border: "1px solid #ccc",
                        borderRadius: "50%",
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                      <Typography
                        color="white"
                        variant="subtitle1"
                        fontWeight="bold"
                      >
                        Pick a Color
                      </Typography>
                      <ToggleButtonGroup
                        value={color}
                        exclusive
                        onChange={handleColorChange}
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        {availableColors.map((colorOption, index) => (
                          <ToggleButton
                            key={index}
                            value={colorOption}
                            sx={{
                              backgroundColor: colorOption.toLowerCase(),
                              color: "white",
                              border: "1px solid black",
                              "&.Mui-selected": {
                                border: "2px solid gold",
                              },
                              minWidth: "50px",
                              height: "40px",
                              padding: 0,
                            }}
                          >
                            {/* No text, just the color box */}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography
                    color="white"
                    variant="subtitle1"
                    fontWeight="bold"
                  >
                    Available Sizes
                  </Typography>
                  <ToggleButtonGroup
                    value={size}
                    exclusive
                    onChange={handleSizeChange}
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                  >
                    {availableSizes.map((sizeOption, index) => (
                      <ToggleButton
                        key={index}
                        value={sizeOption}
                        sx={{
                          color: "black",
                          backgroundColor: "#c6c6c6",
                          border: "1px solid #ccc",
                          "&.Mui-selected": {
                            border: "2px solid gold",
                            color: "white",
                          },
                        }}
                      >
                        {sizeOption}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    mt: 3,
                    bgcolor: "#fdc200",
                    color: "black",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#e0a800" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/CustProductList")}
                  sx={{
                    mt: 3,
                    color: "white",
                    borderColor: "white",
                    "&:hover": { borderColor: "#fdc200", color: "#fdc200" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Keep Shopping
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/ViewAllcart")}
                  sx={{
                    mt: 3,
                    color: "white",
                    borderColor: "white",
                    "&:hover": { borderColor: "#fdc200", color: "#fdc200" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Go to Cart
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default AddToCartOrderForm;
