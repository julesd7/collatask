import React, { useState } from 'react';

import { CardCreationModalProps } from '../utils/interfaces';

import '../styles/Modal.css';

const BoardModal: React.FC<CardCreationModalProps> = ({ boardId, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    if (boardId === undefined) {
        console.error('boardId is undefined');
        onClose();
    }

    const handleSave = () => {
        onSave(boardId, title, description);
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
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Create</button>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;
