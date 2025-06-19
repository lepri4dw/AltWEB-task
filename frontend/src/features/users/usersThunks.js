import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosApi from '../../axiosApi';
import { isAxiosError } from 'axios';
import { unsetUser } from './usersSlice';

export const register = createAsyncThunk(
  'users/register',
  async (registerMutation, {rejectWithValue}) => {
    try {
      const formData = new FormData();
      formData.append('email', registerMutation.email);
      formData.append('password', registerMutation.password);
      formData.append('displayName', registerMutation.displayName || (registerMutation.email).split('@')[0]);
      
      if (registerMutation.avatar) {
        formData.append('avatar', registerMutation.avatar);
      }
      
      const response = await axiosApi.post('/user', formData);
      
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      return response.data;
    } catch (e) {
      if (isAxiosError(e) && e.response && e.response.status === 400) {
        return rejectWithValue(e.response.data);
      }
      throw e;
    }
  }
);

export const login = createAsyncThunk(
  'users/login',
  async (loginMutation, {rejectWithValue}) => {
    try {      const response = await axiosApi.post('/user/auth', {
        email: loginMutation.email,
        password: loginMutation.password
      });
      
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      return response.data;
    } catch (e) {
      if (isAxiosError(e) && e.response && e.response.status === 400) {
        return rejectWithValue(e.response.data);
      }
      throw e;
    }

  }
);

export const googleLogin = createAsyncThunk(
  'users/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      const response = await axiosApi.post('/user/google', { credential });
      
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      return response.data;
    } catch (e) {
      if (isAxiosError(e) && e.response && e.response.status === 400) {
        return rejectWithValue(e.response.data);
      }
      throw e;
    }  },
);

export const logout = createAsyncThunk(
  'users/logout',
  async (_, {dispatch}) => {
    localStorage.removeItem('token');
    dispatch(unsetUser());
  }
);
