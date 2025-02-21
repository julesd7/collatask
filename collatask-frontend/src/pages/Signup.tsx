// Signup.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';
import { GoogleLogin } from '@react-oauth/google';

import Logo from '../assets/logo_white_500x500.png';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleGoogleLogin = async (response: any) => {
        const googleToken = response.credential;

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_APP_URL}/api/auth/google`,
                { token: googleToken },
                { withCredentials: true }
            );

            if (data && data.user) {
                navigate('/');
                window.location.reload();
            }
        } catch (error) {
            setError('Google login failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        setIsLoading(true);
    
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
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
            setSuccess(successMessage);

            setTimeout(() => {
                navigate('/login');
            }, 5000);

        } catch (error) {
            const errorMessage = (error as any).response?.data?.error || 'An error occurred.';
            
            if ((error as any).response?.status === 409) {
                const conflictMessage = (error as any).response?.data?.error || 'Username or email already exists.';
                setError(conflictMessage);
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
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
                <h1>Sign Up</h1>
                <div className="google-login-container">
                    <GoogleLogin
                        text="signup_with"
                        onSuccess={handleGoogleLogin}
                        onError={() => console.log('Google Login Failed')}
                        theme="outline"
                    />
                </div>
                <hr />
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
                    <button type='submit' disabled={isLoading}>
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                    <div className="swap-link">
                        <p>Already have an account? <span onClick={() => navigate('/login')}>Sign in</span></p>
                    </div>
                </form>
                {success && <p className="success-message">{success}</p>}
                {error && <p className='error-message'>{error}</p>}
            </div>
        </div>
    );
}

export default Signup;
