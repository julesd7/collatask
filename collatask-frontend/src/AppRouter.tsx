// src/AppRouter.tsx

import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import Welcome from './pages/Welcome';
import NotFound from './pages/NotFound';

import './styles/Global.css';

const AppRouter: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${process.env.APP_URL}/api/user/me`, {
          credentials: 'include',
        });

        setIsConnected(response.status === 200);
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

      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
