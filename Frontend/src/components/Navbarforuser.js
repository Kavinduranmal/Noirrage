import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import logo from "../images/logo.png"; // Adjust import path

const Navbar = () => {
  const [showNavBar, setShowNavBar] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Scroll-based Navbar logic
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

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/CustProductList", label: "Feed" },
    { path: "/ViewAllcart", label: "My Cart" },
    { path: "/userorders", label: "My Orders" },
    { path: "/Profile", label: "My Profile" },
    { path: "/AboutUs", label: "About Us" },
    { path: "/ContactUs", label: "Contact Us" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  // Drawer content for mobile
  const drawerContent = (
    <Box
      sx={{
        width: 280,
        height: "100%",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Header with Logo and Close Button */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <img src={logo} alt="Logo" style={{ height: "50px" }} />
        <IconButton onClick={handleDrawerToggle} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation Links */}
      <List sx={{ flexGrow: 1, p: 2 }}>
        {navLinks.map((link) => (
          <ListItem
            button
            key={link.path}
            component={NavLink}
            to={link.path}
            onClick={handleDrawerToggle}
            sx={{
              py: 1.5,
              borderRadius: "8px",
              mb: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 235, 59, 0.1)",
                transform: "translateX(5px)",
                transition: "all 0.3s ease",
              },
              "&.active": {
                backgroundColor: "rgba(255, 235, 59, 0.2)",
                "& .MuiListItemText-primary": { color: "#FFEB3B" },
              },
              transition: "all 0.3s ease",
            }}
          >
            <ListItemText
              primary={link.label}
              primaryTypographyProps={{
                fontSize: "1.1rem",
                fontFamily: "'Raleway', sans-serif",
                fontWeight: 500,
                color: "#fff",
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <Button
          onClick={() => {
            handleLogout();
            handleDrawerToggle();
          }}
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#FFEB3B",
            color: "#1a1a1a",
            fontWeight: "bold",
            fontFamily: "'Raleway', sans-serif",
            borderRadius: "8px",
            py: 1.5,
            "&:hover": {
              bgcolor: "#FFD700",
              transform: "scale(1.02)",
              transition: "all 0.3s ease",
            },
            transition: "all 0.3s ease",
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
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
            {navLinks.map((link) => (
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
                        backgroundColor: "rgba(255, 235, 59, 0.1)",
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
            <Button
              onClick={handleLogout}
              sx={{
                fontSize: "1rem",
                fontWeight: "bold",
                fontFamily: "'Raleway', sans-serif",
                color: "#fff",
                ml: 25,
                px: 2,
                py: 1,
                borderRadius: "8px",
                "&:hover": {
                  color: "red",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Logout
            </Button>
          </Box>
        )}

        {/* Mobile Hamburger Icon */}
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: "#fff", ml: "auto" }}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        )}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            transition: "transform 0.3s ease-in-out",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
