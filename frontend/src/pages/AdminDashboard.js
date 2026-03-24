import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminData, verifyGuide, rejectGuide, uploadDestination, getAdminDestinations, deleteDestination } from '../services/api';
import ChatBox from '../components/ChatBox';
import { formatCurrency } from '../utils/currency';
import './AdminDashboard.css';

// Elegant SVG icons
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const CrossIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [guides, setGuides] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [activeChat, setActiveChat] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Upload Destination Form State
    const [destForm, setDestForm] = useState({
        name: '',
        altitude_range: '',
        trekking_complexity: '',
        duration: '',
        price_range: '',
        region: '',
        description: '',
        image: null
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        
        try {
            const userObj = JSON.parse(userStr);
            setCurrentUser(userObj);
            if (userObj.role !== 'admin') {
                navigate('/');
                return;
            }
        } catch (e) {
            navigate('/login');
            return;
        }

        fetchAdminData();
        const interval = setInterval(fetchAdminData, 10000); 
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const res = await getAdminData();
            setUsers(res.data.users || []);
            setGuides(res.data.guides || []);
            
            const destRes = await getAdminDestinations();
            setDestinations(destRes.data || []);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
            setError('Could not load data. Please make sure you are logged in as admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await verifyGuide(id);
            setSuccessMessage('Guide verified successfully!');
            fetchAdminData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify guide.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this guide? They will not be able to log in.')) return;
        try {
            await rejectGuide(id);
            setSuccessMessage('Guide rejected.');
            fetchAdminData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject guide.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const getStatus = (guide) => guide.verification_status || (guide.is_verified ? 'verified' : 'pending');

    const handleDeleteDestination = async (id) => {
        if (!window.confirm('Are you sure you want to delete this destination?')) return;
        
        try {
            await deleteDestination(id);
            setSuccessMessage('Destination deleted successfully!');
            fetchAdminData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete destination. Please try again.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleUploadChange = (e) => {
        if (e.target.name === 'image') {
            setDestForm({ ...destForm, image: e.target.files[0] });
        } else {
            setDestForm({ ...destForm, [e.target.name]: e.target.value });
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!destForm.name) {
            setError('Destination name is required.');
            setTimeout(() => setError(''), 3000);
            return;
        }
        
        const fd = new FormData();
        Object.keys(destForm).forEach(key => {
            if (destForm[key]) {
                fd.append(key, destForm[key]);
            }
        });

        try {
            await uploadDestination(fd);
            setSuccessMessage('Destination uploaded successfully!');
            setDestForm({
                name: '',
                altitude_range: '',
                trekking_complexity: '',
                duration: '',
                price_range: '',
                description: '',
                region: '',
                image: null
            });
            fetchAdminData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload destination. Please try again.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header-bar">
                <div className="admin-brand">ParyatanNepal Admin Area</div>
                <button className="admin-logout-btn" onClick={handleLogout}>Log Out</button>
            </header>
            
            <main className="admin-dashboard-main">
                <header className="admin-header">
                    <h1>Admin Control Panel</h1>
                    <p>Manage users, verify guides, and organize destinations across the platform.</p>
                </header>

                {error && <div className="admin-error">{error}</div>}
                {successMessage && <div className="admin-success">{successMessage}</div>}

                <div className="admin-content">
                    <nav className="admin-tabs">
                        <button 
                            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                        <button 
                            className={`admin-tab ${activeTab === 'guides' ? 'active' : ''}`}
                            onClick={() => setActiveTab('guides')}
                        >
                            Guides
                        </button>
                        <button 
                            className={`admin-tab ${activeTab === 'destinations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('destinations')}
                        >
                            Destinations Management
                        </button>
                    </nav>

                    <div className="admin-table-container">
                        {loading && <p>Loading data...</p>}
                        
                        {!loading && activeTab === 'users' && (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Full Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.full_name || '-'}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="empty-message">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {!loading && activeTab === 'guides' && (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Total Earnings</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guides.map(guide => (
                                        <tr key={guide.id}>
                                            <td>{guide.id}</td>
                                            <td>{guide.username}</td>
                                            <td>{guide.email}</td>
                                            <td className="earnings-cell">
                                                {guide.earnings ? formatCurrency(parseFloat(guide.earnings)) : 'NRs. 0.00 ($0.00)'}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${(guide.verification_status || (guide.is_verified ? 'verified' : 'pending'))}`}>
                                                    {(() => { const s = guide.verification_status || (guide.is_verified ? 'verified' : 'pending'); return s.charAt(0).toUpperCase() + s.slice(1); })()}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {(() => {
                                                        const status = guide.verification_status || (guide.is_verified ? 'verified' : 'pending');
                                                        if (status === 'pending') return (
                                                            <>
                                                                <button className="ag-btn ag-btn--verify" onClick={() => handleVerify(guide.id)}>Verify</button>
                                                                <button className="ag-btn ag-btn--reject" onClick={() => handleReject(guide.id)}>Reject</button>
                                                            </>
                                                        );
                                                        if (status === 'verified') return (
                                                            <>
                                                                <span className="ag-status-indicator ag-status-indicator--verified"><CheckIcon /> Verified</span>
                                                                <button className="ag-btn ag-btn--revoke" onClick={() => handleReject(guide.id)}>Revoke</button>
                                                            </>
                                                        );
                                                        if (status === 'rejected') return (
                                                            <>
                                                                <span className="ag-status-indicator ag-status-indicator--rejected"><CrossIcon /> Rejected</span>
                                                                <button className="ag-btn ag-btn--verify" onClick={() => handleVerify(guide.id)}>Re-verify</button>
                                                            </>
                                                        );
                                                        return null;
                                                    })()}
                                                    <button
                                                        className="ag-btn"
                                                        style={{ background: '#0070f3', color: '#fff' }}
                                                        onClick={() => setActiveChat(guide)}
                                                    >
                                                        Chat
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {guides.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="empty-message">No guides found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {!loading && activeTab === 'destinations' && (
                            <div className="destinations-management">
                                <div className="upload-section">
                                    <h2>Upload New Destination</h2>
                                    <form onSubmit={handleUploadSubmit} className="upload-form">
                                        <div className="form-group">
                                            <label>Destination Name *</label>
                                            <input type="text" name="name" value={destForm.name} onChange={handleUploadChange} required placeholder="e.g. Everest Base Camp" />
                                        </div>
                                        <div className="form-group">
                                            <label>Altitude Range</label>
                                            <input type="text" name="altitude_range" value={destForm.altitude_range} onChange={handleUploadChange} placeholder="e.g. 2,860m - 5,364m" />
                                        </div>
                                        <div className="form-group">
                                            <label>Trekking Complexity</label>
                                            <select name="trekking_complexity" value={destForm.trekking_complexity} onChange={handleUploadChange}>
                                                <option value="">Select Complexity</option>
                                                <option value="Easy">Easy</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Strenuous">Strenuous</option>
                                                <option value="Challenging">Challenging</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Duration</label>
                                            <input type="text" name="duration" value={destForm.duration} onChange={handleUploadChange} placeholder="e.g. 14 Days" />
                                        </div>
                                        <div className="form-group">
                                            <label>Price Range</label>
                                            <input type="text" name="price_range" value={destForm.price_range} onChange={handleUploadChange} placeholder="e.g. $1000 - $1500" />
                                        </div>
                                        <div className="form-group">
                                            <label>Region</label>
                                            <input type="text" name="region" value={destForm.region} onChange={handleUploadChange} placeholder="e.g. Himalayas, Nepal, Everest" />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Description</label>
                                            <textarea name="description" value={destForm.description} onChange={handleUploadChange} rows="2" placeholder="Brief description about the destination..."></textarea>
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Cover Image</label>
                                            <input type="file" name="image" onChange={handleUploadChange} accept="image/*" />
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="submit-btn text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md transition duration-200">
                                                Upload Destination
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className="existing-destinations">
                                    <h2>Existing Destinations</h2>
                                    <table className="admin-table mt-4">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Complexity</th>
                                                <th>Duration</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {destinations.map(dest => (
                                                <tr key={dest.id}>
                                                    <td>{dest.id}</td>
                                                    <td>{dest.name}</td>
                                                    <td>{dest.trekking_complexity || '-'}</td>
                                                    <td>{dest.duration || '-'}</td>
                                                    <td>
                                                        <button 
                                                            className="delete-btn"
                                                            onClick={() => handleDeleteDestination(dest.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {destinations.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="empty-message">No destinations uploaded yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {activeChat && (
                <ChatBox 
                    currentUser={currentUser} 
                    receiver={activeChat} 
                    onClose={() => setActiveChat(null)} 
                />
            )}
        </div>
    );
}

export default AdminDashboard;
