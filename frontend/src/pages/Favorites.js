import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getFavorites } from '../services/api';
import './Destinations.css';

function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user.id) return;
      try {
        const res = await getFavorites(user.id);
        setFavorites(res.data);
      } catch (err) {
        console.error('Fetch favorites error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user.id]);

  return (
    <div className="destinations-layout">
      <Navbar transparent={false} />
      <div className="destinations-page">
        <div className="destinations-sidebar">
          <div className="filter-group">
            <label>My Favourites</label>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
              These are the destinations you've saved. You can filter them by search or view details.
            </p>
          </div>
          
          <div className="filter-group" style={{ marginTop: 'auto' }}>
            <Link to="/user/destinations" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>&larr;</span> Back to explorer
            </Link>
          </div>
        </div>

        <main className="destinations-main" style={{ padding: '60px 40px' }}>
          <header className="destinations-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#173339' }}>Your Favourite Destinations</h1>
            <p style={{ color: '#666', marginTop: '10px' }}>Quickly access the places you're planning to visit.</p>
          </header>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>Loading your favourites...</div>
          ) : favorites.length > 0 ? (
            <div className="destinations-grid">
              {favorites.map(dest => (
                <div key={dest.id} className="destination-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/user/destinations/${dest.id}`)}>
                  <div className="card-image-placeholder" style={{ height: '180px', margin: '10px', borderRadius: '4px', overflow: 'hidden' }}>
                    {dest.image_url ? (
                      <img src={`http://localhost:5001/uploads/${dest.image_url}`} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="image-placeholder" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d9d9d9', color: '#666' }}>{dest.name}</div>
                    )}
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{dest.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                      {dest.duration} • {dest.price_range}
                    </p>
                    <button className="view-details-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#173339', marginBottom: '15px' }}>No favourites yet</h2>
              <p style={{ color: '#666', marginBottom: '25px' }}>Explore destinations and click the heart icon to add them here.</p>
              <Link to="/user/destinations" style={{ display: 'inline-block', backgroundColor: '#173339', color: 'white', padding: '12px 25px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                Explore Destinations
              </Link>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Favorites;
