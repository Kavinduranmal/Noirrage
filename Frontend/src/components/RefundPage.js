import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const RefundPage = () => {
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
          Refund Policy
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
          You may return items within 7 days of delivery. Items must be unused, unwashed, and in original condition. We will refund the amount excluding shipping once the product is received and inspected.
          <br /><br />
          Personalized or clearance items cannot be returned. For defective or incorrect products, we offer free returns or exchanges. Refunds are processed within 5–7 working days to your original payment method.
        </Typography>
      </Container>
    </Box>
  );
};

export default RefundPage;
