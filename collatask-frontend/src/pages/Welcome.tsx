// Welcome.tsx

import React from 'react';
import '../styles/Welcome.css';
import { useNavigate } from 'react-router-dom';

import Logo from '../assets/logo_white_500x500.png';
import HomePicture from '../assets/HomePicture.png';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <div className='header-logo' onClick={() => navigate('/')}>
            <img src={Logo} alt="Collatask Logo" className="logo" />
            <p className='logo-text'>Collatask</p>
        </div>
          <a href="/about" className="nav-link">About</a>
          <button className="signup-button" onClick={handleSignUp}>
            Sign up <span className="arrow">→</span>
          </button>
      </header>

      <div className="welcome-content">
        <div className="text-section">
          <span className="tag">#collatask</span>
          <h1 className="title">The Easiest Way to Collaborate</h1>
          <p className="description">
            Simplify collaboration and boost your team's productivity with solutions tailored to your needs.
          </p>
          <button className="start-button" onClick={handleSignUp}>
            Start to collatask <span className="arrow">→</span>
          </button>
        </div>

        <div className="image-section">
          <img src={HomePicture} alt="Person working on a laptop" className="hero-image" />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
