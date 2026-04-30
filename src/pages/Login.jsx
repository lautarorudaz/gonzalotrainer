import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            const docRef = doc(db, 'usuarios', uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                setError('No se encontró el perfil del usuario.');
                setLoading(false);
                return;
            }

            const rol = docSnap.data().rol;

            if (rol === 'profesor') {
                navigate('/profesor/dashboard');
            } else if (rol === 'alumno') {
                navigate('/alumno/mi-rutina');
            } else {
                setError('Rol no reconocido.');
            }
        } catch (err) {
            setError('Email o contraseña incorrectos.');
        }

        setLoading(false);
    };

    return (
        <div className="login">
            <div className="login__card">
                <div className="login__brand">TRAINER<span>.</span></div>
                <h1 className="login__title">Bienvenido</h1>
                <p className="login__subtitle">Ingresá con tu cuenta</p>

                <form className="login__form" onSubmit={handleLogin}>
                    <div className="login__field">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login__field">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="login__error">{error}</p>}

                    <button className="login__btn" type="submit" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}