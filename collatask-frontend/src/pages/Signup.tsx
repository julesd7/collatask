// Signup.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Signup.css';

import Logo from '../assets/logo_white_500x500.png';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setError('');
        e.preventDefault();
    
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
    
        try {
            const requestBody: any = {
                username,
                email,
                password,
            };

            await axios.post(
                `${import.meta.env.VITE_APP_URL}/api/auth/register`,
                requestBody,
                {
                    withCredentials: true,
                }
            );
            
            const successMessage = 'Email sent. You will be redirected to the login page in 5 seconds.';
            setError(successMessage);

            setTimeout(() => {
                navigate('/login');
            }, 5000);

        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || 'An error occurred.';
            
            if ((error as any).response?.status === 409) {
                const conflictMessage = (error as any).response?.data?.message || 'Username or email already exists.';
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
                    <img src={Logo} alt='Logo' className='logo' />
                </div>
            </div>
            <div className='signup-content'>
                <h1>Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type='text'
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type='password'
                        placeholder='Confirm Password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type='submit'>Sign Up</button>
                    <div className="swap-link">
                        <p>Already have an account? <span onClick={() => navigate('/login')}>Sign in</span></p>
                    </div>
                </form>
                {error && <p className='error-message'>{error}</p>}
            </div>
        </div>
    );      
}

export default Signup;
