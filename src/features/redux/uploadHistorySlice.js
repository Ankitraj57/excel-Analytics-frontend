import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 🔄 Thunk to fetch upload history
export const getUploadHistory = createAsyncThunk(
  'uploadHistory/fetch',
  async (_, thunkAPI) => {
    const jwt = localStorage.getItem('jwt');

    // ⛔ Prevent calling API with null jwt
    if (!jwt) {
      return thunkAPI.rejectWithValue('User not authenticated');
    }

    try {
      const response = await axios.get(`${API_URL}/files/history`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Upload history fetch failed');
    }
  }
);


const uploadHistorySlice = createSlice({
  name: 'uploadHistory',
  initialState: {
    history: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUploadHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUploadHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getUploadHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default uploadHistorySlice.reducer;
