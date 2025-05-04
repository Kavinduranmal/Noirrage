// PaymentCancel.js
import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fff3f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Container maxWidth="sm">
        <HighlightOffIcon sx={{ fontSize: 100, color: "#f44336" }} />
        <Typography variant="h3" sx={{ mt: 3, fontWeight: "bold", color: "#f44336" }}>
          Payment Cancelled
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: "#666" }}>
          It seems like your payment didn’t go through. No worries — you can try again or contact our support for help.
        </Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={() => navigate("/CustProductList")}
          sx={{ mt: 4, px: 4, py: 1.5, fontSize: "1rem" }}
        >
          Continue Shopping
        </Button>
      </Container>
    </Box>
  );
};

export default PaymentCancel;