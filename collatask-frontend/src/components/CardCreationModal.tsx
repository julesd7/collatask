import React, { useState } from 'react';
import { CardCreationModalProps } from '../utils/interfaces';
import '../styles/Modal.css';

const CardCreationModal: React.FC<CardCreationModalProps> = ({ card, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
  const [priority, setPriority] = useState<string | null>(null);

  if (card.BoardId === undefined) {
    console.error('boardId is undefined');
    onClose();
  }

  const handleCheckboxChange = (email: string) => {
    setAssignedMembers((prevSelected) => {
      if (prevSelected.includes(email)) {
        return prevSelected.filter((item) => item !== email);
      } else {
        return [...prevSelected, email];
      }
    });
  };

  const handleSave = () => {
    onSave(card.BoardId, title, description, startDate, endDate, assignedMembers, priority);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="modal-header">Card Creation</div>
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
            placeholder="Card Description (optional)"
          />
          <div className="date-picker">
            <div className="start-date">
              <label>Start Date</label>
              <input
                className="input-field"
                type="date"
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
            <div className="due-date">
              <label>Due Date</label>
              <input
                className="input-field"
                type="date"
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                min={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="priority">
            <label>Priority</label>
            <select
              className="select-field"
              onChange={(e) => setPriority(e.target.value === "" ? null : e.target.value)}
            >
              <option value="">No priority</option>
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </div>
          <div className="assign-users">
            <h3>Assigned to:</h3>
            <div className="team-members-checkboxes">
                {card.teamMembers.filter(member => member.role !== 'viewer').map((member) => (
                <div key={member.email} className="team-member-checkbox">
                  <input
                    type="checkbox"
                    id={member.email}
                    value={member.email}
                    checked={assignedMembers.includes(member.email)}
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
          <button className="save-btn" onClick={handleSave}>Create</button>
        </div>
      </div>
    </div>
  );
};

export default CardCreationModal;
