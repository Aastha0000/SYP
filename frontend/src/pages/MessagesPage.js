import React, { useEffect, useState, useCallback } from 'react';
import GuideNavbar from '../components/GuideNavbar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatBox from '../components/ChatBox';
import './GuideDashboard.css';
import { getInbox, searchUsers, markConversationRead, updateUser } from '../services/api';

function MessagesPage() {
    const [inbox, setInbox] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ full_name: '', specialities: '', languages_spoken: '' });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Select correct Navbar
    const NavComponent = user.role === 'guide' ? GuideNavbar : Navbar;

    const handleMarkRead = useCallback(async (otherId) => {
        try {
            await markConversationRead(user.id, otherId);
            setInbox(prev => prev.map(chat => 
                chat.id === otherId ? { ...chat, unread_count: 0 } : chat
            ));
        } catch (err) {}
    }, [user.id]);

    const fetchInboxData = useCallback(async () => {
        try {
            const res = await getInbox(user.id);
            setInbox(res.data);
            
            if (activeChat) {
                const updatedActive = res.data.find(c => c.id === activeChat.id);
                if (updatedActive && updatedActive.unread_count > 0) {
                    handleMarkRead(updatedActive.id);
                }
            }
        } catch (err) {
            console.error('Error fetching inbox:', err);
        }
    }, [user.id, activeChat, handleMarkRead]);

    useEffect(() => {
        if (!user.id) return;
        fetchInboxData();
        const interval = setInterval(fetchInboxData, 5000);
        return () => clearInterval(interval);
    }, [user.id, fetchInboxData]);

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length > 2) {
            const res = await searchUsers(val, ''); 
            setSearchResults(res.data.filter(u => u.id !== user.id));
        } else {
            setSearchResults([]);
        }
    };

    const selectChat = (e, chat) => {
        if (e) e.stopPropagation();
        setActiveChat(chat);
        setSearchQuery('');
        setSearchResults([]);
        if (chat.unread_count > 0) {
            handleMarkRead(chat.id);
        }
    };

    const openProfile = (e, profile) => {
        if (e) e.stopPropagation();
        setSelectedProfile(profile);
        setIsEditing(false);
        setEditData({
            full_name: profile.full_name || '',
            specialities: profile.specialities || '',
            languages_spoken: profile.languages_spoken || '',
            portfolio_url: profile.portfolio_url || ''
        });
    };

    const handleSaveProfile = async () => {
        try {
            const res = await updateUser(user.id, editData);
            if (res.status === 200) {
                // Update local storage
                const updatedUser = { ...user, ...editData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Update state
                setSelectedProfile({ ...selectedProfile, ...editData });
                setIsEditing(false);
                fetchInboxData();
                alert('Profile updated successfully!');
            }
        } catch (err) {
            console.error('Update profile error:', err);
            alert('Failed to update profile.');
        }
    };

    return (
        <div className="guide-dashboard-root" style={{backgroundColor: '#fafafa', minHeight: '100vh'}}>
            <NavComponent />
            <main className={user.role === 'guide' ? "guide-main" : "user-main"} style={{padding: '20px 0'}}>
                <div className={user.role === 'guide' ? "guide-container" : "user-container"} style={{maxWidth: '1200px', height: 'calc(100vh - 140px)', margin: '0 auto'}}>
                    <div className={user.role === 'guide' ? "guide-section" : "user-section"} style={{height: '100%', padding: 0, display: 'flex', overflow: 'hidden', borderRadius: '12px', border: '1px solid #dbdbdb', backgroundColor: 'white', boxShadow: '0 1px 10px rgba(0,0,0,0.05)'}}>
                        
                        {/* Unified Sidebar */}
                        <div style={{width: '350px', borderRight: '1px solid #dbdbdb', display: 'flex', flexDirection: 'column', backgroundColor: '#fff'}} onClick={() => setActiveChat(null)}>
                            <div style={{padding: '20px 20px 15px 20px', borderBottom: '1px solid #efefef'}} onClick={(e) => e.stopPropagation()}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h2 
                                        onClick={(e) => openProfile(e, user)} 
                                        style={{fontSize: '1.4rem', fontWeight: '800', margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}
                                    >
                                        {user.username}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                    </h2>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </div>
                                
                                <div style={{position: 'relative'}}>
                                    <input 
                                        type="text" 
                                        placeholder="Search" 
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        style={{width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#efefef', outline: 'none', fontSize: '0.9rem'}}
                                    />
                                    {searchResults.length > 0 && (
                                        <div style={{position: 'absolute', top: '45px', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #dbdbdb', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '12px', zIndex: 100, maxHeight: '300px', overflowY: 'auto'}}>
                                            {searchResults.map(u => (
                                                <div key={u.id} onClick={(e) => selectChat(e, u)} style={{padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.2s'}}>
                                                    <div onClick={(e) => openProfile(e, u)} style={{width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold', overflow: 'hidden'}}>
                                                        {u.profile_picture ? <img src={`http://localhost:5001/uploads/${u.profile_picture}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="" /> : u.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{fontWeight: '700', fontSize: '0.9rem'}}>{u.full_name || u.username}</div>
                                                        <div style={{fontSize: '0.75rem', color: '#8e8e8e'}}>{u.role}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{flex: 1, overflowY: 'auto'}}>
                                {inbox.length > 0 ? (
                                    inbox.map(chat => (
                                        <div 
                                            key={chat.id} 
                                            onClick={(e) => selectChat(e, chat)}
                                            style={{
                                                padding: '12px 20px', 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '12px',
                                                backgroundColor: activeChat?.id === chat.id ? '#efefef' : 'transparent',
                                                transition: 'all 0.1s ease',
                                            }}
                                            className="sidebar-item"
                                        >
                                            <div onClick={(e) => openProfile(e, chat)} style={{width: '56px', height: '56px', borderRadius: '50%', border: '1px solid #dbdbdb', padding: '2px', backgroundColor: 'white'}}>
                                                 <div style={{width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    {chat.profile_picture ? (
                                                        <img src={`http://localhost:5001/uploads/${chat.profile_picture}`} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                    ) : (
                                                        <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{chat.username[0].toUpperCase()}</span>
                                                    )}
                                                 </div>
                                            </div>
                                            <div style={{flex: 1, overflow: 'hidden'}}>
                                                <div style={{fontWeight: '700', fontSize: '0.9rem', color: '#262626'}}>
                                                    {chat.full_name || chat.username}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.85rem', 
                                                    color: chat.unread_count > 0 ? '#000' : '#8e8e8e', 
                                                    whiteSpace: 'nowrap', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis', 
                                                    fontWeight: chat.unread_count > 0 ? '700' : '400',
                                                    marginTop: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <span style={{flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis'}}>{chat.last_message}</span>
                                                    <span style={{color: '#8e8e8e'}}>·</span>
                                                    <span style={{flexShrink: 0, color: '#8e8e8e'}}>{new Date(chat.last_message_time).toLocaleDateString() === new Date().toLocaleDateString() ? 
                                                        '1h' : '1d'}</span>
                                                </div>
                                            </div>
                                            {chat.unread_count > 0 && (
                                                <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0095f6'}}></div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    !searchQuery && (
                                        <div style={{textAlign: 'center', padding: '100px 20px', color: '#8e8e8e'}}>
                                            <p style={{fontSize: '1rem', fontWeight: '500', color: '#262626'}}>No conversations yet</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Chat Panel */}
                        <div style={{flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column'}}>
                            {activeChat ? (
                                <ChatBox 
                                    currentUser={user} 
                                    receiver={activeChat} 
                                    onClose={() => setActiveChat(null)}
                                    inline={true}
                                />
                            ) : (
                                <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center'}}>
                                    <div style={{width: '96px', height: '96px', borderRadius: '50%', border: '2px solid #262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: '15px'}}>
                                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                    </div>
                                    <h2 style={{fontSize: '1.4rem', fontWeight: '400'}}>Your Messages</h2>
                                    <p style={{color: '#8e8e8e', marginTop: '10px', fontSize: '0.95rem', maxWidth: '280px'}}>Send private photos and messages to a friend or group.</p>
                                    <button 
                                        onClick={() => document.querySelector('input[placeholder="Search"]').focus()} 
                                        style={{marginTop: '20px', backgroundColor: '#0095f6', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'}}
                                    >
                                        Send Message
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Profile Modal / Edit Flow */}
            {selectedProfile && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}} onClick={() => setSelectedProfile(null)}>
                    <div style={{backgroundColor: 'white', width: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}} onClick={e => e.stopPropagation()}>
                        <div style={{padding: '30px', textAlign: 'center'}}>
                            <div style={{width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 20px', border: '1px solid #dbdbdb', padding: '3px'}}>
                                <div style={{width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    {selectedProfile.profile_picture ? (
                                        <img src={`http://localhost:5001/uploads/${selectedProfile.profile_picture}`} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    ) : (
                                        <span style={{fontSize: '3rem', fontWeight: 'bold'}}>{selectedProfile.username[0].toUpperCase()}</span>
                                    )}
                                </div>
                            </div>
                            
                            {isEditing ? (
                                <div style={{textAlign: 'left', marginBottom: '20px'}}>
                                    <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#8e8e8e', marginBottom: '5px'}}>FULL NAME</label>
                                    <input 
                                        type="text" 
                                        value={editData.full_name} 
                                        onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                                        style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dbdbdb', marginBottom: '15px'}}
                                    />
                                    <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#8e8e8e', marginBottom: '5px'}}>SPECIALITIES</label>
                                    <input 
                                        type="text" 
                                        value={editData.specialities} 
                                        onChange={(e) => setEditData({...editData, specialities: e.target.value})}
                                        style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dbdbdb', marginBottom: '15px'}}
                                    />
                                    <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#8e8e8e', marginBottom: '5px'}}>LANGUAGES</label>
                                    <input 
                                        type="text" 
                                        value={editData.languages_spoken} 
                                        onChange={(e) => setEditData({...editData, languages_spoken: e.target.value})}
                                        style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dbdbdb'}}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 style={{fontSize: '1.5rem', marginBottom: '5px'}}>{selectedProfile.full_name || selectedProfile.username}</h2>
                                    <p style={{color: '#8e8e8e', fontSize: '0.9rem', marginBottom: '20px'}}>@{selectedProfile.username} · {selectedProfile.role}</p>
                                    
                                    <div style={{borderTop: '1px solid #efefef', padding: '20px 0', textAlign: 'left'}}>
                                        <div style={{marginBottom: '10px'}}>
                                            <strong style={{fontSize: '0.85rem', color: '#262626'}}>Role</strong>
                                            <p style={{margin: '2px 0 0', textTransform: 'capitalize'}}>{selectedProfile.role}</p>
                                        </div>
                                        {selectedProfile.role === 'guide' && (
                                            <>
                                                <div style={{marginBottom: '10px'}}>
                                                    <strong style={{fontSize: '0.85rem', color: '#262626'}}>Specialties</strong>
                                                    <p style={{margin: '2px 0 0'}}>{selectedProfile.specialities || 'Trekking'}</p>
                                                </div>
                                                <div style={{marginBottom: '10px'}}>
                                                    <strong style={{fontSize: '0.85rem', color: '#262626'}}>Languages</strong>
                                                    <p style={{margin: '2px 0 0'}}>{selectedProfile.languages_spoken || 'English, Nepali'}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            <div style={{display: 'flex', gap: '10px'}}>
                                {isEditing ? (
                                    <>
                                        <button onClick={handleSaveProfile} style={{flex: 1, padding: '12px', backgroundColor: '#0095f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Save Changes</button>
                                        <button onClick={() => setIsEditing(false)} style={{flex: 1, padding: '12px', backgroundColor: '#efefef', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        {selectedProfile.id === user.id && user.role === 'guide' && (
                                            <button onClick={() => setIsEditing(true)} style={{flex: 1, padding: '12px', backgroundColor: '#0095f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Edit Profile</button>
                                        )}
                                        <button onClick={() => setSelectedProfile(null)} style={{flex: 1, padding: '12px', backgroundColor: '#efefef', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>{selectedProfile.id === user.id ? 'Close' : 'Close'}</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <Footer />
        </div>
    );
}

export default MessagesPage;
