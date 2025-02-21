import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  IconButton,
  CardMedia,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Add, Remove } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

const OrderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.state?.productId || null;
  const [step, setStep] = useState(1); // Track current step
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [shippingDetails, setShippingDetails] = useState({
    email: "",
    address: "",
    contactNumber: "",
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const token = localStorage.getItem("userToken"); // Get token from localStorage

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(
        "http://51.21.127.196:5000/api/products"
      );
      const selected = data.find((p) => p._id === productId);
      setSelectedProduct(selected);
      setAvailableColors(selected.colors || []);
      setAvailableSizes(selected.sizes || []);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      return;
    }

    // Prepare order data with multiple images
    const orderData = {
      products: [
        {
          product: selectedProduct?._id,
          quantity,
          size,
          color,
          images: selectedProduct?.images || [], // Include all images of the product
        },
      ],
      totalPrice: selectedProduct?.price * quantity,
      shippingDetails,
    };

    try {
      await axios.post("http://51.21.127.196:5000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order Placed Successfully!");
      navigate("/CustProductList"); // Redirect after order is placed
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order.");
    }
  };

  const cancel = () => {
    navigate("/CustProductList"); // Redirect to Home page
  };

  const handleNext = () => setStep(2); // Go to next step (Shipping Details)
  const handleBack = () => setStep(1); // Go to previous step (Product Selection)

  if (
    !selectedProduct ||
    !selectedProduct.images ||
    selectedProduct.images.length === 0
  ) {
    return <p>No images available</p>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mb:3,
        mt:3,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
           
            p: 3,
            position: 'relative',
            boxShadow: '0px 12px 20px rgba(0, 0, 0, 0.88)',
            borderRadius: 2,
            background: 'linear-gradient(90deg, #232526, #414345)',
          }}
        >
          {/* Close Button in Top-Right */}
          <IconButton
            onClick={cancel}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'red',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Flexbox for Top Image & Bottom Form */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 4,
            }}
          >
            {/* Top - Product Image */}
            <Box
              sx={{
                width: { xs: '100%', md: '35%' },
                textAlign: 'center',
              }}
            >
              <Card
                sx={{
                  boxShadow: '0px 12px 20px rgb(0, 0, 0)',
                  height: 500,
                  textAlign: 'center',
                  p: 2,
                }}
              >
                {/* Main Image Preview */}
                <CardMedia
                  component="img"
                  image={`http://51.21.127.196:5000${selectedProduct.images[selectedImageIndex]}`}
                  alt={selectedProduct.name}
                  sx={{ borderRadius: '10px', marginBottom: '10px' }}
                />
              </Card>

              {/* Image Selection Thumbnails */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  mt: 4,
                }}
              >
                {selectedProduct.images.map((img, index) => (
                  <Button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      minWidth: 50,
                      height: 50,
                      border: '1px solid black',
                      borderRadius: '3px',
                      backgroundImage: `url(http://51.21.127.196:5000${img})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border:
                        selectedImageIndex === index
                          ? '2px solid gold'
                          : '2px solid transparent',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Bottom - Order Form */}
            <Box
              sx={{
                width: { xs: '100%', md: '60%' },
                p: 3,
                borderRadius: 2,
              }}
            >
              <form onSubmit={handleOrderSubmit}>
                {/* Step 1: Product Details */}
                {step === 1 && selectedProduct && (
                  <>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: "'Raleway', sans-serif",
                        fontSize: '2em',
                      }}
                      color="#fdc200"
                      mb={5}
                    >
                      Fill Order Details of {selectedProduct.name}
                    </Typography>

                    <Box sx={{ color: 'lightgray', pb: 3, fontSize: '1.3rem' }}>
                      <Typography sx={{ fontSize: '1.7rem' }}>
                        Rs {selectedProduct.price}.00
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 4, md: 12 },
                      }}
                    >
                      {/* Quantity Selector */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Typography
                          color="white"
                          variant="subtitle1"
                          fontWeight="bold"
                        >
                          Quantity
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <IconButton
                            onClick={() =>
                              setQuantity((prev) => Math.max(prev - 1, 1))
                            }
                            sx={{
                              color: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '500px',
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
                              style: { color: 'white', textAlign: 'center' },
                            }}
                            sx={{ width: '50px' }}
                          />
                          <IconButton
                            onClick={() => setQuantity((prev) => prev + 1)}
                            sx={{
                              color: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '500px',
                            }}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Color Selector */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
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
                          onChange={(e) => setColor(e.target.value)}
                          aria-label="color selection"
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
                        >
                          {availableColors.map((color, index) => (
                            <ToggleButton
                              key={index}
                              value={color}
                              sx={{
                                backgroundColor: color.toLowerCase(),
                                color: 'white',
                                border: '1px solid black',
                                '&.Mui-selected': { border: '2px solid gold' },
                              }}
                            >
                              {color}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      </Box>

                      {/* Size Selector */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
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
                          onChange={(e) => setSize(e.target.value)}
                          aria-label="size selection"
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
                        >
                          {availableSizes.map((sizeOption, index) => (
                            <ToggleButton
                              key={index}
                              value={sizeOption}
                              sx={{
                                color: 'black',
                                backgroundColor: '#c6c6c6',
                                border: '1px solid #ccc',
                                '&.Mui-selected': {
                                  backgroundColor: 'black',
                                  color: 'white',
                                },
                              }}
                            >
                              {sizeOption}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      </Box>
                    </Box>

                    {/* Shipping Details */}
                    <Typography
                      color="#d7d7d7"
                      mt={3}
                      variant="h5"
                      gutterBottom
                    >
                      Shipping Details
                    </Typography>
                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      margin="normal"
                      value={shippingDetails.email}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          email: e.target.value,
                        })
                      }
                      sx={{
                        '& label': { color: 'gray' }, // Default label color
                        '& label.Mui-focused': { color: 'white' }, // Focused label color
                        '& input': { color: 'white' }, // User-typed text color
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'gray' }, // Default border color
                        },
                      }}
                      required
                    />
                    <TextField
                      label="Address"
                      fullWidth
                      margin="normal"
                      value={shippingDetails.address}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          address: e.target.value,
                        })
                      }
                      sx={{
                        '& label': { color: 'gray' }, // Default label color
                        '& label.Mui-focused': { color: 'white' }, // Focused label color
                        '& input': { color: 'white' }, // User-typed text color
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'gray' }, // Default border color
                        },
                      }}
                      required
                    />
                    <TextField
                      label="Contact Number"
                      fullWidth
                      margin="normal"
                      value={shippingDetails.contactNumber}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          contactNumber: e.target.value,
                        })
                      }
                      sx={{
                        '& label': { color: 'gray' }, // Default label color
                        '& label.Mui-focused': { color: 'white' }, // Focused label color
                        '& input': { color: 'white' }, // User-typed text color
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'gray' }, // Default border color
                        },
                      }}
                      required
                    />

                    {/* Next Button */}
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        right: '0',
                        bottom: '0',
                        px: 5,
                        mr: 6,
                        mb: 1,
                        bgcolor: 'black',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': { color: 'black', bgcolor: 'gold' },
                      }}
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  </>
                )}

                <Typography color="#d7d7d7" mt={3} variant="h5" gutterBottom>
                  Shipping Details
                </Typography>
                {step === 2 && (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ mt: 2 }}
                      onClick={handleBack}
                      fullWidth
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        mt: 2,
                        background:
                          'linear-gradient(90deg, #FFD200, #F7971E, #FFD200)',
                      }}
                      type="submit"
                      fullWidth
                    >
                      Order Now
                    </Button>
                  </>
                )}
              </form>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default OrderForm;
