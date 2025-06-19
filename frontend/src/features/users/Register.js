import React, {useState} from 'react';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {Avatar, Box, Container, Grid, IconButton, InputAdornment, Link, TextField, Typography} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {selectRegisterError, selectRegisterLoading} from './usersSlice';
import {googleLogin, register} from './usersThunks';
import {LoadingButton} from "@mui/lab";
import FileInput from "../../components/UI/FileInput/FileInput";
import {GoogleLogin} from "@react-oauth/google";

const Register = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectRegisterError);
  const navigate = useNavigate();
  const loading = useAppSelector(selectRegisterLoading);
  const [state, setState] = useState({
    email: '',
    password: '',
    displayName: '',
    avatar: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  };
  const inputChangeHandler = (event) => {
    const {name, value} = event.target;
    setState(prevState => ({...prevState, [name]: value}));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({...prev, [name]: ''}));
    }
  };
  const validateForm = () => {
    const errors = {};
    
    if (!state.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(state.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!state.displayName) {
      errors.displayName = 'Display name is required';
    }
    
    if (!state.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(state.password)) {
      errors.password = 'Password must be at least 8 characters with letters and numbers';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const googleLoginHandler = async (credential) => {
    await dispatch(googleLogin(credential)).unwrap();
    navigate('/');
  };
  const submitFormHandler = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
      try {
      await dispatch(register(state)).unwrap();
      navigate('/');
    } catch (e) {
    }
  };

  const fileInputChangeHandler = (e) => {
    const {name, files} = e.target;
    setState(prevState => ({
      ...prevState, [name]: files && files[0] ? files[0] : null,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getFieldError = (fieldName) => {
    try {
      return error?.errors[fieldName].message;
    } catch {
      return undefined;
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        style={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
          <LockOutlinedIcon/>
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box sx={{ pt: 2 }}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                void googleLoginHandler(credentialResponse.credential);
              }
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />
        </Box>
        <Box component="form" noValidate onSubmit={submitFormHandler} sx={{mt: 3}}>          <Grid container spacing={2}>
            <Grid item xs={12}>              <TextField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={state.email} 
                required
                onChange={inputChangeHandler}
                error={Boolean(validationErrors.email || getFieldError('email'))}
                helperText={validationErrors.email || getFieldError('email')}
                inputProps={{
                  'aria-label': 'Email address',
                  'aria-required': 'true'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                name="displayName"
                label="Display Name"
                autoComplete="name"
                value={state.displayName}
                onChange={inputChangeHandler}
                error={Boolean(validationErrors.displayName || getFieldError('displayName'))}
                helperText={validationErrors.displayName || getFieldError('displayName')}
                inputProps={{
                  'aria-label': 'Display name',
                  'aria-required': 'true'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={state.password} 
                required
                onChange={inputChangeHandler}
                error={Boolean(validationErrors.password || getFieldError('password'))}
                helperText={validationErrors.password || getFieldError('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  'aria-label': 'Password',
                  'aria-required': 'true',
                  'aria-describedby': 'password-helper-text'
                }}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{mt: 2}}>
            <FileInput onChange={fileInputChangeHandler} name="avatar" label="Avatar"
                       error={Boolean(getFieldError('avatar'))} helperText={getFieldError('avatar')}/>
          </Grid>
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            sx={{mt: 3, mb: 2}}
            loading={loading}
            loadingIndicator="Loading…"
          >
            Sign Up
          </LoadingButton>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
