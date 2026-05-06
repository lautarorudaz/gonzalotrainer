import { useState } from 'react';
import { ETAPAS, ejercicioVacio } from '../../utils/rutinas';
import './DiaModal.css';

export default function DiaModal({ dia, diaIdx, ejerciciosBanco, onGuardar, onClose }) {
    const [data, setData] = useState(JSON.parse(JSON.stringify(dia)));
    const [selectorAbierto, setSelectorAbierto] = useState(null); // { etapa, idx }
    const [busqueda, setBusqueda] = useState('');
    const [etapasExpandidas, setEtapasExpandidas] = useState(
        ETAPAS.reduce((acc, etapa) => ({ ...acc, [etapa]: true }), {})
    );
    const [ejerciciosExpandidos, setEjerciciosExpandidos] = useState({});

    const toggleEtapa = (etapa) => {
        setEtapasExpandidas(prev => ({ ...prev, [etapa]: !prev[etapa] }));
    };

    const toggleEjercicio = (etapa, idx) => {
        const key = `${etapa}-${idx}`;
        setEjerciciosExpandidos(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
    };

    const isEjercicioExpandido = (etapa, idx) => {
        const key = `${etapa}-${idx}`;
        return ejerciciosExpandidos[key] !== false; // Default is true
    };

    const setNombre = (nombre) => setData(d => ({ ...d, nombre }));

    const agregarEjercicio = (etapa) => {
        setData(d => {
            const ejs = [...(d.ejercicios?.[etapa] || []), ejercicioVacio()];
            setEjerciciosExpandidos(prev => ({ ...prev, [`${etapa}-${ejs.length - 1}`]: true }));
            return { ...d, ejercicios: { ...d.ejercicios, [etapa]: ejs } };
        });
    };

    const eliminarEjercicio = (etapa, idx) => {
        setData(d => {
            const ejs = [...(d.ejercicios?.[etapa] || [])];
            ejs.splice(idx, 1);
            return { ...d, ejercicios: { ...d.ejercicios, [etapa]: ejs } };
        });
    };

    const updateEjercicio = (etapa, idx, field, value) => {
        setData(d => {
            const ejs = [...(d.ejercicios?.[etapa] || [])];
            ejs[idx] = { ...ejs[idx], [field]: value };
            return { ...d, ejercicios: { ...d.ejercicios, [etapa]: ejs } };
        });
    };

    const seleccionarEjercicio = (ejercicio) => {
        const { etapa, idx } = selectorAbierto;
        setData(d => {
            const ejs = [...(d.ejercicios?.[etapa] || [])];
            ejs[idx] = { ...ejs[idx], ejercicioId: ejercicio.id, nombre: ejercicio.nombre };
            return { ...d, ejercicios: { ...d.ejercicios, [etapa]: ejs } };
        });
        setSelectorAbierto(null);
        setBusqueda('');
    };

    const ejerciciosFiltrados = (etapa) => {
        return ejerciciosBanco
            .filter(e => e.etapa === etapa)
            .filter(e => e.nombre?.toLowerCase().includes(busqueda.toLowerCase()));
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 300 }} onClick={onClose}>
            <div className="dia-modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <input
                        className="dia-modal__nombre"
                        placeholder="Nombre del día (ej: Piernas, Empuje...)"
                        value={data.nombre}
                        onChange={e => setNombre(e.target.value)}
                    />
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="dia-modal__body">
                    {ETAPAS.map(etapa => (
                        <div className="dia-modal__etapa" key={etapa}>
                            <div className="dia-modal__etapa-header" onClick={() => toggleEtapa(etapa)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <h3>{etapa}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        {etapasExpandidas[etapa] ? '▲' : '▼'}
                                    </span>
                                </div>
                                <button 
                                    className="dia-modal__add-ej" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        agregarEjercicio(etapa);
                                        setEtapasExpandidas(prev => ({ ...prev, [etapa]: true }));
                                    }}
                                >
                                    + Agregar ejercicio
                                </button>
                            </div>

                            {etapasExpandidas[etapa] && (
                                (data.ejercicios?.[etapa] || []).length === 0 ? (
                                    <p className="dia-modal__empty">Sin ejercicios en esta etapa.</p>
                                ) : (
                                    (data.ejercicios?.[etapa] || []).map((ej, ei) => (
                                        <div className="ej-row" key={ei}>
                                            <div className="ej-row__header" style={{ marginBottom: isEjercicioExpandido(etapa, ei) ? '1rem' : '0' }}>
                                                <div className="ej-row__toggle" onClick={() => toggleEjercicio(etapa, ei)}>
                                                    <span className="ej-row__toggle-icon">
                                                        {isEjercicioExpandido(etapa, ei) ? '▼' : '▶'}
                                                    </span>
                                                    <span className="ej-row__title">
                                                        {ej.nombre || 'Nuevo ejercicio...'}
                                                    </span>
                                                </div>
                                                <button className="ej-row__eliminar" onClick={() => eliminarEjercicio(etapa, ei)}>✕</button>
                                            </div>

                                            {isEjercicioExpandido(etapa, ei) && (
                                                <>
                                                    <div className="ej-row__select">
                                                        <label>Ejercicio</label>
                                                        <button
                                                            className="ej-selector-btn"
                                                            onClick={() => { setSelectorAbierto({ etapa, idx: ei }); setBusqueda(''); }}
                                                        >
                                                            {ej.nombre || 'Seleccioná un ejercicio...'}
                                                            <span>▾</span>
                                                        </button>
                                                    </div>

                                                    <div className="ej-row__campos">
                                                        <div className="ej-campo">
                                                            <label>Series</label>
                                                            <input type="number" value={ej.series} placeholder="3"
                                                                onChange={e => updateEjercicio(etapa, ei, 'series', e.target.value)} />
                                                        </div>
                                                        <div className="ej-campo">
                                                            <label>Reps</label>
                                                            <input type="number" value={ej.repeticiones} placeholder="12"
                                                                onChange={e => updateEjercicio(etapa, ei, 'repeticiones', e.target.value)} />
                                                        </div>
                                                        <div className="ej-campo">
                                                            <label>Peso (kg)</label>
                                                            <input type="number" value={ej.peso} placeholder="0"
                                                                onChange={e => updateEjercicio(etapa, ei, 'peso', e.target.value)} />
                                                        </div>
                                                    </div>

                                                    <div className="ej-row__aclaracion">
                                                        <label>Aclaración</label>
                                                        <input type="text" value={ej.aclaracion} placeholder="Ej: mantené la espalda recta..."
                                                            onChange={e => updateEjercicio(etapa, ei, 'aclaracion', e.target.value)} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    ))}
                </div>

                <div className="modal__actions" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
                    <button className="modal__btn modal__btn--cancel" onClick={onClose}>Cancelar</button>
                    <button className="modal__btn modal__btn--save" onClick={() => onGuardar(data, diaIdx)}>
                        Guardar día
                    </button>
                </div>
            </div>

            {/* Mini modal selector de ejercicio */}
            {selectorAbierto && (
                <div className="ej-selector-overlay" onClick={() => setSelectorAbierto(null)}>
                    <div className="ej-selector-modal" onClick={e => e.stopPropagation()}>
                        <div className="ej-selector-modal__header">
                            <p className="ej-selector-modal__etapa">{selectorAbierto.etapa}</p>
                            <input
                                className="ej-selector-modal__busqueda"
                                placeholder="Buscar ejercicio..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="ej-selector-modal__lista">
                            {ejerciciosFiltrados(selectorAbierto.etapa).length === 0 ? (
                                <p className="ej-selector-modal__empty">
                                    No hay ejercicios cargados para esta etapa.
                                </p>
                            ) : (
                                ejerciciosFiltrados(selectorAbierto.etapa).map(ej => (
                                    <button
                                        key={ej.id}
                                        className="ej-selector-modal__item"
                                        onClick={() => seleccionarEjercicio(ej)}
                                    >
                                        <span className="ej-selector-modal__nombre">{ej.nombre}</span>
                                        <span className="ej-selector-modal__zona">
                                            {Array.isArray(ej.zona) ? ej.zona.join(', ') : ej.zona}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}