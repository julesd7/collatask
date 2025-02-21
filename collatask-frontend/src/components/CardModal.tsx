import React, { useState } from 'react';

import { CardModalProps } from '../utils/interfaces';

import '../styles/Modal.css';

const CardModal: React.FC<CardModalProps> = ({ card, teamMembers, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [startDate, setStartDate] = useState<Date | null>(card.startDate ? new Date(card.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(card.endDate ? new Date(card.endDate) : null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(card.assignedMembers || []);

  const handleSave = () => {
    onSave(card.id, title, description, startDate, endDate, card.assignedMembers, selectedMembers);
    onClose();
  };

  const handleCheckboxChange = (email: string) => {
    setSelectedMembers((prevSelected) => {
      if (prevSelected.includes(email)) {
        return prevSelected.filter((item) => item !== email);
      } else {
        return [...prevSelected, email];
      }
    });
  };

  const handleDelete = () => {
    onClose();
    onDelete(card.id);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="modal-header">Card Settings</div>
        <div className="modal-body">
          <input
            className="input-field"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card Title"
          />
          <input
            className="input-field"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Card Description"
          />
          <div className="date-picker">
            <div className='start-date'>
              <label>Start Date</label>
              <input
                className="input-field"
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newStartDate = e.target.value ? new Date(e.target.value) : null;
                  setStartDate(newStartDate);
                  if (newStartDate && endDate && newStartDate > endDate) {
                    setEndDate(null);
                    (document.querySelector('input[type="date"][min]') as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            <div className='due-date'>
              <label>Due Date</label>
              <input
                className="input-field"
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                min={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="assign-users">
            <h3>Assigned to:</h3>
            <div className="team-members-checkboxes">
                {teamMembers?.filter(member => member.role !== 'viewer').map((member) => (
                <div key={member.email} className="team-member-checkbox">
                  <input
                    type="checkbox"
                    id={member.email}
                    value={member.email}
                    checked={selectedMembers.includes(member.email)}
                    onChange={() => handleCheckboxChange(member.email)}
                  />
                  <label htmlFor={member.email}>{member.email}</label>
                </div>
              ))}
            </div>
          </div>
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

export default CardModal;
