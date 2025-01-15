import React, { useState } from 'react';

import { CardModalProps } from '../utils/interfaces';

import '../styles/Modal.css';

const BoardModal: React.FC<CardModalProps> = ({ card, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description);

    const handleSave = () => {
        onSave(card.id, title, description);
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
