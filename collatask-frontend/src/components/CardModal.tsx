import React, { useState } from 'react';

import { CardModalProps } from '../utils/interfaces';

import '../styles/Modal.css';

const BoardModal: React.FC<CardModalProps> = ({ card, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description);
    const [startDate, setStartDate] = useState<Date | null>(card.startDate);
    const [endDate, setEndDate] = useState<Date | null>(card.endDate);

    const handleSave = () => {
        onSave(card.id, title, description, startDate, endDate);
        onClose();
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
          <label>Due Date</label>
          <input
            className="input-field"
            type="date"
            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
            min={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
          />
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

export default BoardModal;
