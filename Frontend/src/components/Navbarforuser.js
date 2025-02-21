import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../images/logo.png"; // Adjust import path

const Navbar = () => {
  const [showNavBar, setShowNavBar] = useState(true);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const navigate = useNavigate();

  // Scroll-based Nav Logic
  useEffect(() => {
    let prevScrollPos = window.pageYOffset;

    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      // If user scrolls up, show; scrolls down, hide
      if (prevScrollPos > currentScrollPos) {
        setShowNavBar(true);
      } else {
        setShowNavBar(false);
      }
      prevScrollPos = currentScrollPos;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = (userType) => {
    if (userType === "user") {
      localStorage.removeItem("userToken");
    }
    navigate("/user/Login"); // Redirect after logout
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/CustProductList", label: "Feed" },
    { path: "/ViewAllcart", label: "My Cart" },
    { path: "/Myorders", label: "My Orders" },
    { path: "/Profile", label: "My Profile" },
    { path: "/AboutUs", label: "About Us" },
    { path: "/ContactUs", label: "Contact Us" },
  ];

  return (
    <Box
      sx={{
        position: "sticky",
        top: showNavBar ? 0 : "-100px",
        zIndex: 1100,
        background: "linear-gradient(90deg, rgb(46, 46, 46), rgb(37, 37, 37))",
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
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            width: "100%",
            height: "100vh",
            position: "fixed",
            // Slide up logic:
            top: showNavBar ? 0 : "-100vh",
            left: 0,
            background: "linear-gradient(90deg, rgb(46, 46, 46), rgb(37, 37, 37))",
            zIndex: 1200,
            transition: "top 0.3s ease-in-out",
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={{
                textDecoration: "none",
                width: "100%",
                textAlign: "center",
              }}
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
                transition: "transform 0.2s ease-in-out, color 0.3s ease-in-out",
              },
              padding: "8px 16px",
            }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        // Desktop Menu
        <Box sx={{ display: "flex", textAlign: "center", gap: 8 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
              mr: 33,
              flexWrap: "wrap", // ensures wrapping on smaller desktops
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
            sx={{
              fontSize: "1rem",
              fontWeight: "500",
              color: "white",
              "&:hover": {
                color: "red",
                transform: "scale(1.1)",
                transition: "transform 0.2s ease-in-out, color 0.3s ease-in-out",
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
