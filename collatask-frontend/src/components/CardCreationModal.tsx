import React, { useState } from 'react';

import { CardCreationModalProps } from '../utils/interfaces';

import '../styles/Modal.css';

const CardCreationModal: React.FC<CardCreationModalProps> = ({ boardId, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    if (boardId === undefined) {
        console.error('boardId is undefined');
        onClose();
    }

    const handleSave = () => {
        onSave(boardId, title, description, startDate, endDate);
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
            <div className='start-date'>
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
            <div className='due-date'>
              <label>Due Date</label>
              <input
                className="input-field"
                type="date"
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                min={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              />
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
