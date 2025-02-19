import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../images/logo.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ExitToApp } from '@mui/icons-material';


const Navbar = ({ showNavBar }) => {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = (userType) => {
    if (userType === "admin") {
      localStorage.removeItem("adminToken");
    }

    navigate("/");
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navLinks = [
    { path: "/admin/AdminDashboard", label: "Dashboard" },
    { path: "/admin/ProductAdd", label: "Add a new Item" },
    { path: "/admin/ProductList", label: "Remove item" },
    // { path: "/admin/AdminDashboard", label: "My Mycart" },

    // { path: "/ViewAllcart", label: "My Mycart" },
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
      <a href="/admin/AdminDashboard">
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
        <>
          <IconButton onClick={toggleDrawer(true)} sx={{ color: "white" }}>
            <MenuIcon fontSize="large" />
          </IconButton>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            <List sx={{ width: 250 }}>
              {navLinks.map((link) => (
                <ListItem
                  button
                  key={link.path}
                  component={NavLink}
                  to={link.path}
                  onClick={toggleDrawer(false)}
                >
                  <ListItemText
                    primary={link.label}
                    sx={{ textAlign: "center" }}
                  />
                </ListItem>
              ))}
              <ListItem button onClick={() => handleLogout("user")}>
                <ListItemText
                  primary="Logout"
                  sx={{ textAlign: "center", color: "red" }}
                />
              </ListItem>
            </List>
          </Drawer>
        </>
      ) : (
        <Box sx={{ display: "flex", textAlign: "center", gap: 8 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // Centers all nav links
              alignItems: "center",
              gap: 8,
              mr: 39,
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
    color: "red",
    backgroundColor: "#c6c6c600",
    display: "flex",
    alignItems: "center",
    gap: 1, // Adds space between the icon and text
    "&:hover": {
      color: "#FFEB3B",
      transform: "scale(1.1)",
      transition: "transform 0.3s ease-in-out, color 0.3s ease-in-out",
    },
  }}
>
 
  Logout <ExitToApp sx={{ fontSize: 20 }} /> 
</Button>

        </Box>
      )}
    </Box>
  );
};

export default Navbar;
