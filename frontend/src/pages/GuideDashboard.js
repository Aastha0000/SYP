import React, { useEffect, useState } from 'react';
import GuideNavbar from '../components/GuideNavbar';
import Footer from '../components/Footer';
import { getGuideBookings, getGuideById } from '../services/api';
import { formatCurrency } from '../utils/currency';
import './GuideDashboard.css';

function GuideDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bkRes, gRes] = await Promise.all([
                    getGuideBookings(user.id),
                    getGuideById(user.id)
                ]);
                setBookings(bkRes.data);
                setTotalEarnings(parseFloat(gRes.data.earnings || 0));
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user.id) {
            fetchData();
            const interval = setInterval(fetchData, 5000); 
            return () => clearInterval(interval);
        }
    }, [user.id]);

    const confirmedBookings = bookings.filter(bk => bk.status === 'confirmed');

    return (
        <div className="guide-dashboard-root">
            <GuideNavbar />
            
            <main className="guide-main">
                <div className="guide-container">
                    
                    {/* Welcome Header */}
                    <header className="guide-header">
                        <div className="guide-welcome">
                            <h1>Namaste, {user.full_name || user.username}</h1>
                            <p>Your trekking schedule and earnings for this season.</p>
                        </div>
                        <div className="guide-stats-row">
                            <div className="stat-card">
                                <span className="stat-label">Confirmed Bookings</span>
                                <span className="stat-value">{confirmedBookings.length}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Total Earnings</span>
                                <span className="stat-value" style={{color: 'white', fontSize: '1.2rem'}}>{formatCurrency(totalEarnings)}</span>
                            </div>
                        </div>
                    </header>

                    <div className="guide-content-grid">
                        
                        {/* Bookings Table */}
                        <section className="guide-section">
                            <h2 className="section-title">Upcoming Bookings</h2>
                            <div className="table-wrapper">
                                {loading ? <div className="loader">Loading bookings...</div> : (
                                    <table className="guide-table">
                                        <thead>
                                            <tr>
                                                <th>Client Name</th>
                                                <th>Trek Date</th>
                                                <th>Status</th>
                                                <th>Payment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(bk => (
                                                <tr key={bk.id}>
                                                    <td>{bk.user_name || bk.user_username}</td>
                                                    <td>{new Date(bk.booking_date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`badge badge-${bk.status}`}>
                                                            {bk.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`payment-status ${bk.payment_status}`}>
                                                            {bk.payment_status === 'paid' ? '● Paid' : '○ Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {bookings.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="empty-row" style={{height: '60px'}}></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>

                        <section className="guide-section nature-card">
                            <div className="nature-content">
                                <h3>Environmental Tip 🏔️</h3>
                                <p>"Take nothing but pictures, leave nothing but footprints." Remind your clients to keep the trails clean.</p>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default GuideDashboard;
