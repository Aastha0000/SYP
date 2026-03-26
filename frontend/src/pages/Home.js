import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDestinations } from '../services/api';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const [destList, setDestList] = useState([]);

    useEffect(() => {
        const fetchDests = async () => {
            try {
                const res = await getDestinations();
                setDestList(res.data.slice(0, 3));
            } catch (err) {
                console.error(err);
            }
        };
        fetchDests();
    }, []);

    return (
        <div className="home-page">

            {/* ── HERO SECTION ───────────────────────────────────────── */}
            <section className="home-hero" style={{ backgroundImage: "url('/img/mt-everest.jpeg')" }}>
                <Navbar transparent={true} />

                <div className="home-hero__overlay" />

                <div className="home-hero__content">
                    <h1 className="home-hero__title">
                        Explore The<br />Wonders of<br />Nepal
                    </h1>
                    <Link to="/destinations" className="home-hero__btn">Discover</Link>
                </div>
            </section>

            {/* ── POPULAR DESTINATIONS ───────────────────────────────── */}
            <section className="home-destinations" id="destinations">
                <h2 className="home-destinations__heading">Popular Destinations</h2>
                <div className="home-destinations__grid">
                    {destList.map((dest) => (
                        <div 
                            className="dest-card" 
                            key={dest.id} 
                            onClick={() => navigate(`/destinations/${dest.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="dest-card__img-wrap">
                                {dest.image_url ? (
                                    <img src={`http://localhost:5001/uploads/${dest.image_url}`} alt={dest.name} className="dest-card__img" />
                                ) : (
                                    <div className="dest-card__img-placeholder">Image for {dest.name}</div>
                                )}
                            </div>
                            <p className="dest-card__name">{dest.name}</p>
                        </div>
                    ))}
                    {destList.length === 0 && (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.6 }}>No destinations found. Check back later!</p>
                    )}
                </div>
            </section>

            {/* ── GUIDE PROMO SECTION ────────────────────────────────── */}
            <section className="home-guide" id="guides">
                <div className="home-guide__image-wrap">
                    <img
                        src="/img/boudha.png"
                        alt="Cultural festival of Nepal"
                        className="home-guide__image"
                    />
                </div>
                <div className="home-guide__content">
                    <h2 className="home-guide__title">Find your<br />perfect guide</h2>
                    <Link to="/guides" className="home-guide__btn">Plan your trip</Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Home;
