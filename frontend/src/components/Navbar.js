import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUnreadCount } from '../services/api';
import './Navbar.css';

function Navbar({ transparent = false }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user || !user.id) return;
        const fetchUnread = async () => {
            try {
                const res = await getUnreadCount(user.id);
                setUnreadCount(res.data.unread_count);
            } catch (err) {}
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 10000); 
        return () => clearInterval(interval);
    }, [user?.id]);

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
                <li><Link to="/user/destinations">Destinations</Link></li>
                <li><Link to="/guides">Guides</Link></li>
            </ul>

            <div className="navbar__user">
                {token ? (
                    <div className="navbar__user-menu" style={{display: 'flex', alignItems: 'center', gap: '25px'}}>
                        <Link to="/user/messages" style={{ position: 'relative', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ff3b30', color: 'white',
                                    fontSize: '0.65rem', fontWeight: 'bold', minWidth: '18px', height: '18px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>{unreadCount}</span>
                            )}
                        </Link>
                        
                        <Link to="/user/profile" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>Profile</Link>
                        
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '15px'}}>
                            <span className="navbar__username" style={{fontSize: '0.85rem'}}>@{user?.username}</span>
                            <button className="navbar__logout-btn" onClick={handleLogout} style={{backgroundColor: 'transparent', border: '1px solid white', color: 'white', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem'}}>Logout</button>
                        </div>
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
