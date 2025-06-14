import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Initialize axios instance and export it
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add token refresh middleware
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        // Get fresh token
        const response = await api.post('/auth/refresh-token');
        const { jwt } = response.data;
        localStorage.setItem('jwt', jwt);
        
        // Update request with new token
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${jwt}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure
        localStorage.removeItem('jwt');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// 🔓 Decode JWT helper
function parsejwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

// 🔐 Get initial jwt from localStorage
const jwt = localStorage.getItem('jwt');
const tokenData = jwt ? parsejwt(jwt) : null;

const initialState = {
  user: tokenData || null,
  jwt: jwt,
  role: tokenData?.role || 'user', // Default to 'user' if role is not present
  isAuthenticated: Boolean(jwt),
  loading: false,
  error: null,
  success: false,
  tokenExpired: false,
  refreshTimer: null,
};

// Update the setToken reducer to ensure role is always set
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setToken: (state, action) => {
      state.jwt = action.payload.jwt;
      state.user = action.payload.user;
      state.role = action.payload.user.role || 'user'; // Ensure role is always set
      state.isAuthenticated = true;
      state.tokenExpired = false;
      
      // Clear any existing timer
      if (state.refreshTimer) {
        clearTimeout(state.refreshTimer);
      }
      
      // Set new refresh timer (refresh 1 hour before expiration)
      const decoded = parsejwt(state.jwt);
      if (decoded) {
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const refreshTime = expirationTime - 3600000; // 1 hour before expiration
        const timeUntilRefresh = refreshTime - Date.now();
        
        if (timeUntilRefresh > 0) {
          state.refreshTimer = setTimeout(() => {
            // Dispatch refresh token action
          }, timeUntilRefresh);
        }
      }
    },
    setTokenExpired: (state) => {
      state.tokenExpired = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.jwt = null;
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.tokenExpired = false;
        localStorage.removeItem('jwt');
      })
      .addCase(logoutUser.rejected, (state) => {
        state.error = 'Logout failed';
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.jwt = action.payload.jwt;
        state.user = action.payload.user;
        state.role = action.payload.user.role || 'user'; // Ensure role is always set
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        state.success = true;
        state.tokenExpired = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.jwt = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.user.role || 'user'; // Ensure role is always set
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        state.success = true;
        state.tokenExpired = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

// 🔄 Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', {
        ...userData,
        email: userData.email.toLowerCase(),
      });

      const token = response.data.token;
      const decodedUser = parsejwt(token);
      localStorage.setItem('jwt', token);

      return {
        jwt: token,
        user: decodedUser,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// 🆕 Register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', {
        ...userData,
        email: userData.email.toLowerCase(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// 🔐 Forgot Password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
    }
  }
);

// 🔐 Reset Password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

// 🚪 Logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('jwt');
  return null;
});

export const { clearError, clearSuccess } = authSlice.actions;

export default authSlice.reducer;
