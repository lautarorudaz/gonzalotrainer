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
import ProfesorLayout from './components/ProfesorLayout';

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Profesor */}
      <Route path="/profesor/dashboard" element={
        <PrivateRoute rolRequerido="profesor">
          <ProfesorLayout><Dashboard /></ProfesorLayout>
        </PrivateRoute>
      } />
      <Route path="/profesor/alumnos" element={
        <PrivateRoute rolRequerido="profesor">
          <ProfesorLayout><Alumnos /></ProfesorLayout>
        </PrivateRoute>
      } />
      <Route path="/profesor/ejercicios" element={
        <PrivateRoute rolRequerido="profesor">
          <ProfesorLayout><Ejercicios /></ProfesorLayout>
        </PrivateRoute>
      } />
      <Route path="/profesor/rutinas" element={
        <PrivateRoute rolRequerido="profesor">
          <ProfesorLayout><Rutinas /></ProfesorLayout>
        </PrivateRoute>
      } />
      <Route path="/profesor/comentarios" element={
        <PrivateRoute rolRequerido="profesor">
          <ProfesorLayout><Comentarios /></ProfesorLayout>
        </PrivateRoute>
      } />

      {/* Alumno */}
      <Route path="/alumno/mi-rutina" element={
        <PrivateRoute rolRequerido="alumno"><MiRutina /></PrivateRoute>
      } />
    </Routes>
  );
}

export default App;