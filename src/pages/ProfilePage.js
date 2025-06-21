import React from 'react';
import { useSelector } from 'react-redux';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <h2>User Profile</h2>
        <div className="profile-card">
          <div className="profile-info">
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      <div className="profile-card">
        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> {user.status || 'Active'}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;