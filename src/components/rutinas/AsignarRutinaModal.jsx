import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import RutinaEditor from './RutinaEditor';
import './AsignarRutinaModal.css';

export default function AsignarRutinaModal({ rutinaBase, onClose }) {
    const [paso, setPaso] = useState('editor'); // 'editor' | 'elegir-alumno'
    const [rutinaCopia, setRutinaCopia] = useState(JSON.parse(JSON.stringify(rutinaBase)));
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getDocs(collection(db, 'usuarios')).then(snap => {
            setAlumnos(snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(u => u.rol === 'alumno')
            );
        });
    }, []);

    const handleAsignar = async (alumno) => {
        setLoading(true);
        try {
            const rutinaRef = collection(db, 'usuarios', alumno.id, 'rutinaActiva');
            await addDoc(rutinaRef, {
                ...rutinaCopia,
                fechaInicio: serverTimestamp(),
            });
            onClose();
        } catch { alert('Error al asignar. Intentá de nuevo.'); }
        setLoading(false);
    };

    if (paso === 'elegir-alumno') {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="asignar-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal__header">
                        <h2>Asignar a alumno</h2>
                        <button className="modal__close" onClick={onClose}>✕</button>
                    </div>
                    <p className="asignar-modal__rutina-nombre">Rutina: <strong>{rutinaCopia.nombre}</strong></p>
                    <div className="asignar-modal__lista">
                        {alumnos.length === 0 ? (
                            <p className="asignar-modal__empty">No hay alumnos registrados.</p>
                        ) : alumnos.map(alumno => (
                            <div className="asignar-alumno-row" key={alumno.id}>
                                <div className="asignar-alumno-avatar">
                                    {alumno.nombre?.[0]}{alumno.apellido?.[0]}
                                </div>
                                <div className="asignar-alumno-info">
                                    <p>{alumno.nombre} {alumno.apellido}</p>
                                    <span>{alumno.modalidad}</span>
                                </div>
                                <button
                                    className="modal__btn modal__btn--save"
                                    onClick={() => handleAsignar(alumno)}
                                    disabled={loading}
                                >
                                    Asignar
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="modal__actions" style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 1.5rem' }}>
                        <button className="modal__btn modal__btn--cancel" onClick={() => setPaso('editor')}>
                            ← Volver a editar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <RutinaEditor
            rutina={rutinaCopia}
            coleccion={null}
            onClose={onClose}
            onGuardar={async (data) => {
                setRutinaCopia(data);
                setPaso('elegir-alumno');
            }}
            textoGuardar="Asignar a →"
        />
    );
}