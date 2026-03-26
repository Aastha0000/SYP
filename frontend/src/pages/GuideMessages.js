import React, { useEffect, useState } from 'react';
import GuideNavbar from '../components/GuideNavbar';
import Footer from '../components/Footer';
import ChatBox from '../components/ChatBox';
import './GuideDashboard.css';
import { getInbox, searchUsers, markMessageRead } from '../services/api';

function GuideMessages() {
    const [inbox, setInbox] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchInboxData();
        const interval = setInterval(fetchInboxData, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    const fetchInboxData = async () => {
        try {
            const res = await getInbox(user.id);
            setInbox(res.data);
        } catch (err) {} finally { setLoading(false); }
    };

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length > 2) {
            const res = await searchUsers(val, user.role === 'guide' ? 'user' : 'guide');
            setSearchResults(res.data);
        } else {
            setSearchResults([]);
        }
    };

    const selectChat = (chat) => {
        setActiveChat(chat);
        setSearchQuery('');
        setSearchResults([]);
        // Mark all messages as read (simplified)
        // In a real app we'd mark specific ones
        if (chat.unread_count > 0) {
            // markMessageRead logic would go here
        }
    };

    return (
        <div className="guide-dashboard-root">
            <GuideNavbar />
            <main className="guide-main" style={{padding: '20px'}}>
                <div className="guide-container" style={{maxWidth: '1200px', height: 'calc(100vh - 120px)'}}>
                    <div className="guide-section" style={{height: '100%', padding: 0, display: 'flex', overflow: 'hidden', borderRadius: '16px'}}>
                        
                        {/* Sidebar */}
                        <div style={{width: '350px', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column'}}>
                            <div style={{padding: '20px', borderBottom: '1px solid #eee'}}>
                                <h2 style={{fontSize: '1.5rem', marginBottom: '15px'}}>Messages</h2>
                                <div style={{position: 'relative'}}>
                                    <input 
                                        type="text" 
                                        placeholder="Search people..." 
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        style={{width: '100%', padding: '10px 15px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', backgroundColor: '#f9f9f9'}}
                                    />
                                    {searchResults.length > 0 && (
                                        <div style={{position: 'absolute', top: '45px', left: 0, right: 0, backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '10px', zIndex: 10, maxHeight: '200px', overflowY: 'auto'}}>
                                            {searchResults.map(u => (
                                                <div key={u.id} onClick={() => selectChat(u)} style={{padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                    <div style={{width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>{u.username[0].toUpperCase()}</div>
                                                    <div>{u.full_name || u.username}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{flex: 1, overflowY: 'auto'}}>
                                {inbox.map(chat => (
                                    <div 
                                        key={chat.id} 
                                        onClick={() => selectChat(chat)}
                                        style={{
                                            padding: '15px 20px', 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '15px',
                                            backgroundColor: activeChat?.id === chat.id ? '#f0f7f4' : 'transparent',
                                            borderLeft: activeChat?.id === chat.id ? '4px solid #2d6a4f' : '4px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', position: 'relative'}}>
                                            {chat.username[0].toUpperCase()}
                                            {chat.unread_count > 0 && <div style={{position: 'absolute', top: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff3b30', border: '2px solid white'}}></div>}
                                        </div>
                                        <div style={{flex: 1, overflow: 'hidden'}}>
                                            <div style={{fontWeight: chat.unread_count > 0 ? 'bold' : '600', display: 'flex', justifyContent: 'space-between'}}>
                                                <span>{chat.full_name || chat.username}</span>
                                                <span style={{fontSize: '0.7rem', color: '#999'}}>{new Date(chat.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <div style={{fontSize: '0.85rem', color: chat.unread_count > 0 ? '#333' : '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: chat.unread_count > 0 ? '500' : 'normal'}}>
                                                {chat.last_message}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {inbox.length === 0 && !searchQuery && <p style={{textAlign: 'center', color: '#999', padding: '40px'}}>No conversations yet.</p>}
                            </div>
                        </div>

                        {/* Chat View */}
                        <div style={{flex: 1, backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column'}}>
                            {activeChat ? (
                                <ChatBox 
                                    currentUser={user} 
                                    receiver={activeChat} 
                                    onClose={() => setActiveChat(null)}
                                    inline={true}
                                />
                            ) : (
                                <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999'}}>
                                    <div style={{width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '20px'}}>💬</div>
                                    <h3>Your Messages</h3>
                                    <p>Send private photos and messages to a friend or group.</p>
                                    <button onClick={() => document.querySelector('input[placeholder="Search people..."]').focus()} style={{marginTop: '15px', backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>Send Message</button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default GuideMessages;
