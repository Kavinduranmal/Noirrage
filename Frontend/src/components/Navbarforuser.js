import React from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../images/logo.png";
import { useNavigate } from "react-router-dom"; // Import for navigation

const Navbar = ({ showNavBar }) => {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const navigate = useNavigate();

  const handleLogout = (userType) => {
    if (userType === "user") {
      localStorage.removeItem("userToken");
    }

    navigate("/user/Login"); // Redirect to home after logout
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/CustProductList", label: "Feed" },
    { path: "/ViewAllcart", label: "My Cart" },
    { path: "/Myorders", label: "My Orders" },
    { path: "/Profile", label: "My Profile" },
    { path: "/AboutUs", label: "About Us" },
    { path: "/ContactUs", label: "Contact US" },
  ];

  return (
    <Box
      sx={{
        position: "sticky",
        top: showNavBar ? 0 : "-100px",
        zIndex: 1100,
        background: "linear-gradient(90deg,rgb(46, 46, 46),rgb(37, 37, 37))",
        transition: "top 0.3s ease-in-out, background 0.5s ease-in-out",
        padding: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
      }}
    >
      {/* Logo */}
      <a href="/">
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: "75px", marginLeft: "20px" }}
          />
        </Box>
      </a>

      {/* Mobile Menu */}
      {isMobile ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center", // Center horizontally
            justifyContent: "center", // Center vertically
            gap: 2,
            width: "100%",
            height: "100vh", // Full viewport height
            position: "fixed",
            top: 0,
            left: 0,
            background: "linear-gradient(90deg,rgb(46, 46, 46),rgb(37, 37, 37))",
            zIndex: 1200,
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={{ textDecoration: "none", width: "100%", textAlign: "center" }}
            >
              {({ isActive }) => (
                <Typography
                  sx={{
                    fontSize: "1.2rem",
                    fontFamily: "'Raleway', sans-serif",
                    color: isActive ? "#FFEB3B" : "#FFF",
                    "&:hover": {
                      color: "#FFEB3B",
                      transform: "scale(1.05)",
                      transition: "transform 0.3s ease-in-out",
                    },
                    transition:
                      "color 0.3s ease-in-out, transform 0.3s ease-in-out",
                    padding: "8px 16px",
                  }}
                >
                  {link.label}
                </Typography>
              )}
            </NavLink>
          ))}
          <Button
            onClick={() => handleLogout("user")}
            sx={{
              fontSize: "1rem",
              fontWeight: "500",
              color: "white",
              "&:hover": {
                color: "red",
                transform: "scale(1.1)",
                transition:
                  "transform 0.2s ease-in-out, color 0.3s ease-in-out",
              },
              padding: "8px 16px",
            }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", textAlign: "center", gap: 8 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // Centers all nav links
              alignItems: "center",
              gap: 5,
              mr: 20,
              flexWrap: "wrap", // Ensures wrapping on small screens
            }}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <Typography
                    sx={{
                      fontSize: "1.2rem",
                      fontFamily: "'Raleway', sans-serif",
                      color: isActive ? "#FFEB3B" : "#FFF",
                      "&:hover": {
                        color: "#FFEB3B",
                        transform: "scale(1.1)",
                        transition: "transform 0.3s ease-in-out",
                      },
                      transition:
                        "color 0.3s ease-in-out, transform 0.3s ease-in-out",
                    }}
                  >
                    {link.label}
                  </Typography>
                )}
              </NavLink>
            ))}
          </Box>

          <Button
            onClick={() => handleLogout("user")}
            to="/"
            sx={{
              fontSize: "1rem",
              fontWeight: "500",
              color: "white",
              "&:hover": {
                color: "red",
                transform: "scale(1.1)",
                transition:
                  "transform 0.2s ease-in-out, color 0.3s ease-in-out",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;