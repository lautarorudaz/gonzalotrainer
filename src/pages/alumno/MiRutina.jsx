import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, updateDoc, deleteDoc, setDoc, doc as fsDoc } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import './MiRutina.css';

const ETAPAS = ['Movilidad', 'Activación', 'Central'];

function getYoutubeEmbed(url) {
    if (!url) return null;
    const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    if (!match) return null;
    const id = match[1];
    return `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
}

function getRegistroPesoId(rutinaId, semana, dia, etapa, ejercicio, ejercicioIdx) {
    const ejercicioKey = ejercicio.instanciaId || ejercicio.ejercicioId || ejercicioIdx;
    return `${rutinaId}_${semana}_${dia}_${etapa}_${ejercicioKey}`.replaceAll('/', '-');
}

export default function MiRutina() {
    const { user } = useAuth();
    const [rutina, setRutina] = useState(null);
    const [alumno, setAlumno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [semanaIdx, setSemanaIdx] = useState(0);
    const [diaIdx, setDiaIdx] = useState(0);
    const [comentarioDia, setComentarioDia] = useState('');
    const [comentarioEj, setComentarioEj] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [enviandoEj, setEnviandoEj] = useState({});
    const [comentariosDelDia, setComentariosDelDia] = useState([]);
    const [ejAbierto, setEjAbierto] = useState(null);
    const [registrosPeso, setRegistrosPeso] = useState([]);
    const [pesoDraft, setPesoDraft] = useState({});
    const [guardandoPeso, setGuardandoPeso] = useState({});
    const [mensajePeso, setMensajePeso] = useState({});
    const [historialSemana, setHistorialSemana] = useState('todas');
    const [historialDia, setHistorialDia] = useState('todos');
    // Edición de comentarios
    const [editandoId, setEditandoId] = useState(null);
    const [editandoTexto, setEditandoTexto] = useState('');

    useEffect(() => {

        const fetchData = async () => {
            const alumnoDoc = await getDoc(doc(db, 'usuarios', user.uid));
            const alumnoData = alumnoDoc.data();
            setAlumno(alumnoData);

            const rutinaSnap = await getDocs(collection(db, 'usuarios', user.uid, 'rutinaActiva'));
            if (!rutinaSnap.empty) {
                const rutinaData = { id: rutinaSnap.docs[0].id, ...rutinaSnap.docs[0].data() };

                // Traer todos los ejercicios del banco
                const ejSnap = await getDocs(collection(db, 'ejercicios'));
                const bancoPorId = {};
                ejSnap.docs.forEach(d => { bancoPorId[d.id] = d.data(); });

                console.log('Banco:', bancoPorId);
                console.log('Ejercicios rutina:', rutinaData.semanas?.[0]?.dias?.[0]?.ejercicios);
                console.log('Aq5 tiene videoUrl:', bancoPorId['Aq5FgMHscOGFlpk0AJoq']?.videoUrl);

                // Cruzar videoUrl desde el banco a cada ejercicio de la rutina
                const rutinaCruzada = {
                    ...rutinaData,
                    semanas: rutinaData.semanas?.map(semana => ({
                        ...semana,
                        dias: semana.dias?.map(dia => ({
                            ...dia,
                            ejercicios: Object.fromEntries(
                                Object.entries(dia.ejercicios || {}).map(([etapa, ejs]) => [
                                    etapa,
                                    ejs.map(ej => ({
                                        ...ej,
                                        videoUrl: bancoPorId[ej.ejercicioId]?.videoUrl || ej.videoUrl || '',
                                    }))
                                ])
                            )
                        }))
                    }))
                };

                setRutina(rutinaCruzada);

                if (alumnoData?.autoregistroPesos) {
                    const pesosSnap = await getDocs(collection(db, 'usuarios', user.uid, 'registrosPeso'));
                    setRegistrosPeso(pesosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                }
            }
            setLoading(false);
        };
        fetchData();

    }, [user]);

    const fetchComentariosDia = useCallback(async () => {
        const q = query(
            collection(db, 'usuarios', user.uid, 'comentarios'),
            orderBy('fecha', 'desc')
        );
        const snap = await getDocs(q);
        const todos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const filtrados = todos.filter(c =>
            c.semana === semanaIdx && c.dia === diaIdx
        );
        setComentariosDelDia(filtrados);
    }, [user.uid, semanaIdx, diaIdx]);

    useEffect(() => {
        if (!rutina) return;
        // La carga es asíncrona y sincroniza los comentarios con la selección actual.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchComentariosDia();
    }, [rutina, fetchComentariosDia]);

    const handleComentarioDia = async () => {
        if (!comentarioDia.trim()) return;
        setEnviando(true);
        await addDoc(collection(db, 'usuarios', user.uid, 'comentarios'), {
            tipo: 'dia',
            texto: comentarioDia,
            semana: semanaIdx,
            dia: diaIdx,
            alumnoId: user.uid,
            alumnoNombre: `${alumno?.nombre} ${alumno?.apellido}`,
            rutinaId: rutina.id,
            rutinaNombre: rutina.nombre,
            fecha: serverTimestamp(),
        });
        setComentarioDia('');
        setEnviando(false);
        fetchComentariosDia();
    };

    const handleComentarioEj = async (ejercicioNombre) => {
        const texto = comentarioEj[ejercicioNombre];
        if (!texto?.trim()) return;
        setEnviandoEj(prev => ({ ...prev, [ejercicioNombre]: true }));
        await addDoc(collection(db, 'usuarios', user.uid, 'comentarios'), {
            tipo: 'ejercicio',
            texto,
            ejercicioNombre,
            semana: semanaIdx,
            dia: diaIdx,
            alumnoId: user.uid,
            alumnoNombre: `${alumno?.nombre} ${alumno?.apellido}`,
            rutinaId: rutina.id,
            rutinaNombre: rutina.nombre,
            fecha: serverTimestamp(),
        });
        setComentarioEj(prev => ({ ...prev, [ejercicioNombre]: '' }));
        setEnviandoEj(prev => ({ ...prev, [ejercicioNombre]: false }));
        setEjAbierto(null);
        fetchComentariosDia();
    };

    const handleEliminarComentario = async (comentarioId) => {
        if (!window.confirm('¿Eliminar este comentario?')) return;
        await deleteDoc(fsDoc(db, 'usuarios', user.uid, 'comentarios', comentarioId));
        fetchComentariosDia();
    };

    const handleGuardarEdicion = async (comentarioId) => {
        if (!editandoTexto.trim()) return;
        await updateDoc(fsDoc(db, 'usuarios', user.uid, 'comentarios', comentarioId), {
            texto: editandoTexto,
            editado: true,
        });
        setEditandoId(null);
        setEditandoTexto('');
        fetchComentariosDia();
    };

    const handleGuardarPeso = async (etapa, ejercicio, ejercicioIdx) => {
        const registroId = getRegistroPesoId(rutina.id, semanaIdx, diaIdx, etapa, ejercicio, ejercicioIdx);
        const registroActual = registrosPeso.find(r => r.id === registroId);
        const peso = Number(String(pesoDraft[registroId] ?? registroActual?.peso ?? '').replace(',', '.'));

        if (!Number.isFinite(peso) || peso <= 0) {
            setMensajePeso(prev => ({ ...prev, [registroId]: 'Ingresá un peso mayor a 0.' }));
            return;
        }

        setGuardandoPeso(prev => ({ ...prev, [registroId]: true }));
        const registro = {
            rutinaId: rutina.id,
            rutinaNombre: rutina.nombre,
            semana: semanaIdx,
            dia: diaIdx,
            diaNombre: rutina.semanas?.[semanaIdx]?.dias?.[diaIdx]?.nombre || `Día ${diaIdx + 1}`,
            etapa,
            ejercicioId: ejercicio.ejercicioId || '',
            instanciaId: ejercicio.instanciaId || '',
            ejercicioNombre: ejercicio.nombre,
            ejercicioIdx,
            peso,
            fechaActualizacion: serverTimestamp(),
        };

        try {
            await setDoc(fsDoc(db, 'usuarios', user.uid, 'registrosPeso', registroId), registro, { merge: true });
            setRegistrosPeso(prev => [
                ...prev.filter(r => r.id !== registroId),
                { id: registroId, ...registro, fechaActualizacion: new Date() },
            ]);
            setPesoDraft(prev => ({ ...prev, [registroId]: String(peso) }));
            setMensajePeso(prev => ({ ...prev, [registroId]: 'Peso guardado.' }));
        } catch {
            setMensajePeso(prev => ({ ...prev, [registroId]: 'No se pudo guardar. Intentá de nuevo.' }));
        } finally {
            setGuardandoPeso(prev => ({ ...prev, [registroId]: false }));
        }
    };

    if (loading) return <div className="mirutina__loading">Cargando tu rutina...</div>;

    if (!rutina) return (
        <div className="mirutina__sin-rutina">
            <h2>Todavía no tenés una rutina asignada.</h2>
            <p>Tu profesor te asignará una rutina pronto.</p>
        </div>
    );

    const semana = rutina.semanas?.[semanaIdx];
    const dia = semana?.dias?.[diaIdx];
    const diasHistorial = Array.from(new Map(
        rutina.semanas.flatMap(sem => (sem.dias || []).map((item, idx) => [
            idx,
            item.nombre || `Día ${idx + 1}`,
        ]))
    ), ([indice, nombre]) => ({ indice, nombre }));

    const registrosPesoFiltrados = registrosPeso
        .filter(registro => registro.rutinaId === rutina.id)
        .filter(registro => historialSemana === 'todas' || registro.semana === Number(historialSemana))
        .filter(registro => historialDia === 'todos' || registro.dia === Number(historialDia))
        .sort((a, b) => b.semana - a.semana || b.dia - a.dia || a.ejercicioNombre.localeCompare(b.ejercicioNombre));

    const ejerciciosHistorial = Array.from(new Map(
        registrosPesoFiltrados.map((registro, idx) => [
            registro.ejercicioId || registro.ejercicioNombre,
            {
                etapa: registro.etapa,
                ejercicio: { ejercicioId: registro.ejercicioId, nombre: registro.ejercicioNombre },
                ejercicioIdx: idx,
            },
        ])
    ).values());

    const getHistorialEjercicio = (ejercicio) => registrosPesoFiltrados.filter(registro => (
        ejercicio.ejercicioId
            ? registro.ejercicioId === ejercicio.ejercicioId
            : registro.ejercicioNombre === ejercicio.nombre
    ));

    return (
        <div className="mirutina">
            <nav className="mirutina__nav">
                <img src="/logo-light-bg.png" alt="Force Training" className="mirutina__nav-brand-img" />
                <button className="mirutina__nav-logout" onClick={async () => {
                    const { signOut } = await import('firebase/auth');
                    const { auth } = await import('../../firebase/config');
                    await signOut(auth);
                    window.location.href = '/';
                }}>
                    Cerrar sesión
                </button>
            </nav>
            {/* Header */}
            <div className="mirutina__header">
                <div className="mirutina__bienvenida">
                    <p className="mirutina__saludo">Bienvenido, <strong>{alumno?.nombre}</strong></p>
                    <h1 className="mirutina__titulo">{rutina.nombre}</h1>
                </div>
            </div>

            {/* Selectores */}
            <div className="mirutina__selectores">
                <div className="mirutina__selector-wrap">
                    <label>Semana</label>
                    <select value={semanaIdx} onChange={e => { setSemanaIdx(Number(e.target.value)); setDiaIdx(0); }}>
                        {rutina.semanas?.map((_, i) => (
                            <option key={i} value={i}>Semana {i + 1}</option>
                        ))}
                    </select>
                </div>
                <div className="mirutina__selector-wrap">
                    <label>Día</label>
                    <select value={diaIdx} onChange={e => setDiaIdx(Number(e.target.value))}>
                        {semana?.dias?.map((dia, i) => (
                            <option key={i} value={i}>{dia.nombre || `Día ${i + 1}`}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Ejercicios por etapa */}
            <div className="mirutina__contenido">
                {ETAPAS.map(etapa => {
                    const ejercicios = dia?.ejercicios?.[etapa] || [];
                    if (ejercicios.length === 0) return null;
                    return (
                        <div className="mirutina__etapa" key={etapa}>
                            <h2 className="mirutina__etapa-titulo">{etapa}</h2>
                            <div className="mirutina__ejercicios">
                                {ejercicios.map((ej, ei) => {
                                    const embedUrl = getYoutubeEmbed(ej.videoUrl);
                                    const ejKey = `${etapa}-${ei}`;
                                    return (
                                        <div className="ej-card" key={ei}>
                                            {embedUrl && (
                                                <div className="ej-card__video">
                                                    <iframe
                                                        src={embedUrl}
                                                        title={ej.nombre}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            )}
                                            <div className="ej-card__body">
                                                <h3 className="ej-card__nombre">{ej.nombre}</h3>
                                                <div className="ej-card__props">
                                                    <div className="ej-prop">
                                                        <span className="ej-prop__label">Series</span>
                                                        <span className="ej-prop__val">{ej.series || '—'}</span>
                                                    </div>
                                                    <div className="ej-prop">
                                                        <span className="ej-prop__label">Reps</span>
                                                        <span className="ej-prop__val">{ej.repeticiones || '—'}</span>
                                                    </div>
                                                    <div className="ej-prop">
                                                        <span className="ej-prop__label">Peso</span>
                                                        <span className="ej-prop__val">{ej.peso ? `${ej.peso}kg` : '—'}</span>
                                                    </div>
                                                </div>
                                                {ej.aclaracion && (
                                                    <p className="ej-card__aclaracion">💬 {ej.aclaracion}</p>
                                                )}
                                                {alumno?.autoregistroPesos && (() => {
                                                    const registroId = getRegistroPesoId(rutina.id, semanaIdx, diaIdx, etapa, ej, ei);
                                                    const registro = registrosPeso.find(r => r.id === registroId);
                                                    const valor = pesoDraft[registroId] ?? registro?.peso ?? '';
                                                    return (
                                                        <div className="ej-card__peso-personal">
                                                            <div className="ej-card__peso-header">
                                                                <div>
                                                                    <span className="ej-card__peso-label">Mi peso realizado</span>
                                                                    <small>Semana {semanaIdx + 1} · {dia?.nombre || `Día ${diaIdx + 1}`}</small>
                                                                </div>
                                                                {registro && <span className="ej-card__peso-guardado">Guardado</span>}
                                                            </div>
                                                            <div className="ej-card__peso-form">
                                                                <div className="ej-card__peso-input-wrap">
                                                                    <input
                                                                        type="number"
                                                                        min="0.1"
                                                                        step="0.1"
                                                                        inputMode="decimal"
                                                                        aria-label={`Peso realizado en ${ej.nombre}`}
                                                                        value={valor}
                                                                        onChange={e => {
                                                                            setPesoDraft(prev => ({ ...prev, [registroId]: e.target.value }));
                                                                            setMensajePeso(prev => ({ ...prev, [registroId]: '' }));
                                                                        }}
                                                                        placeholder="0"
                                                                    />
                                                                    <span>kg</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleGuardarPeso(etapa, ej, ei)}
                                                                    disabled={guardandoPeso[registroId]}
                                                                >
                                                                    {guardandoPeso[registroId] ? 'Guardando...' : registro ? 'Actualizar' : 'Guardar'}
                                                                </button>
                                                            </div>
                                                            {mensajePeso[registroId] && (
                                                                <p className={`ej-card__peso-mensaje${mensajePeso[registroId] === 'Peso guardado.' ? ' is-success' : ''}`}>
                                                                    {mensajePeso[registroId]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                                <button
                                                    className="ej-card__comentar-btn"
                                                    onClick={() => setEjAbierto(ejAbierto === ejKey ? null : ejKey)}
                                                >
                                                    {ejAbierto === ejKey ? 'Cancelar' : '+ Dejar comentario'}
                                                </button>
                                                {ejAbierto === ejKey && (
                                                    <div className="ej-card__comentario-form">
                                                        <textarea
                                                            placeholder={`Comentario sobre ${ej.nombre}...`}
                                                            value={comentarioEj[ej.nombre] || ''}
                                                            onChange={e => setComentarioEj(prev => ({ ...prev, [ej.nombre]: e.target.value }))}
                                                            rows={2}
                                                        />
                                                        <button
                                                            className="ej-card__comentario-enviar"
                                                            onClick={() => handleComentarioEj(ej.nombre)}
                                                            disabled={enviandoEj[ej.nombre]}
                                                        >
                                                            {enviandoEj[ej.nombre] ? 'Enviando...' : 'Enviar'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Comentarios del día */}
            {alumno?.autoregistroPesos && (
                <section className="mirutina__historial-pesos">
                    <div className="mirutina__historial-header">
                        <p>Progreso personal</p>
                        <h2>Mi historial de cargas</h2>
                        <span>Consultá los pesos que registraste en cada semana.</span>
                    </div>
                    <div className="mirutina__historial-filtros">
                        <label>
                            <span>Semana</span>
                            <select value={historialSemana} onChange={e => setHistorialSemana(e.target.value)}>
                                <option value="todas">Todas las semanas</option>
                                {rutina.semanas.map((_, idx) => (
                                    <option value={idx} key={idx}>Semana {idx + 1}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span>Día</span>
                            <select value={historialDia} onChange={e => setHistorialDia(e.target.value)}>
                                <option value="todos">Todos los días</option>
                                {diasHistorial.map(item => (
                                    <option value={item.indice} key={item.indice}>{item.nombre}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    {registrosPesoFiltrados.length === 0 && (
                        <div className="mirutina__historial-vacio">No hay pesos guardados para esta selección.</div>
                    )}
                    <div className="mirutina__historial-grid">
                        {ejerciciosHistorial.map(({ etapa, ejercicio, ejercicioIdx }) => {
                            const historial = getHistorialEjercicio(ejercicio);
                            return (
                                <article className="historial-peso-card" key={`${etapa}-${ejercicioIdx}`}>
                                    <h3>{ejercicio.nombre}</h3>
                                    {historial.length === 0 ? (
                                        <p className="historial-peso-card__empty">Todavía no registraste pesos.</p>
                                    ) : (
                                        <div className="historial-peso-card__lista">
                                            {historial.map(registro => (
                                                <div className="historial-peso-card__fila" key={registro.id}>
                                                    <span>Semana {registro.semana + 1} · {registro.diaNombre || `Día ${registro.dia + 1}`}</span>
                                                    <strong>{registro.peso} kg</strong>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            <div className="mirutina__comentarios">
                <h2 className="mirutina__comentarios-titulo">Comentarios del día</h2>

                {comentariosDelDia.length > 0 && (
                    <div className="mirutina__comentarios-lista">
                        {comentariosDelDia.map(c => (
                            <div className="comentario-item" key={c.id}>
                                <div className="comentario-item__meta">
                                    {c.tipo === 'ejercicio'
                                        ? <span className="comentario-item__tag">📌 {c.ejercicioNombre}</span>
                                        : <span className="comentario-item__tag">📋 General</span>
                                    }
                                    <div className="comentario-item__right">
                                        <span className="comentario-item__fecha">
                                            {c.fecha?.seconds
                                                ? new Date(c.fecha.seconds * 1000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                                                : ''}
                                        </span>
                                        <button
                                            className="comentario-item__action comentario-item__action--edit"
                                            title="Editar"
                                            onClick={() => { setEditandoId(c.id); setEditandoTexto(c.texto); }}
                                        >✏️</button>
                                        <button
                                            className="comentario-item__action comentario-item__action--delete"
                                            title="Eliminar"
                                            onClick={() => handleEliminarComentario(c.id)}
                                        >🗑️</button>
                                    </div>
                                </div>
                                {editandoId === c.id ? (
                                    <div className="comentario-item__edit-form">
                                        <textarea
                                            value={editandoTexto}
                                            onChange={e => setEditandoTexto(e.target.value)}
                                            rows={2}
                                            autoFocus
                                        />
                                        <div className="comentario-item__edit-actions">
                                            <button
                                                className="comentario-item__edit-cancel"
                                                onClick={() => setEditandoId(null)}
                                            >Cancelar</button>
                                            <button
                                                className="comentario-item__edit-save"
                                                onClick={() => handleGuardarEdicion(c.id)}
                                            >Guardar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p>{c.texto}{c.editado && <span className="comentario-item__editado"> (editado)</span>}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="mirutina__comentario-form">
                    <textarea
                        placeholder="Dejá un comentario general del día..."
                        value={comentarioDia}
                        onChange={e => setComentarioDia(e.target.value)}
                        rows={3}
                    />
                    <button
                        className="mirutina__comentario-enviar"
                        onClick={handleComentarioDia}
                        disabled={enviando || !comentarioDia.trim()}
                    >
                        {enviando ? 'Enviando...' : 'Enviar comentario'}
                    </button>
                </div>
            </div>
        </div>
    );
}
