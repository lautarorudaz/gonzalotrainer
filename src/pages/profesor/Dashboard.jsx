import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const [alumnos, setAlumnos] = useState([]);
    const [rutinasActivas, setRutinasActivas] = useState({});
    const [comentariosRecientes, setComentariosRecientes] = useState([]);
    const [sinLeer, setSinLeer] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        // Alumnos
        const alumnosSnap = await getDocs(collection(db, 'usuarios'));
        const lista = alumnosSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(u => u.rol === 'alumno');
        setAlumnos(lista);

        // Rutinas activas
        const activas = {};
        await Promise.all(lista.map(async (alumno) => {
            const snap = await getDocs(collection(db, 'usuarios', alumno.id, 'rutinaActiva'));
            if (!snap.empty) activas[alumno.id] = { id: snap.docs[0].id, ...snap.docs[0].data() };
        }));
        setRutinasActivas(activas);

        // Comentarios recientes
        const todosComentarios = [];
        for (const alumno of lista) {
            const snap = await getDocs(
                query(collection(db, 'usuarios', alumno.id, 'comentarios'), orderBy('fecha', 'desc'))
            );
            snap.docs.forEach(d => {
                todosComentarios.push({
                    id: d.id,
                    alumnoId: alumno.id,
                    alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
                    ...d.data()
                });
            });
        }
        todosComentarios.sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
        setComentariosRecientes(todosComentarios.slice(0, 5));
        setSinLeer(todosComentarios.filter(c => !c.leido && c.tipo === 'dia').length);
        setLoading(false);
    };

    const formatFecha = (ts) => {
        if (!ts?.seconds) return '—';
        const d = new Date(ts.seconds * 1000);
        return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) +
            ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };

    const conRutina = alumnos.filter(a => rutinasActivas[a.id]).length;
    const sinRutina = alumnos.filter(a => !rutinasActivas[a.id]);

    if (loading) return <div className="dashboard__loading">Cargando...</div>;

    return (
        <div className="dashboard">
            <h1 className="dashboard__title">Inicio</h1>

            {/* Stats */}
            <div className="dashboard__stats">
                <div className="dash-stat">
                    <span className="dash-stat__num">{alumnos.length}</span>
                    <span className="dash-stat__label">Alumnos totales</span>
                </div>
                <div className="dash-stat">
                    <span className="dash-stat__num">{conRutina}</span>
                    <span className="dash-stat__label">Con rutina</span>
                </div>
                <div className="dash-stat dash-stat--warn">
                    <span className="dash-stat__num">{sinRutina.length}</span>
                    <span className="dash-stat__label">Sin rutina</span>
                </div>
                <div className="dash-stat dash-stat--accent" onClick={() => navigate('/profesor/comentarios')} style={{ cursor: 'pointer' }}>
                    <span className="dash-stat__num">{sinLeer}</span>
                    <span className="dash-stat__label">Sin leer</span>
                </div>
            </div>

            <div className="dashboard__grid">
                {/* Comentarios recientes */}
                <div className="dash-panel">
                    <div className="dash-panel__header">
                        <h2>Últimos comentarios</h2>
                        <button className="dash-panel__link" onClick={() => navigate('/profesor/comentarios')}>
                            Ver todos →
                        </button>
                    </div>
                    {comentariosRecientes.length === 0 ? (
                        <p className="dash-panel__empty">No hay comentarios todavía.</p>
                    ) : (
                        <div className="dash-comentarios">
                            {comentariosRecientes.map((c, i) => (
                                <div className={`dash-comentario ${c.leido ? 'dash-comentario--leido' : ''}`} key={i}>
                                    <div className="dash-comentario__avatar">
                                        {c.alumnoNombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="dash-comentario__body">
                                        <div className="dash-comentario__meta">
                                            <span className="dash-comentario__nombre">{c.alumnoNombre}</span>
                                            <span className="dash-comentario__fecha">{formatFecha(c.fecha)}</span>
                                        </div>
                                        <p className="dash-comentario__texto">{c.texto}</p>
                                        <span className="dash-comentario__tipo">
                                            {c.tipo === 'ejercicio' ? `📌 ${c.ejercicioNombre}` : '📋 General'}
                                            {` · Sem ${(c.semana ?? 0) + 1} · Día ${(c.dia ?? 0) + 1}`}
                                        </span>
                                    </div>
                                    {!c.leido && <div className="dash-comentario__dot" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Alumnos sin rutina */}
                <div className="dash-panel">
                    <div className="dash-panel__header">
                        <h2>Alumnos sin rutina</h2>
                        <button className="dash-panel__link" onClick={() => navigate('/profesor/alumnos')}>
                            Ver alumnos →
                        </button>
                    </div>
                    {sinRutina.length === 0 ? (
                        <div className="dash-panel__ok">
                            <span>✓</span>
                            <p>Todos los alumnos tienen rutina asignada.</p>
                        </div>
                    ) : (
                        <div className="dash-sinrutina">
                            {sinRutina.map(a => (
                                <div className="dash-sinrutina__item" key={a.id}>
                                    <div className="dash-sinrutina__avatar">
                                        {a.nombre?.[0]}{a.apellido?.[0]}
                                    </div>
                                    <div className="dash-sinrutina__info">
                                        <span>{a.nombre} {a.apellido}</span>
                                        <span>{a.modalidad}</span>
                                    </div>
                                    <button
                                        className="accion accion--rutina"
                                        onClick={() => navigate('/profesor/alumnos')}
                                    >
                                        Asignar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Estado general de alumnos */}
            <div className="dash-panel" style={{ marginTop: '1.5rem' }}>
                <div className="dash-panel__header">
                    <h2>Estado general</h2>
                </div>
                <div className="dash-alumnos">
                    {alumnos.map(a => {
                        const rutina = rutinasActivas[a.id];
                        return (
                            <div className="dash-alumno-row" key={a.id}>
                                <div className="dash-alumno-row__avatar">
                                    {a.nombre?.[0]}{a.apellido?.[0]}
                                </div>
                                <div className="dash-alumno-row__info">
                                    <span className="dash-alumno-row__nombre">{a.nombre} {a.apellido}</span>
                                    <span className="dash-alumno-row__modalidad">{a.modalidad}</span>
                                </div>
                                <div className="dash-alumno-row__rutina">
                                    {rutina
                                        ? <span className="dash-tag dash-tag--activa">● {rutina.nombre}</span>
                                        : <span className="dash-tag dash-tag--sin">Sin rutina</span>
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}