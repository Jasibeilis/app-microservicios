import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'https://x3spbqlsvg.execute-api.us-west-2.amazonaws.com';

function App() {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarCursos();
  }, []);

  async function cargarCursos() {
    try {
      const ids = ['curso1', 'curso2'];
      const resultados = await Promise.all(
        ids.map(id =>
          fetch(`${API_BASE}/cursos/${id}`).then(res => (res.ok ? res.json() : null))
        )
      );
      setCursos(resultados.filter(Boolean));
    } catch (error) {
      console.error('Error cargando cursos:', error);
    }
  }

  async function handleInscripcion(e) {
    e.preventDefault();
    if (!cursoSeleccionado || !email) return;
    setCargando(true);
    setMensaje('');

    try {
      const usuarioRes = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(email)}`);
      const esNuevo = usuarioRes.status === 404;

      if (esNuevo) {
        await fetch(`${API_BASE}/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioID: email, email }),
        });
      }

      const inscripcionRes = await fetch(`${API_BASE}/inscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoID: cursoSeleccionado.cursoID, email }),
      });

      if (inscripcionRes.ok) {
        setMensaje(
          esNuevo
            ? `¡Bienvenida! Te inscribiste a "${cursoSeleccionado.nombre}". Revisa tu correo.`
            : `Te inscribiste a "${cursoSeleccionado.nombre}". Revisa tu correo.`
        );
        setEmail('');
        setCursoSeleccionado(null);
      } else {
        setMensaje('Hubo un error al procesar tu inscripción.');
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="App" style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Inscripción de Cursos</h1>

      <h2>Cursos disponibles</h2>
      {cursos.length === 0 && <p>Cargando cursos...</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cursos.map(curso => (
          <li
            key={curso.cursoID}
            onClick={() => setCursoSeleccionado(curso)}
            style={{
              padding: 12,
              marginBottom: 8,
              border: '1px solid #ccc',
              borderRadius: 6,
              cursor: 'pointer',
              background: cursoSeleccionado?.cursoID === curso.cursoID ? '#e0f0ff' : '#fff',
            }}
          >
            {curso.nombre}
          </li>
        ))}
      </ul>

      {cursoSeleccionado && (
        <form onSubmit={handleInscripcion} style={{ marginTop: 20 }}>
          <p>
            Te vas a inscribir a: <strong>{cursoSeleccionado.nombre}</strong>
          </p>
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: 8, width: '100%', marginBottom: 10 }}
          />
          <button type="submit" disabled={cargando} style={{ padding: '8px 16px' }}>
            {cargando ? 'Procesando...' : 'Inscribirme'}
          </button>
        </form>
      )}

      {mensaje && <p style={{ marginTop: 20, fontWeight: 'bold' }}>{mensaje}</p>}
    </div>
  );
}

export default App;