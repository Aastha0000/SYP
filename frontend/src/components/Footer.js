import React from 'react';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <span className="footer__contact">Contact us</span>
            <div className="footer__socials">
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer__icon" aria-label="Facebook">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                </a>
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer__icon" aria-label="Instagram">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                </a>
            </div>
        </footer>
    );
}

export default Footer;
