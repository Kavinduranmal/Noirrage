import React, { useEffect, useState } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import PhoneIcon from "@mui/icons-material/Phone";

import ContactMailIcon from "@mui/icons-material/ContactMail";
import Typography from "@mui/material/Typography"; // For desktop text
import logo from "../images/logo.png"; // Adjust import path
import { Store } from "@mui/icons-material";
const Navbar = () => {
  const [showNavBar, setShowNavBar] = useState(true);
  const [mobileNavValue, setMobileNavValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Scroll-based Navbar logic for desktop
  useEffect(() => {
    let prevScrollPos = window.pageYOffset;
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setShowNavBar(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      prevScrollPos = currentScrollPos;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/user/Login");
  };

  // Navigation links for desktop and mobile
  const desktopNavLinks = [
    { path: "/", label: "Home" },
    { path: "/CustProductList", label: "Store" },
    { path: "/ViewAllcart", label: "My Cart" },
    { path: "/userorders", label: "My Orders" },
    { path: "/Profile", label: "My Profile" },
    { path: "/AboutUs", label: "About Us" },
    { path: "/ContactUs", label: "Contact Us" },
  ];

  const mobileNavLinks = [
    { path: "/", label: <span style={{ fontSize: "10px" }}>Home</span>, icon: <HomeIcon /> },
    { path: "/CustProductList", label: <span style={{ fontSize: "10px" }}>Store</span>, icon: <Store /> },
    { path: "/ViewAllcart", label: <span style={{ fontSize: "10px" }}>My Cart</span>, icon: <ShoppingCartIcon /> },
    { path: "/userorders", label: <span style={{ fontSize: "10px" }}>My Orders</span>, icon: <ListAltIcon /> },
    { path: "/Profile", label: <span style={{ fontSize: "10px" }}>My Profile</span>, icon: <PersonIcon /> },
  ];
  

  return (
    <>
      {/* Top Navbar (Desktop and Mobile) */}
      <Box
        sx={{
          position: "sticky",
          top: showNavBar ? 0 : "-100px",
          zIndex: 1100,
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          transition: "top 0.3s ease-in-out",
          px: { xs: 1, sm: 2 },
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <NavLink to="/" style={{ textDecoration: "none" }}>
            <img
              src={logo}
              alt="Logo"
              style={{ height: "60px", marginLeft: "10px" }}
            />
          </NavLink>
        </Box>

        {/* Desktop Nav Links */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { sm: 2, md: 4 },
            }}
          >
            {desktopNavLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      fontFamily: "'Raleway', sans-serif",
                      fontWeight: 500,
                      color: isActive ? "#FFEB3B" : "#fff",
                      px: 1,
                      py: 0.5,
                      borderRadius: "6px",
                      "&:hover": {
                        color: "#FFEB3B",
                        
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {link.label}
                  </Typography>
                )}
              </NavLink>
            ))}
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "#fff",
                ml: 30,
                "&:hover": {
                  color: "red",
                  backgroundColor: "rgba(255, 0, 0, 0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        )}

        {/* Mobile Top Actions (Contact Us and Logout) */}
        {isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              component={NavLink}
              to="/ContactUs"
              sx={{
                color: "#fff",
                "&:hover": {
                  color: "#FFEB3B",
                  backgroundColor: "rgba(255, 235, 59, 0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <PhoneIcon />
            </IconButton>
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "#fff",
                "&:hover": {
                  color: "red",
                  backgroundColor: "rgba(255, 0, 0, 0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <BottomNavigation
            value={mobileNavValue}
            onChange={(event, newValue) => {
              setMobileNavValue(newValue);
              navigate(mobileNavLinks[newValue].path); // Navigate to selected path
            }}
            showLabels
            sx={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              height: "60px",
              
            }}
          >
            {mobileNavLinks.map((link) => (
              <BottomNavigationAction
                key={link.path}
                label={link.label}
                icon={link.icon}
                sx={{
                  color: "#fff",
                  "&.Mui-selected": {
                    color: "#FFEB3B",
                  },
                  "&:hover": {
                    color: "#FFEB3B",
                    backgroundColor: "rgba(255, 235, 59, 0.1)",
                  },
                  transition: "all 0.3s ease",
                  "& .MuiBottomNavigationAction-label": {
                    fontSize: "0.9rem",
                    fontFamily: "'Raleway', sans-serif",
                    fontWeight: 500,
                    mt: 0.5,
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </Box>
      )}
    </>
  );
};

export default Navbar;