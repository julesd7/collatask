import React, { useState, useEffect } from 'react';

import { ProjectModalProps, TeamMember } from '../utils/interfaces';

import '../styles/Modal.css';

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState<string>(project.title);
  const [description, setDescription] = useState<string>(project.description);
  const [newTeamMembers, setNewTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (project.newTeamMembers && Array.isArray(project.newTeamMembers)) {
      setNewTeamMembers(project.newTeamMembers);
    } else {
      console.error('project.newTeamMembers.data n\'est pas un tableau valide');
    }
  }, [project]);  

  const handleAddMember = () => {
    setNewTeamMembers([...newTeamMembers, { email: '', role: '' }]);
  };

  const handleInputChange = (index: number, field: 'email' | 'role', value: string) => {
    const updatedTeamMembers = [...newTeamMembers];
    updatedTeamMembers[index][field] = value;
    setNewTeamMembers(updatedTeamMembers);
  };

  const handleRemoveMember = (index: number) => {
    const updatedTeamMembers = newTeamMembers.filter((_, i) => i !== index);
    setNewTeamMembers(updatedTeamMembers.length > 0 ? updatedTeamMembers : [{ email: '', role: '' }]);
  };

  const handleSave = () => {
    onSave(project.id, title, description, newTeamMembers);
    onClose();
  };

  const handleDelete = () => {
    onDelete(project.id);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="modal-header">Project Settings</div>
        <div className="modal-body">
          <input
            className="input-field"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Title"
          />
          <textarea
            className="input-field"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Project Description"
          />
          {newTeamMembers.length > 0 && (
            <div className="team-members">
              <h3>Team Members</h3>
              {newTeamMembers.map((member, index) => (
                <div key={index} className="team-member">
                  <input
                    type="email"
                    placeholder="Email"
                    value={member.email}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    required
                  />
                  <select
                    value={member.role}
                    onChange={(e) => handleInputChange(index, 'role', e.target.value)}
                    required
                  >
                    <option value="">Select role</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="remove-member"
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={handleAddMember} className="add-member-btn">
            Add Member +
          </button>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
