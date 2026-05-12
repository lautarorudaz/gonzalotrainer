import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { rutinaVacia, semanaVacia, diaVacio, ejercicioVacio, ETAPAS } from '../../utils/rutinas';
import DiaModal from './DiaModal';
import './RutinaEditor.css';

export default function RutinaEditor({ rutina, coleccion, alumnoId, onClose, onGuardar }) {
    const editando = !!rutina;
    const [data, setData] = useState(
        rutina ? JSON.parse(JSON.stringify(rutina)) : rutinaVacia()
    );
    const [semanaIdx, setSemanaIdx] = useState(0);
    const [diaModal, setDiaModal] = useState(null);
    const [ejercicios, setEjercicios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        getDocs(collection(db, 'ejercicios')).then(snap => {
            setEjercicios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
    }, []);

    const agregarSemana = () => {
        setData(d => ({ ...d, semanas: [...d.semanas, semanaVacia()] }));
        setSemanaIdx(data.semanas.length);
    };

    const agregarDia = () => {
        setData(d => {
            const semanas = [...d.semanas];
            semanas[semanaIdx] = {
                ...semanas[semanaIdx],
                dias: [...(semanas[semanaIdx].dias || []), diaVacio()]
            };
            return { ...d, semanas };
        });
    };

    const handleDiaGuardar = (diaActualizado, diaIdx) => {
        setData(d => {
            const semanas = JSON.parse(JSON.stringify(d.semanas));
            semanas[semanaIdx].dias[diaIdx] = diaActualizado;
            return { ...d, semanas };
        });
        setDiaModal(null);
    };

    const handleGuardar = async () => {
        if (!data.nombre.trim()) { setError('Ponele un nombre a la rutina.'); return; }
        setLoading(true);
        try {
            if (onGuardar) {
                // Si onGuardar es externo NO llamamos onClose, lo maneja el padre
                await onGuardar(data);
            } else if (editando) {
                await updateDoc(doc(db, coleccion, rutina.id), data);
                onClose();
            } else {
                await addDoc(collection(db, coleccion), data);
                onClose();
            }
        } catch { setError('Error al guardar. Intentá de nuevo.'); }
        setLoading(false);
    };

    const semana = data.semanas?.[semanaIdx];

    return (
        <div className="modal-overlay rutina-editor-overlay" onClick={onClose}>
            <div className="rutina-editor" onClick={e => e.stopPropagation()}>
                <div className="rutina-editor__header">
                    <input
                        className="rutina-editor__nombre"
                        placeholder="Nombre de la rutina..."
                        value={data.nombre}
                        onChange={e => setData(d => ({ ...d, nombre: e.target.value }))}
                    />
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="rutina-editor__semanas">
                    {data.semanas?.map((_, i) => (
                        <button
                            key={i}
                            className={`semana-chip ${semanaIdx === i ? 'active' : ''}`}
                            onClick={() => setSemanaIdx(i)}
                        >
                            Semana {i + 1}
                        </button>
                    ))}
                    <button className="semana-chip semana-chip--add" onClick={agregarSemana}>
                        + Semana
                    </button>
                </div>

                <div className="rutina-editor__dias">
                    {semana?.dias?.map((dia, di) => (
                        <div
                            className="dia-card-editor"
                            key={di}
                            onClick={() => setDiaModal({ dia: JSON.parse(JSON.stringify(dia)), diaIdx: di })}
                        >
                            <div className="dia-card-editor__header">
                                <span>{dia.nombre || `Día ${di + 1}`}</span>
                                <span className="dia-card-editor__edit">Editar →</span>
                            </div>
                            {ETAPAS.map(etapa => {
                                const ejs = dia.ejercicios?.[etapa] || [];
                                if (ejs.length === 0) return null;
                                return (
                                    <div key={etapa} className="dia-card-editor__etapa">
                                        <span className="dia-preview__etapa-label">{etapa}</span>
                                        {ejs.map((ej, ei) => (
                                            <div key={ei} className="dia-preview__ej">
                                                <div className="dia-preview__ej-nombre">{ej.nombre || '—'}</div>
                                                <div className="dia-preview__ej-detalle">
                                                    {ej.series}×{ej.repeticiones}{ej.peso ? ` · ${ej.peso}kg` : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                            {ETAPAS.every(e => !dia.ejercicios?.[e]?.length) && (
                                <p className="dia-card-editor__empty">Sin ejercicios</p>
                            )}
                        </div>
                    ))}
                    <div className="dia-card-editor dia-card-editor--add" onClick={agregarDia}>
                        <span>+ Agregar día</span>
                    </div>
                </div>

                {error && <p className="modal__error" style={{ margin: '0 1.5rem' }}>{error}</p>}

                <div className="rutina-editor__footer">
                    <button className="modal__btn modal__btn--cancel" onClick={onClose}>Cancelar</button>
                    <button className="modal__btn modal__btn--save" onClick={handleGuardar} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar rutina'}
                    </button>
                </div>

                {diaModal && (
                    <DiaModal
                        dia={diaModal.dia}
                        diaIdx={diaModal.diaIdx}
                        ejerciciosBanco={ejercicios}
                        onGuardar={handleDiaGuardar}
                        onClose={() => setDiaModal(null)}
                    />
                )}
            </div>
        </div>
    );
}