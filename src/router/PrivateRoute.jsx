import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute({ children, rolRequerido }) {
    const { user, rol } = useAuth();

    if (!user) return <Navigate to="/login" />;
    if (rolRequerido && rol !== rolRequerido) return <Navigate to="/login" />;

    return children;
}