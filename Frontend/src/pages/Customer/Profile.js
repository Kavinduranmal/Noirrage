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
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ViewAllcart from "./ViewAllcart";
import { styled } from "@mui/system";
import { Person, Email, Edit } from "@mui/icons-material";
import Orderstatus from "./OrderStatus";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(2);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    console.log("Token:", token); // Debug token
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          "http://51.21.127.196:5000/api/auth/profileview",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Fetched data:", data); // Debug API response
        setUser(data);
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        console.error("Error fetching profile:", error.response || error); // Log detailed error
        toast.error("Failed to fetch profile. Please try again.");
      } finally {
        setPendingRequests((prev) => prev - 1);
      }
    };

    fetchProfile();
  }, [token, navigate]); // Added navigate to deps (though unlikely to change)

  useEffect(() => {
    if (pendingRequests === 0) {
      setLoading(false);
    }
  }, [pendingRequests]);


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
      console.error("Error updating profile:", error.response || error);
      toast.error("Failed to update profile.");
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const FullWidthSection = styled(Box)(({ theme }) => ({
    width: "100%",
    padding: theme.spacing(5, 0),
  }));


  return (
    <Container maxWidth={false}>
      <FullWidthSection>
        {loading ? (
          <Box>Loading your profile...</Box>
        ) : user ? (
          <Card
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" }, // Column on mobile, row on desktop
              alignItems: "center",
              justifyContent: "space-between",
              p: { xs: 1, sm: 1 }, // Tighter padding on mobile
              mb: { xs: 2, sm: 5 }, // Slightly less margin on mobile
              bgcolor: "transparent", // Transparent base for gradient
              background: {
                xs:" rgba(255, 255, 0, 0.15)",
                sm: " rgba(255, 255, 0, 0.15)",
              },
              borderRadius: { xs: 3, sm: 20 }, // Softer corners on mobile
              color: "white", // White text for contrast
              border: "1px solid rgba(255, 215, 0, 0.4)", // Brighter gold border
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.22)", // Deeper shadow for pop
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: { sm: "0 6px 20px rgba(255, 215, 0, 0.3)" }, // Glow on desktop hover
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: { xs: "row", sm: "row" }, // Row on both, but mobile adjusts
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 1, sm: 3 }, // Tighter gap on mobile
                flexGrow: 1,
                width: "100%",
                textAlign: { xs: "left", sm: "left" }, // Left-align consistently
                padding: { xs: "8px !important", sm: "16px !important" }, // Override default padding
              }}
            >
              {/* Icon/Person Placeholder */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: { xs: 40, sm: 50 },
                  height: { xs: 40, sm: 50 },
                  bgcolor: "rgba(255, 215, 0, 0.2)",
                  borderRadius: "50%",
                  mr: { xs: 1, sm: 2 },
                }}
              >
                <Person sx={{ color: "gold", fontSize: { xs: 24, sm: 30 } }} />
              </Box>

              {/* Text Content */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: 0.5,
                    color: "gold",
                    fontSize: { xs: "14px", sm: "18px" }, // Smaller on mobile
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                ><Person sx={{ color: "gold", fontSize: { xs: 16, sm: 20 } }}/>
                  {user.name}
                </Typography>
                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  sx={{
                    fontWeight: "medium",
                    letterSpacing: 0.5,
                    color: "gold",
                    fontSize: { xs: "12px", sm: "16px" }, // Smaller on mobile
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: { xs: 0.5, sm: 0 },
                  }}
                >
                  <Email sx={{ color: "gold", fontSize: { xs: 16, sm: 20 } }} />
                  {user.email}
                </Typography>
              </Box>
            </CardContent>

            {/* Edit Button */}
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{
                bgcolor: "gold",
                color: "black",
                fontWeight: "bold",
                borderRadius: { xs: "25px", sm: "50px" }, // Slightly less round on mobile
                width: { xs: "90%", sm: "auto" }, // Full-width on mobile
                padding: { xs: "8px 16px", sm: "10px 20px" },
                m: { xs: 1, sm: 0 }, // Margin on mobile for separation
                boxShadow: "0 2px 10px rgba(255, 215, 0, 0.5)",
                "&:hover": {
                  bgcolor: "black",
                  color: "gold",
                  boxShadow: "0 4px 15px rgba(255, 215, 0, 0.7)",
                },
                "&:active": {
                  transform: "scale(0.98)", // Subtle press effect
                },
              }}
            >
              <Edit sx={{ mr: 1, fontSize: { xs: 16, sm: 20 } }} /> Edit Profile
            </Button>
          </Card>
        ) : (
          <Typography>No profile data found.</Typography>
        )}

        <Orderstatus />

        {/* Edit Profile Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              background: "linear-gradient(90deg, #232526, #414345)",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 400 },
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              "& label": { color: "gray" },
              "& label.Mui-focused": { color: "white" },
              "& input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
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
              variant="contained"
              sx={{
                width: "100%",
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
