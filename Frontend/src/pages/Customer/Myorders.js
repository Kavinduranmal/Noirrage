import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Modal,
  Divider,
  Box,
  TextField,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ViewAllcart from "./ViewAllcart";
import { styled } from "@mui/system";
import { Person, Email, Edit } from "@mui/icons-material";
import Orderstatus from "./OrderStatus";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null); // example state for cart data
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login")
      return;
    }

    // Create promises for all API requests
    const fetchProfile = axios.get(
      "http://51.21.127.196:5000/api/auth/profileview",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const fetchOrders = axios.get("http://51.21.127.196:5000/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fetchCart = axios.get("http://51.21.127.196:5000/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Execute all API calls concurrently
    Promise.all([fetchProfile, fetchOrders, fetchCart])
      .then(([profileRes, ordersRes, cartRes]) => {
        setUser(profileRes.data);
        setName(profileRes.data.name);
        setEmail(profileRes.data.email);
        setOrders(ordersRes.data);
        setCart(cartRes.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleUpdateProfile = async () => {
    try {
      const { data } = await axios.put(
        "http://51.21.127.196:5000/api/auth/profiledit",
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data);
      toast.success("Profile updated successfully!");
      handleClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  const FullWidthSection = styled(Box)({
    width: "100%",
    padding: "40px 0",
  });
  return (
    <Container maxWidth={false} sx={{ width: "100%", p: 0 }}>
      <FullWidthSection>
        {loading ? (
          <Box>
            {/* You can add a loading spinner or skeleton here */}
            <Typography>Loading...</Typography>
          </Box>
        ) : user ? (
          <Card
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" }, // Column for mobile, row for larger screens
              alignItems: { xs: "flex-start", sm: "center" }, // Align left on mobile, center on larger screens
              justifyContent: "space-between",
              px: 1.5,
              mb: 5,
              bgcolor: "rgba(163, 164, 74, 0.3)",
              borderRadius: 20,
              color: "black",
              border: "1px solid rgba(255, 215, 0, 0.2)",
              width: "100%",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" }, // Column for mobile, row for larger screens
                alignItems: { xs: "flex-start", sm: "center" }, // Align left on mobile, center on larger screens
                gap: { xs: 1, sm: 3 }, // Smaller gap on mobile
                flexGrow: 1,
                width: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  letterSpacing: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Person sx={{ ml: 1, color: "black" }} /> {user.name}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  letterSpacing: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Email sx={{ ml: { xs: 0, sm: 5 }, color: "black" }} />{" "}
                {user.email}
              </Typography>
            </CardContent>

            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{
                height: "45px",
                minWidth: "130px",
                bgcolor: "gold",
                color: "black",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 50,
                "&:hover": {
                  bgcolor: "black",
                  color: "gold",
                },
                mt: { xs: 2, sm: 0 }, // Margin top on mobile
                mb: { xs: 2, sm: 0 }, // Margin bottom on mobile
                alignSelf: { xs: "center", sm: "auto" }, // Center button on mobile
              }}
            >
              <Edit /> Edit Profile
            </Button>
          </Card>
        ) : (
          <Typography></Typography>
        )}

        {/* Pass the fetched orders to the Orderstatus component if needed */}
        <Orderstatus orders={orders} />

        {/* Edit Profile Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              background: "linear-gradient(90deg, #232526, #232526)",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 400 }, // Responsive width
              "& label": { color: "gray" },
              "& label.Mui-focused": { color: "white" },
              "& input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
              },
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Edit Profile
            </Typography>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              onClick={handleUpdateProfile}
              sx={{
                bgcolor: "gold",
                color: "black",
                fontWeight: "bold",
                "&:hover": { bgcolor: "gray" },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Modal>
      </FullWidthSection>
    </Container>
  );
};

export default Profile;
