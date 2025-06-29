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

const CustomerDirectOrderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [shippingDetails, setShippingDetails] = useState({
    email: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    postalCode: "",
    contactNumber: "",
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem("userToken");
  const productId = location.state?.productId || null;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    window.payhere.onCompleted = function (orderId) {
      toast.success("Payment successful!");
      navigate("/payment-success");
    };

    window.payhere.onDismissed = function () {
      toast.warn("Payment was dismissed.");
      navigate("/payment-cancel");
    };

    window.payhere.onError = function (error) {
      toast.error("Payment Error: " + error);
    };
  }, []);

  const handlePayHerePayment = async () => {
    if (!window.payhere) {
      toast.error("PayHere script not loaded. Please refresh the page.");
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    const fullAddress = [
      shippingDetails.addressLine1,
      shippingDetails.addressLine2,
      shippingDetails.addressLine3,
      shippingDetails.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      // 1️⃣ Send intent to backend (no order creation yet!)
      const response = await axios.post(
        "https://noirrage.com/api/payhere/intend",
        {
          product: selectedProduct._id,
          quantity,
          size,
          color,
          totalPrice: selectedProduct.price * quantity,
          shippingDetails: {
            email: shippingDetails.email,
            addressLine1: shippingDetails.addressLine1,
            addressLine2: shippingDetails.addressLine2,
            addressLine3: shippingDetails.addressLine3,
            postalCode: shippingDetails.postalCode,
            contactNumber: shippingDetails.contactNumber,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const payment = response.data.payment;
      console.log("✅ Payment Object from Backend:", payment);

      // 2️⃣ Start PayHere payment
      window.payhere.startPayment(payment);
    } catch (error) {
      toast.error("Failed to initialize payment.");
      console.error("❌ Payment Intent Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to continue");
      navigate("/user/Login");
      return;
    }

    const fetchUserId = async () => {
      try {
        const response = await axios.get(
          "https://noirrage.com/api/auth/profileview",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserId(response.data._id);
      } catch (error) {
        toast.error("Failed to fetch user details");
        navigate("/user/Login");
      }
    };

    fetchUserId();

    if (productId) {
      fetchProduct();
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
      const { data } = await axios.get("https://noirrage.com/api/products");
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

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (!size || !color) {
        toast.error("Please select a size and color");
        return;
      }
      if (
        !shippingDetails.email ||
        !shippingDetails.addressLine1 ||
        !shippingDetails.contactNumber
      ) {
        toast.error("Please fill in all required shipping details");
        return;
      }
      setStep(2);
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    const fullAddress = [
      shippingDetails.addressLine1,
      shippingDetails.addressLine2,
      shippingDetails.addressLine3,
      shippingDetails.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    const orderData = {
      products: [
        {
          product: selectedProduct._id,
          quantity,
          size,
          color,
        },
      ],
      totalPrice: selectedProduct.price * quantity,
      shippingDetails: {
        email: shippingDetails.email,
        address: fullAddress,
        contactNumber: shippingDetails.contactNumber,
      },
    };

    try {
      const { data } = await axios.post(
        "https://noirrage.com/api/orders/create",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ FIX: Use correct path to order ID
      const orderId = data._id || data.order?._id;

      console.log("Created Order ID:", orderId);

      handlePayHerePayment(orderId); // ✅ Pass correct ID to PayHere
    } catch (error) {
      setPaymentError(
        error.response?.data?.message || "Failed to process order"
      );
      toast.error(error.response?.data?.message || "Failed to process order");
    } finally {
      setProcessing(false);
    }
  };

  //-------------------------------------------------------------------------------------------

  const handleCashOnDelivery = async () => {
    setProcessing(true);
    setPaymentError(null);

    const fullAddress = [
      shippingDetails.addressLine1,
      shippingDetails.addressLine2,
      shippingDetails.addressLine3,
      shippingDetails.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    const orderData = {
      products: [
        {
          product: selectedProduct._id,
          quantity,
          size,
          color,
        },
      ],
      totalPrice: selectedProduct.price * quantity,
      shippingDetails: {
        email: shippingDetails.email,
        address: fullAddress,
        contactNumber: shippingDetails.contactNumber,
      },
      paymentMethod: "COD", // optional, if your backend supports it
      isPaid: false, // mark unpaid
    };

    try {
      await axios.post("https://noirrage.com/api/orders/create", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order placed with Cash on Delivery!");
      navigate("/userorders");
    } catch (error) {
      setPaymentError(
        error.response?.data?.message || "Failed to process COD order"
      );
      toast.error(
        error.response?.data?.message || "Failed to process COD order"
      );
    } finally {
      setProcessing(false);
    }
  };

  //-------------------------------------------------------------------------------------------
  if (loading || !selectedProduct || !userId) {
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
    <Container maxWidth="lg" sx={{ mt: 3, mb: { xs: 10, md: 3 } }}>
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
                image={`https://noirrage.com${selectedProduct.images[selectedImageIndex]}`}
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
              {Array.isArray(selectedProduct?.images) &&
                selectedProduct.images.map((img, index) => (
                  <Button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      minWidth: 50,
                      height: 50,
                      backgroundImage: `url(https://noirrage.com${img})`,
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
              onSubmit={handleOrderSubmit}
              style={{ width: "100%", maxWidth: "600px" }}
            >
              {step === 1 && (
                <>
                  <Typography
                    variant="h4"
                    color="#fdc200"
                    sx={{
                      mb: 2,
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
                        {Array.isArray(availableColors) &&
                          availableColors.map((colorOption, index) => (
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

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
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
                        onChange={handleSizeChange}
                        sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                      >
                        {Array.isArray(availableSizes) &&
                          availableSizes.map((sizeOption, index) => (
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

                  <Typography
                    color="#d7d7d7"
                    variant="h5"
                    gutterBottom
                    sx={{ textAlign: { xs: "center", md: "left" } }}
                  >
                    Shipping Details
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {[
                      {
                        id: "addressLine1",
                        label: "Address Line 1",
                        required: true,
                      },
                      {
                        id: "addressLine2",
                        label: "Address Line 2 (Optional)",
                      },
                      { id: "addressLine3", label: "City" },
                      {
                        id: "postalCode",
                        label: "Postal Code",
                        required: false,
                        type: "number",
                      },
                      {
                        id: "email",
                        label: "Email",
                        required: true,
                        type: "email",
                      },
                      {
                        id: "contactNumber",
                        label: "Contact Number",
                        required: true,
                        type: "tel",
                        inputProps: {
                          minLength: 10,
                          maxLength: 10,
                          pattern: "[0-9]*",
                        },
                      },
                    ].map((field) => (
                      <TextField
                        key={field.id}
                        label={field.label}
                        fullWidth
                        type={field.type || "text"}
                        value={shippingDetails[field.id] || ""}
                        onChange={(e) =>
                          setShippingDetails({
                            ...shippingDetails,
                            [field.id]: e.target.value,
                          })
                        }
                        required={field.required}
                        inputProps={field.inputProps}
                        sx={{
                          "& input": { color: "white" },
                          "& label": { color: "gray" },
                          "& label.Mui-focused": { color: "gold" },
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "gray" },
                            "&:hover fieldset": { borderColor: "white" },
                            "&.Mui-focused fieldset": {
                              borderColor: "gold",
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      bgcolor: "black",
                      color: "gold",
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "black", color: "gray" },
                      width: { xs: "100%", sm: "auto" },
                    }}
                    type="submit"
                  >
                    Next
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Typography
                    variant="h4"
                    color="#fdc200"
                    sx={{
                      mb: 2,
                      fontFamily: "'Raleway', sans-serif",
                      textAlign: { xs: "center", md: "left" },
                    }}
                  >
                    Confirm Your Order
                  </Typography>

                  <Box
                    sx={{
                      flex: 1,
                      background:
                        "linear-gradient(90deg, #232526,rgb(51, 55, 58))",
                      borderRadius: 2,
                      mb: 2,
                      p: 3,
                      color: "white",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#fdc200",
                        fontWeight: 600,
                        fontFamily: "'Raleway', sans-serif",
                        mb: 2,
                      }}
                    >
                      Order Summary
                    </Typography>

                    <Typography sx={{ mb: 1 }}>
                      {selectedProduct.name} - {quantity} x Rs{" "}
                      {selectedProduct.price.toFixed(2)}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>Size: {size}</Typography>
                    <Typography sx={{ mb: 1 }}>Color: {color}</Typography>
                    <Typography sx={{ mb: 1 }}>
                      Shipping to:{" "}
                      {[
                        shippingDetails.addressLine1,
                        shippingDetails.addressLine2,
                        shippingDetails.addressLine3,
                        shippingDetails.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      Email: {shippingDetails.email}
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      Contact: {shippingDetails.contactNumber}
                    </Typography>

                    {/* Pricing Breakdown */}
                    <Typography sx={{ fontWeight: 500 }}>
                      Item Total: Rs{" "}
                      {(selectedProduct.price * quantity).toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      Delivery Fee: Rs 475.00
                    </Typography>
                    <Typography
                      sx={{
                        mt: 5,
                        fontSize: "1.2rem",

                        color: "#fdc200",
                      }}
                    >
                      Total Price: Rs{" "}
                      {(selectedProduct.price * quantity + 475).toFixed(2)}
                    </Typography>
                    <Box
                      sx={{
                        mt: 4.5,
                        display: "flex",
                        gap: 2,
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => setStep(1)}
                        sx={{
                          bgcolor: "black",
                          color: "white",
                          borderColor: "black",

                          "&:hover": {
                            bgcolor: "black",
                            color: "gray",
                            borderColor: "black",
                          },
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        Back
                      </Button>

                      <Button
                        variant="contained"
                        onClick={handlePayHerePayment}
                        disabled={processing}
                        sx={{
                          bgcolor: "#fdc200",
                          color: "black",
                          fontWeight: "bold",
                          "&:hover": { bgcolor: "#e0a800" },
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        Pay with Card
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={handleCashOnDelivery}
                        disabled={processing}
                        sx={{
                          bgcolor: "black",
                          color: "white",

                          borderColor: "black",
                          "&:hover": {
                            bgcolor: "gold",
                            borderColor: "black",
                            color: "black",
                            fontWeight: "bold",
                          },
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        Cash on Delivery
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </form>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default CustomerDirectOrderForm;
