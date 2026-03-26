import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import { loginUser } from '../services/api';
import './Auth.css';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.identifier || !form.password) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            const res = await loginUser({ identifier: form.identifier, password: form.password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            if (res.data.user.role === 'guide') {
                navigate('/guide-dashboard');
            } else if (res.data.user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error("AXIOS ERROR:", err);
            setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Hero background: boudha.png */}
            <div
                className="auth-hero"
                style={{ backgroundImage: "url('/img/boudha.png')" }}
            >


                <div className="auth-card">
                    <h2 className="auth-card__title">Welcome back!</h2>

                    {error && <p className="auth-error">{error}</p>}

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
                                id="login-identifier"
                                type="text"
                                name="identifier"
                                placeholder="Email/Username"
                                value={form.identifier}
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
                                id="login-password"
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                className="auth-input"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="auth-eye-btn"
                                onClick={() => setShowPass(!showPass)}
                                aria-label="Toggle password visibility"
                            >
                                {showPass ? (
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
                                )}
                            </button>
                        </div>

                        <div className="auth-forgot">
                            <Link to="#">Forgot password?</Link>
                        </div>

                        <button
                            id="login-submit-btn"
                            type="submit"
                            className="auth-btn"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-switch__link">Sign up</Link>
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Login;
