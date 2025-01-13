import React, { useState } from 'react';

import '../styles/Modal.css';

interface BoardModalProps {
  board: { id: number; title: string;};
  onSave: (boardId: number, title: string) => void;
  onDelete: (boardId: number) => void;
  onClose: () => void;
}

const BoardModal: React.FC<BoardModalProps> = ({ board, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState(board.title);

    const handleSave = () => {
        onSave(board.id, title);
        onClose();
    };

    const handleDelete = () => {
        onClose();
        onDelete(board.id);
    }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="modal-header">Board Settings</div>
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
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;
