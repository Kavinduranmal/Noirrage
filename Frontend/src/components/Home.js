import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { styled } from "@mui/system";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CustProductList from "../../src/pages/Customer/CustProductList";

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  height: "80vh",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  color: "#fff",
  fontFamily: "'Raleway', sans-serif",
  padding: "0 20px",
  zIndex: 1,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "hsla(0, 0.00%, 0.00%, 0.39)",
    zIndex: -1,
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontSize: "3rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "2px",
  [theme.breakpoints.down("md")]: {
    fontSize: "2.5rem",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "2rem",
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 300,
  marginTop: "10px",
  maxWidth: "600px",
  [theme.breakpoints.down("md")]: {
    fontSize: "1.3rem",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.1rem",
  },
}));

const HeroButton = styled(Button)(({ theme }) => ({
  marginTop: "20px",
  padding: "12px 30px",
  fontSize: "1rem",
  fontWeight: 500,
  textTransform: "none",
  backgroundColor: "#ff6f61",
  color: "#fff",
  borderRadius: "8px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor: "#e65b50",
    transform: "scale(1.05)",
  },
}));

const FullWidthSection = styled(Box)({
  width: "100%",
  padding: "40px 0",
});

// Slideshow Settings
const settings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  pauseOnHover: true,
  fade: true,
};

// Array of 10 images for the slideshow
const images = [
  "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1509067917181-3ec8d8ef5170?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1298&q=80",
  "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1301&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
  "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1523194258983-4ef0203f0c47?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1561526116-e2460f4d40a9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xvdGhzfGVufDB8fDB8fHww",
];

const Home = () => {
  return (
    <div>
      {/* Hero Section with Slideshow */}
      <Box sx={{ position: "relative" }}>
        <Slider {...settings}>
          {images.map((image, index) => (
            <Box key={index}>
              <HeroSection
                sx={{
                  background: `url(${image}) center/cover no-repeat`,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: "'Raleway', sans-serif",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    display: "inline-block",
                    mx: "auto",
                  }}
                >
                  Noirrage
                </Typography>
                <HeroSubtitle
                  sx={{ fontFamily: "'Raleway', sans-serif" }}
                  variant="h6"
                >
                  Elevate your fashion with our exclusive collections
                </HeroSubtitle>
              </HeroSection>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Featured Products Section */}
      <FullWidthSection>
        <Typography
          variant="h4"
          textAlign="center"
          mb={4}
          sx={{
            fontFamily: "'Raleway', sans-serif",
          }}
        >
          Our Products
        </Typography>

        <CustProductList />
      </FullWidthSection>
    </div>
  );
};

export default Home;
