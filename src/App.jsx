import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./router/PrivateRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/profesor/Dashboard";
import Alumnos from "./pages/profesor/Alumnos";
import Ejercicios from "./pages/profesor/Ejercicios";
import Rutinas from "./pages/profesor/Rutinas";
import Comentarios from "./pages/profesor/Comentarios";
import MiRutina from "./pages/alumno/MiRutina";

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Profesor */}
      <Route path="/profesor/dashboard" element={
        <PrivateRoute rolRequerido="profesor"><Dashboard /></PrivateRoute>
      } />
      <Route path="/profesor/alumnos" element={
        <PrivateRoute rolRequerido="profesor"><Alumnos /></PrivateRoute>
      } />
      <Route path="/profesor/ejercicios" element={
        <PrivateRoute rolRequerido="profesor"><Ejercicios /></PrivateRoute>
      } />
      <Route path="/profesor/rutinas" element={
        <PrivateRoute rolRequerido="profesor"><Rutinas /></PrivateRoute>
      } />
      <Route path="/profesor/comentarios" element={
        <PrivateRoute rolRequerido="profesor"><Comentarios /></PrivateRoute>
      } />

      {/* Alumno */}
      <Route path="/alumno/mi-rutina" element={
        <PrivateRoute rolRequerido="alumno"><MiRutina /></PrivateRoute>
      } />
    </Routes>
  );
}

export default App;