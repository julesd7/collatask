// MyProjects.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import '../styles/MyProjects.css';

const MyProjects: React.FC = () => {
  const [projects, setProjects] = useState<Array<{ project_id: number, title: string, description: string }> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/user-projects`, { withCredentials: true });
        setProjects(response.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setProjects([]);
        } else {
          console.error("Error while loading projects:", error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="my-projects-container">
      <div className="my-projects">
        <h1>My Projects</h1>
        {projects && projects.length > 0 ? (
          <ul>
            {projects.map(project => (
              <li key={project.project_id} className="project-item" onClick={() => navigate(`/project/${project.project_id}`)}>
                <h2>{project.title}</h2>
                <p>{project.description}</p>
                <button onClick={() => navigate(`/project/${project.project_id}`)} className="view-button">
                  View Project
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-projects">
            <p>You currently have no projects.</p>
            <button onClick={() => navigate('/create-project')} className="create-button">
              Create a Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects;
