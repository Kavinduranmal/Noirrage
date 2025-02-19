import React from "react";
import { Box, Container, Typography } from "@mui/material";

const AboutUs = () => {
  return (
    <Box
      sx={{
        bgcolor: "#0d0d0d",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
      }}
    >
      <Container maxWidth="md">
        {/* Brand Name */}
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{
            letterSpacing: "3px",
            textTransform: "uppercase",
            borderBottom: "3px solid #e0b252",
            display: "inline-block",
            mx: "auto",
            pb: 1,
          }}
        >
          Noirrage
        </Typography>

        {/* Tagline */}
        <Typography
          variant="h5"
          sx={{
            mt: 2,
            fontWeight: 300,
            opacity: 0.8,
          }}
        >
          Redefining Luxury, One Thread at a Time.
        </Typography>

        {/* Content */}
        <Typography
          variant="body1"
          sx={{
            mt: 4,
            fontSize: "18px",
            fontWeight: 300,
            lineHeight: 1.8,
            maxWidth: "800px",
            mx: "auto",
            opacity: 0.9,
          }}
        >
          Noirrage is where fashion meets exclusivity. Every piece is crafted with 
          precision, embracing elegance and modern sophistication. Our passion lies in 
          creating timeless designs that empower confidence and individuality.  
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mt: 3,
            fontSize: "18px",
            fontWeight: 300,
            lineHeight: 1.8,
            maxWidth: "800px",
            mx: "auto",
            opacity: 0.9,
          }}
        >
          We are committed to sustainability, ethical production, and innovative craftsmanship.  
          Noirrage is more than a brand; it's a statement—bold, refined, and unforgettable.
        </Typography>
      </Container>
    </Box>
  );
};

export default AboutUs;
