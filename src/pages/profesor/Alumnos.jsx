import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AlumnoModal from '../../components/AlumnoModal';
import AsignarDesdeAlumnoModal from '../../components/rutinas/AsignarDesdeAlumnoModal';
import HistorialModal from '../../components/rutinas/HistorialModal';
import './Alumnos.css';

export default function Alumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [alumnoEditando, setAlumnoEditando] = useState(null);
    const [asignarAlumno, setAsignarAlumno] = useState(null);
    const [historialAlumno, setHistorialAlumno] = useState(null);
    const [rutinasActivas, setRutinasActivas] = useState({});

    const fetchAlumnos = async () => {
        const snap = await getDocs(collection(db, 'usuarios'));
        const lista = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(u => u.rol === 'alumno');
        setAlumnos(lista);

        // Verificar qué alumnos tienen rutina activa
        const activas = {};
        await Promise.all(lista.map(async (alumno) => {
            const rutinaSnap = await getDocs(collection(db, 'usuarios', alumno.id, 'rutinaActiva'));
            if (!rutinaSnap.empty) {
                activas[alumno.id] = { id: rutinaSnap.docs[0].id, ...rutinaSnap.docs[0].data() };
            }
        }));
        setRutinasActivas(activas);
        setLoading(false);
    };

    useEffect(() => { fetchAlumnos(); }, []);

    const handleEliminar = async (alumno) => {
        if (!confirm(`¿Eliminar a ${alumno.nombre} ${alumno.apellido}?`)) return;
        await deleteDoc(doc(db, 'usuarios', alumno.id));
        fetchAlumnos();
    };

    const handleEliminarRutina = async (alumno) => {
        if (!confirm(`¿Eliminar la rutina activa de ${alumno.nombre}? Se moverá al historial.`)) return;
        const rutinaActiva = rutinasActivas[alumno.id];
        if (!rutinaActiva) return;

        // Mover al historial
        const { id, ...rutinaData } = rutinaActiva;
        await getDocs(collection(db, 'usuarios', alumno.id, 'rutinaActiva')).then(async snap => {
            for (const documento of snap.docs) {
                const data = documento.data();
                // Guardar en historial con fecha de fin
                await getDocs(collection(db, 'usuarios', alumno.id, 'historialRutinas')).then(() => { });
                const { addDoc, serverTimestamp } = await import('firebase/firestore');
                await addDoc(collection(db, 'usuarios', alumno.id, 'historialRutinas'), {
                    ...data,
                    fechaFin: serverTimestamp(),
                });
                await deleteDoc(doc(db, 'usuarios', alumno.id, 'rutinaActiva', documento.id));
            }
        });

        fetchAlumnos();
    };

    return (
        <div className="alumnos">
            <div className="alumnos__header">
                <div>
                    <h1 className="alumnos__title">Alumnos</h1>
                    <p className="alumnos__subtitle">{alumnos.length} alumnos registrados</p>
                </div>
                <button className="alumnos__btn-nuevo" onClick={() => { setAlumnoEditando(null); setModalOpen(true); }}>
                    + Nuevo alumno
                </button>
            </div>

            {loading ? (
                <p className="alumnos__loading">Cargando...</p>
            ) : alumnos.length === 0 ? (
                <div className="alumnos__empty">
                    <p>No hay alumnos todavía.</p>
                    <button onClick={() => setModalOpen(true)}>Agregá el primero</button>
                </div>
            ) : (
                <div className="alumnos__lista">
                    {alumnos.map((alumno) => {
                        const tieneRutina = !!rutinasActivas[alumno.id];
                        return (
                            <div className="alumno-card" key={alumno.id}>
                                <div className="alumno-card__avatar">
                                    {alumno.nombre?.[0]}{alumno.apellido?.[0]}
                                </div>
                                <div className="alumno-card__info">
                                    <h3>{alumno.nombre} {alumno.apellido}</h3>
                                    <p>{alumno.email}</p>
                                    <div className="alumno-card__tags">
                                        {alumno.numero && <span>{alumno.numero}</span>}
                                        {alumno.modalidad && <span>{alumno.modalidad}</span>}
                                        {tieneRutina && (
                                            <span className="alumno-card__tag-rutina">
                                                ● {rutinasActivas[alumno.id].nombre}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="alumno-card__acciones">
                                    <button className="accion accion--editar"
                                        onClick={() => { setAlumnoEditando(alumno); setModalOpen(true); }}>
                                        Editar
                                    </button>

                                    {!tieneRutina ? (
                                        <button className="accion accion--rutina"
                                            onClick={() => setAsignarAlumno(alumno)}>
                                            Asignar rutina
                                        </button>
                                    ) : (
                                        <>
                                            <button className="accion accion--rutina"
                                                onClick={() => setAsignarAlumno({ alumno, modo: 'editar', rutina: rutinasActivas[alumno.id] })}>
                                                Editar rutina
                                            </button>
                                            <button className="accion accion--del-rutina"
                                                onClick={() => handleEliminarRutina(alumno)}>
                                                Eliminar rutina
                                            </button>
                                        </>
                                    )}

                                    <button className="accion accion--historial"
                                        onClick={() => setHistorialAlumno(alumno)}>
                                        Historial
                                    </button>

                                    <button className="accion accion--eliminar"
                                        onClick={() => handleEliminar(alumno)}>
                                        Eliminar alumno
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {modalOpen && (
                <AlumnoModal
                    alumno={alumnoEditando}
                    onClose={() => { setModalOpen(false); setAlumnoEditando(null); fetchAlumnos(); }}
                />
            )}

            {asignarAlumno && (
                <AsignarDesdeAlumnoModal
                    alumno={asignarAlumno.alumno || asignarAlumno}
                    modo={asignarAlumno.modo || 'nuevo'}
                    rutinaExistente={asignarAlumno.rutina || null}
                    onClose={() => { setAsignarAlumno(null); fetchAlumnos(); }}
                />
            )}

            {historialAlumno && (
                <HistorialModal
                    alumno={historialAlumno}
                    onClose={() => setHistorialAlumno(null)}
                />
            )}
        </div>
    );
}