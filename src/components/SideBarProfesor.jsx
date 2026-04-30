import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import './SidebarProfesor.css';

const links = [
    { to: '/profesor/dashboard', label: 'Inicio', icon: '▦' },
    { to: '/profesor/alumnos', label: 'Alumnos', icon: '◎' },
    { to: '/profesor/ejercicios', label: 'Ejercicios', icon: '◈' },
    { to: '/profesor/rutinas', label: 'Rutinas', icon: '▤' },
    { to: '/profesor/comentarios', label: 'Comentarios', icon: '◻' },
];

export default function SidebarProfesor() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar__brand">TRAINER<span>.</span></div>
            <nav className="sidebar__nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                        }
                    >
                        <span className="sidebar__icon">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            <button className="sidebar__logout" onClick={handleLogout}>
                Cerrar sesión
            </button>
        </aside>
    );
}