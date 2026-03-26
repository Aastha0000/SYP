import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getGuides } from '../services/api';
import ChatBox from '../components/ChatBox';

function PublicGuides() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeChatGuide, setActiveChatGuide] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const res = await getGuides();
                setGuides(res.data || []);
            } catch (err) {
                setError('Failed to load guides.');
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, []);

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            
            <main style={{ marginTop: '100px', flex: 1, padding: '0 40px', maxWidth: '1200px', margin: '100px auto 40px', width: '100%' }}>
                <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '10px' }}>Our Verified Guides</h1>
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>Connect with local experts to make your journey memorable.</p>
                </header>

                {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
                {loading && <div style={{ textAlign: 'center' }}>Loading guides...</div>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {!loading && guides.map(guide => (
                        <div key={guide.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <div style={{ width: '100px', height: '100px', margin: '0 auto 20px', borderRadius: '50%', backgroundColor: '#e9ecef', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#aaa' }}>
                                {guide.profile_picture ? (
                                    <img src={`http://localhost:5001/uploads/${guide.profile_picture}`} alt={guide.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span>{guide.username.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <h3 style={{ fontSize: '1.3rem', color: '#333', marginBottom: '8px' }}>{guide.full_name || guide.username}</h3>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ display: 'inline-block', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    Verified Guide
                                </span>
                            </div>

                            <div style={{ textAlign: 'left', marginTop: '20px', fontSize: '0.95rem', color: '#555' }}>
                                <div style={{ marginBottom: '8px' }}><strong>Languages:</strong> {guide.languages_spoken || 'Not specified'}</div>
                                <div style={{ marginBottom: '8px' }}><strong>Specialities:</strong> {guide.specialities || 'Not specified'}</div>
                                {guide.portfolio_url && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <strong>Portfolio:</strong> <a href={guide.portfolio_url.startsWith('http') ? guide.portfolio_url : `https://${guide.portfolio_url}`} target="_blank" rel="noopener noreferrer" style={{color: '#1a73e8', textDecoration: 'none'}}>View Link</a>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <Link to={`/guides/${guide.id}`} style={{ flex: 1, padding: '10px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    View Profile
                                </Link>
                                <button 
                                    style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', color: '#1a73e8', border: '1px solid #1a73e8', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                                    onClick={() => currentUser ? setActiveChatGuide(guide) : window.location.href = '/login'}
                                >
                                    Message
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && guides.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>
                            No verified guides available at the moment.
                        </div>
                    )}
                </div>
            </main>

            {activeChatGuide && (
                <ChatBox 
                    currentUser={currentUser} 
                    receiver={activeChatGuide} 
                    onClose={() => setActiveChatGuide(null)} 
                />
            )}

            <Footer />
        </div>
    );
}

export default PublicGuides;
