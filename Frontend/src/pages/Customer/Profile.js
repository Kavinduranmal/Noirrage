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
  Fade,
  LinearProgress,
  TextField,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ViewAllcart from "./ViewAllcart";
import { styled } from "@mui/system";
import { Person, Email, Edit } from "@mui/icons-material";
import Orderstatus from "./OrderStatus";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(2); // Track API requests

  const token = localStorage.getItem("userToken"); // Get token once

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          "http://51.21.127.196:5000/api/auth/profileview",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(data);
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
      } finally {
        setPendingRequests((prev) => prev - 1); // Reduce pending requests
      }
    };

    fetchProfile();
  }, [token]);

  // Set loading to false when all requests complete
  useEffect(() => {
    if (pendingRequests === 0) {
      setLoading(false);
    }
  }, [pendingRequests]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleUpdateProfile = async () => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      return;
    }

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
    width: "100%", // Ensures full width
    padding: "40px 0", // Adds spacing on top and bottom
  });
  return (
    <Container maxWidth={false} sx={{ width: "100%", p: 0 }}>
      <FullWidthSection>
        {loading ? (
          <Box></Box>
        ) : user ? (
          <Card
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.5,
              mb: 5,
              bgcolor: "rgba(163, 164, 74, 0.3)",
              borderRadius: 20,
              color: "black",

              border: "1px solid rgba(255, 215, 0, 0.2)",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                flexGrow: 1,
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
                <Email sx={{ ml: 5, color: "black" }} /> {user.email}
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
              }}
            >
              <Edit /> Edit Profile
            </Button>
          </Card>
        ) : (
          <Typography>No profile data found.</Typography>
        )}

        <Orderstatus />
        {/* Edit Profile Modal */}

        {/* Edit Profile Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              background: "linear-gradient(90deg, #232526, #232526)",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              "& label": { color: "gray" }, // Default label color
              "& label.Mui-focused": { color: "white" }, // Focused label color
              "& input": { color: "white" }, // User-typed text color
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" }, // Default border color
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

        <Divider
          sx={{
            border: "1px solid black",
            backgroundColor: "#FFD700",
            height: "0.8px",
            my: 2,
          }}
        />

        <ViewAllcart />
      </FullWidthSection>
    </Container>
  );
};

export default Profile;
