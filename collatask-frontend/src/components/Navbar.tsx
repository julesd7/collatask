// Navbar.tsx

import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import chatIcon from '../assets/chat_icon.png';
import userProfileIcon from '../assets/profile_icon_default.png';

import '../styles/Navbar.css';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isProfileMenuOpen, setProfileMenuState] = useState(false);

  const toggleProfileMenu = () => {
    setProfileMenuState((previous: boolean) => !previous);
  };

  const handleProfile = () => {
    navigate('/profile');
    setProfileMenuState(false);
  };

  const handleSignOut = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_APP_URL}/api/auth/logout`, {}, {
          withCredentials: true,
        });
        navigate('/login');
        window.location.reload();
      } catch (error) {
        console.error('An error occurred while signing out.');
      }
    }

  return (
    <div className="navbar">
      <div className="left-section">
        <Link to="/" className="brand">
          Collatask
        </Link>
      </div>
      <div className="center-section">
        <ul>
            <li>
                <Link to="/" className={currentPath === '/' ? 'active' : ''}>
                Home
                </Link>
            </li>
            <li>
                <Link to="/create-project" className={currentPath === '/create-project' ? 'active' : ''}>
                Create
                </Link>
            </li>
            <li>
                <Link to="/my-projects" className={currentPath === '/my-projects' ? 'active' : ''}>
                My Projects
                </Link>
            </li>
        </ul>
      </div>
      <div className="right-section">
        <div className="contact">
          <img src={chatIcon} alt="Contact" onClick={() => navigate('/contact')} />
        </div>
        <div className="user-profile">
          <img src={userProfileIcon} alt="User Profile" onClick={toggleProfileMenu} />
          {isProfileMenuOpen && (
            <div className="user-profile-menu">
              <ul>
                <li onClick={() => handleProfile()}>Profile</li>
                <li onClick={() => handleSignOut()}>Logout</li>
              </ul>
            </div>
          )}
        </div>
      </div>
  </div>
  );
};

export default Navbar;
