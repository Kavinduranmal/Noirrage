import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CardMedia,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import { ShoppingCart, AttachMoney, TrendingUp } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("adminToken"); // Fetch token

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const emailMatch = order.shippingDetails.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const priceMatch = order.totalPrice
      .toString()
      .includes(searchTerm.toLowerCase());

    return order.status === "Shipped" && (emailMatch || priceMatch);
  });

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/admin/login"); // Redirect to admin login if no token
      return;
    }
    try {
      const { data } = await axios.get("http://localhost:5000/api/orders/all", {
        headers: { Authorization: `Bearer ${token}` }, // Add token here
      });
      setOrders(data || []); // Ensure empty array if no data
      console.log("Fetched Orders:", data); // Debug log
    } catch (error) {
      console.error(
        "Error fetching orders:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to fetch orders");
    }
  };

  const markAsShipped = async (orderId) => {
    const token = localStorage.getItem("adminToken"); // Fetch token
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/ship`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is in Authorization header
          },
        }
      );
      fetchOrders();
      toast.success("Marked");
    } catch (error) {
      console.error(
        "Error updating order:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const [monthlySales, setMonthlySales] = useState([]);

  useEffect(() => {
    const salesData = Array(12).fill(0);
    orders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      salesData[month] += order.totalPrice;
    });
    setMonthlySales(
      salesData.map((total, index) => ({
        month: new Date(2025, index).toLocaleString("default", {
          month: "short",
        }),
        total,
      }))
    );
  }, [orders]);

  const totalOrders = orders.length;
  const totalSales = orders.filter(
    (order) => order.status === "Shipped"
  ).length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  // State to keep track of image index for each product (0: default, 1: hover)
  const [productImageState, setProductImageState] = useState({});

  const handleImageHover = (productId, hover) => {
    setProductImageState((prevState) => ({
      ...prevState,
      [productId]: hover ? 1 : 0, // 1 for hover image, 0 for default image
    }));
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        color: "#fff",
        padding: 3,
        borderRadius: 2,
      }}
    >
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              p: 2,
              border: "1px solid rgb(246, 193, 0)",
              bgcolor: "rgba(244, 203, 0, 0.26)",
              boxShadow: "0px 4px 10px rgba(141, 113, 0, 0.76)",
              color: "#fff",

              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <CardContent>
              <ShoppingCart sx={{ fontSize: 40, opacity: 0.8, mb: 2 }} />
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                Total Orders
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              p: 2,
              border: "1px solid rgb(0, 37, 244)",
              bgcolor: "rgba(0, 37, 244, 0.26)",
              color: "#fff",
              boxShadow: "0px 4px 10px rgba(0, 33, 141, 0.76)",
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <CardContent>
              <AttachMoney sx={{ fontSize: 40, opacity: 0.8, mb: 2 }} />
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                Total Sales
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {totalSales}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              p: 2,
              border: "1px solid rgb(82, 246, 0)",
              bgcolor: "rgba(0, 244, 57, 0.26)",
              boxShadow: "0px 4px 10px rgba(14, 141, 0, 0.76)",
              color: "#fff",

              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <CardContent>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.8, mb: 2 }} />
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                Total Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                Rs :{totalRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Sales Graph */}

      <Paper
        sx={{
          mx: 15,
          my: 10,
          width: "80%",
          padding: 2,
          backgroundColor: "#1e1e1e",
          borderRadius: 2,
          border: "1px solid rgba(255, 217, 0, 0.32)",
          bgcolor: "rgba(51, 51, 51, 0.26)",
          boxShadow: "0px 4px 20px rgb(0, 0, 0)",
        }}
      >
        <Typography variant="h4" sx={{ ml: "40%", mb: 5, color: "gold" }}>
          Monthly Sales
        </Typography>
        <ResponsiveContainer width="95%" height={400}>
          <BarChart data={monthlySales}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.2)"
            />
            <XAxis dataKey="month" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#333",
                border: "none",
                color: "#fff",
                borderRadius: 5,
              }}
              cursor={{ fill: "rgba(255,255,255,0.1)" }}
            />
            <Bar
              dataKey="total"
              fill="url(#barGradient)"
              barSize={30}
              radius={[10, 10, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#42a5f5" />
                <stop offset="100%" stopColor="#1976d2" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </Paper>
      {/* Orders Table */}
      <Typography
        variant="h4"
        mt={6}
        mb={4}
        sx={{
          color: "gold",
          fontFamily: "'Raleway', sans-serif",
        }}
      >
        Pending Orders
      </Typography>
      {/* Search Bar */}

      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#1e1e1e", color: "#fff" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "gray" }}>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Product
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Customer Email
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Address
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Contact no
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Quantity
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Total Price
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .filter((order) => order.status === "Pending")
              .map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    {order.products.map((item) => (
                      <Box
                        key={item.product?._id}
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Card
                          sx={{
                            height: 150,
                            width: 150,
                            perspective: "1000px",
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={`http://localhost:5000${
                              item.product.images[
                                productImageState[item.product._id] || 0
                              ]
                            }`}
                            alt={item.product?.name}
                            sx={{
                              transition: "transform 1.2s ease",
                              transformStyle: "preserve-3d",
                              ":hover": { transform: "rotateY(180deg)" },
                            }}
                            onMouseEnter={() =>
                              handleImageHover(item.product._id, true)
                            }
                            onMouseLeave={() =>
                              handleImageHover(item.product._id, false)
                            }
                          />
                        </Card>
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {order.shippingDetails.email}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {order.shippingDetails.address}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {order.shippingDetails.contactNumber}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {order.products.map((item) => (
                      <Typography key={item.product._id} sx={{ color: "#fff" }}>
                        {item.product?.name}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {order.products.map((item) => (
                      <Typography key={item.product._id} sx={{ color: "#fff" }}>
                        {item.quantity}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    Rs: {order.totalPrice}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      sx={{
                        border: "1px solid rgba(254, 254, 254, 0.97)",
                        bgcolor: "black",
                        color: "lightgreen",
                        fontWeight: "bold",
                        ":hover": {
                          bgcolor: "lightgreen",
                          color: "green",
                          fontWeight: "bold",
                        },
                      }}
                      onClick={() => markAsShipped(order._id)}
                    >
                      Completed
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="h4"
        mt={6}
        mb={4}
        sx={{
          color: "gold",
          fontFamily: "'Raleway', sans-serif",
        }}
      >
        Completed Orders
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#1e1e1e", color: "#fff" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "gray" }}>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Product
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Customer Email
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Address
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Contact no
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Quantity
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", fontSize: "1.3rem" }}
              >
                Total Price
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .filter((order) => order.status === "Shipped")
              .map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    {order.products.map((item) => (
                      <Box
                        key={item.product?._id}
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Card
                          sx={{
                            height: 150,
                            width: 150,
                            perspective: "1000px",
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={`http://localhost:5000${
                              item.product.images[
                                productImageState[item.product._id] || 0
                              ]
                            }`}
                            alt={item.product?.name}
                            sx={{
                              transition: "transform 1.2s ease",
                              transformStyle: "preserve-3d",
                              ":hover": { transform: "rotateY(180deg)" },
                            }}
                            onMouseEnter={() =>
                              handleImageHover(item.product._id, true)
                            }
                            onMouseLeave={() =>
                              handleImageHover(item.product._id, false)
                            }
                          />
                        </Card>
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {order.shippingDetails.email}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {order.shippingDetails.address}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {order.shippingDetails.contactNumber}
                  </TableCell>
                  <TableCell>
                    {order.products.map((item) => (
                      <Typography
                        key={item.product._id}
                        sx={{ color: "#fff", mb: 1 }}
                      >
                        {item.product?.name}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {order.products.map((item) => (
                      <Typography
                        key={item.product._id}
                        sx={{ color: "#fff", mb: 1 }}
                      >
                        {item.quantity}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    Rs: {order.totalPrice.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminDashboard;
