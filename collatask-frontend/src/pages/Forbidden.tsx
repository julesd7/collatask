// Forbidden.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

const Forbidden: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className='not-found-container'>
            <div className='not-found-content'>
                <div className="not-found">
                    <h1>Forbidden</h1>
                    <p>Sorry, you do not have permission to access this page.</p>
                    <button className='back-button' onClick={() => navigate('/')}>Go back to Home</button>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;