import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuideNavbar from '../components/GuideNavbar';
import Footer from '../components/Footer';
import './GuideDashboard.css';
import { updateUser } from '../services/api';

function GuideProfileSettings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        languages_spoken: '',
        specialities: '',
        bio: '',
        portfolio_url: '',
        gender: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        setFormData({
            full_name: parsed.full_name || '',
            languages_spoken: parsed.languages_spoken || '',
            specialities: parsed.specialities || '',
            bio: parsed.bio || '',
            portfolio_url: parsed.portfolio_url || '',
            gender: parsed.gender || ''
        });
    }, [navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        try {
            const data = new FormData();
            data.append('full_name', formData.full_name);
            data.append('languages_spoken', formData.languages_spoken);
            data.append('specialities', formData.specialities);
            data.append('bio', formData.bio);
            data.append('portfolio_url', formData.portfolio_url);
            data.append('gender', formData.gender);
            if (selectedFile) {
                data.append('profilePicture', selectedFile);
            }

            const res = await updateUser(user.id, data);
            if (res.status === 200) {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
                setIsEditing(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setStatus('Profile updated successfully!');
                setTimeout(() => setStatus(''), 3000);
            }
        } catch (err) {
            alert('Failed to update profile.');
        }
    };

    const SPECIALITY_OPTIONS = ['Trekking', 'Peak Climbing', 'Cultural Tours', 'Jungle Safari', 'River Rafting', 'Rock Climbing', 'Bird Watching', 'Photography Tours'];
    const LANGUAGE_OPTIONS = ['English', 'Nepali', 'Hindi', 'Chinese', 'Japanese', 'German', 'French', 'Spanish', 'Russian'];

    if (!user) return null;

    return (
        <div className="guide-dashboard-root">
            <GuideNavbar />
            <main className="guide-main">
                <div className="guide-container" style={{maxWidth: '800px', margin: '0 auto', padding: '40px 20px'}}>
                    <header className="guide-header" style={{marginBottom: '40px'}}>
                        <h1 style={{fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px'}}>Guide Profile</h1>
                        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.9)'}}>Manage your professional details and how you appear to trekkers.</p>
                    </header>

                    <div className="guide-section" style={{padding: 0, backgroundColor: 'transparent', boxShadow: 'none'}}>
                        {status && <div style={{padding: '15px 20px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '12px', marginBottom: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            {status}
                        </div>}
                        
                        <div style={{display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', padding: '30px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #efefef', boxShadow: '0 10px 30px rgba(0,0,0,0.03)'}}>
                            <div style={{width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#2d6a4f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', boxShadow: '0 8px 16px rgba(45, 106, 79, 0.2)', overflow: 'hidden'}}>
                                {user.profile_picture ? (
                                    <img src={`http://localhost:5001/uploads/${user.profile_picture}`} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                ) : (
                                    <span>{user.username[0].toUpperCase()}</span>
                                )}
                            </div>
                            <div>
                                <h2 style={{margin: 0, fontSize: '1.8rem', fontWeight: '900'}}>{user.full_name || user.username}</h2>
                                <p style={{color: '#8e8e8e', margin: '5px 0', fontSize: '1rem'}}>{user.email}</p>
                                <span style={{backgroundColor: '#e8f5e9', color: '#2d6a4f', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800', display: 'inline-block', marginTop: '10px'}}>Verified Guide</span>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#fff', 
                            borderRadius: '24px', 
                            border: '1px solid #efefef', 
                            padding: '40px',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)'
                        }}>
                            {isEditing ? (
                                <form onSubmit={handleUpdate} style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px'}}>
                                        <div style={{width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e2e8f0', border: '3px solid white', flexShrink: 0}}>
                                            {previewUrl ? <img src={previewUrl} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : (
                                                user.profile_picture ? <img src={`http://localhost:5001/uploads/${user.profile_picture}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null
                                            )}
                                        </div>
                                        <div>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: '800', fontSize: '0.8rem', color: '#64748b'}}>Profile Picture</label>
                                            <input type="file" onChange={handleFileChange} accept="image/*" />
                                        </div>
                                    </div>

                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
                                        <div>
                                            <label style={{display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Full Name</label>
                                            <input 
                                                type="text" 
                                                value={formData.full_name} 
                                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                                style={{width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'}}
                                            />
                                        </div>

                                        <div>
                                            <label style={{display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Speciality</label>
                                            <select 
                                                value={formData.specialities} 
                                                onChange={(e) => setFormData({...formData, specialities: e.target.value})}
                                                style={{width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none', backgroundColor: 'white'}}
                                            >
                                                <option value="">Select Speciality</option>
                                                {SPECIALITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Main Language</label>
                                            <select 
                                                value={formData.languages_spoken} 
                                                onChange={(e) => setFormData({...formData, languages_spoken: e.target.value})}
                                                style={{width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none', backgroundColor: 'white'}}
                                            >
                                                <option value="">Select Language</option>
                                                {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Portfolio / Social Link</label>
                                            <input 
                                                type="url" 
                                                placeholder="https://example.com"
                                                value={formData.portfolio_url} 
                                                onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})}
                                                style={{width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none'}}
                                            />
                                        </div>

                                        <div>
                                            <label style={{display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Gender</label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                                style={{width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none', backgroundColor: 'white'}}
                                            >
                                                <option value="">Not specified</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                                <option value="Prefer not to say">Prefer not to say</option>
                                            </select>
                                        </div>

                                        <div style={{gridColumn: '1 / -1'}}>
                                            <label style={{display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'}}>About / Bio</label>
                                            <textarea 
                                                value={formData.bio} 
                                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                placeholder="Tell trekkers about your experience, certifications, and why they should book you..."
                                                style={{width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none', minHeight: '120px', fontFamily: 'inherit'}}
                                            />
                                        </div>
                                    </div>

                                    <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
                                        <button type="submit" style={{backgroundColor: '#2d6a4f', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 10px 20px rgba(45, 106, 79, 0.2)'}}>Save All Changes</button>
                                        <button type="button" onClick={() => setIsEditing(false)} style={{backgroundColor: '#f8fafc', color: '#64748b', border: '2px solid #f1f5f9', padding: '16px 40px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem'}}>Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '40px'}}>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px 60px'}}>
                                        <div>
                                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em'}}>Full Name</label>
                                            <div style={{fontSize: '1.25rem', color: '#1e293b', fontWeight: '600'}}>{user.full_name || 'Not specified'}</div>
                                        </div>
                                        <div>
                                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em'}}>Speciality</label>
                                            <div style={{fontSize: '1.25rem', color: '#1e293b', fontWeight: '600'}}>{user.specialities || 'None set'}</div>
                                        </div>
                                        <div>
                                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em'}}>Languages Spoken</label>
                                            <div style={{fontSize: '1.25rem', color: '#1e293b', fontWeight: '600'}}>{user.languages_spoken || 'English'}</div>
                                        </div>
                                        <div>
                                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em'}}>Gender</label>
                                            <div style={{fontSize: '1.25rem', color: '#1e293b', fontWeight: '600'}}>{user.gender || 'Not specified'}</div>
                                        </div>
                                        <div>
                                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em'}}>Portfolio Link</label>
                                            {user.portfolio_url ? (
                                                <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" style={{fontSize: '1.25rem', color: '#3182ce', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    {user.portfolio_url} 
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                                </a>
                                            ) : (
                                                <div style={{fontSize: '1.25rem', color: '#94a3b8', fontWeight: '600'}}>Not linked</div>
                                            )}
                                        </div>
                                        <div style={{gridColumn: '1 / -1'}}>
                                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em'}}>About / Bio</label>
                                            <div style={{fontSize: '1.1rem', color: '#475569', lineHeight: '1.6', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px'}}>{user.bio || 'Please update your bio to help trekkers know you better.'}</div>
                                        </div>
                                    </div>
                                    <div style={{borderTop: '2px solid #f8fafc', paddingTop: '40px', display: 'flex', justifyContent: 'flex-start'}}>
                                        <button 
                                            onClick={() => setIsEditing(true)} 
                                            style={{backgroundColor: '#2d6a4f', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 10px 25px rgba(45, 106, 79, 0.4)', fontSize: '1rem'}}
                                        >
                                            Update Profile Info
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default GuideProfileSettings;
