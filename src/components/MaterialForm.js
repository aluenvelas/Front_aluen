import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const MaterialForm = ({ material, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'cera',
    precioPorGramo: 0,
    proveedor: '',
    descripcion: '',
    stock: 0,
    unidad: 'gramos'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (material) {
      setFormData({
        nombre: material.nombre || '',
        tipo: material.tipo || 'cera',
        precioPorGramo: material.precioPorGramo || 0,
        proveedor: material.proveedor || '',
        descripcion: material.descripcion || '',
        stock: material.stock || 0,
        unidad: material.unidad || 'gramos'
      });
    }
  }, [material]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.proveedor.trim()) {
      newErrors.proveedor = 'El proveedor es requerido';
    }

    if (formData.precioPorGramo <= 0) {
      newErrors.precioPorGramo = 'El precio debe ser mayor a 0';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const tiposMaterial = [
    { value: 'cera', label: 'Cera' },
    { value: 'aditivo', label: 'Aditivo' },
    { value: 'esencia', label: 'Esencia' },
    { value: 'otro', label: 'Otro' }
  ];

  const unidades = [
    { value: 'gramos', label: 'Gramos' },
    { value: 'ml', label: 'Mililitros' },
    { value: 'unidades', label: 'Unidades' }
  ];

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {material ? 'Editar Material' : 'Nuevo Material'}
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
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  isInvalid={!!errors.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo *</Form.Label>
                <Form.Select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  {tiposMaterial.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio por Gramo *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="precioPorGramo"
                  value={formData.precioPorGramo}
                  onChange={handleChange}
                  isInvalid={!!errors.precioPorGramo}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.precioPorGramo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Proveedor *</Form.Label>
                <Form.Control
                  type="text"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  isInvalid={!!errors.proveedor}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.proveedor}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  isInvalid={!!errors.stock}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.stock}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unidad</Form.Label>
                <Form.Select
                  name="unidad"
                  value={formData.unidad}
                  onChange={handleChange}
                >
                  {unidades.map(unidad => (
                    <option key={unidad.value} value={unidad.value}>
                      {unidad.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {material ? 'Actualizar' : 'Crear'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MaterialForm;


