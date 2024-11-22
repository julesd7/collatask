// Welcome.tsx

import React from 'react';
import '../styles/About.css';
import '../styles/Welcome.css';
import { useNavigate } from 'react-router-dom';

import Logo from '../assets/logo_white_500x500.png';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      <header className="about-header">
        <div className='header-logo' onClick={() => navigate('/')}>
            <img src={Logo} alt="Collatask Logo" className="logo" />
            <p className='logo-text'>Collatask</p>
        </div>
          <a onClick={() => navigate('/about')} className="nav-link">About</a>
      </header>

      <div className="about-content">
        <div className="text-section">
            <h1 className="title">About Collatask</h1>
            <p className="description">
                Collatask is a tool designed to simplify project and task management, whether you're a student, a professional, or working on personal projects. Our mission is to help teams collaborate effectively and organize their work in a smooth and intuitive way.
            </p>
            <h2 className="subtitle">What is Collatask?</h2>
            <p className="description">
                Collatask is a web-based application that allows you to create and manage projects, tasks, and teams. With an easy-to-use interface, you can track task progress, assign roles, and ensure optimal collaboration.
            </p>
            <h2 className="subtitle">Key Features</h2>
            <ul className="features-list">
                <li>Intuitive Interface: Easily create and manage projects and tasks.</li>
                <li>Role Management: Assign roles (Viewer, Member, Admin, Owner) to your teammates.</li>
                <li>Task Tracking: Organize tasks into boards and track progress.</li>
                <li>Collaboration Tools: Assign tasks, set deadlines, and stay synchronized with your team.</li>
                <li>Security: Secure login and data protection.</li>
            </ul>
            <h2 className="subtitle">Why Collatask?</h2>
            <p className="description">
                Collatask simplifies project management by bringing all the necessary tools into one platform. Stay organized, work collaboratively, and meet your deadlines, whether it's for school, work, or personal projects.
            </p>
            <h2 className="subtitle">Our Vision</h2>
            <p className="description">
                We aim to provide a flexible and intuitive tool that helps anyone optimize project management and collaborate better, no matter the project type.
            </p>
            <h2 className="subtitle">Join Us</h2>
            <p className="description">
                Collatask is more than just a tool; it’s a community. Join us to organize your projects, boost your productivity, and achieve your goals.
            </p>
            <button className='signup-button' onClick={() => navigate('/signup')}>Sign up <span className="arrow">→</span></button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
