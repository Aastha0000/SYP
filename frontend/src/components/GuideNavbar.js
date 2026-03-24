import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getUnreadCount } from '../services/api';
import './Navbar.css';

function GuideNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await getUnreadCount(user.id);
                setUnreadCount(res.data.unread_count);
            } catch (err) {}
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 10000); // 10s polling
        return () => clearInterval(interval);
    }, [user.id]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar--solid" style={{ backgroundColor: '#2d6a4f', display: 'flex', alignItems: 'center', padding: '10px 40px' }}>
            <Link to="/guide/home" className="navbar__brand" style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textDecoration: 'none'}}>
                Paryatan<span style={{color: '#a47148'}}>Nepal</span>
            </Link>

            <div style={{ marginLeft: '40px', display: 'flex', alignItems: 'center', gap: '30px' }}>
                <Link to="/guide/home" style={{ color: 'white', textDecoration: 'none', fontWeight: location.pathname === '/guide/home' ? 'bold' : 'normal', opacity: 0.9 }}>Home</Link>
                
                <Link to="/guide/messages" style={{ position: 'relative', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ff3b30', color: 'white',
                            fontSize: '0.65rem', fontWeight: 'bold', minWidth: '18px', height: '18px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #2d6a4f'
                        }}>{unreadCount}</span>
                    )}
                </Link>

                <Link to="/guide/profile" style={{ color: 'white', textDecoration: 'none', fontWeight: location.pathname === '/guide/profile' ? 'bold' : 'normal', opacity: 0.9 }}>Profile</Link>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                <div className="navbar__user" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' }}>
                    <div className="navbar__user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className="navbar__username" style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>@{user.username}</span>
                        <button className="navbar__logout-btn" onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid white', padding: '6px 16px', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Logout</button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default GuideNavbar;
