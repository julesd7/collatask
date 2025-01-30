import React, { useState } from 'react';

import { BoardCreationModalProps } from '../utils/interfaces';

import '../styles/Modal.css';

const BoardCreationModal: React.FC<BoardCreationModalProps> = ({ onSave, onClose }) => {
    const [title, setTitle] = useState('');

    const handleSave = () => {
        onSave(title);
        onClose();
    };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="modal-header">Board Creation</div>
        <div className="modal-body">
          <input
            className="input-field"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Board Title"
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

export default BoardCreationModal;
