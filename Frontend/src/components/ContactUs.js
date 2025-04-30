import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Phone, Email } from "@mui/icons-material";
import { keyframes } from "@emotion/react";

// Local image imports
import whatsapp from "./what.jpg";
import instagram from "./inster.jpg";
import facebook from "./face.jpg";
import tiktok from "./tik.jpg";

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

const ContactUs = () => {
  return (
    <Box
      id="contact"
      sx={{
        bgcolor: "rgba(0, 0, 0, 0.55)",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          sx={{
            letterSpacing: "3px",
            textTransform: "uppercase",
            borderBottom: "3px solid #e0b252",
            display: "inline-block",
            mx: "auto",
            pb: 1,
            animation: `${fadeIn} 1s ease-in-out`,
          }}
        >
          Contact Us
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mt: 2,
            fontWeight: 300,
            animation: `${fadeIn} 1s ease-in-out`,
            opacity: 0.8,
          }}
        >
          Get in Touch with Noirrage
        </Typography>

        <Box sx={{ mt: 4, maxWidth: "600px", mx: "auto" }}>
          <List>
            <ListItem>
              <ListItemIcon sx={{ color: "gray" }}>
                <Phone />
              </ListItemIcon>
              <ListItemText
                primary="Call Us:"
                secondary={
                  <>
                    <Typography variant="body1" sx={{ color: "#fff", mt: 1 }}>
                      0777854037
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#fff" }}>
                      0743327138
                    </Typography>
                  </>
                }
              />
            </ListItem>

            <ListItem>
              <ListItemIcon sx={{ color: "gray" }}>
                <Email />
              </ListItemIcon>
              <ListItemText
                primary="Email Us:"
                secondary={
                  <Link
                    href="mailto:info@noirrage.com"
                    sx={{
                      color: "#e0b252",
                      textDecoration: "none",
                      "&:hover": { color: "#fff" },
                    }}
                  >
                    Noirrage.lk@gmail.com
                  </Link>
                }
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Follow Us:"
                secondary={
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      mt: 1,
                      justifyContent: "center",
                    }}
                  >
                    {/* WhatsApp */}
                    <Link
                      href="https://wa.me/94743327138"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Box
                        component="img"
                        src={whatsapp}
                        alt="WhatsApp"
                        sx={{ width: 40, height: 40 }}
                      />
                    </Link>

                    {/* Instagram */}
                    <Link
                      href="https://www.instagram.com/n_o_i_r_r_a_g_e/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Box
                        component="img"
                        src={instagram}
                        alt="Instagram"
                        sx={{ width: 40, height: 40 }}
                      />
                    </Link>

                    {/* Facebook */}
                    <Link
                      href="https://www.facebook.com/share/1DPLDBX3H8/?mibextid=wwXIfr"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Box
                        component="img"
                        src={facebook}
                        alt="Facebook"
                        sx={{ width: 40, height: 40 }}
                      />
                    </Link>

                    {/* TikTok */}
                    <Link
                      href="https://www.tiktok.com/@noirrage.lk?_t=ZS-8vEJhMKirvI&_r=1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Box
                        component="img"
                        src={tiktok}
                        alt="TikTok"
                        sx={{ width: 40, height: 40 }}
                      />
                    </Link>
                  </Box>
                }
              />
            </ListItem>
          </List>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactUs;
