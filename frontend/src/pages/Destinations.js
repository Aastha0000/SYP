import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getDestinations } from '../services/api';
import { parseAndFormatPriceRange } from '../utils/currency';
import './Destinations.css';

function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Filter states
  const [regionFilter, setRegionFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState(''); // '', 'price-asc', 'price-desc', 'name-asc'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, regionFilter, durationFilter, priceFilter, sortBy]);

  useEffect(() => {
    const fetchDests = async () => {
        try {
            const res = await getDestinations();
            setDestinations(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchDests();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Basic filtering
  const filteredDestinations = destinations.filter(dest => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = (dest.name || '').toLowerCase().includes(searchLow) || 
                          (dest.region || '').toLowerCase().includes(searchLow);
    
    // Duration matching - handles ranges like "2-5 days"
    let matchesDuration = true;
    if (durationFilter) {
      const nums = (dest.duration || '').replace(/,/g, '').match(/\d+/g);
      if (nums) {
        const dMin = parseInt(nums[0]);
        const dMax = nums.length > 1 ? parseInt(nums[1]) : dMin;
        
        if (durationFilter === 'short') matchesDuration = dMin <= 3; 
        else if (durationFilter === 'medium') matchesDuration = (dMax >= 4 && dMin <= 7);
        else if (durationFilter === 'long') matchesDuration = dMax > 7;
      } else {
        matchesDuration = false;
      }
    }

    const matchesRegion = regionFilter ? (dest.region && dest.region.toLowerCase().includes(regionFilter.toLowerCase())) : true;
    
    // Price range filtering - handles ranges like "NRs. 4,500 - NRs. 8,000"
    let matchesPrice = true;
    if (priceFilter) {
      const nums = (dest.price_range || '').replace(/,/g, '').match(/\d+/g);
      if (nums) {
        const pMin = parseInt(nums.join('')); // Simplified: get all digits as one number if needed, or first range
        const pFirst = parseInt(nums[0]);
        const pLast = nums.length > 1 ? parseInt(nums[1]) : pFirst;

        // Thresholds in NPR (e.g. 5,000, 15,000)
        if (priceFilter === 'low') matchesPrice = pFirst < 5000;
        else if (priceFilter === 'medium') matchesPrice = (pLast >= 5000 && pFirst <= 15000);
        else if (priceFilter === 'high') matchesPrice = pLast > 15000;
      } else {
        matchesPrice = false;
      }
    }
    
    return matchesSearch && matchesDuration && matchesRegion && matchesPrice;
  });

  // Sorting logic
  const sortedDestinations = [...filteredDestinations].sort((a, b) => {
    const getPrice = (str) => {
        const nums = (str || '').replace(/,/g, '').match(/\d+/g);
        return nums ? parseInt(nums[0]) : 0;
    };

    if (sortBy === 'price-asc') {
      return getPrice(a.price_range) - getPrice(b.price_range);
    }
    if (sortBy === 'price-desc') {
      return getPrice(b.price_range) - getPrice(a.price_range);
    }
    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedDestinations.length / itemsPerPage);
  const displayedDestinations = sortedDestinations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="destinations-layout">
      <Navbar />
      <div className="destinations-page">
        <div className="destinations-sidebar">
          <div className="filter-group">
            <label>Region</label>
            <div className="region-buttons">
               <button 
                 className={`region-btn ${regionFilter === 'Nepal' ? 'active' : ''}`}
                 onClick={() => setRegionFilter(regionFilter === 'Nepal' ? '' : 'Nepal')}
               >
                 Nepal
               </button>
               <button 
                 className={`region-btn ${regionFilter === 'Himalayas' ? 'active' : ''}`}
                 onClick={() => setRegionFilter(regionFilter === 'Himalayas' ? '' : 'Himalayas')}
               >
                 Himalayas
               </button>

            </div>
          </div>

          <div className="filter-group">
            <label>Duration</label>
            <select 
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="">Any</option>
              <option value="short">Short (1-3 days)</option>
              <option value="medium">Medium (4-7 days)</option>
              <option value="long">Long (7+ days)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Pricing Range</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="">Any</option>
              <option value="low">Budget (&lt;$300)</option>
              <option value="medium">Standard ($300-$800)</option>
              <option value="high">Premium (&gt;$800)</option>
            </select>
          </div>
        </div>

        <div className="destinations-main">
          <div className="destinations-content">
            <div className="search-bar-container">
              <div className="search-input-group">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                      type="text" 
                      placeholder="Search destinations in Nepal ..." 
                      value={searchTerm}
                      onChange={handleSearch}
                      className="search-input"
                  />
              </div>
              <button className="search-button">Search</button>
            </div>

            <div className="destinations-toolbar">
              <span className="results-count">
                Showing {sortedDestinations.length} results
              </span>
              <div className="sort-group">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                </select>
              </div>
            </div>

            {loading ? <p style={{ textAlign: 'center', padding: '50px' }}>Loading destinations...</p> : (
            <div className="destinations-grid">
              {displayedDestinations.map(dest => (
                <div 
                  className="destination-card" 
                  key={dest.id}
                  onClick={() => navigate(`/destinations/${dest.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-image-placeholder">
                    {dest.image_url ? (
                        <img src={`http://localhost:5001/uploads/${dest.image_url}`} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '0.8rem', color: '#999' }}>No Image</span>
                    )}
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{dest.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                      {parseAndFormatPriceRange(dest.price_range)}
                    </p>
                    <button className="view-details-btn">
                      View details
                    </button>
                  </div>
                </div>
              ))}
              {displayedDestinations.length === 0 && !loading && <p>No destinations found.</p>}
            </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn prev-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: '#173339', color: 'white' }}
                >
                  &lt;
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1} 
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 3 && <span className="pagination-dots">......</span>}
                <button 
                  className="page-btn next-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Destinations;
