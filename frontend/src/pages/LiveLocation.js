import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import GuideNavbar from '../components/GuideNavbar';
import { updateUser, searchUsers, sendLocationRequest, getLocationRequests, updateLocationRequest, getUserLocation } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';

// Establish socket connection
const socket = io('http://localhost:5001');

const userMarker = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const guideMarker = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const nepalBounds = [
    [26.347, 80.058], // Southwest
    [30.447, 88.201]  // Northeast
];

function MapUpdater({ myPos, targetPos }) {
    const map = useMap();
    useEffect(() => {
        if (targetPos?.latitude && targetPos?.longitude) {
            map.flyTo([targetPos.latitude, targetPos.longitude], 14);
        } else if (myPos?.latitude && myPos?.longitude) {
            map.flyTo([myPos.latitude, myPos.longitude], 9);
        }
    }, [myPos, targetPos, map]);
    return null;
}

function DraggableLegend() {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setDragging(true);
        setOffset({
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (dragging) {
                setPos({
                    x: e.clientX - offset.x,
                    y: e.clientY - offset.y
                });
            }
        };
        const handleMouseUp = () => setDragging(false);

        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, offset]);

    return (
        <div 
            style={{ 
                position: 'absolute', 
                bottom: '30px', 
                right: '30px', 
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                zIndex: 1000, 
                background: '#fff', 
                padding: '15px', 
                borderRadius: '15px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                border: '1px solid #f1f5f9',
                cursor: dragging ? 'grabbing' : 'grab',
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
        >
            <h6 style={{ margin: '0 0 10px 0', fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.5px' }}>MAP LEGEND</h6>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '14px', height: '14px', background: '#2563eb', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e293b' }}>USER (BLUE)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '14px', height: '14px', background: '#ef4444', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e293b' }}>GUIDE (RED)</span>
            </div>
        </div>
    );
}

function LiveLocation() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;

    const [myPosition, setMyPosition] = useState(null);
    const [targetUser, setTargetUser] = useState(null);
    const [targetPosition, setTargetPosition] = useState(null);
    
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [geoError, setGeoError] = useState(null);

    const fetchRequests = async () => {
        if (!user.id) return;
        try {
            const res = await getLocationRequests(user.id);
            setIncomingRequests(res.data.incoming || []);
            setOutgoingRequests(res.data.outgoing || []);
        } catch (err) {}
    };

    const loadInitPositions = async () => {
        if (!user.id) return;
        try {
            const res = await getUserLocation(user.id, user.id);
            if (res.data?.latitude) {
                setMyPosition({ 
                    latitude: parseFloat(res.data.latitude), 
                    longitude: parseFloat(res.data.longitude) 
                });
            }
        } catch (err) {}
    };

    useEffect(() => {
        fetchRequests();
        loadInitPositions();
        const tid = setInterval(fetchRequests, 10000);
        return () => clearInterval(tid);
    }, [user.id]);

    useEffect(() => {
        if (user.id) socket.emit('join_location', user.id);

        socket.on('location_update', (data) => {
            if (targetUser && parseInt(data.userId) === parseInt(targetUser.id)) {
                setTargetPosition({
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude)
                });
            }
        });

        return () => socket.off('location_update');
    }, [user.id, targetUser]);

    useEffect(() => {
        let watchId;
        if (navigator.geolocation && user.id) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setMyPosition({ latitude, longitude });
                    setGeoError(null);
                    socket.emit('update_location', { userId: user.id, latitude, longitude });
                    updateUser(user.id, { latitude, longitude }).catch(() => {});
                },
                (err) => {
                    setGeoError(err.message === "User denied Geolocation" ? "Permission Denied" : "Searching GPS...");
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        } else {
            setGeoError("Geolocation Not Supported");
        }
        return () => watchId && navigator.geolocation.clearWatch(watchId);
    }, [user.id]);

    const handleTrack = async (target) => {
        setTargetUser(target);
        setTargetPosition(null);
        socket.emit('track_user', target.id);
        
        try {
            const res = await getUserLocation(target.id, user.id);
            if (res.data?.latitude) {
                setTargetPosition({ 
                    latitude: parseFloat(res.data.latitude), 
                    longitude: parseFloat(res.data.longitude) 
                });
            }
        } catch (err) {}
    };

    const handleTriggerRequest = async (targetId) => {
        try {
            await sendLocationRequest({ requester_id: user.id, target_id: targetId });
            setSearchQuery('');
            setSearchResults([]);
            fetchRequests();
            alert('Location request sent successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send request.';
            alert(msg);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const handleAction = async (requestId, status) => {
        try {
            await updateLocationRequest(requestId, status);
            fetchRequests();
        } catch (err) { }
    };

    const getIcon = (r) => (r === 'guide' ? guideMarker : userMarker);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f4f8', fontFamily: "'Inter', sans-serif" }}>
            {role === 'guide' ? <GuideNavbar /> : <Navbar />}
            
            <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr' }}>
                
                <div style={{ background: '#fff', padding: '30px', borderRight: '1px solid #e1e8ed', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h2 style={{ fontSize: '1.4rem', color: '#1a3a3a', fontWeight: '800', margin: 0 }}>Location Portal</h2>
                        <div style={{ padding: '4px 8px', background: '#e11d48', color: '#fff', borderRadius: '5px', fontSize: '0.6rem' }}>LIVE</div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '30px' }}>📍 Nepal Territory Monitoring</p>

                    <div style={{ marginBottom: '35px' }}>
                        <h5 style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Find Tracker</h5>
                        <input 
                            type="text" 
                            placeholder="Find by username..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value.length > 2) {
                                    searchUsers(e.target.value, role === 'guide' ? 'user' : 'guide').then(res => setSearchResults(res.data)).catch(() => {});
                                } else setSearchResults([]);
                            }}
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', background: '#f8fafc' }}
                        />
                        {searchResults.map(s => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#ecfdf4', borderRadius: '10px', marginTop: '12px', border: '1px solid #d1fae5' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>@{s.username}</span>
                                <button onClick={() => handleTriggerRequest(s.id)} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 'bold' }}>Request</button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: '35px' }}>
                        <h5 style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Incoming Requests</h5>
                        {incomingRequests.length === 0 && <p style={{ fontSize: '0.85rem', color: '#ccc', fontStyle: 'italic' }}>No incoming requests</p>}
                        {incomingRequests.map(r => (
                            <div key={`inc-${r.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: r.status === 'accepted' ? '#eff6ff' : '#fff7ed', borderRadius: '12px', marginBottom: '10px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>@{r.username}</span>
                                    <span style={{ fontSize: '0.7rem', color: '#666' }}>{r.status.toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {r.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleAction(r.id, 'accepted')} style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>Accept</button>
                                            <button onClick={() => handleAction(r.id, 'declined')} style={{ padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>Deny</button>
                                        </>
                                    )}
                                    {r.status === 'accepted' && (
                                        <button onClick={() => handleTrack({ id: r.requester_id, username: r.username, role: r.role })} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 'bold' }}>View Map</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: '35px' }}>
                        <h5 style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Sent Requests</h5>
                        {outgoingRequests.length === 0 && <p style={{ fontSize: '0.85rem', color: '#ccc', fontStyle: 'italic' }}>No sent requests</p>}
                        {outgoingRequests.map(r => (
                            <div key={`out-${r.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: r.status === 'accepted' ? '#eff6ff' : '#f8fafc', borderRadius: '12px', marginBottom: '10px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>@{r.username}</span>
                                    <span style={{ fontSize: '0.7rem', color: r.status === 'accepted' ? '#2563eb' : '#f59e0b' }}>{r.status.toUpperCase()}</span>
                                </div>
                                {r.status === 'accepted' && (
                                    <button onClick={() => handleTrack({ id: r.target_id, username: r.username, role: r.role })} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 'bold' }}>View Map</button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '20px', background: '#f1f5f9', borderRadius: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>IDENTITY</span>
                            <span style={{ fontSize: '0.75rem', color: geoError ? '#ef4444' : '#10b981' }}>{geoError || 'Online'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#2563eb' }}></div>
                            <span style={{ fontSize: '0.85rem' }}><strong>You:</strong> {myPosition?.latitude ? `${myPosition.latitude.toFixed(4)}, ${myPosition.longitude.toFixed(4)}` : 'Scanning...'}</span>
                        </div>
                        {targetUser && (
                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#ef4444' }}></div>
                                <span style={{ fontSize: '0.85rem' }}><strong>@{targetUser.username}:</strong> {targetPosition?.latitude ? `${targetPosition.latitude.toFixed(4)}, ${targetPosition.longitude.toFixed(4)}` : 'Searching...'}</span>
                             </div>
                        )}
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <MapContainer 
                        center={[28.3949, 84.1240]} 
                        zoom={7} 
                        style={{ height: '100%', width: '100%' }}
                        maxBounds={nepalBounds}
                        maxBoundsViscosity={1.0}
                        minZoom={8}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                        
                        <MapUpdater myPos={myPosition} targetPos={targetPosition} />
                        
                        {myPosition?.latitude && (
                            <Marker position={[myPosition.latitude, myPosition.longitude]} icon={getIcon(role)}>
                                <Popup><b>YOU ({role})</b><br/>Live active</Popup>
                            </Marker>
                        )}

                        {targetPosition?.latitude && targetUser && (
                            <Marker position={[targetPosition.latitude, targetPosition.longitude]} icon={getIcon(targetUser.role)}>
                                <Popup><b>@{targetUser.username} ({targetUser.role})</b><br/>Live tracking</Popup>
                            </Marker>
                        )}

                        <DraggableLegend />
                    </MapContainer>
                </div>

            </div>
        </div>
    );
}

export default LiveLocation;
