import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ViewAllcart from "./ViewAllcart";
import Orderstatus from "./OrderStatus";
import { styled } from "@mui/system";
import { Person, Email } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Use environment variable for API base URL (set in .env file or AWS config)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://16.170.141.231:5000";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/user/Login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/api/auth/profileview`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error.response || error);
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch profile. Please try again."
        );
        if (error.response?.status === 401) {
          localStorage.removeItem("userToken"); // Clear invalid token
          navigate("/user/Login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const FullWidthSection = styled(Box)(({ theme }) => ({
    width: "100%",
    padding: theme.spacing(5, 0),
  }));

  return (
    <Container maxWidth={false}>
      <FullWidthSection>
        {loading ? (
          <Box sx={{ width: "100%", mb: 2 }}></Box>
        ) : user ? (
          <Card
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              p: { xs: 1 },
              mb: { xs: 2, sm: 5 },
              bgcolor: "transparent",
              background: "rgba(255, 255, 0, 0.15)",
              borderRadius: { xs: 3, sm: 20 },
              color: "white",
              border: "1px solid rgba(255, 215, 0, 0.4)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.22)",
              transition: "all 0.3s ease",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 1, sm: 3 },
                flexGrow: 1,
                width: "100%",
                textAlign: { xs: "left", sm: "left" },
                padding: { xs: "8px !important", sm: "16px !important" },
              }}
            >
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

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: 0.5,
                    color: "gold",
                    fontSize: { xs: "14px", sm: "18px" },
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Person
                    sx={{ color: "gold", fontSize: { xs: 16, sm: 20 } }}
                  />
                  {user.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "medium",
                    letterSpacing: 0.5,
                    color: "gold",
                    fontSize: { xs: "12px", sm: "16px" },
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
          </Card>
        ) : (
          <Typography sx={{ color: "#fff", textAlign: "center" }}>
            No profile data found.
          </Typography>
        )}

        <Orderstatus />

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
