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
      setRecentProjects(Array.isArray(projects) ? projects : []);
    };    

    fetchProjects();
  }, []);

  const timeSinceLastUpdate = (date: string): string => {
    const now = new Date();
    const lastUpdate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    return days > 1 ? `${days} days ago` :
       days === 1 ? `1 day ago` :
       hours > 1 ? `${hours} hours ago` :
       hours === 1 ? `1 hour ago` :
       minutes > 1 ? `${minutes} minutes ago` :
       minutes === 1 ? `1 minute ago` :
       `just now`;
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
            {Array.isArray(recentProjects) && recentProjects.length > 0 ? (
              recentProjects.slice(0, 3).map((project: any) => (
                <li key={project.id} className="project-item" onClick={() => navigate(`/project/${project.id}`)}>
                  <h3>{project.title}</h3>
                  <p className="description">{project.description}</p>
                  <p className="last-updated">Last updated: {timeSinceLastUpdate(project.updated_at)}</p>
                </li>
              ))
            ) : (
              <p>No recent projects available.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
