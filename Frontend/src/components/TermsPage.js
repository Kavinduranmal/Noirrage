import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TermsPage = () => {
  return (
    <Box
      sx={{
        mt: -8,
        bgcolor: "rgba(0,0,0,0.55)",
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
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Raleway', sans-serif",
            color: "gold",
            textTransform: "uppercase",
            letterSpacing: 2,
            borderBottom: "2px solid gold",
            pb: 1,
            animation: `${fadeIn} 1s ease-in-out`,
          }}
        >
          Terms & Conditions
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: 4,
            fontSize: "18px",
            lineHeight: 1.9,
            fontFamily: "'Raleway', sans-serif",
            opacity: 0.9,
            animation: `${fadeIn} 1.2s ease-in-out`,
          }}
        >
          By accessing Noirrage.com, you agree to abide by our terms. Users must be 18+ and provide accurate details during purchase. We reserve the right to cancel suspicious orders and modify site content without notice.
          <br /><br />
          Prices, descriptions, and inventory may change anytime. Orders are not confirmed until payment is received. We use secure third-party processors like PayHere to handle your information safely.
        </Typography>
      </Container>
    </Box>
  );
};

export default TermsPage;
