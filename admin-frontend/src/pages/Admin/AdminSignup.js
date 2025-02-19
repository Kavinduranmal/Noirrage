import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import { toast } from "react-toastify"; // Import Toast
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  FcAdvertising,
  FcBusinessman,
  FcCellPhone,
  FcLock,
  FcUnlock,
} from "react-icons/fc";

const Signup = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://13.60.91.24:5000/api/auth/admin/register",
        admin
      );
      console.log(data);
      toast.success("Signup successful! ");
      setTimeout(() => navigate("/"), 700);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed! Try again."); // Show error message
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Admin Signup
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FcBusinessman style={{ fontSize: "25px" }} />
                </InputAdornment>
              ),
            }}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FcAdvertising style={{ fontSize: "25px" }} />
                </InputAdornment>
              ),
            }}
            onChange={handleChange}
          />
          <TextField
            label="Phone"
            name="phone"
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FcCellPhone style={{ fontSize: "25px" }} />
                </InputAdornment>
              ),
            }}
            onChange={handleChange}
          />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"} // Fix for password visibility toggle
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <FcUnlock /> : <FcLock />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
            margin="normal"
            required
            onChange={handleChange}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
          >
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Signup;
