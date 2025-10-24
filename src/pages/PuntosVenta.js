import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { puntosVentaAPI } from '../services/api';

const PuntosVenta = () => {
  const [puntosVenta, setPuntosVenta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPunto, setEditingPunto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    responsable: '',
    descripcion: '',
    activo: true
  });

  useEffect(() => {
    cargarPuntosVenta();
  }, []);

  const cargarPuntosVenta = async () => {
    try {
      setLoading(true);
      const response = await puntosVentaAPI.getAll();
      setPuntosVenta(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar puntos de venta');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (punto = null) => {
    if (punto) {
      setEditingPunto(punto);
      setFormData({
        nombre: punto.nombre || '',
        direccion: punto.direccion || '',
        telefono: punto.telefono || '',
        email: punto.email || '',
        responsable: punto.responsable || '',
        descripcion: punto.descripcion || '',
        activo: punto.activo !== undefined ? punto.activo : true
      });
    } else {
      setEditingPunto(null);
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        responsable: '',
        descripcion: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPunto(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      responsable: '',
      descripcion: '',
      activo: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre del punto de venta es requerido');
      return;
    }

    try {
      if (editingPunto) {
        await puntosVentaAPI.update(editingPunto._id, formData);
        alert('✅ Punto de venta actualizado exitosamente');
      } else {
        await puntosVentaAPI.create(formData);
        alert('✅ Punto de venta creado exitosamente');
      }
      handleCloseModal();
      cargarPuntosVenta();
    } catch (err) {
      alert('❌ Error al guardar el punto de venta');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de desactivar el punto de venta "${nombre}"?`)) {
      return;
    }

    try {
      await puntosVentaAPI.delete(id);
      alert('✅ Punto de venta desactivado exitosamente');
      cargarPuntosVenta();
    } catch (err) {
      alert('❌ Error al desactivar el punto de venta');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2>📍 Puntos de Venta</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleOpenModal()}>
            ➕ Nuevo Punto de Venta
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {puntosVenta.length === 0 ? (
            <Alert variant="info" className="text-center">
              No hay puntos de venta registrados. Haz clic en "Nuevo Punto de Venta" para agregar uno.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {puntosVenta.map((punto) => (
                  <tr key={punto._id}>
                    <td>
                      <strong>{punto.nombre}</strong>
                      {punto.descripcion && (
                        <div>
                          <small className="text-muted">{punto.descripcion}</small>
                        </div>
                      )}
                    </td>
                    <td>{punto.direccion || '-'}</td>
                    <td>{punto.telefono || '-'}</td>
                    <td>{punto.responsable || '-'}</td>
                    <td>
                      <Badge bg={punto.activo ? 'success' : 'secondary'}>
                        {punto.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenModal(punto)}
                      >
                        ✏️ Editar
                      </Button>
                      {punto.activo && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(punto._id, punto.nombre)}
                        >
                          🗑️ Desactivar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Formulario */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPunto ? '✏️ Editar Punto de Venta' : '➕ Nuevo Punto de Venta'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    placeholder="Ej: Sucursal Centro"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Responsable</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    placeholder="Nombre del responsable"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ej: +54 11 1234-5678"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Dirección completa"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Información adicional del punto de venta"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              💾 Guardar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PuntosVenta;

