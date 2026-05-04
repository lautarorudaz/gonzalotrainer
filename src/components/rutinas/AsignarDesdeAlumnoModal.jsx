import { useState, useEffect } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import RutinaEditor from './RutinaEditor';
import { rutinaVacia } from '../../utils/rutinas';
import './AsignarDesdeAlumnoModal.css';

export default function AsignarDesdeAlumnoModal({ alumno, modo, rutinaExistente, onClose }) {
    const [paso, setPaso] = useState(modo === 'editar' ? 'editor' : 'elegir-tipo');
    const [rutinaBase, setRutinaBase] = useState(rutinaExistente || null);
    const [genericas, setGenericas] = useState([]);
    const [loadingGenericas, setLoadingGenericas] = useState(false);

    useEffect(() => {
        if (paso === 'elegir-generica') {
            setLoadingGenericas(true);
            getDocs(collection(db, 'rutinas_genericas')).then(snap => {
                setGenericas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoadingGenericas(false);
            });
        }
    }, [paso]);

    const handleGuardarRutina = async (data) => {
        if (modo === 'editar' && rutinaExistente) {
            // Actualizar rutina activa existente
            const snap = await getDocs(collection(db, 'usuarios', alumno.id, 'rutinaActiva'));
            if (!snap.empty) {
                await updateDoc(doc(db, 'usuarios', alumno.id, 'rutinaActiva', snap.docs[0].id), data);
            }
        } else {
            // Crear nueva rutina activa
            await addDoc(collection(db, 'usuarios', alumno.id, 'rutinaActiva'), {
                ...data,
                fechaInicio: serverTimestamp(),
            });
        }
        onClose();
    };

    // Paso 1 — elegir tipo (solo para alumnos sin rutina)
    if (paso === 'elegir-tipo') {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="asignar-tipo-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal__header">
                        <div>
                            <h2>Asignar rutina</h2>
                            <p className="asignar-tipo-modal__alumno">
                                {alumno.nombre} {alumno.apellido}
                            </p>
                        </div>
                        <button className="modal__close" onClick={onClose}>✕</button>
                    </div>
                    <div className="asignar-tipo-modal__opciones">
                        <button
                            className="asignar-tipo-opcion"
                            onClick={() => { setRutinaBase(rutinaVacia()); setPaso('editor'); }}
                        >
                            <span className="asignar-tipo-opcion__icono">✦</span>
                            <span className="asignar-tipo-opcion__titulo">Rutina nueva</span>
                            <span className="asignar-tipo-opcion__desc">Creá una rutina desde cero para este alumno</span>
                        </button>
                        <button
                            className="asignar-tipo-opcion"
                            onClick={() => setPaso('elegir-generica')}
                        >
                            <span className="asignar-tipo-opcion__icono">◈</span>
                            <span className="asignar-tipo-opcion__titulo">Usar rutina genérica</span>
                            <span className="asignar-tipo-opcion__desc">Elegí una base y editala antes de asignar</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Paso 2 — elegir rutina genérica
    if (paso === 'elegir-generica') {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="asignar-tipo-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal__header">
                        <h2>Elegí una rutina base</h2>
                        <button className="modal__close" onClick={onClose}>✕</button>
                    </div>
                    <div className="asignar-generica-lista">
                        {loadingGenericas ? (
                            <p className="asignar-generica-empty">Cargando...</p>
                        ) : genericas.length === 0 ? (
                            <p className="asignar-generica-empty">No hay rutinas genéricas cargadas.</p>
                        ) : genericas.map(g => (
                            <button
                                key={g.id}
                                className="asignar-generica-item"
                                onClick={() => { setRutinaBase(JSON.parse(JSON.stringify(g))); setPaso('editor'); }}
                            >
                                <span className="asignar-generica-item__nombre">{g.nombre}</span>
                                <span className="asignar-generica-item__meta">
                                    {g.semanas?.length} semana{g.semanas?.length !== 1 ? 's' : ''}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="modal__actions" style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 1.5rem' }}>
                        <button className="modal__btn modal__btn--cancel" onClick={() => setPaso('elegir-tipo')}>
                            ← Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Paso 3 — editor de rutina
    return (
        <RutinaEditor
            rutina={rutinaBase}
            coleccion={null}
            onClose={onClose}
            onGuardar={handleGuardarRutina}
            textoGuardar={modo === 'editar' ? 'Guardar cambios' : `Asignar a ${alumno.nombre}`}
        />
    );
}