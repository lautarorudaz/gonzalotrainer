import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import AlumnoModal from '../../components/AlumnoModal';
import './Alumnos.css';

export default function Alumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [alumnoEditando, setAlumnoEditando] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAlumnos = async () => {
        const snap = await getDocs(collection(db, 'usuarios'));
        const lista = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(u => u.rol === 'alumno');
        setAlumnos(lista);
        setLoading(false);
    };

    useEffect(() => { fetchAlumnos(); }, []);

    const handleEliminar = async (alumno) => {
        if (!confirm(`¿Eliminár a ${alumno.nombre} ${alumno.apellido}?`)) return;
        await deleteDoc(doc(db, 'usuarios', alumno.id));
        fetchAlumnos();
    };

    const handleEditar = (alumno) => {
        setAlumnoEditando(alumno);
        setModalOpen(true);
    };

    const handleNuevo = () => {
        setAlumnoEditando(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setAlumnoEditando(null);
        fetchAlumnos();
    };

    return (
        <div className="alumnos">
            <div className="alumnos__header">
                <div>
                    <h1 className="alumnos__title">Alumnos</h1>
                    <p className="alumnos__subtitle">{alumnos.length} alumnos registrados</p>
                </div>
                <button className="alumnos__btn-nuevo" onClick={handleNuevo}>
                    + Nuevo alumno
                </button>
            </div>

            {loading ? (
                <p className="alumnos__loading">Cargando...</p>
            ) : alumnos.length === 0 ? (
                <div className="alumnos__empty">
                    <p>No hay alumnos todavía.</p>
                    <button onClick={handleNuevo}>Agregá el primero</button>
                </div>
            ) : (
                <div className="alumnos__lista">
                    {alumnos.map((alumno) => (
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
                                </div>
                            </div>
                            <div className="alumno-card__acciones">
                                <button
                                    className="accion accion--editar"
                                    onClick={() => handleEditar(alumno)}
                                >
                                    Editar
                                </button>
                                <button className="accion accion--rutina">
                                    Asignar rutina
                                </button>
                                <button className="accion accion--del-rutina">
                                    Eliminar rutina
                                </button>
                                <button
                                    className="accion accion--eliminar"
                                    onClick={() => handleEliminar(alumno)}
                                >
                                    Eliminar alumno
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <AlumnoModal
                    alumno={alumnoEditando}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}