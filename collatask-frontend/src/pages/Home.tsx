// Home.tsx

import React from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

import Logo from '../assets/logo_white_500x500.png';

const Home: React.FC = () => {
  const [recentProjects, setRecentProjects] = React.useState<any[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<any | null>(null); // pour afficher les détails du projet
  const navigate = useNavigate();

  const getRecentlyUpdatedProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/user-projects/recent`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('An error occurred while fetching recently updated projects.');
    }
  }

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

  React.useEffect(() => {
    const fetchProjects = async () => {
      const projects = await getRecentlyUpdatedProjects();
      setRecentProjects(projects);
    };

    fetchProjects();
  }, []);

  const timeSinceLastUpdate = (date: string): string => {
    return 'TODO: Calculate time since last update';
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className='header-logo' onClick={() => navigate('/')}>
            <img src={Logo} alt="Collatask Logo" className="logo" />
            <p className='logo-text'>Collatask</p>
        </div>
        <button className="create-button" onClick={() => navigate('/create-project')}>
            Create <span className="arrow">→</span>
        </button>
        <div className="links">
          <a href="/my-projects" className="nav-link">My projects</a>
          <a href="/about" className="nav-link">Profile</a>
          <a onClick={handleSignOut} className="nav-link">Sign out</a>
        </div>
      </header>
      <div className="home-content">
        <div className="home-text">
          <h1>Welcome to Collatask</h1>
          <p>Collaborate with your team and get things done.</p>
        </div>
        <div className="recently-update-projects">
          <h2>Recently Updated Projects</h2>
          <ul>
            {recentProjects.slice(0, 3).map((project: any) => (
              <li key={project.id}>
                {project.title}
                <button onClick={() => setSelectedProject(project)}>View</button>
                {selectedProject && selectedProject.id === project.id && (
                  <div className="project-details">
                    <p>{project.description}</p>
                    <p>Last updated: {timeSinceLastUpdate(project.updated_at)}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home;
