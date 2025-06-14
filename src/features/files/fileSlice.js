import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchUploadHistory = createAsyncThunk(
  'files/fetchUploadHistory',
  async (_, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/files/history`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

export const deleteFileById = createAsyncThunk(
  'files/deleteFileById',
  async (fileId, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return fileId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Delete failed');
    }
  }
);

const fileSlice = createSlice({
  name: 'files',
  initialState: {
    history: [],
    loading: false,
    deleting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUploadHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUploadHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchUploadHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFileById.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteFileById.fulfilled, (state, action) => {
        state.history = state.history.filter(file => file._id !== action.payload);
        state.deleting = false;
      })
      .addCase(deleteFileById.rejected, (state, action) => {
        state.error = action.payload;
        state.deleting = false;
      });
  },
});

export default fileSlice.reducer;
