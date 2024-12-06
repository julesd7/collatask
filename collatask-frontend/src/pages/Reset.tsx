// Reset.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/logo_white_500x500.png';
import '../styles/Auth.css';

const Reset: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleIDSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_URL}/api/auth/reset`, {
                identifier: identifier,
            });

            if (response.status === 200) {
                setSuccess('Reset email sent successfully.');
            } else {
                setError('An error occurred.');
            }
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setError('User not found.');
            } else if (error.response && error.response.status === 403) {
                setError('User is not confirmed.');
            } else {
                setError('Internal error. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_URL}/api/auth/reset-password`, {
                token: token,
                newPassword: password,
            });

            if (response.status === 200) {
                setSuccess('Password reset successfully. Redirecting to login page...');
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else {
                setError('An error occurred.');
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setError('Expired or invalid token.');
            } else {
                setError('Internal error. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            setIdentifier('');
        }
    }, [token]);

    return (
        <div className="signup-container">
            <div className='logo-wrapper'>
                <div className='logo-container'>
                    <img src={Logo} alt='Logo' className='logo' onClick={() => navigate('/')} />
                </div>
            </div>
            <div className="signup-content">
                <h1>{token ? 'Reset Password' : 'Request Password Reset'}</h1>

                {!token ? (
                    <form onSubmit={handleIDSubmit}>
                        <div>
                            <input
                                type="text"
                                placeholder="username or email"
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <div className="spinner"></div>
                            ) : (
                                'Request password reset'
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handlePasswordSubmit}>
                        <div>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <div className="spinner"></div> // Show spinner
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                )}

                {success && <p className="success-message">{success}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Reset;
