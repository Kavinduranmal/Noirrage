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
import {
  Phone,
  Email,
  Instagram,
  Facebook,
} from "@mui/icons-material"; // Material-UI icons
import { keyframes } from "@emotion/react";

// TikTok Icon from FontAwesome
import { FaTiktok } from "react-icons/fa"; // FontAwesome TikTok icon

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
        bgcolor:"rgba(0, 0, 0, 0.55)" ,
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
        {/* Section Title */}
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

        {/* Section Description */}
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

        {/* Contact Information */}
        <Box
          sx={{
            mt: 4,
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          {/* Phone Numbers */}
          <List>
            <ListItem>
              <ListItemIcon sx={{ color: "#e0b252" }}>
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

            {/* Email */}
            <ListItem>
              <ListItemIcon sx={{ color: "#e0b252" }}>
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
                      "&:hover": {
                        color: "#fff",
                      },
                    }}
                  >
                    Noirrage.lk@gmail.com
                  </Link>
                }
              />
            </ListItem>

            {/* Social Media Links */}
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
                    {/* Instagram */}
                    <Link
                      href="https://www.instagram.com/n_o_i_r_r_a_g_e/"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: "#e0b252",
                        textDecoration: "none",
                        "&:hover": {
                          color: "#fff",
                          transform: "scale(1.2)",
                          transition: "transform 0.3s ease-in-out",
                        },
                      }}
                    >
                      <Instagram fontSize="large" />
                    </Link>

                    {/* Facebook */}
                    <Link
                      href="https://www.facebook.com/share/1DPLDBX3H8/?mibextid=wwXIfr"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: "#e0b252",
                        textDecoration: "none",
                        "&:hover": {
                          color: "#fff",
                          transform: "scale(1.2)",
                          transition: "transform 0.3s ease-in-out",
                        },
                      }}
                    >
                      <Facebook fontSize="large" />
                    </Link>

                    {/* TikTok */}
                    <Link
                      href="https://www.tiktok.com/@noirrage.lk?_t=ZS-8vEJhMKirvI&_r=1"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: "#e0b252",
                        textDecoration: "none",
                        "&:hover": {
                          color: "#fff",
                          transform: "scale(1.2)",
                          transition: "transform 0.3s ease-in-out",
                        },
                      }}
                    >
                      <FaTiktok fontSize="3rem" color="#e0b252" />
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
