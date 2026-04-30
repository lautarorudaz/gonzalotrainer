import SidebarProfesor from './SidebarProfesor.jsx';
import './ProfesorLayout.css';

export default function ProfesorLayout({ children }) {
    return (
        <div className="profesor-layout">
            <SidebarProfesor />
            <main className="profesor-layout__main">
                {children}
            </main>
        </div>
    );
}