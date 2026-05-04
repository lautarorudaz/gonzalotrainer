import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import EjercicioModal from '../../components/EjercicioModal';
import { getYoutubeThumbnail, getYoutubeEmbedUrl } from '../../utils/youtube';
import './Ejercicios.css';

const ETAPAS = ['Movilidad', 'Activación', 'Central'];
const ZONAS_DEFAULT = [
    'Pecho', 'Espalda', 'Hombro', 'Bíceps', 'Tríceps', 'Antebrazos',
    'Abdomen', 'Glúteos', 'Cuádriceps', 'Isquiotibiales', 'Pantorrillas', 'Cadera'
];

export default function Ejercicios() {
    const [ejercicios, setEjercicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);

    const [busqueda, setBusqueda] = useState('');
    const [filtroEtapa, setFiltroEtapa] = useState('');
    const [filtroZona, setFiltroZona] = useState('');
    const [etapaAbierta, setEtapaAbierta] = useState(false);
    const [zonaAbierta, setZonaAbierta] = useState(false);
    const [ejercicioViendo, setEjercicioViendo] = useState(null);

    const fetchEjercicios = async () => {
        const snap = await getDocs(collection(db, 'ejercicios'));
        setEjercicios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchEjercicios(); }, []);

    const handleEliminar = async (ej) => {
        if (!confirm(`¿Eliminar "${ej.nombre}"?`)) return;
        await deleteDoc(doc(db, 'ejercicios', ej.id));
        fetchEjercicios();
    };

    const ejerciciosFiltrados = ejercicios.filter(ej => {
        const matchBusqueda = ej.nombre?.toLowerCase().includes(busqueda.toLowerCase());
        const matchEtapa = filtroEtapa ? ej.etapa === filtroEtapa : true;
        const matchZona = filtroZona ? (Array.isArray(ej.zona) ? ej.zona.includes(filtroZona) : ej.zona === filtroZona) : true;
        return matchBusqueda && matchEtapa && matchZona;
    });

    // Zonas únicas incluyendo las custom que haya en Firestore
    const zonasDisponibles = [
        ...new Set([
            ...ZONAS_DEFAULT,
            ...ejercicios.flatMap(e => Array.isArray(e.zona) ? e.zona : [e.zona]).filter(Boolean)
        ])
    ];

    return (
        <div className="ejercicios">
            <div className="ejercicios__header">
                <div>
                    <h1 className="ejercicios__title">Ejercicios</h1>
                    <p className="ejercicios__subtitle">{ejerciciosFiltrados.length} ejercicios</p>
                </div>
                <button className="ejercicios__btn-nuevo" onClick={() => { setEditando(null); setModalOpen(true); }}>
                    + Nuevo ejercicio
                </button>
            </div>

            <div className="ejercicios__layout">
                <div className="ejercicios__grid">
                    {loading ? (
                        <p className="ejercicios__empty">Cargando...</p>
                    ) : ejerciciosFiltrados.length === 0 ? (
                        <p className="ejercicios__empty">No se encontraron ejercicios.</p>
                    ) : (
                        ejerciciosFiltrados.map(ej => {
                            const thumb = getYoutubeThumbnail(ej.videoUrl);
                            const hasVideo = !!getYoutubeEmbedUrl(ej.videoUrl);
                            return (
                                <div className="ejercicio-card" key={ej.id}>
                                    <div
                                        className={`ejercicio-card__thumb ${hasVideo ? 'ejercicio-card__thumb--clickable' : ''}`}
                                        onClick={() => hasVideo && setEjercicioViendo(ej)}
                                    >
                                        {thumb
                                            ? <img src={thumb} alt={ej.nombre} loading="lazy" />
                                            : <div className="ejercicio-card__thumb-placeholder">▶</div>
                                        }
                                        {hasVideo && (
                                            <div className="ejercicio-card__play-overlay">
                                                <span className="ejercicio-card__play-icon">▶</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ejercicio-card__body">
                                        <div className="ejercicio-card__tags">
                                            <span className="tag tag--etapa">{ej.etapa}</span>
                                            {(Array.isArray(ej.zona) ? ej.zona : [ej.zona]).map(z => (
                                                <span className="tag tag--zona" key={z}>{z}</span>
                                            ))}
                                        </div>
                                        <h3 className="ejercicio-card__nombre">{ej.nombre}</h3>
                                        <p className="ejercicio-card__desc">{ej.descripcion}</p>
                                        <div className="ejercicio-card__acciones">
                                            <button className="accion accion--editar" onClick={(e) => { e.stopPropagation(); setEditando(ej); setModalOpen(true); }}>
                                                Editar
                                            </button>
                                            <button className="accion accion--eliminar" onClick={(e) => { e.stopPropagation(); handleEliminar(ej); }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <aside className="ejercicios__filtros">
                    <h3>Búsqueda</h3>
                    <input
                        className="filtro__input"
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />

                    <button className="filtro__seccion-header" onClick={() => setEtapaAbierta(v => !v)}>
                        <h3>Etapa {filtroEtapa && <span className="filtro__activo-badge">●</span>}</h3>
                        <span className={`filtro__arrow ${etapaAbierta ? 'open' : ''}`}>▾</span>
                    </button>
                    {etapaAbierta && (
                        <div className="filtro__opciones">
                            <button
                                className={`filtro__chip ${filtroEtapa === '' ? 'active' : ''}`}
                                onClick={() => setFiltroEtapa('')}
                            >Todas</button>
                            {ETAPAS.map(e => (
                                <button
                                    key={e}
                                    className={`filtro__chip ${filtroEtapa === e ? 'active' : ''}`}
                                    onClick={() => setFiltroEtapa(e)}
                                >{e}</button>
                            ))}
                        </div>
                    )}

                    <button className="filtro__seccion-header" onClick={() => setZonaAbierta(v => !v)}>
                        <h3>Zona muscular {filtroZona && <span className="filtro__activo-badge">●</span>}</h3>
                        <span className={`filtro__arrow ${zonaAbierta ? 'open' : ''}`}>▾</span>
                    </button>
                    {zonaAbierta && (
                        <div className="filtro__opciones">
                            <button
                                className={`filtro__chip ${filtroZona === '' ? 'active' : ''}`}
                                onClick={() => setFiltroZona('')}
                            >Todas</button>
                            {zonasDisponibles.map(z => (
                                <button
                                    key={z}
                                    className={`filtro__chip ${filtroZona === z ? 'active' : ''}`}
                                    onClick={() => setFiltroZona(z)}
                                >{z}</button>
                            ))}
                        </div>
                    )}
                </aside>
            </div>

            {modalOpen && (
                <EjercicioModal
                    ejercicio={editando}
                    zonasDisponibles={zonasDisponibles}
                    onClose={() => { setModalOpen(false); setEditando(null); fetchEjercicios(); }}
                />
            )}

            {ejercicioViendo && (
                <div className="video-modal-overlay" onClick={() => setEjercicioViendo(null)}>
                    <div className="video-modal" onClick={e => e.stopPropagation()}>
                        <div className="video-modal__header">
                            <h2 className="video-modal__title">{ejercicioViendo.nombre}</h2>
                            <button className="video-modal__close" onClick={() => setEjercicioViendo(null)}>✕</button>
                        </div>
                        <div className="video-modal__iframe-wrap">
                            <iframe
                                src={getYoutubeEmbedUrl(ejercicioViendo.videoUrl)}
                                title={ejercicioViendo.nombre}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                frameBorder="0"
                            />
                        </div>
                        {ejercicioViendo.descripcion && (
                            <p className="video-modal__desc">{ejercicioViendo.descripcion}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}