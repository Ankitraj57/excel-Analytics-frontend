import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const analyzeExcelWithAI = createAsyncThunk(
  'ai/analyzeExcel',
  async (fileId, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/analyze`,
        { fileId },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Analysis failed');
    }
  }
);

const initialState = {
  analysis: null,
  loading: false,
  error: null,
  insights: [],
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(analyzeExcelWithAI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeExcelWithAI.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
        state.insights = action.payload.insights || [];
      })
      .addCase(analyzeExcelWithAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default aiSlice.reducer;
