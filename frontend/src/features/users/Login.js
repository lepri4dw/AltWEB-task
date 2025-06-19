import React, {useState} from 'react';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {Alert, Avatar, Box, Container, Grid, IconButton, InputAdornment, Link, TextField, Typography} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {selectLoginError, selectLoginLoading} from './usersSlice';
import {googleLogin, login} from './usersThunks';
import {LoadingButton} from "@mui/lab";
import {GoogleLogin} from "@react-oauth/google";

const Login = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectLoginError);
  const navigate = useNavigate();
  const loading = useAppSelector(selectLoginLoading);
  const [state, setState] = useState({
    email: '',
    password: '',
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

  const inputChangeHandler = (event) => {    const {name, value} = event.target;
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
      await dispatch(login(state)).unwrap();
      navigate('/');
    } catch (error) {
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
          <LockOpenIcon/>
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
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
        {error && (
          <Alert severity="error" sx={{mt: 3, width: '100%'}}>
            {error.error}
          </Alert>
        )}
        <Box component="form" onSubmit={submitFormHandler} sx={{mt: 3}}>          <Grid container spacing={2}>
            <Grid item xs={12}>              <TextField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={state.email} 
                required
                onChange={inputChangeHandler}
                error={Boolean(validationErrors.email)}
                helperText={validationErrors.email}
                inputProps={{
                  'aria-label': 'Email address',
                  'aria-required': 'true'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={state.password}
                onChange={inputChangeHandler}
                error={Boolean(validationErrors.password)}
                helperText={validationErrors.password}
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
                  'aria-required': 'true'
                }}
              />
            </Grid>
          </Grid>
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            sx={{mt: 3, mb: 2}}
            loading={loading}
            loadingIndicator="Loading…"
          >
            Sign In
          </LoadingButton>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                Or sign up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
