import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { getAdminData, verifyGuide, rejectGuide, getAllBookings } from '../services/api';
import { formatCurrency } from '../utils/currency';
import './AdminDashboard.css';

// ─── Elegant SVG Icons ────────────────────────────────────────────────────────
const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CrossIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

function AdminGuides() {
    const navigate = useNavigate();
    const [guides, setGuides] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [lastRefreshed, setLastRefreshed] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/login'); return; }
        try {
            const userObj = JSON.parse(userStr);
            if (userObj.role !== 'admin') { navigate('/'); return; }
        } catch (e) { navigate('/login'); return; }

        fetchAdminData(true);
        const interval = setInterval(() => fetchAdminData(false), 10000);
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchAdminData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [guidesRes, bookingsRes] = await Promise.all([
                getAdminData(),
                getAllBookings()
            ]);
            setGuides(guidesRes.data.guides || []);
            setBookings(bookingsRes.data || []);
            setLastRefreshed(new Date());
        } catch (err) {
            setError('Could not load administrative data.');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await verifyGuide(id);
            setSuccessMessage('Guide verified successfully! They can now log in.');
            fetchAdminData();
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify guide.');
            setTimeout(() => setError(''), 4000);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this guide? They will not be able to log in.')) return;
        try {
            await rejectGuide(id);
            setSuccessMessage('Guide has been rejected.');
            fetchAdminData();
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject guide.');
            setTimeout(() => setError(''), 4000);
        }
    };

    const getStatus = (guide) =>
        guide.verification_status || (guide.is_verified ? 'verified' : 'pending');

    const renderActions = (guide) => {
        const status = getStatus(guide);

        if (status === 'pending') {
            return (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="ag-btn ag-btn--verify" onClick={() => handleVerify(guide.id)}>
                        Verify
                    </button>
                    <button className="ag-btn ag-btn--reject" onClick={() => handleReject(guide.id)}>
                        Reject
                    </button>
                </div>
            );
        }

        if (status === 'verified') {
            return (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="ag-status-indicator ag-status-indicator--verified">
                        <CheckIcon /> Verified
                    </span>
                    <button className="ag-btn ag-btn--revoke" onClick={() => handleReject(guide.id)}>
                        Revoke
                    </button>
                </div>
            );
        }

        if (status === 'rejected') {
            return (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="ag-status-indicator ag-status-indicator--rejected">
                        <CrossIcon /> Rejected
                    </span>
                    <button className="ag-btn ag-btn--verify" onClick={() => handleVerify(guide.id)}>
                        Re-verify
                    </button>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="admin-dashboard">
            <AdminNavbar />
            <main className="admin-dashboard-main">
                <header className="admin-header">
                    <h1>Manage Guides</h1>
                    <p>View registered guides, check their earnings, and approve or reject guide registrations.</p>
                </header>

                {error && <div className="admin-error">{error}</div>}
                {successMessage && <div className="admin-success">{successMessage}</div>}

                <div className="admin-content">
                    <div className="admin-table-container">
                        {loading ? <p style={{ padding: '20px', color: '#666' }}>Loading data...</p> : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.1rem', margin: 0 }}>
                                        Registered Guides
                                    </h3>
                                    {lastRefreshed && (
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            fontSize: '0.78rem', color: '#64748b', fontWeight: '500'
                                        }}>
                                            <span style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                backgroundColor: '#22c55e', display: 'inline-block',
                                                boxShadow: '0 0 0 2px rgba(34,197,94,0.25)'
                                            }} />
                                            Live · Updated {lastRefreshed.toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Earnings (Total Paid)</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {guides.map(guide => {
                                            const status = getStatus(guide);
                                            return (
                                                <tr key={guide.id}>
                                                    <td>{guide.id}</td>
                                                    <td style={{ fontWeight: '600' }}>
                                                        <Link to={`/guides/${guide.id}`} style={{ textDecoration: 'none', color: '#1a73e8' }}>
                                                            {guide.username}
                                                        </Link>
                                                    </td>
                                                    <td>{guide.email}</td>
                                                    <td className="earnings-cell">
                                                        <span style={{ fontWeight: '700', fontSize: '0.97rem' }}>
                                                            {formatCurrency(parseFloat(guide.earnings || 0))}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${status}`}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td>{renderActions(guide)}</td>
                                                </tr>
                                            );
                                        })}
                                        {guides.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="empty-message">No guides found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <h3 style={{ marginTop: '40px', marginBottom: '16px', fontWeight: '700', color: '#1e293b', fontSize: '1.1rem' }}>
                                    System-wide Bookings
                                </h3>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Guide</th>
                                            <th>User</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(bk => (
                                            <tr key={bk.id}>
                                                <td>{bk.id}</td>
                                                <td style={{ fontWeight: '600' }}>{bk.guide_name}</td>
                                                <td>{bk.user_name}</td>
                                                <td>{new Date(bk.booking_date).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge ${bk.status === 'confirmed' ? 'verified' : 'pending'}`}>
                                                        {bk.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {bookings.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="empty-message">No bookings found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminGuides;
