import { Link } from 'react-router-dom';
import './Navbar.css';

function smoothScrollTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar__brand">TRAINER<span>.</span></div>
            <nav className="navbar__links">
                <button className="navbar__link-btn" onClick={() => smoothScrollTo('metodologia')}>
                    Metodología
                </button>
                <button className="navbar__link-btn" onClick={() => smoothScrollTo('contacto')}>
                    Contacto
                </button>
                <Link to="/login" className="navbar__cta">Ingresar</Link>
            </nav>
        </header>
    );
}