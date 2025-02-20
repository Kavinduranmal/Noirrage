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
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";
import logo from "../../images/logo.png";

import axios from "axios";
import { toast } from "react-toastify"; // Import Toast
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  const [admin, setAdmin] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://51.21.127.196:5000/api/auth/admin/login",
        admin
      );

      localStorage.setItem("adminToken", data.token);
      if (data.admin && data.admin.email) {
        localStorage.setItem("adminEmail", data.admin.email); // Store email only if available
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      toast.success("Admin Logged In Successfully");
      navigate("/admin/AdminDashboard"); // Redirect to orders page
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        height: "100vh", // Full viewport height
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            p: 4,
            boxShadow: "0px 12px 20px rgba(0, 0, 0, 0.88)", // Slightly deeper shadow on hover
            borderRadius: 3,
            background: "linear-gradient(90deg, #232526, #414345)", // Smooth gradient
            textAlign: "center",
          }}
        >
          {/* 🔥 Logo Image */}
          <img
            src={logo}
            alt="Brand Logo"
            style={{ width: 150, marginBottom: 15 }}
          />
          <Typography
            variant="h4"
            sx={{ fontFamily: "'Raleway', sans-serif", fontSize: "2.5em" }}
            color="#fdc200"
            gutterBottom
          >
            Admin Login
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
                    <MdOutlineMail color="gray" size={25} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& label": { color: "gray" }, // Default label color
                "& label.Mui-focused": { color: "white" }, // Focused label color
                "& input": { color: "white" }, // User-typed text color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "gray" }, // Default border color
                },
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
                        <IoMdEyeOff color="gray" size={25} />
                      ) : (
                        <IoEye size={25} color="gray" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& label": { color: "gray" }, // Default label color
                "& label.Mui-focused": { color: "white" }, // Focused label color
                "& input": { color: "white" }, // User-typed text color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "gray" }, // Default border color
                },
              }}
              onChange={handleChange}
            />

            <Typography color="gray" sx={{ mt: 1 }}>
              Don't have an account?{" "}
              <Link
                to="/admin/signup"
                style={{
                  color: "#003cff",
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
                mt: 3,
                bgcolor: "black",
                color: "white",
                fontWeight: "bold",
                "&:hover": { bgcolor: "gray" },
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

export default AdminLogin;
