import React from "react";
import { Box, Container, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Footer = () => {
  return (
    <Box sx={{   background: "linear-gradient(135deg, #1a1a1a 0%,rgb(34, 30, 30) 100%)", color: "#fff", py: 3, textAlign: "center" }}>
      <Container>
        <Typography variant="body2" sx={{ mb: 1 }}>
          © {new Date().getFullYear()} Norrage. All rights reserved.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
          <Link component={RouterLink} to="/terms" color="inherit" underline="hover">
            Terms & Conditions
          </Link>
          <Link component={RouterLink} to="/privacy" color="inherit" underline="hover">
            Privacy Policy
          </Link>
          <Link component={RouterLink} to="/refund" color="inherit" underline="hover">
            Refund Policy
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
