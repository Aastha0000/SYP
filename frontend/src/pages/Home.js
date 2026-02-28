import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.css';

const destinations = [
    {
        id: 1,
        name: 'Annapurna Base Camp',
        image: '/img/ABC.png',
        alt: 'Annapurna Base Camp trekking',
    },
    {
        id: 2,
        name: 'Pokhara',
        image: '/img/pokhara.png',
        alt: 'Pokhara lake with boats',
    },
    {
        id: 3,
        name: 'Lumbini',
        image: '/img/lumbini.png',
        alt: 'Lumbini peace stupa',
    },
];

function Home() {
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
                    <Link to="#destinations" className="home-hero__btn">Discover</Link>
                </div>
            </section>

            {/* ── POPULAR DESTINATIONS ───────────────────────────────── */}
            <section className="home-destinations" id="destinations">
                <h2 className="home-destinations__heading">Popular Destinations</h2>
                <div className="home-destinations__grid">
                    {destinations.map((dest) => (
                        <div className="dest-card" key={dest.id}>
                            <div className="dest-card__img-wrap">
                                <img src={dest.image} alt={dest.alt} className="dest-card__img" />
                            </div>
                            <p className="dest-card__name">{dest.name}</p>
                        </div>
                    ))}
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
                    <Link to="/signup" className="home-guide__btn">Plan your trip</Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Home;
