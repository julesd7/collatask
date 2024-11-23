import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

import Logo from '../assets/logo_white_500x500.png';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
    
        try {
            const requestBody: any = {
                identifier,
                password,
                rememberMe,
            };

            const response = await axios.post(
                `${import.meta.env.VITE_APP_URL}/api/auth/login`,
                requestBody,
                {
                    withCredentials: true,
                }
            );
            
            if (response.status === 200) {
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 200);
            }

        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || 'An error occurred.';
            
            if ((error as any).response?.status === 403 || (error as any).response?.status === 401) {
                const conflictMessage = (error as any).response?.data?.message || 'Email or password is invalid.';
                setError(conflictMessage);
            } else {
                setError(errorMessage);
            }
        }
    };

    return (
        <div className='signup-container'>
            <div className='logo-wrapper'>
                <div className='logo-container'>
                    <img src={Logo} alt='Logo' className='logo' onClick={() => navigate('/')} />
                </div>
            </div>
            <div className='signup-content'>
                <h1>Sign in</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type='text'
                        placeholder='Username or email'
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                    />
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type='submit'>Login</button>
                    <div className="remember-me-container">
                        <label>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            Remember Me
                        </label>
                        <label className="forget-password" onClick={() => navigate('/reset')}>
                            Forget password?
                        </label>
                    </div>
                    <div className="swap-link">
                        <p>Don't have an account? <span onClick={() => navigate('/signup')}>Sign up</span></p>
                    </div>
                </form>
                {error && <p className='error-message'>{error}</p>}
            </div>
        </div>
    );      
}

export default Login;
