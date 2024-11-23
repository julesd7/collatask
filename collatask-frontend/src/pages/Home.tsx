// Home.tsx

import React from 'react'
import axios from 'axios';

const Home: React.FC = () => {

  const handleSignOut = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_APP_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      window.location.reload();
    } catch (error) {
      console.error('An error occurred while signing out.');
    }
  }

  return (
    <div>
      <h1>Home</h1>
      <p onClick={() => handleSignOut()} style={{ cursor: 'pointer' }}>Logout</p>
    </div>
  )
}

export default Home
