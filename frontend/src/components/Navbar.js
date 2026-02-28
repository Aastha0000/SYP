import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ transparent = false }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className={`navbar ${transparent ? 'navbar--transparent' : 'navbar--solid'}`}>
            <Link to="/" className="navbar__brand">ParyatanNepal</Link>

            <ul className="navbar__links">
                <li><Link to="/">Home</Link></li>
                <li><a href="#destinations">Destinations</a></li>
                <li><a href="#guides">Guides</a></li>
            </ul>

            <div className="navbar__user">
                {token ? (
                    <div className="navbar__user-menu">
                        <span className="navbar__username">👤 {user?.username}</span>
                        <button className="navbar__logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="navbar__icon" title="Login">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
