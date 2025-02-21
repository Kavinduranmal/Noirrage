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
    navigate("/user/Login");
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

  // Mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  // Drawer content for mobile with matching gradient and color
  const drawerContent = (
    <Box
      sx={{
        width: 210,
        height: "100%",
        background: "linear-gradient(90deg, rgb(46,46,46), rgb(37,37,37))",
        color: "#FFF",
      }}
      role="presentation"
      onClick={handleDrawerToggle}
      onKeyDown={handleDrawerToggle}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <img src={logo} alt="Logo" style={{ height: "50px" }} />
        <IconButton onClick={handleDrawerToggle} sx={{ color: "#FFF" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navLinks.map((link) => (
          <ListItem
            button
            key={link.path}
            component={NavLink}
            to={link.path}
            sx={{
              "&.active > .MuiListItemText-root > span": { color: "#FFEB3B" },
            }}
          >
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
        <ListItem button onClick={() => handleLogout("user")}>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: showNavBar ? 0 : "-100px",
          zIndex: 1100,
          background: "linear-gradient(90deg, rgb(46,46,46), rgb(37,37,37))",
          transition: "top 0.3s ease-in-out, background 0.5s ease-in-out",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <NavLink to="/" style={{ textDecoration: "none" }}>
            <img
              src={logo}
              alt="Logo"
              style={{ height: "60px", marginLeft: "20px" }}
            />
          </NavLink>
        </Box>

        {/* Desktop Nav Links */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
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
                        transform: "scale(1.05)",
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
            <Button
              onClick={() => handleLogout("user")}
              sx={{
                fontSize: "1rem",
                ml:30,
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

        {/* Mobile Hamburger Icon */}
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: "white", ml: "auto" }}
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
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
