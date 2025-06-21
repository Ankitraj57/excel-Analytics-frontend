// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import fileReducer from '../features/files/fileSlice';
import themeReducer from '../features/theme/themeSlice';
import dashboardReducer from '../features/redux/dashboardSlice';
import uploadHistoryReducer from '../features/redux/uploadHistorySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    files: fileReducer,
    theme: themeReducer,
    dashboard: dashboardReducer,
    uploadHistory: uploadHistoryReducer,
  },
});

export default store;