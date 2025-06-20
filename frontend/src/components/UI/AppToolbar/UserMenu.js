import React, { useState } from 'react';
import {Avatar, Button, CircularProgress, Menu, MenuItem} from '@mui/material';
import {useAppDispatch, useAppSelector} from '../../../app/hooks';
import { logout } from '../../../features/users/usersThunks';
import {selectLogoutLoading} from "../../../features/users/usersSlice";
import {API_URL} from "../../../constants";

const UserMenu = ({user}) => {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const logoutLoading = useAppSelector(selectLogoutLoading);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <Button
        onClick={handleClick}
        color="inherit"
      >
        Hello, {user.displayName} <Avatar sx={{ml: 2}} src={API_URL + '/' + user.avatar} alt={user.email}/>
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem>Profile</MenuItem>
        <MenuItem>My account</MenuItem>
        <MenuItem onClick={handleLogout} disabled={logoutLoading}>{logoutLoading && <CircularProgress size={20} sx={{mr: 1}}/>}Logout</MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
