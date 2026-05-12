import { useState, useRef, useCallback } from 'react';
import SidebarProfesor from './SideBarProfesor.jsx';
import './ProfesorLayout.css';

export default function ProfesorLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Swipe-to-open detection
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

        // Swipe right from left edge (within 60px) to open
        if (touchStartX.current < 60 && dx > 60 && dy < 80) {
            setSidebarOpen(true);
        }
        // Swipe left to close
        if (sidebarOpen && dx < -60 && dy < 80) {
            setSidebarOpen(false);
        }
        touchStartX.current = null;
        touchStartY.current = null;
    }, [sidebarOpen]);

    return (
        <div
            className="profesor-layout"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <SidebarProfesor
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="profesor-layout__main">
                {/* Mobile header with hamburger */}
                <div className="profesor-topbar">
                    <button
                        className="profesor-topbar__menu"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menú"
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                    <div className="profesor-topbar__brand">
                        TRAINER<span>.</span>
                    </div>
                </div>

                {children}
            </main>
        </div>
    );
}