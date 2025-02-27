import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  InputAdornment,
  Button,
  Container,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { FcCellPhone,} from "react-icons/fc";
import { Link } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import { FaUserAlt } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { useNavigate } from "react-router-dom"; // Import for navigation
import { toast } from "react-toastify"; // Import Toast
import logo from "../../images/logo.png";

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
        "http://localhost:5000/api/auth/admin/register",
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
          style={{ width: 140, marginBottom: 15 }}
        />

        <Typography
          variant="h5"
          sx={{ fontFamily: "'Raleway', sans-serif", fontSize: "2em" }}
          color="#fdc200"
          gutterBottom
        >
          Create an Account
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FaUserAlt size={20} color="gray" />
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
            label="Phone"
            name="phone"
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {/* <FcCellPhone style={{ fontSize: "25px" }} /> */}
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
            onCha
            onChange={handleChange}
          />
          <Typography color="gray" sx={{ mt: 1 }}>
            Already have an account?{" "}
            <Link
              to="/"
              style={{
                color: "#003cff",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Log in
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
            Sign Up
          </Button>
        </form>
      </Box>
    </Container></Box>
  );
};

export default Signup;

//.raleway { font-family: 'Raleway', sans-serif; }
