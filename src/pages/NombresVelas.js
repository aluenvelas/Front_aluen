import React, { useState, useEffect } from 'react';
import { nombresVelasAPI, frascosAPI, materialesAPI } from '../services/api';
import { Button, Card, Table, Modal, Form, Badge } from 'react-bootstrap';

const NombresVelas = () => {
  const [nombresVelas, setNombresVelas] = useState([]);
  const [frascos, setFrascos] = useState([]);
  const [esencias, setEsencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', // Nombre manual (opcional)
    frasco: '',
    esencia: '',
    color: '',
    descripcion: ''
  });
  
  const [usarNombreManual, setUsarNombreManual] = useState(false);

  const coloresDisponibles = [
    'Blanco', 'Rojo', 'Azul', 'Verde', 'Amarillo', 
    'Naranja', 'Rosa', 'Morado', 'Negro', 'Café',
    'Beige', 'Gris', 'Turquesa', 'Lavanda', 'Natural'
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [nombresRes, frascosRes, materialesRes] = await Promise.all([
        nombresVelasAPI.getAll({ activo: 'true' }),
        frascosAPI.getAll({ activo: 'true' }),
        materialesAPI.getAll({ activo: 'true' })
      ]);
      
      setNombresVelas(nombresRes.data);
      setFrascos(frascosRes.data);
      // Filtrar solo esencias
      setEsencias(materialesRes.data.filter(m => m.tipo === 'esencia'));
    } catch (err) {
      console.error('Error:', err);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (usarNombreManual && !formData.nombre.trim()) {
      alert('Por favor ingrese un nombre para la vela');
      return;
    }
    
    if (!formData.frasco || !formData.esencia || !formData.color) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const dataToSend = usarNombreManual 
        ? formData // Si usa nombre manual, envía el nombre
        : { ...formData, nombre: '' }; // Si no, envía vacío para que se auto-genere
      
      await nombresVelasAPI.create(dataToSend);
      setShowModal(false);
      resetForm();
      setUsarNombreManual(false);
      cargarDatos();
      alert('Nombre de vela creado exitosamente');
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear el nombre de vela: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de desactivar este nombre de vela?')) {
      try {
        await nombresVelasAPI.delete(id);
        cargarDatos();
        alert('Nombre de vela desactivado exitosamente');
      } catch (err) {
        console.error('Error:', err);
        alert('Error al desactivar el nombre de vela');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      frasco: '',
      esencia: '',
      color: '',
      descripcion: ''
    });
  };

  const getNombrePreview = () => {
    if (formData.frasco && formData.esencia && formData.color) {
      const frasco = frascos.find(f => f._id === formData.frasco);
      const esencia = esencias.find(e => e._id === formData.esencia);
      if (frasco && esencia) {
        return `Vela ${esencia.nombre} ${formData.color} ${frasco.capacidad}ml`;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">🕯️ Nombres de Velas</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
          disabled={frascos.length === 0 || esencias.length === 0}
        >
          ➕ Nuevo Nombre de Vela
        </Button>
      </div>

      {(frascos.length === 0 || esencias.length === 0) && (
        <div className="alert alert-warning" role="alert">
          <strong>⚠️ Atención:</strong> Necesitas tener frascos y esencias registrados.
          {frascos.length === 0 && <div>• Agrega frascos en la sección <strong>Frascos</strong></div>}
          {esencias.length === 0 && <div>• Agrega esencias (tipo: esencia) en la sección <strong>Materiales</strong></div>}
        </div>
      )}

      <Card>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Frasco</th>
                <th>Esencia</th>
                <th>Color</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {nombresVelas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No hay nombres de velas registrados
                  </td>
                </tr>
              ) : (
                nombresVelas.map((item) => (
                  <tr key={item._id}>
                    <td><strong>{item.nombre}</strong></td>
                    <td>
                      {item.frasco?.nombre}
                      <div><small className="text-muted">{item.frasco?.capacidad}ml</small></div>
                    </td>
                    <td>
                      <Badge bg="success">{item.esencia?.nombre}</Badge>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        {item.color}
                      </Badge>
                    </td>
                    <td>{item.descripcion || '-'}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
                        title="Desactivar"
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de Formulario */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); setUsarNombreManual(false); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Nombre de Vela</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Opción para nombre manual o automático */}
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="switch-nombre-manual"
                label="✍️ Ingresar nombre manualmente"
                checked={usarNombreManual}
                onChange={(e) => setUsarNombreManual(e.target.checked)}
              />
              <Form.Text className="text-muted">
                {usarNombreManual 
                  ? "Escribirás el nombre personalizado de la vela" 
                  : "El nombre se generará automáticamente: Vela [Esencia] [Color] [Capacidad]ml"}
              </Form.Text>
            </Form.Group>

            {/* Campo de nombre manual (solo si está activado) */}
            {usarNombreManual && (
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la Vela *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Vela Especial Cumpleaños 200ml"
                  required={usarNombreManual}
                />
                <Form.Text className="text-info">
                  Escribe el nombre completo que deseas para esta vela
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Frasco *</Form.Label>
              <Form.Select
                value={formData.frasco}
                onChange={(e) => setFormData({ ...formData, frasco: e.target.value })}
                required
              >
                <option value="">Seleccione un frasco...</option>
                {frascos.map((frasco) => (
                  <option key={frasco._id} value={frasco._id}>
                    {frasco.nombre} - {frasco.capacidad}ml
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Esencia *</Form.Label>
              <Form.Select
                value={formData.esencia}
                onChange={(e) => setFormData({ ...formData, esencia: e.target.value })}
                required
              >
                <option value="">Seleccione una esencia...</option>
                {esencias.map((esencia) => (
                  <option key={esencia._id} value={esencia._id}>
                    {esencia.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color *</Form.Label>
              <Form.Select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                required
              >
                <option value="">Seleccione un color...</option>
                {coloresDisponibles.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional de la vela..."
              />
            </Form.Group>

            {/* Vista previa del nombre */}
            {usarNombreManual ? (
              formData.nombre && (
                <div className="alert alert-success">
                  <strong>✨ Nombre ingresado:</strong><br/>
                  <span className="fs-5 fw-bold">{formData.nombre}</span>
                </div>
              )
            ) : (
              getNombrePreview() && (
                <div className="alert alert-info">
                  <strong>✨ Vista previa del nombre (auto-generado):</strong><br/>
                  <span className="fs-5 fw-bold">{getNombrePreview()}</span>
                </div>
              )
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); setUsarNombreManual(false); }}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Crear Nombre de Vela
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default NombresVelas;

