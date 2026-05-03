import { useState } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, secondaryAuth } from '../firebase/config';
import './AlumnoModal.css';

const modalidades = ['Presencial', 'Online', 'Semipresencial'];

export default function AlumnoModal({ alumno, onClose }) {
    const editando = !!alumno;

    const [form, setForm] = useState({
        nombre: alumno?.nombre || '',
        apellido: alumno?.apellido || '',
        email: alumno?.email || '',
        numero: alumno?.numero || '',
        modalidad: alumno?.modalidad || '',
        password: '',
    });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (editando) {
                await updateDoc(doc(db, 'usuarios', alumno.id), {
                    nombre: form.nombre,
                    apellido: form.apellido,
                    numero: form.numero,
                    modalidad: form.modalidad,
                });
            } else {
                const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
                await setDoc(doc(db, 'usuarios', cred.user.uid), {
                    nombre: form.nombre,
                    apellido: form.apellido,
                    email: form.email,
                    numero: form.numero,
                    modalidad: form.modalidad,
                    rol: 'alumno',
                });
                // Cerrar sesión de la instancia secundaria para no afectar al profesor
                await signOut(secondaryAuth);
            }
            onClose();
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Ese email ya está registrado.');
            } else {
                setError('Ocurrió un error. Intentá de nuevo.');
            }
        }

        setLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>{editando ? 'Editar alumno' : 'Nuevo alumno'}</h2>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <form className="modal__form" onSubmit={handleSubmit}>
                    <div className="modal__row">
                        <div className="modal__field">
                            <label>Nombre</label>
                            <input name="nombre" value={form.nombre} onChange={handleChange} required />
                        </div>
                        <div className="modal__field">
                            <label>Apellido</label>
                            <input name="apellido" value={form.apellido} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="modal__field">
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={editando}
                        />
                    </div>

                    <div className="modal__field">
                        <label>Número de teléfono</label>
                        <input name="numero" value={form.numero} onChange={handleChange} />
                    </div>

                    <div className="modal__field">
                        <label>Modalidad</label>
                        <select name="modalidad" value={form.modalidad} onChange={handleChange} required>
                            <option value="">Seleccioná una modalidad</option>
                            {modalidades.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    {!editando && (
                        <div className="modal__field">
                            <label>Contraseña</label>
                            <div className="modal__pass-wrap">
                                <input
                                    name="password"
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    className="modal__pass-toggle"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <p className="modal__error">{error}</p>}

                    <div className="modal__actions">
                        <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="modal__btn modal__btn--save" disabled={loading}>
                            {loading ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear alumno'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}