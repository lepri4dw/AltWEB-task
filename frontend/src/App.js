import React, { useEffect } from 'react';
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import {Container, CssBaseline} from "@mui/material";
import {Route, Routes} from "react-router-dom";
import Register from "./features/users/Register";
import Login from "./features/users/Login";
import { useAppDispatch } from './app/hooks';
import { setUser } from './features/users/usersSlice';

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        dispatch(setUser({
          _id: payload.id,
          email: payload.email,
          role: payload.role,
          displayName: payload.email.split('@')[0]
        }));
      } catch (error) {
        console.error('Error decoding JWT token:', error);
        localStorage.removeItem('token');
      }
    }
  }, [dispatch]);

  return (
    <>
      <CssBaseline/>
      <header>
        <AppToolbar/>
      </header>
      <main>        <Container maxWidth="xl">          <Routes>
            <Route path="/register" element={<Register/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/*" element={<h1>Not Found! This page does not exist!</h1>}/>
          </Routes>
        </Container>
      </main>
    </>
  );
}

export default App;
