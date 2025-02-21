import React, { useState } from 'react';

import { UpdateProfileModalProps } from '../utils/interfaces';

import '../styles/Modal.css';

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ user, onSave, onDelete, onClose }) => {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changePassword, setChangePassword] = useState(false);

    const handleSave = () => {
        if (newPassword && !password) {
            alert('Please enter your current password');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match');
            return;
        }
        onSave(username, email, password, newPassword);
        onClose();
    };

    const handleDelete = () => {
        onClose();
        onDelete();
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>×</button>
                <div className="modal-header">Profile</div>
                <div className="modal-body">
                    <input
                        className="input-field"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />
                    <input
                        className="input-field"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="User Email"
                    />
                    <label 
                        onClick={() => setChangePassword(!changePassword)} 
                        style={{ cursor: 'pointer' }}
                    >
                        {changePassword ? 'Hide Change Password' : 'Change Password'}
                    </label>
                    {changePassword && (
                        <div>
                            <input
                                className="input-field"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Current Password"
                            />
                            <input
                                className="input-field"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                            />
                            <input
                                className="input-field"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                            />
                        </div>
                    )}
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

export default UpdateProfileModal;
