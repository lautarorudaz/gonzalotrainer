import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './Comentarios.css';

export default function Comentarios() {
    const [seccion, setSeccion] = useState('generales');
    const [alumnos, setAlumnos] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroAlumno, setFiltroAlumno] = useState('todos');
    const [filtroSemana, setFiltroSemana] = useState('todas');
    const [filtroDia, setFiltroDia] = useState('todos');

    useEffect(() => {
        fetchAlumnos();
    }, []);

    useEffect(() => {
        if (alumnos.length > 0) fetchComentarios();
    }, [alumnos]);

    const fetchAlumnos = async () => {
        const snap = await getDocs(collection(db, 'usuarios'));
        const lista = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(u => u.rol === 'alumno');
        setAlumnos(lista);
    };

    const fetchComentarios = async () => {
        setLoading(true);
        const todos = [];
        for (const alumno of alumnos) {
            const snap = await getDocs(
                query(collection(db, 'usuarios', alumno.id, 'comentarios'), orderBy('fecha', 'desc'))
            );
            snap.docs.forEach(d => {
                todos.push({
                    id: d.id,
                    alumnoId: alumno.id,
                    alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
                    ...d.data()
                });
            });
        }
        todos.sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
        setComentarios(todos);
        setLoading(false);
    };

    const handleMarcarLeido = async (c) => {
        await updateDoc(doc(db, 'usuarios', c.alumnoId, 'comentarios', c.id), { leido: true });
        setComentarios(prev => prev.map(x => x.id === c.id && x.alumnoId === c.alumnoId ? { ...x, leido: true } : x));
    };

    const handleEliminar = async (c) => {
        if (!confirm('¿Eliminar este comentario?')) return;
        await deleteDoc(doc(db, 'usuarios', c.alumnoId, 'comentarios', c.id));
        setComentarios(prev => prev.filter(x => !(x.id === c.id && x.alumnoId === c.alumnoId)));
    };

    const handleLimpiarBandeja = async () => {
        if (!confirm('¿Eliminar todos los comentarios leídos?')) return;
        const leidos = comentariosFiltrados.filter(c => c.leido && c.tipo === 'dia');
        for (const c of leidos) {
            await deleteDoc(doc(db, 'usuarios', c.alumnoId, 'comentarios', c.id));
        }
        setComentarios(prev => prev.filter(c => !leidos.find(l => l.id === c.id && l.alumnoId === c.alumnoId)));
    };

    const formatFecha = (ts) => {
        if (!ts?.seconds) return '—';
        return new Date(ts.seconds * 1000).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const semanas = [...new Set(comentarios.map(c => c.semana).filter(s => s !== undefined))].sort((a, b) => a - b);
    const dias = [...new Set(comentarios.map(c => c.dia).filter(d => d !== undefined))].sort((a, b) => a - b);

    const comentariosFiltrados = comentarios.filter(c => {
        const matchAlumno = filtroAlumno === 'todos' || c.alumnoId === filtroAlumno;
        const matchSemana = filtroSemana === 'todas' || c.semana === Number(filtroSemana);
        const matchDia = filtroDia === 'todos' || c.dia === Number(filtroDia);
        return matchAlumno && matchSemana && matchDia;
    });

    const generales = comentariosFiltrados.filter(c => c.tipo === 'dia');
    const progreso = comentariosFiltrados.filter(c => c.tipo === 'ejercicio');

    const totalGenerales = generales.length;
    const vistos = generales.filter(c => c.leido).length;
    const sinLeer = generales.filter(c => !c.leido).length;

    return (
        <div className="comentarios">
            <div className="comentarios__header">
                <div>
                    <h1 className="comentarios__title">Comentarios</h1>
                </div>
                <div className="comentarios__tabs">
                    <button
                        className={`comentarios__tab ${seccion === 'generales' ? 'active' : ''}`}
                        onClick={() => setSeccion('generales')}
                    >
                        Generales {sinLeer > 0 && <span className="comentarios__badge">{sinLeer}</span>}
                    </button>
                    <button
                        className={`comentarios__tab ${seccion === 'progreso' ? 'active' : ''}`}
                        onClick={() => setSeccion('progreso')}
                    >
                        Progreso
                    </button>
                </div>
            </div>

            {/* Filtros compartidos */}
            <div className="comentarios__filtros">
                <div className="filtro-field">
                    <label>Alumno</label>
                    <select value={filtroAlumno} onChange={e => setFiltroAlumno(e.target.value)}>
                        <option value="todos">Todos los alumnos</option>
                        {alumnos.map(a => (
                            <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
                        ))}
                    </select>
                </div>
                <div className="filtro-field">
                    <label>Semana</label>
                    <select value={filtroSemana} onChange={e => setFiltroSemana(e.target.value)}>
                        <option value="todas">Todas</option>
                        {semanas.map(s => (
                            <option key={s} value={s}>Semana {s + 1}</option>
                        ))}
                    </select>
                </div>
                <div className="filtro-field">
                    <label>Día</label>
                    <select value={filtroDia} onChange={e => setFiltroDia(e.target.value)}>
                        <option value="todos">Todos</option>
                        {dias.map(d => (
                            <option key={d} value={d}>Día {d + 1}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* SECCIÓN GENERALES */}
            {seccion === 'generales' && (
                <div className="comentarios__seccion">
                    <div className="comentarios__stats">
                        <div className="stat-card">
                            <span className="stat-card__num">{totalGenerales}</span>
                            <span className="stat-card__label">Total</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-card__num">{vistos}</span>
                            <span className="stat-card__label">Vistos</span>
                        </div>
                        <div className="stat-card stat-card--accent">
                            <span className="stat-card__num">{sinLeer}</span>
                            <span className="stat-card__label">Sin leer</span>
                        </div>
                        <button className="comentarios__limpiar" onClick={handleLimpiarBandeja}>
                            Limpiar leídos
                        </button>
                    </div>

                    {loading ? (
                        <p className="comentarios__empty">Cargando...</p>
                    ) : generales.length === 0 ? (
                        <p className="comentarios__empty">No hay comentarios.</p>
                    ) : (
                        <div className="comentarios__lista">
                            {generales.map((c, i) => (
                                <div className={`comentario-card ${c.leido ? 'comentario-card--leido' : ''}`} key={i}>
                                    <div className="comentario-card__avatar">
                                        {c.alumnoNombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="comentario-card__body">
                                        <div className="comentario-card__meta">
                                            <span className="comentario-card__alumno">{c.alumnoNombre}</span>
                                            <span className="comentario-card__fecha">{formatFecha(c.fecha)}</span>
                                        </div>
                                        <div className="comentario-card__ubicacion">
                                            Semana {(c.semana ?? 0) + 1} · Día {(c.dia ?? 0) + 1}
                                            {c.rutinaNombre && ` · ${c.rutinaNombre}`}
                                        </div>
                                        <p className="comentario-card__texto">{c.texto}</p>
                                    </div>
                                    <div className="comentario-card__acciones">
                                        {!c.leido && (
                                            <button className="accion accion--editar" onClick={() => handleMarcarLeido(c)}>
                                                Marcar leído
                                            </button>
                                        )}
                                        <button className="accion accion--eliminar" onClick={() => handleEliminar(c)}>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* SECCIÓN PROGRESO */}
            {seccion === 'progreso' && (
                <div className="comentarios__seccion">
                    <div className="comentarios__stats">
                        <div className="stat-card">
                            <span className="stat-card__num">{progreso.length}</span>
                            <span className="stat-card__label">Registros totales</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-card__num">
                                {[...new Set(progreso.map(c => c.alumnoId))].length}
                            </span>
                            <span className="stat-card__label">Alumnos activos</span>
                        </div>
                    </div>

                    {loading ? (
                        <p className="comentarios__empty">Cargando...</p>
                    ) : progreso.length === 0 ? (
                        <p className="comentarios__empty">No hay registros de progreso.</p>
                    ) : (
                        <div className="comentarios__lista">
                            {progreso.map((c, i) => (
                                <div className="progreso-card" key={i}>
                                    <div className="progreso-card__avatar">
                                        {c.alumnoNombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="progreso-card__body">
                                        <div className="progreso-card__meta">
                                            <span className="progreso-card__alumno">{c.alumnoNombre}</span>
                                            <span className="progreso-card__fecha">{formatFecha(c.fecha)}</span>
                                        </div>
                                        <div className="progreso-card__ubicacion">
                                            Semana {(c.semana ?? 0) + 1} · Día {(c.dia ?? 0) + 1}
                                        </div>
                                        <div className="progreso-card__ejercicio">
                                            <span className="progreso-card__ej-tag">📌 {c.ejercicioNombre}</span>
                                        </div>
                                        <p className="progreso-card__texto">{c.texto}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}