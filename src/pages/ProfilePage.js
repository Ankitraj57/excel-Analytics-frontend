import React from 'react';
import { useSelector } from 'react-redux';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Profile Information</h2>
        <div className="profile-details">
          <div className="profile-section">
            <h3>Personal Info</h3>
            <div className="profile-item">
              <span className="label">Name:</span>
              <span className="value">{user.name}</span>
            </div>
            <div className="profile-item">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
          </div>

          <div className="profile-section">
            <h3>Account Info</h3>
            <div className="profile-item">
              <span className="label">Role:</span>
              <span className="value">{user.role}</span>
            </div>
            <div className="profile-item">
              <span className="label">Status:</span>
              <span className="value">{user.status || 'Active'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
