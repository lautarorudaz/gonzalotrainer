import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { rutinaVacia, semanaVacia, diaVacio } from '../../utils/rutinas';
import RutinaEditor from '../../components/rutinas/RutinaEditor';
import AsignarRutinaModal from '../../components/rutinas/AsignarRutinaModal';
import './Rutinas.css';

export default function Rutinas() {
    const [rutinas, setRutinas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editorOpen, setEditorOpen] = useState(false);
    const [rutinaEditando, setRutinaEditando] = useState(null);
    const [asignarRutina, setAsignarRutina] = useState(null);
    const [semanaActiva, setSemanaActiva] = useState({});

    const fetchRutinas = async () => {
        const snap = await getDocs(collection(db, 'rutinas_genericas'));
        setRutinas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchRutinas(); }, []);

    const handleNueva = () => {
        setRutinaEditando(null);
        setEditorOpen(true);
    };

    const handleEditar = (rutina) => {
        setRutinaEditando(rutina);
        setEditorOpen(true);
    };

    const handleEliminar = async (rutina) => {
        if (!confirm(`¿Eliminar "${rutina.nombre}"?`)) return;
        await deleteDoc(doc(db, 'rutinas_genericas', rutina.id));
        fetchRutinas();
    };

    const getSemanaActiva = (rutinaId, total) => semanaActiva[rutinaId] ?? 0;

    return (
        <div className="rutinas">
            <div className="rutinas__header">
                <div>
                    <h1 className="rutinas__title">Rutinas</h1>
                    <p className="rutinas__subtitle">{rutinas.length} rutinas genéricas</p>
                </div>
                <button className="btn-primary" onClick={handleNueva}>+ Nueva rutina</button>
            </div>

            {loading ? <p className="rutinas__empty">Cargando...</p> : rutinas.length === 0 ? (
                <p className="rutinas__empty">No hay rutinas todavía.</p>
            ) : (
                rutinas.map(rutina => {
                    const semIdx = getSemanaActiva(rutina.id, rutina.semanas?.length);
                    const semana = rutina.semanas?.[semIdx];
                    return (
                        <div className="rutina-card" key={rutina.id}>
                            <div className="rutina-card__header">
                                <div>
                                    <h3 className="rutina-card__nombre">{rutina.nombre}</h3>
                                    <p className="rutina-card__meta">
                                        {rutina.semanas?.length} semana{rutina.semanas?.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="rutina-card__acciones">
                                    <button className="btn-ghost" onClick={() => handleEditar(rutina)}>Editar</button>
                                    <button className="btn-ghost btn-ghost--accent" onClick={() => setAsignarRutina(rutina)}>
                                        Asignar a alumno
                                    </button>
                                    <button className="btn-ghost btn-ghost--danger" onClick={() => handleEliminar(rutina)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>

                            <div className="rutina-card__semanas">
                                {rutina.semanas?.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`semana-chip ${semIdx === i ? 'active' : ''}`}
                                        onClick={() => setSemanaActiva(prev => ({ ...prev, [rutina.id]: i }))}
                                    >
                                        Semana {i + 1}
                                    </button>
                                ))}
                            </div>

                            <div className="rutina-card__dias">
                                {semana?.dias?.map((dia, di) => (
                                    <div className="dia-preview" key={di}>
                                        <div className="dia-preview__header">
                                            {dia.nombre || `Día ${di + 1}`}
                                        </div>
                                        {['Movilidad', 'Activación', 'Central'].map(etapa => {
                                            const ejs = dia.ejercicios?.[etapa] || [];
                                            if (ejs.length === 0) return null;
                                            return (
                                                <div className="dia-preview__etapa" key={etapa}>
                                                    <span className="dia-preview__etapa-label">{etapa}</span>
                                                    {ejs.map((ej, ei) => (
                                                        <div className="dia-preview__ej" key={ei}>
                                                            <div className="dia-preview__ej-nombre">{ej.nombre || '—'}</div>
                                                            <div className="dia-preview__ej-detalle">
                                                                {ej.series}×{ej.repeticiones}{ej.peso ? ` · ${ej.peso}kg` : ''}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}

            {editorOpen && (
                <RutinaEditor
                    rutina={rutinaEditando}
                    coleccion="rutinas_genericas"
                    onClose={() => { setEditorOpen(false); fetchRutinas(); }}
                />
            )}

            {asignarRutina && (
                <AsignarRutinaModal
                    rutinaBase={asignarRutina}
                    onClose={() => { setAsignarRutina(null); fetchRutinas(); }}
                />
            )}
        </div>
    );
}