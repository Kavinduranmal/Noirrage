import React from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { styled } from "@mui/system";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import d1 from "./images/d1.jpg";
import d2 from "./images/d2.jpg";
import d3 from "./images/d3.jpg";
import d4 from "./images/d4.jpg";

import m1 from "./images/1.jpg";
import m2 from "./images/2.jpg";
import m3 from "./images/3.jpg";
import m4 from "./images/4.jpg";
import m5 from "./images/5.jpg";
import m6 from "./images/6.jpg";
import m7 from "./images/7.jpg";
import m8 from "./images/8.jpg";
import m9 from "./images/9.jpg";
import m10 from "./images/10.jpg";
import m11 from "./images/11.jpg";
import m12 from "./images/12.jpg";

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
const settings = {
  dots: true,
  infinite: true,
  speed: 1000,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  fade: true,              // 👈 fade style
  cssEase: "ease-in-out",  // 👈 smooth easing
  arrows: false,
};


const Home = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const desktopImages = [d1, d2, d3, d4];
  const mobileImages = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12];
  const imagesToUse = isMobile ? mobileImages : desktopImages;

  return (
    <div>
      {/* Slideshow */}
      <Box sx={{ position: "relative" }}>
        <Slider {...settings}>
          {imagesToUse.map((img, index) => (
            <HeroSection
              key={index}
              sx={{
                background: `url(${img}) center/cover no-repeat`,
              }}
            >
              <Box
                sx={{
                  mr: 2,
                  display: "flex",
                  justifyContent: "center", // center horizontally
                  alignItems: "center", // center vertically
                  height: "100%",
                  width: { xs:"90%" ,md: "100%" },
                  flexDirection: "column", // stack the texts vertically
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: "'Raleway', sans-serif",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    fontWeight: 400,
                    color: "#fff",
                  }}
                >
                  Noirrage
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "'Raleway', sans-serif",
                    mt: 1,
                    fontWeight: 300,
                    color: "#fff",
                  }}
                >
                  Embrace Your Individuality
                </Typography>
              </Box>
            </HeroSection>
          ))}
        </Slider>
      </Box>

      {/* Featured Product List */}
      <Box sx={{ width: "100%", padding: "40px 0" }}>
        <CustProductList />
      </Box>
    </div>
  );
};

export default Home;
