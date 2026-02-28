import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import { signupUser, loginUser } from '../services/api';
import './Auth.css';

function Signup() {
    const navigate = useNavigate();
    const [role, setRole] = useState('user'); // 'user' | 'guide'
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, password, confirmPassword } = form;

        if (!username || !password || !confirmPassword) {
            setError('All fields are required.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        // Determine if the username field is email or username
        const isEmail = username.includes('@');
        const payload = {
            username: isEmail ? username.split('@')[0] : username,
            email: isEmail ? username : `${username}@paryatan.local`,
            password,
            role,
        };

        setLoading(true);
        try {
            // 1. Sign up
            await signupUser(payload);

            // 2. Immediately log in
            const loginRes = await loginUser({ identifier: payload.email, password });

            // 3. Store tokens
            localStorage.setItem('token', loginRes.data.token);
            localStorage.setItem('user', JSON.stringify(loginRes.data.user));

            setSuccess('Welcome to the community!');
            navigate('/');
        } catch (err) {
            console.error("AXIOS ERROR:", err);
            setError(err.response?.data?.message || err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Hero background: ilam.png (green hills) */}
            <div
                className="auth-hero"
                style={{ backgroundImage: "url('/img/ilam.png')" }}
            >

                <div className="auth-card">
                    {/* Role toggle */}
                    <div className="auth-toggle">
                        <button
                            id="signup-role-user"
                            type="button"
                            className={`auth-toggle__btn ${role === 'user' ? 'auth-toggle__btn--active' : ''}`}
                            onClick={() => setRole('user')}
                        >
                            User
                        </button>
                        <button
                            id="signup-role-guide"
                            type="button"
                            className={`auth-toggle__btn ${role === 'guide' ? 'auth-toggle__btn--active' : ''}`}
                            onClick={() => setRole('guide')}
                        >
                            Guide
                        </button>
                    </div>

                    <h2 className="auth-card__title auth-card__title--center">Join the community</h2>

                    {error && <p className="auth-error">{error}</p>}
                    {success && <p className="auth-success">{success}</p>}

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        {/* Email / Username */}
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="rgba(100,100,100,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                id="signup-username"
                                type="text"
                                name="username"
                                placeholder="Email/Username"
                                value={form.username}
                                onChange={handleChange}
                                className="auth-input"
                                autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="rgba(100,100,100,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="signup-password"
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                className="auth-input"
                                autoComplete="new-password"
                            />
                            <button type="button" className="auth-eye-btn"
                                onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                                <EyeIcon visible={showPass} />
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="rgba(100,100,100,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="signup-confirm-password"
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="auth-input"
                                autoComplete="new-password"
                            />
                            <button type="button" className="auth-eye-btn"
                                onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                                <EyeIcon visible={showConfirm} />
                            </button>
                        </div>

                        <button
                            id="signup-submit-btn"
                            type="submit"
                            className="auth-btn"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-switch__link">Log in</Link>
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
}

// Small reusable eye icon
function EyeIcon({ visible }) {
    return visible ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="rgba(100,100,100,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="rgba(100,100,100,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export default Signup;
