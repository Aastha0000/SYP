import React, { useEffect, useState, useRef, useCallback } from 'react';
import { sendMessage, getConversation } from '../services/api';

function ChatBox({ currentUser, receiver, onClose, inline = false }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await getConversation(currentUser.id, receiver.id);
            setMessages(res.data);
        } catch (err) {
            console.error('Fetch messages error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser.id, receiver.id]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll for new messages
        return () => clearInterval(interval);
    }, [receiver.id, fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const tempInput = input;
        setInput('');

        try {
            await sendMessage({
                sender_id: currentUser.id,
                receiver_id: receiver.id,
                content: tempInput
            });
            fetchMessages(); // Instant refresh
        } catch (err) {
            alert('Failed to send message.');
        }
    };

    const boxStyle = inline ? styles.chatBoxInline : styles.chatBoxFixed;

    return (
        <div style={boxStyle}>
            {/* Header */}
            <div style={styles.chatHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.avatarMini}>
                        {receiver.profile_picture ? (
                            <img src={`http://localhost:5001/uploads/${receiver.profile_picture}`} alt="" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                        ) : (
                            receiver.username?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span style={{fontWeight: 'bold', fontSize: '1rem'}}>{receiver.full_name || receiver.username}</span>
                        <span style={{fontSize: '0.75rem', color: '#666'}}>Active now</span>
                    </div>
                </div>
                {!inline && <button onClick={onClose} style={styles.closeBtn}>&times;</button>}
            </div>

            {/* Messages Area */}
            <div style={styles.messagesArea}>
                {loading && messages.length === 0 ? (
                    <div style={{display: 'flex', justifyContent: 'center', padding: '20px'}}><div className="loader"></div></div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwn = msg.sender_id === currentUser.id;
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                        
                        return (
                            <div key={msg.id} style={{
                                ...styles.messageWrap,
                                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                marginTop: isFirstInGroup ? '12px' : '2px'
                            }}>
                                {!isOwn && isFirstInGroup && (
                                    <div style={{...styles.avatarMicro, marginRight: '8px'}}>
                                        {receiver.profile_picture ? (
                                            <img src={`http://localhost:5001/uploads/${receiver.profile_picture}`} alt="" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                                        ) : (
                                            receiver.username?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                )}
                                {!isOwn && !isFirstInGroup && <div style={{width: '28px', marginRight: '8px'}}></div>}
                                
                                <div style={{
                                    ...styles.messageBubble,
                                    background: isOwn ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : '#efefef',
                                    color: isOwn ? 'white' : '#262626',
                                    borderTopLeftRadius: !isOwn && !isFirstInGroup ? '4px' : '22px',
                                    borderBottomLeftRadius: !isOwn ? '22px' : '22px',
                                    borderTopRightRadius: isOwn && !isFirstInGroup ? '4px' : '22px',
                                    borderBottomRightRadius: isOwn ? '22px' : '22px',
                                    padding: '12px 16px',
                                    boxShadow: 'none'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input */}
            <form onSubmit={handleSendMessage} style={styles.chatFooter}>
                <div style={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="Message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={styles.chatInput}
                        autoFocus
                    />
                    {input.trim() && (
                        <button type="submit" style={styles.sendBtn}>Send</button>
                    )}
                </div>
            </form>
        </div>
    );
}

const styles = {
    chatBoxInline: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0'
    },
    chatBoxFixed: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        height: '500px',
        backgroundColor: 'white',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2000,
        overflow: 'hidden',
        border: '1px solid #dbdbdb'
    },
    chatHeader: {
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #dbdbdb',
        backgroundColor: 'white'
    },
    avatarMini: {
        width: '40px',
        height: '40px',
        backgroundColor: '#efefef',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        fontWeight: 'bold',
        overflow: 'hidden'
    },
    avatarMicro: {
        width: '28px',
        height: '28px',
        backgroundColor: '#efefef',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        overflow: 'hidden',
        alignSelf: 'flex-end'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#262626',
        fontSize: '1.8rem',
        cursor: 'pointer',
        lineHeight: 0.5
    },
    messagesArea: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    messageWrap: {
        display: 'flex',
        alignItems: 'flex-end',
        width: '100%',
    },
    messageBubble: {
        maxWidth: '75%',
        fontSize: '0.9rem',
        lineHeight: '1.4',
        wordBreak: 'break-word',
    },
    chatFooter: {
        padding: '16px 20px',
        backgroundColor: 'white'
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #dbdbdb',
        borderRadius: '24px',
        padding: '4px 8px 4px 16px',
        gap: '8px'
    },
    chatInput: {
        flex: 1,
        border: 'none',
        padding: '8px 0',
        outline: 'none',
        fontSize: '0.95rem',
        backgroundColor: 'transparent'
    },
    sendBtn: {
        backgroundColor: 'transparent',
        color: '#0095f6',
        border: 'none',
        padding: '8px 12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '0.9rem'
    }
};

export default ChatBox;
