import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const RecetaImagenModal = ({ show, onHide, receta, onSave }) => {
  const [imagenUrl, setImagenUrl] = useState(receta?.imagenUrl || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(receta._id, imagenUrl);
      onHide();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImagenUrl(receta?.imagenUrl || '');
    setError('');
    onHide();
  };

  // Obtener URL de imagen procesada para previsualización
  const getPreviewUrl = (url) => {
    if (!url) return null;
    
    // Si es una URL de Google Drive
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const fileId = match[1];
      const googleUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      const API_URL = process.env.REACT_APP_API_URL || 'https://back-aluen-ohbk.onrender.com/api';
      const baseURL = API_URL.replace('/api', '');
      return `${baseURL}/api/proxy-image?url=${encodeURIComponent(googleUrl)}`;
    }
    
    // Si es una URL directa
    return url;
  };

  const previewUrl = getPreviewUrl(imagenUrl);

  return (
    <Modal show={show} onHide={handleClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          📸 Editar Imagen de la Receta
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Alert variant="info" className="mb-3">
            <strong>📝 Instrucciones:</strong>
            <ul className="mb-0 mt-2">
              <li>Sube tu imagen a Google Drive</li>
              <li>Haz clic derecho → "Compartir" → "Cualquiera con el enlace"</li>
              <li>Copia el enlace y pégalo aquí</li>
            </ul>
          </Alert>

          <h6 className="mb-3">Receta: <strong>{receta?.nombre}</strong></h6>

          <Form.Group className="mb-3">
            <Form.Label>URL de la Imagen</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
            />
            <Form.Text className="text-muted">
              Pega aquí el enlace de Google Drive o cualquier URL de imagen
            </Form.Text>
          </Form.Group>

          {/* Vista Previa */}
          {previewUrl && (
            <div className="mb-3">
              <Form.Label>Vista Previa:</Form.Label>
              <div 
                style={{ 
                  width: '100%', 
                  maxWidth: '300px', 
                  margin: '0 auto',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}
              >
                <img 
                  src={previewUrl} 
                  alt="Preview"
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f8f9fa" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3E❌ Error al cargar imagen%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>
          )}

          {/* Información actual */}
          {receta?.imagenUrl && (
            <Alert variant="secondary" className="mt-3">
              <small>
                <strong>Imagen actual:</strong> 
                <div className="mt-1" style={{ 
                  maxWidth: '100%', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {receta.imagenUrl}
                </div>
              </small>
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || !imagenUrl.trim()}
          >
            {loading ? 'Guardando...' : 'Guardar Imagen'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RecetaImagenModal;

