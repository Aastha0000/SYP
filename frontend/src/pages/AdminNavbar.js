import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../components/Navbar.css';

function AdminNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active-admin-link' : '';
    };

    return (
        <nav className="navbar navbar--solid">
            <div className="navbar__brand">ParyatanNepal Admin</div>

            <ul className="navbar__links">
                <li><Link to="/admin-dashboard/users" className={isActive('/admin-dashboard/users')}>Users</Link></li>
                <li><Link to="/admin-dashboard/guides" className={isActive('/admin-dashboard/guides')}>Guides</Link></li>
                <li><Link to="/admin-dashboard/destinations" className={isActive('/admin-dashboard/destinations')}>Destinations</Link></li>
                <li><Link to="/admin-dashboard/profile" className={isActive('/admin-dashboard/profile')}>Profile</Link></li>
            </ul>

            <div className="navbar__user">
                <div className="navbar__user-menu">
                    <button className="navbar__logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </nav>
    );
}

export default AdminNavbar;
