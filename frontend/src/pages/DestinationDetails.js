import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminNavbar from './AdminNavbar';
import GuideNavbar from '../components/GuideNavbar';
import { getDestinationById, addFavorite, removeFavorite, getFavorites } from '../services/api';
import { parseAndFormatPriceRange } from '../utils/currency';
import './DestinationDetails.css';

function DestinationDetails() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchDest = async () => {
      try {
        const res = await getDestinationById(id);
        setDestination(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDest();

    const checkFavorite = async () => {
        if (!user.id) return;
        try {
            const res = await getFavorites(user.id);
            const favs = res.data;
            setIsFavorite(favs.some(f => f.id === parseInt(id)));
        } catch (err) {}
    };
    checkFavorite();
  }, [id, user.id]);

  const toggleFavorite = async () => {
    if (!user.id) return;
    try {
        if (isFavorite) {
            await removeFavorite(user.id, id);
            setIsFavorite(false);
        } else {
            await addFavorite(user.id, id);
            setIsFavorite(true);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const renderNavbar = () => {
    if (user.role === 'admin') return <AdminNavbar />;
    if (user.role === 'guide') return <GuideNavbar />;
    return <Navbar transparent={false} />;
  };

  const getBackPath = () => {
    if (user.role === 'admin') return '/admin-dashboard/destinations';
    if (user.role === 'guide') return '/guide/home'; // Or somewhere else appropriate
    return '/user/destinations';
  };

  if (loading) {
    return (
      <div className="destination-details-page">
        {renderNavbar()}
        <div className="loading" style={{ padding: '100px', textAlign: 'center' }}>Loading destination details...</div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="destination-details-page">
        {renderNavbar()}
        <div className="error" style={{ padding: '100px', textAlign: 'center' }}>Destination not found.</div>
      </div>
    );
  }

  return (
    <div className="destination-details-page">
      {renderNavbar()}
      
      <div className="details-container">
        <Link to={getBackPath()} className="back-link">
          &larr; Back to Destinations
        </Link>
        
        <div className="details-content">
          <div className="details-image-placeholder" style={{ position: 'relative' }}>
             {destination.image_url ? (
               <img src={`http://localhost:5001/uploads/${destination.image_url}`} alt={destination.name} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }} />
             ) : (
               <span className="placeholder-text">Image for {destination.name}</span>
             )}
             {user.id && user.role === 'user' && (
                <button 
                  onClick={toggleFavorite} 
                  className="fav-btn-floating" 
                  style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    right: '20px', 
                    background: 'white', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '45px', 
                    height: '45px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill={isFavorite ? "#e63946" : "none"} stroke={isFavorite ? "#e63946" : "#173339"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              )}
          </div>

          <div className="details-info">
            <h1 className="details-title">{destination.name}</h1>
            <p className="details-desc">{destination.description || 'No description available.'}</p>
            
            <div className="details-specs">
              <div className="spec-item">
                <span className="spec-label">Altitude Range</span>
                <span className="spec-value">{destination.altitude_range || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Trekking Complexity</span>
                <span className="spec-value">{destination.trekking_complexity || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Duration</span>
                <span className="spec-value">{destination.duration || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Price Range</span>
                <span className="spec-value">{parseAndFormatPriceRange(destination.price_range)}</span>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

export default DestinationDetails;
