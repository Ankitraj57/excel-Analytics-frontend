<<<<<<< HEAD
# excel-Analytics-frontend
=======
Excel Analytics Frontend

React-based frontend for the Excel Analytics Platform. It provides user authentication, file upload UI, interactive Excel data visualization, and role-based routing.
Features

    User registration and login with JWT-based authentication

    Password reset functionality with email link

    Dark/light theme toggle with persistent user preference

    Responsive design for desktop and mobile

    File upload with Excel (.xlsx) preview

    Dynamic charts rendering using Chart.js

    Protected routes with role-based access (user/admin)

    Toast notifications for user feedback

Tech Stack

    React.js (functional components, hooks)

    Redux Toolkit for state management

    React Router v6 for routing

    Chart.js for data visualization

    React Toastify for notifications

    CSS Modules / Custom CSS for styling

Setup & Installation

    Clone the repo

git clone https://github.com/yourusername/excel-analytics-frontend.git
cd excel-analytics-frontend

    Install dependencies

npm install

    Configure environment variables

Create a .env file in the root directory (if needed) with variables like API URL:

REACT_APP_API_URL=http://localhost:5000/api

    Start the development server

npm start

The app will be available at http://localhost:3000.
Folder Structure

/src
  /components     - Shared components (Navbar, Footer, ProtectedRoute, etc.)
  /features       - Redux slices and async thunks
  /pages          - Page components (Login, Register, Dashboard, Upload, etc.)
  /services       - API calls and utilities
  /styles         - CSS files
  App.js          - Main app and routing setup
  index.js        - Entry point

Usage

    Register a new account or login with existing credentials.

    Upload Excel files on the upload page to visualize data as charts.

    Switch between dark and light mode with the toggle in the Navbar.

    Admin users can access admin-specific pages.

    Reset your password via the forgot password link on login.

Notes

    Ensure the backend API is running and accessible at the configured URL.

    For production, build the app using:

npm run build

    Customize API URLs and other configs via environment variables.
>>>>>>> f2c84f52912aa9485c02c808719e49eb16e1f81b
