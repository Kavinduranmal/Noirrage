import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PrivacyPage = () => {
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
          Privacy Policy
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
          At Noirrage, we protect your data. We collect only essential info like name, email, and address. Your payment is securely processed by trusted services like PayHere. We never share or sell your data.
          <br /><br />
          Cookies help improve your experience and track preferences. You may disable them via browser settings. We regularly update our privacy practices to reflect legal and platform changes.
        </Typography>
      </Container>
    </Box>
  );
};

export default PrivacyPage;
