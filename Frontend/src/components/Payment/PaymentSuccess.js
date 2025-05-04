// PaymentSuccess.js
import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Container maxWidth="sm">
        <CheckCircleOutlineIcon sx={{ fontSize: 100, color: "#4caf50" }} />
        <Typography variant="h3" sx={{ mt: 3, fontWeight: "bold" }}>
          Payment Successful!
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: "#555" }}>
          Thank you for your purchase. We’ve received your payment and will start processing your order right away.
        </Typography>

        <Button
          variant="contained"
          color="success"
          onClick={() => navigate("/profile")}
          sx={{ mt: 4, px: 4, py: 1.5, fontSize: "1rem" }}
        >
          Go to My Orders
        </Button>
      </Container>
    </Box>
  );
};

export default PaymentSuccess;