// Login.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';
import { GoogleLogin } from '@react-oauth/google';

import Logo from '../assets/logo_white_500x500.png';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string>('');
    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const [identifier, setIdentifier] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);
    
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
            const errorMessage = (error as any).response?.data?.error || 'An error occurred.';
            
            if ((error as any).response?.status === 403 || (error as any).response?.status === 401) {
                const conflictMessage = (error as any).response?.data?.error || 'Email or password is invalid.';
                setError(conflictMessage);
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) return;

            setMessage('');
            setError('Please wait while we verify your email...');

            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_APP_URL}/api/auth/verify-email`,
                    { token }
                );

                if (response.status === 200) {
                    setMessage('Email verified. Please login.');
                    setError('');
                    setToken('');
                }
            } catch (error) {
                console.error(error);
                setError('Email verification failed.');
            }
        };

        verifyEmail();
    }, [token]);

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

    return (
        <div className='signup-container'>
            <div className='logo-wrapper'>
                <div className='logo-container'>
                    <img src={Logo} alt='Logo' className='logo' onClick={() => navigate('/')} />
                </div>
            </div>
            <div className='signup-content'>
                <h1>Sign in</h1>
                <div className="google-login-container">
                    <GoogleLogin
                        text="continue_with"
                        onSuccess={handleGoogleLogin}
                        onError={() => console.log('Google Login Failed')}
                        theme="outline"
                        useOneTap={true}
                    />
                </div>
                <hr />
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
                    <button type='submit' disabled={isLoading}>
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            'Login'
                        )}
                    </button>
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
                {message && <p className='success-message'>{message}</p>}
                {error && <p className='error-message'>{error}</p>}
            </div>
        </div>
    );
}

export default Login;
