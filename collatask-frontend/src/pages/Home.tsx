// Home.tsx

import React from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

import Navbar from '../components/Navbar';

const Home: React.FC = () => {
  const [recentProjects, setRecentProjects] = React.useState<any[]>([]);
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

  React.useEffect(() => {
    const fetchProjects = async () => {
      const projects = await getRecentlyUpdatedProjects();
      setRecentProjects(projects);
    };

    fetchProjects();
  }, []);

  const timeSinceLastUpdate = (date: string): string => {
    const now = new Date();
    const lastUpdate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    const minutes = Math.floor(diffInSeconds / 60) + 60;
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return `just now`;
  };  

  return (
    <div className="home-container">
      <Navbar />
      <div className="home-content">
        <div className="home-text">
          <h1>Welcome to Collatask</h1>
          <p>Collaborate with your team and get things done.</p>
        </div>
        <div className="recently-update-projects">
          <h2>Recently Updated Projects</h2>
          <ul>
            {recentProjects.slice(0, 3).map((project: any) => (
              <li key={project.id} className="project-item">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <button
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="view-button"
                >
                  View Project
                </button>
                <p className="last-updated">Last updated: {timeSinceLastUpdate(project.updated_at)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
