import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminNavbar from './AdminNavbar';
import Footer from '../components/Footer';
import { getUserBookings, getInbox, updateUser } from '../services/api';
import ChatBox from '../components/ChatBox';
import './AdminDashboard.css'; // Reuse CSS layout

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [inbox, setInbox] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [activeChat, setActiveChat] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        try {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            setFullName(parsedUser.full_name || '');
            setGender(parsedUser.gender || '');
            fetchData(parsedUser.id);
        } catch (e) {
            navigate('/login');
        }
    }, [navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('full_name', fullName);
            data.append('gender', gender);
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
                setStatus('Profile updated!');
                setTimeout(() => setStatus(''), 3000);
            }
        } catch (err) {
            alert('Failed to update profile.');
        }
    };

    const fetchData = async (userId) => {
        setLoadingBookings(true);
        try {
            const [bkRes, inRes] = await Promise.all([
                getUserBookings(userId),
                getInbox(userId)
            ]);
            setBookings(bkRes.data);
            setInbox(inRes.data);
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoadingBookings(false);
        }
    };

    if (!user) return <p>Loading...</p>;

    const isAdmin = user.role === 'admin';

    return (
        <div className="admin-dashboard">
            {isAdmin ? <AdminNavbar /> : <Navbar />}

            <main className="admin-dashboard-main" style={{ marginTop: isAdmin ? '20px' : '80px' }}>
                <header className="admin-header">
                    <h1>My Profile</h1>
                    <p>View your personal account details and bookings.</p>
                </header>

                <div className="admin-content" style={{ display: 'flex', gap: '30px', padding: '30px' }}>
                    <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        {status && <div style={{backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold'}}>{status}</div>}
                        
                        {isEditing ? (
                            <form onSubmit={handleUpdate}>
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f1f5f9', margin: '0 auto 10px', overflow: 'hidden' }}>
                                        {previewUrl ? <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                                            user.profile_picture ? <img src={`http://localhost:5001/uploads/${user.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null
                                        )}
                                    </div>
                                    <input type="file" onChange={handleFileChange} accept="image/*" style={{ fontSize: '0.8rem' }} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Full Name</label>
                                    <input 
                                        type="text" 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Gender</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}
                                    >
                                        <option value="">Not specified</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                                    <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '100px', 
                                        height: '100px', 
                                        borderRadius: '50%', 
                                        backgroundColor: '#e9ecef', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        margin: '0 auto',
                                        fontSize: '2.5rem',
                                        color: '#adb5bd',
                                        overflow: 'hidden'
                                    }}>
                                        {user.profile_picture ? (
                                            <img 
                                                src={`http://localhost:5001/uploads/${user.profile_picture}`} 
                                                alt="Profile" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <span>{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Full Name</label>
                                    <div style={{ fontSize: '1rem', color: '#333' }}>{user.full_name || 'Not set'}</div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Username</label>
                                    <div style={{ fontSize: '1rem', color: '#333' }}>{user.username}</div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Email</label>
                                    <div style={{ fontSize: '1rem', color: '#333' }}>{user.email}</div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Role</label>
                                    <div style={{ fontSize: '1rem', color: '#1a73e8', textTransform: 'capitalize' }}>{user.role}</div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Gender</label>
                                    <div style={{ fontSize: '1rem', color: '#333' }}>{user.gender || 'Not specified'}</div>
                                </div>

                                <button 
                                    onClick={() => setIsEditing(true)}
                                    style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#1a73e8', border: '1px solid #1a73e8', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
                                >
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </div>

                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        


                        {!isAdmin && (
                            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginBottom: '20px' }}>My Bookings</h3>
                                {loadingBookings ? <p>Loading bookings...</p> : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                                <th style={{ padding: '10px' }}>Guide</th>
                                                <th style={{ padding: '10px' }}>Date</th>
                                                <th style={{ padding: '10px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(bk => (
                                                <tr key={bk.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '10px' }}>{bk.guide_name || bk.guide_username}</td>
                                                    <td style={{ padding: '10px' }}>{new Date(bk.booking_date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', textTransform: 'capitalize' }}>{bk.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {bookings.length === 0 && (
                                                <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No bookings found. <Link to="/guides">Book a guide</Link></td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {activeChat && (
                <ChatBox 
                    currentUser={user} 
                    receiver={activeChat} 
                    onClose={() => setActiveChat(null)} 
                />
            )}

            {!isAdmin && <Footer />}
        </div>
    );
}

export default Profile;
