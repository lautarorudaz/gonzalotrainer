import { ETAPAS } from '../../utils/rutinas';
import './HistorialViewer.css';
import { useState } from 'react';

export default function HistorialViewer({ rutina, onClose }) {
    const [semanaIdx, setSemanaIdx] = useState(0);
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="historial-viewer" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <div>
                        <h2>{rutina.nombre}</h2>
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Solo lectura</p>
                    </div>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="rutina-editor__semanas">
                    {rutina.semanas?.map((_, i) => (
                        <button
                            key={i}
                            className={`semana-chip ${semanaIdx === i ? 'active' : ''}`}
                            onClick={() => setSemanaIdx(i)}
                        >
                            Semana {i + 1}
                        </button>
                    ))}
                </div>

                <div className="historial-viewer__dias">
                    {rutina.semanas?.[semanaIdx]?.dias?.map((dia, di) => (
                        <div className="historial-viewer__dia" key={di}>
                            <div className="dia-card-editor__header">
                                {dia.nombre || `Día ${di + 1}`}
                            </div>
                            {ETAPAS.map(etapa => {
                                const ejs = dia.ejercicios?.[etapa] || [];
                                if (ejs.length === 0) return null;
                                return (
                                    <div key={etapa} className="dia-card-editor__etapa">
                                        <span className="dia-preview__etapa-label">{etapa}</span>
                                        {ejs.map((ej, ei) => (
                                            <div key={ei} className="historial-viewer__ej">
                                                <div className="dia-preview__ej-nombre">{ej.nombre || '—'}</div>
                                                <div className="dia-preview__ej-detalle">
                                                    {ej.series}×{ej.repeticiones}
                                                    {ej.peso ? ` · ${ej.peso}kg` : ''}
                                                    {ej.aclaracion ? ` · ${ej.aclaracion}` : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="rutina-editor__footer">
                    <button className="modal__btn modal__btn--cancel" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}