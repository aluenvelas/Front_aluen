import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const GenericForm = ({ item, fields, onSubmit, onClose, title }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initialData = {};
    fields.forEach(field => {
      initialData[field.name] = item?.[field.name] || field.defaultValue || '';
    });
    setFormData(initialData);
  }, [item, fields]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name] === '')) {
        newErrors[field.name] = `${field.label} es requerido`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleChange,
      isInvalid: !!errors[field.name]
    };

    switch (field.type) {
      case 'select':
        return (
          <Form.Select {...commonProps}>
            <option value="">Seleccionar {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        );
      
      case 'textarea':
        return (
          <Form.Control
            as="textarea"
            rows={field.rows || 3}
            {...commonProps}
          />
        );
      
      case 'number':
        return (
          <Form.Control
            type="number"
            step={field.step || '1'}
            min={field.min || '0'}
            {...commonProps}
          />
        );
      
      case 'url':
        return (
          <Form.Control
            type="url"
            placeholder={field.placeholder || 'https://...'}
            {...commonProps}
          />
        );
      
      default:
        return (
          <Form.Control
            type={field.type || 'text'}
            {...commonProps}
          />
        );
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            {fields.map((field, index) => (
              <Col key={field.name} md={field.col || 6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {field.label} {field.required && '*'}
                  </Form.Label>
                  {renderField(field)}
                  <Form.Control.Feedback type="invalid">
                    {errors[field.name]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {item ? 'Actualizar' : 'Crear'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default GenericForm;
