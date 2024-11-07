// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppRouter from './AppRouter';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);

const qClient = new QueryClient();

root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={qClient}>
        <AppRouter />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
