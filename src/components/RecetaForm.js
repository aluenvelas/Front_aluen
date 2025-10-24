import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Table, Badge } from 'react-bootstrap';
import { nombresVelasAPI } from '../services/api';

const RecetaForm = ({ receta, materiales, frascos, onSubmit, onClose }) => {
  const [nombresVelas, setNombresVelas] = useState([]);
  const [nombreVelaSeleccionado, setNombreVelaSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cera: {
      material: '',
      porcentaje: 85
    },
    aditivo: {
      material: '',
      porcentaje: 5
    },
    esencia: {
      material: '',
      porcentaje: 10
    },
    frasco: '',
    gramajeTotal: 0,
    unidadesProducir: 1
  });

  const [errors, setErrors] = useState({});

  // Filtrar materiales por tipo
  const ceras = materiales.filter(m => m.tipo === 'cera');
  const aditivos = materiales.filter(m => m.tipo === 'aditivo');
  const esencias = materiales.filter(m => m.tipo === 'esencia');

  // Cargar nombres de velas al montar el componente
  useEffect(() => {
    const cargarNombresVelas = async () => {
      try {
        const res = await nombresVelasAPI.getAll({ activo: 'true' });
        setNombresVelas(res.data);
      } catch (error) {
        console.error('Error cargando nombres de velas:', error);
      }
    };
    cargarNombresVelas();
  }, []);

  useEffect(() => {
    if (receta) {
      setFormData({
        nombre: receta.nombre || '',
        descripcion: receta.descripcion || '',
        cera: {
          material: receta.cera?.material?._id || '',
          porcentaje: receta.cera?.porcentaje || 85
        },
        aditivo: {
          material: receta.aditivo?.material?._id || '',
          porcentaje: receta.aditivo?.porcentaje || 5
        },
        esencia: {
          material: receta.esencia?.material?._id || '',
          porcentaje: receta.esencia?.porcentaje || 10
        },
        frasco: receta.frasco?._id || '',
        gramajeTotal: receta.gramajeTotal || 0,
        unidadesProducir: receta.unidadesProducir || 1
      });
    }
  }, [receta]);

  // Handler para cuando se selecciona un nombre de vela
  const handleNombreVelaChange = (nombreVelaId) => {
    const nombreVela = nombresVelas.find(nv => nv._id === nombreVelaId);
    
    if (nombreVela) {
      setNombreVelaSeleccionado(nombreVela);
      
      // Auto-completar frasco, esencia y nombre
      const frascoSeleccionado = frascos.find(f => f._id === nombreVela.frasco._id);
      
      setFormData(prev => ({
        ...prev,
        nombre: nombreVela.nombre, // Usar el nombre generado automáticamente
        frasco: nombreVela.frasco._id,
        gramajeTotal: frascoSeleccionado ? frascoSeleccionado.capacidad : prev.gramajeTotal,
        esencia: {
          ...prev.esencia,
          material: nombreVela.esencia._id
        }
      }));
    } else {
      setNombreVelaSeleccionado(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el frasco, actualizar el gramaje total automáticamente
    if (name === 'frasco') {
      const frascoSeleccionado = frascos.find(f => f._id === value);
      if (frascoSeleccionado) {
        // Usar la capacidad del frasco como gramaje total
        // Convertir de ml a gramos (aproximadamente 1:1 para cera)
        setFormData(prev => ({
          ...prev,
          frasco: value,
          gramajeTotal: frascoSeleccionado.capacidad || prev.gramajeTotal
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleComponenteChange = (componente, field, value) => {
    setFormData(prev => ({
      ...prev,
      [componente]: {
        ...prev[componente],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar que se haya seleccionado un nombre de vela
    if (!nombreVelaSeleccionado) {
      newErrors.nombreVela = 'Debe seleccionar un Nombre de Vela antes de crear la receta';
      alert('⚠️ Por favor, selecciona un Nombre de Vela en la sección superior del formulario.');
      return false;
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.cera.material) {
      newErrors.cera = 'Debe seleccionar un tipo de cera';
    }

    if (!formData.esencia.material) {
      newErrors.esencia = 'La esencia no se cargó correctamente desde el nombre de vela';
    }

    if (!formData.frasco) {
      newErrors.frasco = 'Debe seleccionar un frasco';
    }

    if (formData.gramajeTotal <= 0) {
      newErrors.gramajeTotal = 'El gramaje total debe ser mayor a 0';
    }

    if (formData.unidadesProducir <= 0) {
      newErrors.unidadesProducir = 'Debe producir al menos 1 unidad';
    }

    // Validar que los porcentajes sumen 100%
    const totalPorcentaje = parseFloat(formData.cera.porcentaje) + 
                            parseFloat(formData.esencia.porcentaje) + 
                            (formData.aditivo.material ? parseFloat(formData.aditivo.porcentaje) : 0);
    
    if (Math.abs(totalPorcentaje - 100) > 0.01) {
      newErrors.porcentajes = `Los porcentajes deben sumar 100%. Actualmente suman ${totalPorcentaje.toFixed(2)}%`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Preparar datos para enviar
      const dataToSubmit = {
        ...formData,
        // Si no hay aditivo, no enviamos el objeto
        aditivo: formData.aditivo.material ? formData.aditivo : undefined,
        molde: formData.molde || null
      };
      
      onSubmit(dataToSubmit);
    }
  };

  const calcularGramajePorComponente = (porcentaje) => {
    if (formData.gramajeTotal > 0) {
      return Math.ceil((formData.gramajeTotal * porcentaje) / 100);
    }
    return 0;
  };

  const calcularGramajeTotal = (porcentaje) => {
    const gramajePorUnidad = calcularGramajePorComponente(porcentaje);
    return Math.ceil(gramajePorUnidad * formData.unidadesProducir);
  };

  const totalPorcentaje = parseFloat(formData.cera.porcentaje) + 
                          parseFloat(formData.esencia.porcentaje) + 
                          (formData.aditivo.material ? parseFloat(formData.aditivo.porcentaje) : 0);

  // Obtener materiales seleccionados para mostrar stock
  const ceraSeleccionada = ceras.find(c => c._id === formData.cera.material);
  const aditivoSeleccionado = aditivos.find(a => a._id === formData.aditivo.material);
  const esenciaSeleccionada = esencias.find(e => e._id === formData.esencia.material);
  const frascoSeleccionado = frascos.find(f => f._id === formData.frasco);

  return (
    <Modal show={true} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {receta ? 'Editar Receta' : '🕯️ Nueva Receta de Vela'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Paso 0: Selección de Nombre de Vela */}
          <div className="bg-light p-3 rounded mb-4 border border-primary">
            <h6 className="text-primary mb-3">🏷️ Paso 1: Seleccionar Nombre de Vela (OBLIGATORIO)</h6>
            <Alert variant="info" className="mb-3">
              💡 <strong>Importante:</strong> Debes seleccionar un nombre de vela. Esto auto-completará automáticamente:
              <ul className="mb-0 mt-2">
                <li>El nombre de la receta</li>
                <li>El frasco a utilizar</li>
                <li>La esencia (no podrás cambiarla)</li>
                <li>El gramaje según el frasco</li>
              </ul>
            </Alert>
            
            <Form.Group className="mb-3">
              <Form.Label>Nombre de Vela *</Form.Label>
              <Form.Select
                value={nombreVelaSeleccionado?._id || ''}
                onChange={(e) => handleNombreVelaChange(e.target.value)}
                required
              >
                <option value="">-- Selecciona un nombre de vela --</option>
                {nombresVelas.map(nv => (
                  <option key={nv._id} value={nv._id}>
                    {nv.nombre} - {nv.frasco?.capacidad}ml
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                {nombresVelas.length === 0 ? (
                  <span className="text-danger">⚠️ No hay nombres de velas disponibles. Ve a "Nombres de Velas" para crear uno primero.</span>
                ) : (
                  <span className="text-success">✓ Selecciona un nombre para continuar con el formulario</span>
                )}
              </Form.Text>
            </Form.Group>

            {nombreVelaSeleccionado && (
              <Alert variant="success" className="mb-0">
                <strong>✅ Nombre de Vela Seleccionado:</strong>
                <div className="mt-2">
                  <Badge bg="primary" className="me-2">📛 {nombreVelaSeleccionado.nombre}</Badge>
                  <Badge bg="info" className="me-2">🫙 {nombreVelaSeleccionado.frasco?.nombre}</Badge>
                  <Badge bg="success" className="me-2">🌸 {nombreVelaSeleccionado.esencia?.nombre}</Badge>
                  <Badge bg="secondary">🎨 {nombreVelaSeleccionado.color}</Badge>
                </div>
                {nombreVelaSeleccionado.descripcion && (
                  <div className="mt-2 text-muted">
                    <small>{nombreVelaSeleccionado.descripcion}</small>
                  </div>
                )}
              </Alert>
            )}
          </div>

          <hr />

          {/* Paso 2: Información Básica */}
          <h6 className="text-primary mb-3">📝 Paso 2: Información Básica</h6>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la Receta *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  isInvalid={!!errors.nombre}
                  placeholder="Ej: Vela Lavanda 200ml"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Unidades a Producir *</Form.Label>
                <Form.Control
                  type="number"
                  step="1"
                  min="1"
                  name="unidadesProducir"
                  value={formData.unidadesProducir}
                  onChange={handleChange}
                  isInvalid={!!errors.unidadesProducir}
                  placeholder="1"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.unidadesProducir}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción de la vela..."
            />
          </Form.Group>

          <hr />

          {/* Paso 3: Frasco (Auto-completado) */}
          <h6 className="text-primary mb-3">🫙 Paso 3: Frasco (Auto-completado desde Nombre de Vela)</h6>
          <Alert variant="success" className="mb-3">
            ✅ El frasco se seleccionó automáticamente al elegir el nombre de vela. El gramaje también se ajustó según la capacidad del frasco.
          </Alert>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Frasco *</Form.Label>
                <Form.Select
                  name="frasco"
                  value={formData.frasco}
                  onChange={handleChange}
                  isInvalid={!!errors.frasco}
                  disabled={!!nombreVelaSeleccionado}
                >
                  <option value="">Seleccionar frasco...</option>
                  {frascos.map(frasco => (
                    <option key={frasco._id} value={frasco._id}>
                      {frasco.nombre} - {frasco.capacidad}ml - ${frasco.precio.toFixed(2)} (Stock: {frasco.stock})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.frasco}
                </Form.Control.Feedback>
                {nombreVelaSeleccionado && (
                  <Form.Text className="text-info">
                    🔒 Auto-completado por nombre de vela
                  </Form.Text>
                )}
                {frascoSeleccionado && formData.unidadesProducir > 0 && (
                  <Form.Text className="text-success d-block">
                    ✓ Capacidad: {frascoSeleccionado.capacidad}ml | Se necesitarán {formData.unidadesProducir} frascos
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Gramaje por Vela (gramos) *</Form.Label>
                <Form.Control
                  type="number"
                  step="1"
                  min="0"
                  name="gramajeTotal"
                  value={formData.gramajeTotal}
                  onChange={handleChange}
                  isInvalid={!!errors.gramajeTotal}
                  placeholder="Se ajusta automáticamente al seleccionar frasco"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.gramajeTotal}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Se ajusta automáticamente según el frasco seleccionado
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <hr />

          {/* Paso 4: Componentes de la Vela */}
          <h6 className="text-primary mb-3">🕯️ Paso 4: Composición de la Vela</h6>
          <Alert variant="warning" className="mb-3">
            ⚖️ <strong>Importante:</strong> Los porcentajes deben sumar exactamente 100%. 
            {formData.gramajeTotal > 0 && (
              <> Los gramos se calculan automáticamente según el gramaje de {formData.gramajeTotal}g.</>
            )}
          </Alert>
          
          {errors.porcentajes && (
            <Alert variant="danger">{errors.porcentajes}</Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cera *</Form.Label>
                <Form.Select
                  value={formData.cera.material}
                  onChange={(e) => handleComponenteChange('cera', 'material', e.target.value)}
                  isInvalid={!!errors.cera}
                >
                  <option value="">Seleccionar cera...</option>
                  {ceras.map(cera => (
                    <option key={cera._id} value={cera._id}>
                      {cera.nombre} - ${cera.precioPorGramo.toFixed(2)}/g (Stock: {cera.stock}g)
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.cera}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>% Cera *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={formData.cera.porcentaje}
                  onChange={(e) => handleComponenteChange('cera', 'porcentaje', parseFloat(e.target.value) || 0)}
                />
                {formData.gramajeTotal > 0 && (
                  <Form.Text className="text-success">
                    Por unidad: {calcularGramajePorComponente(formData.cera.porcentaje)}g | 
                    Total producción: {calcularGramajeTotal(formData.cera.porcentaje)}g
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Aditivo (Opcional)</Form.Label>
                <Form.Select
                  value={formData.aditivo.material}
                  onChange={(e) => handleComponenteChange('aditivo', 'material', e.target.value)}
                >
                  <option value="">Sin aditivo</option>
                  {aditivos.map(aditivo => (
                    <option key={aditivo._id} value={aditivo._id}>
                      {aditivo.nombre} - ${aditivo.precioPorGramo.toFixed(2)}/g (Stock: {aditivo.stock}g)
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Opcional: Colorante, endurecedor, etc.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>% Aditivo</Form.Label>
                <Form.Control
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={formData.aditivo.porcentaje}
                  onChange={(e) => handleComponenteChange('aditivo', 'porcentaje', parseFloat(e.target.value) || 0)}
                  disabled={!formData.aditivo.material}
                />
                {formData.gramajeTotal > 0 && formData.aditivo.material && (
                  <Form.Text className="text-success">
                    Por unidad: {calcularGramajePorComponente(formData.aditivo.porcentaje)}g | 
                    Total producción: {calcularGramajeTotal(formData.aditivo.porcentaje)}g
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          {!nombreVelaSeleccionado ? (
            <Row>
              <Col xs={12}>
                <Alert variant="warning" className="mb-3">
                  ⚠️ <strong>Importante:</strong> Para usar este formulario, primero selecciona un <strong>Nombre de Vela</strong> en la sección superior. 
                  La esencia vendrá automáticamente del nombre de vela seleccionado.
                </Alert>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col md={6}>
                <Alert variant="success" className="mb-3">
                  ✅ <strong>Esencia automática:</strong> {nombreVelaSeleccionado?.esencia?.nombre || 'N/A'}
                  <div className="mt-1">
                    <small className="text-muted">Se seleccionó automáticamente desde el nombre de vela.</small>
                  </div>
                </Alert>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>% Esencia *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={formData.esencia.porcentaje}
                    onChange={(e) => handleComponenteChange('esencia', 'porcentaje', parseFloat(e.target.value) || 0)}
                  />
                  {formData.gramajeTotal > 0 && (
                    <Form.Text className="text-success">
                      Por unidad: {calcularGramajePorComponente(formData.esencia.porcentaje)}g | 
                      Total producción: {calcularGramajeTotal(formData.esencia.porcentaje)}g
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
          )}

          <hr />

          {/* Resumen */}
          {formData.gramajeTotal > 0 && formData.unidadesProducir > 0 && (
            <Alert variant="info" className="mt-3">
              <strong>📊 Resumen de Producción:</strong>
              <Table size="sm" className="mt-2 mb-0">
                <thead>
                  <tr>
                    <th>Componente</th>
                    <th>%</th>
                    <th>Por Unidad</th>
                    <th>Total ({formData.unidadesProducir} unidades)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cera {ceraSeleccionada && `(${ceraSeleccionada.nombre})`}</td>
                    <td>{formData.cera.porcentaje}%</td>
                    <td>{calcularGramajePorComponente(formData.cera.porcentaje)}g</td>
                    <td className={ceraSeleccionada && ceraSeleccionada.stock < calcularGramajeTotal(formData.cera.porcentaje) ? 'text-danger fw-bold' : 'text-success'}>
                      {calcularGramajeTotal(formData.cera.porcentaje)}g
                      {ceraSeleccionada && ceraSeleccionada.stock < calcularGramajeTotal(formData.cera.porcentaje) && ' ⚠️ Stock insuficiente'}
                    </td>
                  </tr>
                  {formData.aditivo.material && (
                    <tr>
                      <td>Aditivo {aditivoSeleccionado && `(${aditivoSeleccionado.nombre})`}</td>
                      <td>{formData.aditivo.porcentaje}%</td>
                      <td>{calcularGramajePorComponente(formData.aditivo.porcentaje)}g</td>
                      <td className={aditivoSeleccionado && aditivoSeleccionado.stock < calcularGramajeTotal(formData.aditivo.porcentaje) ? 'text-danger fw-bold' : 'text-success'}>
                        {calcularGramajeTotal(formData.aditivo.porcentaje)}g
                        {aditivoSeleccionado && aditivoSeleccionado.stock < calcularGramajeTotal(formData.aditivo.porcentaje) && ' ⚠️ Stock insuficiente'}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>Esencia {esenciaSeleccionada && `(${esenciaSeleccionada.nombre})`}</td>
                    <td>{formData.esencia.porcentaje}%</td>
                    <td>{calcularGramajePorComponente(formData.esencia.porcentaje)}g</td>
                    <td className={esenciaSeleccionada && esenciaSeleccionada.stock < calcularGramajeTotal(formData.esencia.porcentaje) ? 'text-danger fw-bold' : 'text-success'}>
                      {calcularGramajeTotal(formData.esencia.porcentaje)}g
                      {esenciaSeleccionada && esenciaSeleccionada.stock < calcularGramajeTotal(formData.esencia.porcentaje) && ' ⚠️ Stock insuficiente'}
                    </td>
                  </tr>
                  <tr className="fw-bold">
                    <td>TOTAL</td>
                    <td className={Math.abs(totalPorcentaje - 100) > 0.01 ? 'text-danger' : 'text-success'}>
                      {totalPorcentaje.toFixed(2)}%
                    </td>
                    <td>{formData.gramajeTotal}g</td>
                    <td>{(formData.gramajeTotal * formData.unidadesProducir).toFixed(2)}g</td>
                  </tr>
                </tbody>
              </Table>
              {frascoSeleccionado && frascoSeleccionado.stock < formData.unidadesProducir && (
                <div className="text-danger mt-2">
                  ⚠️ Stock insuficiente de frascos. Necesitas {formData.unidadesProducir} pero solo hay {frascoSeleccionado.stock} disponibles
                </div>
              )}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {receta ? 'Actualizar' : 'Crear'} Receta y Descontar Inventario
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RecetaForm;