import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 🔄 Thunk to fetch upload history
export const getUploadHistory = createAsyncThunk(
  'uploadHistory/fetch',
  async (params = {}, thunkAPI) => {
    const jwt = localStorage.getItem('jwt');
    const { userId } = params;

    // ⛔ Prevent calling API with null jwt
    if (!jwt) {
      return thunkAPI.rejectWithValue('User not authenticated');
    }

    try {
      const url = userId 
        ? `${API_URL}/files/history?userId=${userId}`
        : `${API_URL}/files/history`;
        
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to fetch upload history. Please try again.';
      return thunkAPI.rejectWithValue(errorMessage);
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