import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function smoothScrollTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    // Cerrar menú al hacer scroll o resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) setMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavClick = (id) => {
        smoothScrollTo(id);
        setMenuOpen(false);
    };

    return (
        <header className="navbar">
            <img src="/logo-light-bg.png" alt="Force Training" className="navbar__brand-img" />

            {/* Desktop nav */}
            <nav className="navbar__links">
                <button className="navbar__link-btn" onClick={() => smoothScrollTo('metodologia')}>
                    Metodología
                </button>
                <button className="navbar__link-btn" onClick={() => smoothScrollTo('contacto')}>
                    Contacto
                </button>
                <Link to="/login" className="navbar__cta">Ingresar</Link>
            </nav>

            {/* Hamburger button (mobile only) */}
            <button
                className={`navbar__hamburger${menuOpen ? ' is-open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menú"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Mobile dropdown menu */}
            <div className={`navbar__mobile-menu${menuOpen ? ' is-open' : ''}`}>
                <button className="navbar__link-btn" onClick={() => handleNavClick('metodologia')}>
                    Metodología
                </button>
                <button className="navbar__link-btn" onClick={() => handleNavClick('contacto')}>
                    Contacto
                </button>
                <Link to="/login" className="navbar__cta navbar__cta--mobile" onClick={() => setMenuOpen(false)}>
                    Ingresar
                </Link>
            </div>
        </header>
    );
}