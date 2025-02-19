import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { keyframes } from "@emotion/react";

// Fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AboutUs = () => {
  return (
    <Box
      sx={{
        mt:-8,
       bgcolor:"rgba(0, 0, 0, 0.55)" ,
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
       
        overflow: "hidden",
      }}
    >
      <Container maxWidth="md">
        {/* Brand Name */}
        <Typography
          variant="h2"
         
          sx={{
            fontFamily: "'Raleway', sans-serif",
            letterSpacing: "3px",
            textTransform: "uppercase",
            borderBottom: "3px solid gold",
            display: "inline-block",
            mx: "auto",
            color: "gold",
            pb: 1,
            animation: `${fadeIn} 1s ease-in-out`,
          }}
        >
          Noirrage
        </Typography>

        {/* Tagline */}
        <Typography
          variant="h4"
          sx={{
            mt: 2,
            fontWeight: 300,
            fontFamily: "'Raleway', sans-serif",
            opacity: 0.8,
            animation: `${fadeIn} 1.2s ease-in-out`,
          }}
        >
          Redefining Luxury, One Thread at a Time.
        </Typography>

        {/* Content */}
        <Typography
          variant="h5"
          sx={{
            mt: 4,
            fontSize: "20px",
            fontWeight: 300,
            lineHeight: 1.8,
          
            fontFamily: "'Raleway', sans-serif",
            mx: "auto",
            opacity: 0.9,
            animation: `${fadeIn} 1.4s ease-in-out`,
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
            fontSize: "20px",
            fontWeight: 300,
            lineHeight: 1.8,
            fontFamily: "'Raleway', sans-serif",
          
            mx: "auto",
            opacity: 0.9,
            animation: `${fadeIn} 1.6s ease-in-out`,
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