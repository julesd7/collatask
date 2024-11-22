// src/AppRouter.tsx

import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';

import Home from './pages/Home';
import Welcome from './pages/Welcome';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Fordidden from './pages/Forbidden';

import Signup from './pages/Signup';
import Login from './pages/Login';

import './styles/Global.css';

const AppRouter: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
          const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/user/me`, {
            withCredentials: true,
          });

          if (response.status === 200) {
            setIsConnected(true);
          } else if (response.status === 401 || response.status === 403) {
            setIsConnected(false);
          }
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  if (isConnected === null) {
    return <p>Loading...</p>;
  }

  return (
    <Routes>
      <Route path="/" element={isConnected ? <Home /> : <Welcome />} />
      <Route path="/about" element={<About />} />
      <Route path="signup" element={isConnected ? <Navigate to="/" /> : <Signup />} />
      <Route path="/login" element={isConnected ? <Navigate to="/" /> : <Login />} />
      <Route path="/forbidden" element={<Fordidden />} />

      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
