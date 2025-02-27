import React, { useState } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  CardMedia,
  CardActions,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Collapse,
  InputLabel,
  Card,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";

const AddProduct = () => {
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [imageSectionOpen, setImageSectionOpen] = useState(true); // Control for collapsible image section

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    images: [], // Ensure this is always an array
    imagePreview: null,
    sizes: [],
    colors: [],
  });

  const admintoken = localStorage.getItem("adminToken");
  const navigate = useNavigate();
  const categories = ["Men", "Women", "Kids"];

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    setProductData((prevData) => ({
      ...prevData,
      images: [...(prevData.images || []), ...files], // Ensure it's always an array
    }));
  };

  const handleRemoveImage = (index) => {
    setProductData((prevData) => ({
      ...prevData,
      images: prevData.images
        ? prevData.images.filter((_, i) => i !== index)
        : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!admintoken) {
      console.error("No admin token found");
      navigate("/");
      return;
    }

    const formData = new FormData();
    formData.append("name", productData.name); // ✅ Changed from "title" to "name"
    formData.append("description", productData.description);
    formData.append("price", Number(productData.price)); // ✅ Ensure price is a number
    formData.append("category", productData.category);

    // ✅ Append sizes and colors properly
    productData.sizes.forEach((size) => formData.append("sizes", size));
    productData.colors.forEach((color) => formData.append("colors", color));

    // ✅ Append images correctly
    productData.images.forEach((image) => {
      formData.append("images", image);
    });

    // ✅ Debugging (Check what is being sent)
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/products/add",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      window.location.reload();
      toast.success("Product added successfully!");
      console.log("Product added:", response.data);
    } catch (error) {
      toast.error("Product error");
      console.log(error);
    }
  };

  const addSize = () => {
    if (sizeInput && !productData.sizes.includes(sizeInput)) {
      setProductData({
        ...productData,
        sizes: [...productData.sizes, sizeInput],
      });
      setSizeInput("");
    }
  };

  const addColor = () => {
    if (colorInput && !productData.colors.includes(colorInput)) {
      setProductData({
        ...productData,
        colors: [...productData.colors, colorInput],
      });
      setColorInput("");
    }
  };
  // Function to handle color removal
  const removeColor = (colorToRemove) => {
    setProductData({
      ...productData,
      colors: productData.colors.filter((color) => color !== colorToRemove),
    });
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",

          padding: 3,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1200,
            border: "1px solid rgb(104, 104, 104)",
            boxShadow: "0px 12px 20px rgba(0, 0, 0, 0.88)",
            borderRadius: 2,
            background: "linear-gradient(90deg, #232526, #414345)",
            padding: 4,
          }}
        >
          <Typography variant="h4" color="gold" align="center" gutterBottom>
            Add Product
          </Typography>
          <Grid container spacing={4}>
            {/* Left side: Form to add product details */}
            <Grid item xs={12} sm={8}>
              <TextField
                label="Name"
                fullWidth
                name="name"
                value={productData.name}
                onChange={handleChange}
                required
                sx={{
                  marginBottom: 2,
                  "& label": { color: "gray" }, // Default label color
                  "& label.Mui-focused": { color: "white" }, // Focused label color
                  "& input": { color: "white" }, // User-typed text color
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ffd9008f" }, // Default border color
                  },
                }}
              />
              <TextField
                label="Price"
                fullWidth
                type="number"
                name="price"
                value={productData.price}
                onChange={handleChange}
                required
                sx={{
                  marginBottom: 2,
                  "& label": { color: "gray" }, // Default label color
                  "& label.Mui-focused": { color: "white" }, // Focused label color
                  "& input": { color: "white" }, // User-typed text color
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ffd9008f" }, // Default border color
                  },
                }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                name="description"
                value={productData.description}
                onChange={handleChange}
                required
                sx={{
                  marginBottom: 2,
                  "& label": { color: "gray" }, // Default label color
                  "& label.Mui-focused": { color: "white" }, // Focused label color
                  "& input": { color: "white" }, // User-typed text color
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ffd9008f" }, // Default border color
                  },
                }}
              />
              <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel sx={{ color: "gray" }}>Category</InputLabel>
                <Select
                  name="category"
                  value={productData.category}
                  onChange={handleChange}
                  required
                  sx={{
                    color: "white", // Selected text color
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ffd9008f",
                    }, // Border color
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    }, // Focused border color
                  }}
                >
                  <MenuItem value="Men">Men</MenuItem>
                  <MenuItem value="Women">Women</MenuItem>
                  <MenuItem value="Kids">Kids</MenuItem>
                </Select>
              </FormControl>

              {/* Sizes Input */}
              <TextField
                label="Add Size"
                fullWidth
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSize()}
                sx={{
                  marginBottom: 2,
                  "& label": { color: "gray" }, // Default label color
                  "& label.Mui-focused": { color: "white" }, // Focused label color
                  "& input": { color: "white" }, // User-typed text color
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ffd9008f" }, // Default border color
                  },
                }}
              />
              <Button
                onClick={addSize}
                sx={{
                  bgcolor: "black",
                  color: "white",
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "gray", color: "black" },
                  marginBottom: 2,
                  "& label": { color: "gray" }, // Default label color
                  "& label.Mui-focused": { color: "white" }, // Focused label color
                  "& input": { color: "white" }, // User-typed text color
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ffd9008f" }, // Default border color
                  },
                }}
                variant="contained"
                color="primary"
              >
                Add Size
              </Button>
              <Box sx={{ marginBottom: 2 }}>
                {productData.sizes.map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "gray",
                      p: 2,
                      color: "black",
                      margin: 0.5,
                    }}
                  />
                ))}
              </Box>

              {/* Colors Input */}
              <TextField
                label="Add Color"
                fullWidth
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addColor()}
                sx={{
                  marginBottom: 2,
                  "& label": { color: "gray" }, // Default label color
                  "& label.Mui-focused": { color: "white" }, // Focused label color
                  "& input": { color: "white" }, // User-typed text color
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ffd9008f" }, // Default border color
                  },
                }}
              />

              <Button
                onClick={addColor}
                variant="contained"
                sx={{
                  marginBottom: 2,
                  bgcolor: "black",
                  color: "white",
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "gray", color: "black" },
                }}
              >
                Add Color
              </Button>
              <Box sx={{ marginBottom: 2 }}>
                {productData.colors.map((color) => (
                  <Chip
                    key={color}
                    label={color}
                    sx={{
                      fontWeight: "bold",
                      fontSize: 15,
                      backgroundColor: color, // Apply the color entered by the user as background
                      p: 1,
                      border: "1px solid rgba(255, 217, 0, 0.32)",
                      color: "black",
                      margin: 0.5,
                      position: "relative", // To position the close icon
                    }}
                    // Adding the delete icon
                    deleteIcon={
                      <DeleteIcon sx={{ color: "white", fontSize: 18 }} />
                    }
                    onDelete={() => removeColor(color)} // Calling the remove function
                  />
                ))}
              </Box>
            </Grid>

            {/* Right side: Image Upload Section */}
            <Grid item xs={12} sm={4}>
              {/* Toggle Image Section */}
              <Box
                sx={{
                  position: "relative",
                  background: "#1E1E1E",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: 3,
                }}
              >
                <IconButton
                  onClick={() => setImageSectionOpen(!imageSectionOpen)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "white",
                  }}
                >
                  {imageSectionOpen ? <CloseIcon /> : <AddPhotoAlternateIcon />}
                </IconButton>

                <Collapse in={imageSectionOpen}>
                  <Typography variant="h6" color="white" gutterBottom>
                    Product Images
                  </Typography>

                  {/* Image Previews */}
                  {productData.images.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {productData.images.map((image, index) => (
                        <Card
                          key={index}
                          sx={{
                            width: 140,
                            borderRadius: 2,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="140"
                            image={URL.createObjectURL(image)}
                            alt="Preview"
                            sx={{ objectFit: "cover" }}
                          />
                          <CardActions
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "rgba(0,0,0,0.6)",
                              borderRadius: "50%",
                            }}
                          >
                            <IconButton
                              onClick={() => handleRemoveImage(index)}
                              sx={{
                                color: "white",
                                "&:hover": {
                                  background: "rgba(255, 0, 0, 0.5)",
                                },
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      ))}
                    </Box>
                  )}

                  {/* File Input */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<AddPhotoAlternateIcon />}
                      sx={{
                        backgroundColor: "#2196F3",
                        color: "white",
                        "&:hover": { backgroundColor: "#1976D2" },
                      }}
                    >
                      Upload Images
                      <input
                        accept="image/png, image/jpeg, image/jpg"
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                  </Box>
                </Collapse>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ marginTop: 3 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "black",
                color: "white",
                fontWeight: "bold",
                "&:hover": { bgcolor: "gold", color: "black" },
              }}
              onClick={handleSubmit}
            >
              Add Product
            </Button>
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default AddProduct;
