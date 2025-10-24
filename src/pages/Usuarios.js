import React, { useState, useEffect } from 'react';
import { usuariosAPI } from '../services/api';
import { Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Usuarios = () => {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'usuario',
    activo: true
  });
  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: ''
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usuariosAPI.getAll();
      setUsuarios(response.data);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (usuario = null) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: '',
        rol: usuario.rol,
        activo: usuario.activo
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'usuario',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUsuario(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'usuario',
      activo: true
    });
  };

  const handleShowPasswordModal = (usuario) => {
    setEditingUsuario(usuario);
    setPasswordData({
      passwordActual: '',
      passwordNueva: '',
      passwordConfirmar: ''
    });
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setEditingUsuario(null);
    setPasswordData({
      passwordActual: '',
      passwordNueva: '',
      passwordConfirmar: ''
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUsuario) {
        // Actualizar usuario existente
        const dataToUpdate = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo
        };
        await usuariosAPI.update(editingUsuario._id, dataToUpdate);
        alert('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        if (!formData.password || formData.password.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        await usuariosAPI.create(formData);
        alert('Usuario creado exitosamente');
      }
      
      handleCloseModal();
      fetchUsuarios();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar usuario');
      console.error('Error:', err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.passwordNueva !== passwordData.passwordConfirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordData.passwordNueva.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      // Si es el usuario actual, requiere contraseña actual
      const esUsuarioActual = editingUsuario._id === usuarioActual.id;
      
      if (esUsuarioActual) {
        await usuariosAPI.cambiarPassword(editingUsuario._id, {
          passwordActual: passwordData.passwordActual,
          passwordNueva: passwordData.passwordNueva
        });
      } else {
        // Admin reseteando contraseña de otro usuario
        await usuariosAPI.resetearPassword(editingUsuario._id, {
          passwordNueva: passwordData.passwordNueva
        });
      }
      
      alert('Contraseña actualizada exitosamente');
      handleClosePasswordModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cambiar contraseña');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
      try {
        await usuariosAPI.delete(id);
        alert('Usuario desactivado exitosamente');
        fetchUsuarios();
      } catch (err) {
        alert(err.response?.data?.message || 'Error al desactivar usuario');
        console.error('Error:', err);
      }
    }
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
        <h1 className="h3 mb-0">👥 Gestión de Usuarios</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          ➕ Nuevo Usuario
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Lista de Usuarios</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha Creación</th>
                  <th>Último Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario._id}>
                      <td>
                        <strong>{usuario.nombre}</strong>
                        {usuario._id === usuarioActual?.id && (
                          <Badge bg="info" className="ms-2">Tú</Badge>
                        )}
                      </td>
                      <td>{usuario.email}</td>
                      <td>
                        <Badge bg={usuario.rol === 'admin' ? 'danger' : 'primary'}>
                          {usuario.rol === 'admin' ? '👑 Admin' : '👤 Usuario'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={usuario.activo ? 'success' : 'secondary'}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td>
                        {new Date(usuario.fechaCreacion).toLocaleDateString('es-ES')}
                      </td>
                      <td>
                        {usuario.ultimoAcceso
                          ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES')
                          : 'Nunca'}
                      </td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleShowModal(usuario)}
                          title="Editar"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleShowPasswordModal(usuario)}
                          title="Cambiar Contraseña"
                        >
                          🔑
                        </Button>
                        {usuario._id !== usuarioActual?.id && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(usuario._id)}
                            disabled={!usuario.activo}
                            title="Desactivar"
                          >
                            🗑️
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal para crear/editar usuario */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre completo"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="correo@ejemplo.com"
              />
            </Form.Group>

            {!editingUsuario && (
              <Form.Group className="mb-3">
                <Form.Label>Contraseña *</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUsuario}
                  minLength="6"
                  placeholder="Mínimo 6 caracteres"
                />
                <Form.Text className="text-muted">
                  La contraseña debe tener al menos 6 caracteres
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Rol *</Form.Label>
              <Form.Select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
              >
                <option value="usuario">👤 Usuario</option>
                <option value="admin">👑 Administrador</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Los administradores tienen acceso completo al sistema
              </Form.Text>
            </Form.Group>

            {editingUsuario && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="activo"
                  label="Usuario activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingUsuario ? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <Modal show={showPasswordModal} onHide={handleClosePasswordModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            🔑 Cambiar Contraseña - {editingUsuario?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordSubmit}>
          <Modal.Body>
            {editingUsuario?._id === usuarioActual?.id && (
              <Form.Group className="mb-3">
                <Form.Label>Contraseña Actual *</Form.Label>
                <Form.Control
                  type="password"
                  name="passwordActual"
                  value={passwordData.passwordActual}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Tu contraseña actual"
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña *</Form.Label>
              <Form.Control
                type="password"
                name="passwordNueva"
                value={passwordData.passwordNueva}
                onChange={handlePasswordChange}
                required
                minLength="6"
                placeholder="Mínimo 6 caracteres"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar Nueva Contraseña *</Form.Label>
              <Form.Control
                type="password"
                name="passwordConfirmar"
                value={passwordData.passwordConfirmar}
                onChange={handlePasswordChange}
                required
                minLength="6"
                placeholder="Repetir nueva contraseña"
              />
            </Form.Group>

            {editingUsuario?._id !== usuarioActual?.id && (
              <Alert variant="warning">
                <strong>⚠️ Advertencia:</strong> Vas a resetear la contraseña de otro usuario. 
                No se requiere la contraseña actual.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePasswordModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Cambiar Contraseña
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Usuarios;


