import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { IoEye, IoEyeOff } from "react-icons/io5"; // Correct import from io5
import { MdOutlineMail } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../images/logo.png";

const UserLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [admin, setAdmin] = useState({ email: "", password: "" });

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleChange = (e) =>
    setAdmin({ ...admin, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://13.49.246.175:3000/api/auth/user/login",
        admin
      );      
      localStorage.setItem("userToken", data.token);
      if (data.admin && data.admin.email) {
        localStorage.setItem("userEmail", data.admin.email);
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.9)",
            borderRadius: "5px",
            background: "linear-gradient(135deg,rgb(31, 34, 36),rgb(68, 72, 75))",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
        >
          <img
            src={logo}
            alt="Brand Logo"
            style={{ width: "120px", marginBottom: "20px" }}
          />

          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: { xs: "1.5rem", sm: "2.5rem" },
              color: "#fdc200",
              
              mb: 3,
            }}
          >
            Welcome Back
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MdOutlineMail color="#aaa" size={24} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& label": { color: "#aaa" },
                "& label.Mui-focused": { color: "#fdc200" },
                "& input": { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#888" },
                  "&.Mui-focused fieldset": { borderColor: "#fdc200" },
                  borderRadius: "8px",
                },
                mb: 2,
              }}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? (
                        <IoEyeOff color="#aaa" size={24} />
                      ) : (
                        <IoEye color="#aaa" size={24} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& label": { color: "#aaa" },
                "& label.Mui-focused": { color: "#fdc200" },
                "& input": { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#888" },
                  "&.Mui-focused fieldset": { borderColor: "#fdc200" },
                  borderRadius: "8px",
                },
                mb: 2,
              }}
              onChange={handleChange}
            />

            <Typography
              sx={{
                color: "#ccc",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                mb: 3,
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/user/signup"
                style={{
                  color: "#fdc200",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Sign Up
              </Link>
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                bgcolor: "black",
                color: "white",
                fontWeight: "bold",
                fontFamily: "'Raleway', sans-serif",
                borderRadius: "8px",
                py: 1,
               
                "&:hover": {
                  bgcolor: "gold",
                  color: "black",
                  transform: "scale(1.02)",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.7)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Login
            </Button>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default UserLogin;