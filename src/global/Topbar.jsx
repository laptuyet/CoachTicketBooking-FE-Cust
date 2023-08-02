import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../utils/useLogin";
import UserDrawerItems from "./UserDrawerItems";

const renderUserSettings = (isLoggedIn) => {
  return (
    <Box width="300px">
      <List sx={{ mt: "20px" }}>
        {UserDrawerItems.map((item, index) =>
          isLoggedIn === item?.requireLogin ? (
            <Link
              key={index}
              to={item.to}
              style={{ textDecoration: "none", color: "#000" }}
            >
              <ListItem disablePadding>
                <ListItemButton disableRipple>
                  <ListItemIcon>{<item.icon />}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            </Link>
          ) : !isLoggedIn === !item?.requireLogin ? (
            <Link
              key={index}
              to={item.to}
              style={{ textDecoration: "none", color: "#000" }}
            >
              <ListItem disablePadding>
                <ListItemButton disableRipple>
                  <ListItemIcon>{<item.icon />}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            </Link>
          ) : undefined
        )}
      </List>
    </Box>
  );
};

const Topbar = () => {
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const isLoggedIn = useLogin();
  const loggedInUsername = localStorage.getItem("loggedInUsername");

  return (
    <Box
      zIndex={1000}
      position="fixed"
      top={0}
      left={0}
      right={0}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p="12px 30px"
      bgcolor="#fff"
      boxShadow="rgba(100, 100, 111, 0.2) 0px 7px 25px 0px"
    >
      <Box
        sx={{
          cursor: "pointer",
        }}
      >
        {/* ICON */}
        <Link to="/" style={{ textDecoration: "none", color: "#000" }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="4px"
          >
            <Typography fontWeight="bold" variant="h5">
              DIDU
            </Typography>
            <Box width="30px" height="30px">
              <img
                src="src/assets/BusImages/bus.png"
                alt="bus_icon"
                width="100%"
                height="100%"
                style={{
                  objectFit: "contain",
                }}
              />
            </Box>
            <Typography fontWeight="bold" variant="h5">
              DUADI
            </Typography>
          </Box>
        </Link>
      </Box>

      {/* Top bar Menu */}
      <Box display="flex" gap="30px">
        <Link to="/booking">
          <IconButton disableRipple color="success">
            <Box display="flex" gap="10px">
              <ConfirmationNumberIcon />
              <Typography fontWeight="bold" variant="h5">
                Đặt vé
              </Typography>
            </Box>
          </IconButton>
        </Link>

        <Link to="/booking-search">
          <IconButton disableRipple color="success">
            <Box display="flex" gap="10px">
              <SearchIcon />
              <Typography fontWeight="bold" variant="h5">
                Tra cứu vé
              </Typography>
            </Box>
          </IconButton>
        </Link>
      </Box>

      {/* User Settings */}
      <Box display="flex">
        {/* side bar user settings */}
        <IconButton onClick={() => setToggleDrawer(!toggleDrawer)}>
          <Box display="flex" alignItems="center" gap="5px">
            <ManageAccountsOutlinedIcon />
          </Box>
          <Drawer
            anchor="right"
            open={toggleDrawer}
            onClose={() => setToggleDrawer(!toggleDrawer)}
          >
            {isLoggedIn && loggedInUsername !== null && (
              <>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                  height="150px"
                >
                  <Typography fontWeight="bold" variant="h3">
                    Xin chào
                  </Typography>
                  <Typography fontStyle="italic" variant="h4">
                    {loggedInUsername}
                  </Typography>
                </Box>
                <Divider />
              </>
            )}

            {renderUserSettings(isLoggedIn)}
          </Drawer>
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
