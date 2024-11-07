import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className='not-found-container'>
            <div className='not-found-content'>
                <div className="not-found">
                    <h1>404</h1>
                    <p>Sorry, the page you are looking for does not exist.</p>
                    <button className='back-button' onClick={() => navigate('/')}>Go back to Home</button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;