import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatBox from '../components/ChatBox';
import './GuideProfile.css';
import { getGuideById, createBooking, getGuideReviews, postReview } from '../services/api';

function GuideProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [guide, setGuide] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(true);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingStep, setBookingStep] = useState('selection'); 
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isChatting, setIsChatting] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        fetchGuideAndReviews();
    }, [id]);

    const fetchGuideAndReviews = async () => {
        try {
            const [gRes, rRes] = await Promise.all([
                getGuideById(id),
                getGuideReviews(id)
            ]);
            setGuide(gRes.data);
            setReviews(rRes.data);
        } catch (err) {
            setError('Failed to load guide profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return navigate('/login');
        try {
            await postReview(id, { user_id: currentUser.id, ...newReview });
            setNewReview({ rating: 5, comment: '' });
            fetchGuideAndReviews();
        } catch (err) {
            alert('Failed to post review.');
        }
    };

    const handleBookNow = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setShowModal(true);
        setBookingStep('selection');
    };

    const handleContinueBooking = () => {
        if (!bookingDate) {
            alert('Please select a date.');
            return;
        }
        const selected = new Date(bookingDate);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (selected < today) {
            alert('Cannot book for past dates.');
            return;
        }
        const dateStr = selected.toISOString().split('T')[0];
        if (guide.bookedDates && guide.bookedDates.some(d => d.split('T')[0] === dateStr)) {
            alert('This date is already booked.');
            return;
        }
        setBookingStep('confirmation');
    };

    const handleConfirmBooking = () => {
        setBookingStep('payment');
    };

    const processPayment = async () => {
        try {
            await createBooking({
                guide_id: guide.id,
                user_id: currentUser.id,
                booking_date: bookingDate
            });
            setBookingStep('success');
            fetchGuideAndReviews();
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed.');
        }
    };

    if (loading) return <div className="loading-screen">Loading Profile...</div>;
    if (error) return <div className="error-screen">{error}</div>;
    if (!guide) return <div className="error-screen">Guide not found.</div>;

    return (
        <div className="guide-profile-page" style={{backgroundColor: '#f8fafc'}}>
            <Navbar />
            
            <main className="profile-container" style={{maxWidth: '1200px', margin: '140px auto 40px', padding: '0 20px'}}>
                <div className="profile-header" style={{background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', display: 'flex', gap: '40px', alignItems: 'center'}}>
                    <div className="profile-avatar" style={{width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #f1f5f9'}}>
                        {guide.profile_picture ? (
                            <img src={`http://localhost:5001/uploads/${guide.profile_picture}`} alt={guide.username} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                            <div className="avatar-placeholder" style={{width: '100%', height: '100%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#94a3b8'}}>{guide.username.charAt(0).toUpperCase()}</div>
                        )}
                    </div>
                    <div className="profile-info" style={{flex: 1}}>
                        <h1 style={{fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '10px'}}>{guide.full_name || guide.username}</h1>
                        <p className="speciality-tag" style={{display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 16px', borderRadius: '30px', fontWeight: '800', fontSize: '0.9rem', marginBottom: '15px'}}>{guide.specialities || 'Professional Guide'}</p>
                        <div className="stats-row" style={{display: 'flex', gap: '20px', color: '#64748b', fontWeight: '600'}}>
                            <a href="#reviews" style={{textDecoration: 'none', color: 'inherit', cursor: 'pointer'}}>
                                <span style={{color: '#d1a054'}}>⭐</span> {Number(guide.avg_rating).toFixed(1)} ({guide.review_count} Reviews)
                            </a>
                            <span>📍 Nepal</span>
                            {guide.languages_spoken && <span>🗣️ {guide.languages_spoken}</span>}
                        </div>
                    </div>
                    <div className="profile-actions" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        <button className="book-btn" onClick={handleBookNow} style={{backgroundColor: '#1a434e', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s'}}>Book Now</button>
                        <button className="chat-btn" onClick={() => currentUser ? setIsChatting(true) : navigate('/login')} style={{backgroundColor: 'white', color: '#0095f6', border: '2px solid #0095f6', padding: '12px 28px', borderRadius: '14px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer'}}>Chat with Guide</button>
                    </div>
                </div>

                <div className="profile-content" style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px'}}>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                        <section className="about-section" style={{background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'}}>
                            <h3 style={{fontSize: '1.4rem', fontWeight: '800', marginBottom: '15px'}}>About {guide.username}</h3>
                            <p style={{color: '#475569', lineHeight: '1.7', fontSize: '1.05rem', whiteSpace: 'pre-wrap'}}>
                                {guide.bio || `Expert guide with extensive experience in ${guide.specialities || 'trekking and mountaineering'}. Committed to providing safe and memorable adventures across the Himalayas.`}
                            </p>
                            
                            <div className="details-grid" style={{marginTop: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '16px'}}>
                                <div className="detail-item">
                                    <strong style={{display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px'}}>Main Language</strong>
                                    <p style={{fontSize: '1.1rem', fontWeight: '700', color: '#1e293b'}}>{guide.languages_spoken || 'English'}</p>
                                </div>
                                {guide.portfolio_url && (
                                    <div className="detail-item">
                                        <strong style={{display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px'}}>Professional Link</strong>
                                        <p style={{fontSize: '1.1rem', fontWeight: '700'}}><a href={guide.portfolio_url.startsWith('http') ? guide.portfolio_url : `https://${guide.portfolio_url}`} target="_blank" rel="noopener noreferrer" style={{color: '#0095f6', textDecoration: 'none'}}>{guide.portfolio_url}</a></p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Reviews Section */}
                        <section id="reviews" style={{background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'}}>
                            <h3 style={{fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px'}}>Client Reviews ({reviews.length})</h3>
                            
                            {currentUser && (
                                <form onSubmit={handleReviewSubmit} style={{marginBottom: '40px', padding: '20px', borderRadius: '16px', border: '2px solid #f1f5f9'}}>
                                    <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px'}}>
                                        <span style={{fontWeight: '700'}}>Rating:</span>
                                        {[1,2,3,4,5].map(num => (
                                            <button 
                                                key={num} 
                                                type="button" 
                                                onClick={() => setNewReview({...newReview, rating: num})}
                                                style={{fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: num <= newReview.rating ? '#d1a054' : '#e2e8f0'}}
                                            >⭐</button>
                                        ))}
                                    </div>
                                    <textarea 
                                        placeholder="Write your experience with this guide..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                        style={{width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '100px', marginBottom: '15px', outline: 'none'}}
                                        required
                                    />
                                    <button type="submit" style={{backgroundColor: '#1a434e', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'}}>Submit Review</button>
                                </form>
                            )}

                            <div style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
                                {reviews.length > 0 ? reviews.map(rev => (
                                    <div key={rev.id} style={{display: 'flex', gap: '15px'}}>
                                        <div style={{width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', overflow: 'hidden', flexShrink: 0}}>
                                            {rev.reviewer_avatar ? (
                                                <img src={`http://localhost:5001/uploads/${rev.reviewer_avatar}`} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                            ) : (
                                                <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>{rev.reviewer_name?.[0].toUpperCase()}</div>
                                            )}
                                        </div>
                                        <div style={{flex: 1}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <strong style={{color: '#1e293b'}}>{rev.reviewer_name}</strong>
                                                <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>{new Date(rev.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{margin: '5px 0', color: '#d1a054'}}>
                                                {'⭐'.repeat(rev.rating)}
                                            </div>
                                            <p style={{color: '#475569', fontSize: '0.95rem'}}>{rev.comment}</p>
                                        </div>
                                    </div>
                                )) : <p style={{textAlign: 'center', color: '#94a3b8', padding: '20px'}}>No reviews yet. Be the first to share your experience!</p>}
                            </div>
                        </section>
                    </div>
                    
                    <aside className="availability-sidebar" style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                        <div style={{background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'}}>
                            <h3 style={{fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px'}}>Booked Dates</h3>
                            <div className="booked-dates-list" style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                                {guide.bookedDates && guide.bookedDates.length > 0 ? (
                                    guide.bookedDates.map((date, idx) => (
                                        <div key={idx} className="booked-date-badge" style={{backgroundColor: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700'}}>
                                            {new Date(date).toLocaleDateString()}
                                        </div>
                                    ))
                                ) : (
                                    <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>No upcoming bookings found.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Booking Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="booking-modal">
                        <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
                        
                        {bookingStep === 'selection' && (
                            <div className="modal-step">
                                <h2>Select a Date</h2>
                                <input 
                                    type="date" 
                                    value={bookingDate} 
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="date-input"
                                />
                                <div className="modal-footer">
                                    <button className="modal-next" onClick={handleContinueBooking}>Continue</button>
                                </div>
                            </div>
                        )}

                        {bookingStep === 'confirmation' && (
                            <div className="modal-step">
                                <h2>Confirm Booking</h2>
                                <p>You are booking <strong>{guide.full_name || guide.username}</strong> for <strong>{new Date(bookingDate).toLocaleDateString()}</strong>.</p>
                                <div className="booking-summary">
                                    <div className="summary-item"><span>Package Fee</span><span>NRs. 2000</span></div>
                                    <div className="summary-item"><span>Service Charge</span><span>NRs. 200</span></div>
                                    <div className="summary-total"><span>Total</span><span>NRs. 2200</span></div>
                                </div>
                                <div className="modal-footer">
                                    <button className="modal-back" onClick={() => setBookingStep('selection')}>Back</button>
                                    <button className="modal-next" onClick={handleConfirmBooking}>Proceed to Payment</button>
                                </div>
                            </div>
                        )}

                        {bookingStep === 'payment' && (
                            <div className="modal-step">
                                <h2>Payment</h2>
                                <div className="payment-options">
                                    <div className="payment-method eSewa">eSewa</div>
                                    <div className="payment-method khalti">Khalti</div>
                                    <div className="payment-method card">Debit/Credit Card</div>
                                </div>
                                <div className="modal-footer">
                                    <button className="modal-back" onClick={() => setBookingStep('confirmation')}>Back</button>
                                    <button className="modal-next success" onClick={processPayment}>Pay & Confirm</button>
                                </div>
                            </div>
                        )}

                        {bookingStep === 'success' && (
                            <div className="modal-step success-step">
                                <div className="success-icon">✓</div>
                                <h2>Booking Confirmed!</h2>
                                <p>Your booking for {new Date(bookingDate).toLocaleDateString()} is successful.</p>
                                <button className="modal-next" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isChatting && (
                <ChatBox 
                    currentUser={currentUser} 
                    receiver={guide} 
                    onClose={() => setIsChatting(false)} 
                />
            )}

            <Footer />
        </div>
    );
}

export default GuideProfile;
