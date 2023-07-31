import {
  Box,
  Button,
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
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import UserDrawerItems from "./UserDrawerItems";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import useLogin from "../utils/useLogin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as userApi from "../queries/user/userQueries";

const renderUserSettings = (isLoggedIn) => {
  return (
    <Box width="300px">
      <List>
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
        <Link to="/" style={{ textDecoration: "none" }}>
          <Typography variant="h5" fontWeight="bold">
            FaekBus Icon
          </Typography>
        </Link>
      </Box>
      {/* Top bar Menu */}

      <Box display="flex" gap="30px">
        <Link to="/booking">
          <IconButton
            disableRipple
            sx={{
              border: "2px solid #dadada",
              borderRadius: "10px",
            }}
          >
            <Box display="flex" gap="10px">
              <ConfirmationNumberIcon />
              <Typography fontWeight="bold">Đặt vé</Typography>
            </Box>
          </IconButton>
        </Link>

        <Link to="/booking-search">
          <IconButton
            disableRipple
            sx={{ border: "2px solid #dadada", borderRadius: "10px" }}
          >
            <Box display="flex" gap="10px">
              <SearchIcon />
              <Typography fontWeight="bold">Tra cứu vé</Typography>
            </Box>
          </IconButton>
        </Link>
      </Box>

      {/* User Settings */}
      <Box display="flex">
        {/* side bar user settings */}
        <Button onClick={() => setToggleDrawer(!toggleDrawer)}>
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
                  <Typography fontWeight="bold">Xin chào</Typography>
                  <Typography fontStyle="italic">{loggedInUsername}</Typography>
                </Box>
                <Divider />
              </>
            )}

            {renderUserSettings(isLoggedIn)}
          </Drawer>
        </Button>
      </Box>
    </Box>
  );
};

export default Topbar;
