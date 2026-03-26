import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { getAdminData } from '../services/api';
import './AdminDashboard.css';

function AdminUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        
        try {
            const userObj = JSON.parse(userStr);
            if (userObj.role !== 'admin') {
                navigate('/');
                return;
            }
        } catch (e) {
            navigate('/login');
            return;
        }

        fetchAdminData();
    }, [navigate]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const res = await getAdminData();
            setUsers(res.data.users || []);
        } catch (err) {
            setError('Could not load user data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <AdminNavbar />
            <main className="admin-dashboard-main">
                <header className="admin-header">
                    <h1>Manage Users</h1>
                    <p>View all registered users on the platform.</p>
                </header>
                {error && <div className="admin-error">{error}</div>}
                
                <div className="admin-content">
                    <div className="admin-table-container">
                        {loading ? <p>Loading data...</p> : (
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
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminUsers;
