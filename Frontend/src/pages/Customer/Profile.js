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
   if (!token) {
         toast.error("Unauthorized! Please log in.");
         navigate("/user/Login")
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
        console.error("Error fetching profile:", error);
      } finally {
        setPendingRequests((prev) => prev - 1);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (pendingRequests === 0) {
      setLoading(false);
    }
  }, [pendingRequests]);

  const updateProfileLive = async (field, value) => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      return;
    }
    try {
      const { data } = await axios.put(
        "http://51.21.127.196:5000/api/auth/profiledit",
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data);
      toast.success("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

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
    <Container maxWidth={false} >
      <FullWidthSection>
        {loading ? (
          <Box>Loading...</Box>
        ) : user ? (
          <Card
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              p: { xs: 1, sm: 2 },
              mb: { xs: 3, sm: 5 },
              bgcolor: "rgba(163, 164, 74, 0.3)",
              borderRadius: 20,
              color: "black",
              border: "1px solid rgba(255, 215, 0, 0.2)",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: { xs: 2, sm: 3 },
                flexGrow: 1,
                width: "100%",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              <Typography
                variant={isMobile ? "body1" : "h6"}
                sx={{
                  fontWeight: "bold",
                  letterSpacing: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Person sx={{ color: "black" }} /> {user.name}
              </Typography>
              <Typography
                variant={isMobile ? "body1" : "h6"}
                sx={{
                  fontWeight: "bold",
                  letterSpacing: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Email sx={{ color: "black" }} /> {user.email}
              </Typography>
            </CardContent>
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{
                
                bgcolor: "gold",
                color: "black",
                fontWeight: "bold",
               
               
                borderRadius: "50px",
                mt: { xs: 2, sm: 0 },
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
