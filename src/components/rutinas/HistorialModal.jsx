import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import HistorialViewer from './HistorialViewer';
import './HistorialModal.css';

export default function HistorialModal({ alumno, onClose }) {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rutinaViendo, setRutinaViendo] = useState(null);

    useEffect(() => {
        getDocs(collection(db, 'usuarios', alumno.id, 'historialRutinas')).then(snap => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            items.sort((a, b) => b.fechaFin?.seconds - a.fechaFin?.seconds);
            setHistorial(items);
            setLoading(false);
        });
    }, []);

    const formatFecha = (ts) => {
        if (!ts) return '—';
        return new Date(ts.seconds * 1000).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    if (rutinaViendo) {
        return <HistorialViewer rutina={rutinaViendo} onClose={() => setRutinaViendo(null)} />;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="historial-modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <div>
                        <h2>Historial de rutinas</h2>
                        <p className="historial-modal__alumno">{alumno.nombre} {alumno.apellido}</p>
                    </div>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="historial-modal__body">
                    {loading ? (
                        <p className="historial-modal__empty">Cargando...</p>
                    ) : historial.length === 0 ? (
                        <p className="historial-modal__empty">No hay rutinas en el historial.</p>
                    ) : historial.map(rutina => (
                        <div className="historial-card" key={rutina.id}>
                            <div className="historial-card__info">
                                <h3>{rutina.nombre}</h3>
                                <p>
                                    Inicio: {formatFecha(rutina.fechaInicio)} · Fin: {formatFecha(rutina.fechaFin)}
                                </p>
                                <span>{rutina.semanas?.length} semana{rutina.semanas?.length !== 1 ? 's' : ''}</span>
                            </div>
                            <button className="accion accion--editar" onClick={() => setRutinaViendo(rutina)}>
                                Ver rutina
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}