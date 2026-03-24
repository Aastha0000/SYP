import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getDestinationById } from '../services/api';
import { parseAndFormatPriceRange } from '../utils/currency';
import './DestinationDetails.css';

function DestinationDetails() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [id]);

  if (loading) {
    return (
      <div className="destination-details-page">
        <Navbar transparent={false} />
        <div className="loading" style={{ padding: '100px', textAlign: 'center' }}>Loading destination details...</div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="destination-details-page">
        <Navbar transparent={false} />
        <div className="error" style={{ padding: '100px', textAlign: 'center' }}>Destination not found.</div>
      </div>
    );
  }

  return (
    <div className="destination-details-page">
      <Navbar transparent={false} />
      
      <div className="details-container">
        <Link to="/destinations" className="back-link">
          &larr; Back to Destinations
        </Link>
        
        <div className="details-content">
          <div className="details-image-placeholder">
             {destination.image_url ? (
               <img src={`http://localhost:5001/uploads/${destination.image_url}`} alt={destination.name} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }} />
             ) : (
               <span className="placeholder-text">Image for {destination.name}</span>
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

            <button className="book-btn">Book Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DestinationDetails;
