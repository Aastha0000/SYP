import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import { signupUser, loginUser } from '../services/api';
import './Auth.css';

function Signup() {
    const navigate = useNavigate();
    const [role, setRole] = useState('user'); // 'user' | 'guide'
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        languages: '',
        specialities: '',
        gender: ''
    });
    const [files, setFiles] = useState({
        profilePicture: null,
        licence: null
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { fullName, email, password, confirmPassword, languages, specialities } = form;

        if (!fullName || !email || !password || !confirmPassword) {
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

        const formData = new FormData();
        formData.append('username', fullName); // map to backend username
        formData.append('fullName', fullName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('gender', form.gender);

        if (role === 'guide') {
            formData.append('languages', languages);
            formData.append('specialities', specialities);
            if (files.profilePicture) formData.append('profilePicture', files.profilePicture);
            if (files.licence) formData.append('licence', files.licence);
        }

        setLoading(true);
        try {
            await signupUser(formData);
            
            if (role === 'guide') {
                setSuccess('Signup successful! Your account is pending admin verification.');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                const loginRes = await loginUser({ identifier: email, password });
                localStorage.setItem('token', loginRes.data.token);
                localStorage.setItem('user', JSON.stringify(loginRes.data.user));

                setSuccess('Welcome to the community!');
                navigate('/');
            }
        } catch (err) {
            console.error("AXIOS ERROR:", err);
            setError(err.response?.data?.message || err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div
                className="auth-hero"
                style={{ backgroundImage: "url('/img/ilam.png')" }}
            >
                {/* ParyatanNepal branding top left (simulate header) */}
                <div className="auth-header-fake">
                    <span className="auth-brand">ParyatanNepal</span>
                    <nav className="auth-nav">
                        <Link to="/">Home</Link>
                        <Link to="/#destinations">Destinations</Link>
                        <Link to="/#guides">Guides</Link>
                        <Link to="/login" className="auth-icon-link">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </Link>
                    </nav>
                </div>

                <div className="auth-card auth-card--large">
                    <div className="auth-toggle">
                        <button
                            type="button"
                            className={`auth-toggle__btn ${role === 'user' ? 'auth-toggle__btn--active' : ''}`}
                            onClick={() => setRole('user')}
                        >
                            User
                        </button>
                        <button
                            type="button"
                            className={`auth-toggle__btn ${role === 'guide' ? 'auth-toggle__btn--active' : ''}`}
                            onClick={() => setRole('guide')}
                        >
                            Guide
                        </button>
                    </div>

                    {error && <p className="auth-error">{error}</p>}
                    {success && <p className="auth-success">{success}</p>}

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="form-row">
                            <div className="auth-input-wrap half">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(100,100,100,0.7)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                <input type="text" name="fullName" placeholder="Full name" value={form.fullName} onChange={handleChange} className="auth-input" />
                            </div>
                            <div className="auth-input-wrap half">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(100,100,100,0.7)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                </span>
                                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="auth-input" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="auth-input-wrap half">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(100,100,100,0.7)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </span>
                                <input type={showPass ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} className="auth-input" />
                                <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)}><EyeIcon visible={showPass} /></button>
                            </div>
                            <div className="auth-input-wrap half">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(100,100,100,0.7)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </span>
                                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="auth-input" />
                                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(!showConfirm)}><EyeIcon visible={showConfirm} /></button>
                            </div>
                        </div>

                        {/* Gender — shown for both roles */}
                        <div className="form-row" style={{ marginTop: '4px' }}>
                            <div className="auth-input-wrap half select-wrap">
                                <select name="gender" value={form.gender} onChange={handleChange} className="auth-input">
                                    <option value="">Gender (optional)</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        {role === 'guide' && (
                            <>
                                <div className="form-row guide-labels">
                                    <div className="half"><label>Languages spoken</label></div>
                                    <div className="half"><label>Specialities</label></div>
                                </div>
                                <div className="form-row">
                                    <div className="auth-input-wrap half select-wrap">
                                        <select name="languages" value={form.languages} onChange={handleChange} className="auth-input">
                                            <option value="">Select</option>
                                            <option value="English">English</option>
                                            <option value="Nepali">Nepali</option>
                                            <option value="Hindi">Hindi</option>
                                        </select>
                                    </div>
                                    <div className="auth-input-wrap half select-wrap">
                                        <select name="specialities" value={form.specialities} onChange={handleChange} className="auth-input">
                                            <option value="">Select</option>
                                            <option value="Trekking">Trekking</option>
                                            <option value="City Tour">City Tour</option>
                                            <option value="Wildlife">Wildlife</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="uploads-section">
                                    <h4>Uploads</h4>
                                    <div className="form-row">
                                        <div className="auth-input-wrap half file-wrap">
                                            <label className="file-label">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                <span>{files.profilePicture ? files.profilePicture.name : 'Upload profile picture'}</span>
                                                <input type="file" name="profilePicture" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <div className="auth-input-wrap half file-wrap">
                                            <label className="file-label">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                <span>{files.licence ? files.licence.name : 'Upload your licence and certifications'}</span>
                                                <input type="file" name="licence" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" className="auth-btn auth-submit-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'Sign up'}
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
