import { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getYoutubeThumbnail, getYoutubeEmbedUrl } from '../utils/youtube';
import './EjercicioModal.css';

const ETAPAS = ['Movilidad', 'Activación', 'Central'];

export default function EjercicioModal({ ejercicio, zonasDisponibles, onClose }) {
    const editando = !!ejercicio;

    const [form, setForm] = useState({
        nombre: ejercicio?.nombre || '',
        descripcion: ejercicio?.descripcion || '',
        etapa: ejercicio?.etapa || '',
        zona: Array.isArray(ejercicio?.zona) ? ejercicio.zona : ejercicio?.zona ? [ejercicio.zona] : [],
        videoUrl: ejercicio?.videoUrl || '',
    });
    const [zonaCustom, setZonaCustom] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const toggleZona = (z) => {
        setForm(f => ({
            ...f,
            zona: f.zona.includes(z) ? f.zona.filter(x => x !== z) : [...f.zona, z]
        }));
    };

    const agregarZonaCustom = () => {
        const nueva = zonaCustom.trim();
        if (!nueva || form.zona.includes(nueva)) return;
        setForm(f => ({ ...f, zona: [...f.zona, nueva] }));
        setZonaCustom('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.zona.length === 0) { setError('Seleccioná al menos una zona muscular.'); return; }
        setError('');
        setLoading(true);

        try {
            const data = {
                nombre: form.nombre,
                descripcion: form.descripcion,
                etapa: form.etapa,
                zona: form.zona,
                videoUrl: form.videoUrl,
            };

            if (editando) {
                await updateDoc(doc(db, 'ejercicios', ejercicio.id), data);
            } else {
                await addDoc(collection(db, 'ejercicios'), data);
            }
            onClose();
        } catch {
            setError('Ocurrió un error. Intentá de nuevo.');
        }

        setLoading(false);
    };

    const thumb = getYoutubeThumbnail(form.videoUrl);
    const embedUrl = getYoutubeEmbedUrl(form.videoUrl);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal ej-modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>{editando ? 'Editar ejercicio' : 'Nuevo ejercicio'}</h2>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <form className="modal__form" onSubmit={handleSubmit}>
                    <div className="modal__field">
                        <label>Nombre</label>
                        <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Press de banca" />
                    </div>

                    <div className="modal__field">
                        <label>Descripción</label>
                        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} placeholder="Descripción del ejercicio..." />
                    </div>

                    <div className="modal__field">
                        <label>Etapa</label>
                        <select name="etapa" value={form.etapa} onChange={handleChange} required>
                            <option value="">Seleccioná una etapa</option>
                            {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>

                    <div className="modal__field">
                        <label>Zona muscular <span className="modal__label-hint">(podés elegir varias)</span></label>
                        <div className="zona__chips">
                            {zonasDisponibles.map(z => (
                                <button
                                    type="button"
                                    key={z}
                                    className={`filtro__chip ${form.zona.includes(z) ? 'active' : ''}`}
                                    onClick={() => toggleZona(z)}
                                >{z}</button>
                            ))}
                        </div>
                        <div className="zona__custom">
                            <input
                                type="text"
                                placeholder="Agregar zona nueva..."
                                value={zonaCustom}
                                onChange={e => setZonaCustom(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregarZonaCustom())}
                            />
                            <button type="button" onClick={agregarZonaCustom}>+</button>
                        </div>
                    </div>

                    <div className="modal__field">
                        <label>URL de video de YouTube</label>
                        <input
                            name="videoUrl"
                            value={form.videoUrl}
                            onChange={handleChange}
                            placeholder="https://youtube.com/watch?v=..."
                        />
                        {embedUrl && (
                            <div className="ej-modal__preview">
                                <iframe
                                    src={embedUrl}
                                    title="Preview video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    frameBorder="0"
                                />
                            </div>
                        )}
                    </div>

                    {error && <p className="modal__error">{error}</p>}

                    <div className="modal__actions">
                        <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="modal__btn modal__btn--save" disabled={loading}>
                            {loading ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear ejercicio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}