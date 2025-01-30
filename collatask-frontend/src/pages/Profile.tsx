// Profile.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Profile.css';

import Navbar from '../components/Navbar';

const Profile: React.FC = () => {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/user/me`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-content">
        <h1>Profile</h1>
        {user ? (
          <div className="profile-card">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><br /><br /><em>In the next update,<br />it will be possible to change your information.</em></p>
            <button className="home-button">Home</button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
