import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CardMedia,
  Card,
  Button,
  Box,
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://13.50.4.1:5000/api/products");
      setProducts(response.data); // The response should contain the inStock status now
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://13.50.4.1:5000/api/products/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch {
      toast.error("Error deleting product");
    }
  };

  const markOutOfStock = async (id) => {
    try {
      // Optimistic update: set inStock to false locally
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, inStock: false } : product
        )
      );
  
      await axios.put(
        `http://13.50.4.1:5000/api/products/${id}/out-of-stock`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      toast.success("Product marked as out of stock");
      fetchProducts(); // Refresh product list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating product status");
    }
  };
  
  const markRestoreStock = async (id) => {
    try {
      // Optimistic update: set inStock to true locally
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, inStock: true } : product
        )
      );
  
      await axios.put(
        `http://13.50.4.1:5000/api/products/${id}/restored`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      toast.success("Product marked as in stock");
      fetchProducts(); // Refresh product list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating product status");
    }
  };
  

  const [productImageState, setProductImageState] = useState({});

  const handleImageHover = (productId, hover) => {
    setProductImageState((prevState) => ({
      ...prevState,
      [productId]: hover ? 1 : 0, // 1 for hover image, 0 for default image
    }));
  };

  return (
    <Box
      sx={{
        mx: 5,
        my: 5,
        borderRadius: "20px",
        padding: "40px",
        backgroundColor: "#121212",
        color: "#fff",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Product List
      </Typography>
      {loading && (
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress color="primary" />
        </Box>
      )}
      <TableContainer component={Paper} sx={{ backgroundColor: "#1E1E1E" }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                fontSize: "2rem",
                color: "black",
                backgroundColor: "gray",
              }}
            >
              <TableCell sx={{ fontSize: "1.3rem", textAlign: "center" }}>
                Image
              </TableCell>
              <TableCell sx={{ fontSize: "1.3rem", textAlign: "center" }}>
                Name
              </TableCell>
              <TableCell sx={{ fontSize: "1.3rem", textAlign: "center" }}>
                Price
              </TableCell>
              <TableCell sx={{ fontSize: "1.3rem", textAlign: "center" }}>
                Description
              </TableCell>
              <TableCell sx={{ fontSize: "1.3rem", textAlign: "center" }}>
                Action
              </TableCell>
              <TableCell sx={{ fontSize: "1.3rem", textAlign: "center" }}>
                Stock
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "#fff" }}>
                  No products available
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product._id}
                  sx={{
                    backgroundColor: "4d4d4dc9",
                    color: "#fff",
                  }}
                >
                  <TableCell>
                    <Card sx={{ maxWidth: 150, perspective: "1000px" }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={`http://13.50.4.1:5000${
                          product.images[productImageState[product._id] || 0]
                        }`} // Dynamic image index for each product
                        alt={product.name}
                        id={`image-${product._id}`}
                        sx={{
                          transition: "transform 1.2s ease", // Slow down the rotation effect (1 second)
                          transformStyle: "preserve-3d",
                          ":hover": {
                            transform: "rotateY(180deg)", // Rotate right to left
                          },
                        }}
                        onMouseEnter={() => handleImageHover(product._id, true)} // Hover image
                        onMouseLeave={() =>
                          handleImageHover(product._id, false)
                        } // Default image
                      />
                    </Card>
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.2rem", color: "#fff" }}>
                    {product.name}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.2rem", color: "#fff" }}>
                    ${product.price}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.2rem", color: "#fff" }}>
                    {product.description}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        marginLeft: 1,
                        bgcolor: "red",
                        color: "black",
                        fontWeight: "bold",
                        "&:hover": { bgcolor: "black", color: "white" },
                      }}
                      onClick={() => handleDelete(product._id)}
                    >
                      Remove <DeleteIcon />
                    </Button>
                  </TableCell>
                  <TableCell>
                  <Box sx={{ display: "flex", gap: 2 }}>
  <Button
    variant="contained"
    
    onClick={() => markOutOfStock(product._id)}
    sx={{
    
      backgroundColor: "black",
      color: "lightgreen",
      "&:hover": {color: "green", fontWeight: "bold", backgroundColor: "#333" },
      
    }}
    disabled={!product.inStock} // Enable only if product is in stock
  >Restored Stock
    
  </Button>
  <Button
    variant="contained"
    onClick={() => markRestoreStock(product._id)}
    sx={{
     
      backgroundColor: "black",
      color: "red",
      "&:hover": {color: "red", fontWeight: "bold", backgroundColor: "#333" },
    }}
    disabled={product.inStock} // Enable only if product is out of stock
  >
    Out of Stock
  </Button>
</Box>

                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProductList;
