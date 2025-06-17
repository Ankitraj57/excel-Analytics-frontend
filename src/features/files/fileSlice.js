import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../auth/authSlice';

export const fetchUploadHistory = createAsyncThunk(
  'files/fetchUploadHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/files/history');
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
      await api.delete(`/files/${fileId}`);
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
