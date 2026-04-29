import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [rol, setRol] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsuscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Busca el rol del usuario en Firestore
                const docRef = doc(db, "usuarios", firebaseUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setRol(docSnap.data().rol); // "profesor" o "alumno"
                }
                setUser(firebaseUser);
            } else {
                setUser(null);
                setRol(null);
            }
            setLoading(false);
        });

        return () => unsuscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, rol, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}