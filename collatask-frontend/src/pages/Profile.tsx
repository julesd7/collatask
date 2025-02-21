// Profile.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Profile.css';

import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import UpdateProfileModal from '../components/UpdateProfileModal';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [isUpdateProfileModalOpen, setUpdateProfileModalState] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSave = async (username: string, email: string, password: string, newPassword: string) => {
    let newUsername = username;
    let newEmail = email;
    if (username === user?.username) {
      newUsername = '';
    }
    if (email === user?.email) {
      newEmail = '';
    }
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_URL}/api/user/update`, {
        username: newUsername,
        email: newEmail,
        oldPass: password,
        newpass: newPassword,
      }, {
        withCredentials: true,
      }
      );
      if (response.status === 204) {
        return;
      }
      const data = await axios.get(`${import.meta.env.VITE_APP_URL}/api/user/me`, {
        withCredentials: true,
      });
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
      setUser(data.data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
      const response = await axios.delete(`${import.meta.env.VITE_APP_URL}/api/user/delete`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        navigate('/');
      }
      } catch (error) {
      console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-content">
        <h1>Profile</h1>
        {user ? (
          <div className="profile-card">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <div className="profile-buttons">
              <button
              className="update-button"
              onClick={() => setUpdateProfileModalState(true)}
              disabled={loading}
              >
              {loading ? 'Loading...' : 'Update Profile'}
              </button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      {isUpdateProfileModalOpen && user && (
        <UpdateProfileModal
          user={user}
          onSave={(username, email, password, newPassword) => {
            handleSave(username, email, password, newPassword);
          }}
          onDelete={() => {
            handleDelete();
          }}
          onClose={() => setUpdateProfileModalState(false)}
        />
      )}
    </div>
  );
};

export default Profile;
