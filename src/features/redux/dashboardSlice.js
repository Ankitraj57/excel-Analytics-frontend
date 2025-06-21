// src/features/redux/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../auth/authSlice';

// Async thunk to fetch dashboard data from backend
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      // Return a rejected action with error message
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    totalUploads: 0,
    lastUpload: null,
    uploads: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Add non-async reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.uploads = action.payload.uploads || [];
        state.totalUploads = state.uploads.length;
        state.lastUpload = state.uploads.length
          ? state.uploads[state.uploads.length - 1].timestamp
          : null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch dashboard data';
      });
  },
});

export default dashboardSlice.reducer;