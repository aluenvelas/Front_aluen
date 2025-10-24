import React, { useState, useEffect } from 'react';
import { recetasAPI, materialesAPI, frascosAPI } from '../services/api';
import RecetaForm from '../components/RecetaForm';
import RecetaTable from '../components/RecetaTable';
import RecetaDetalleModal from '../components/RecetaDetalleModal';
import RecetaImagenModal from '../components/RecetaImagenModal';
import SearchBar from '../components/SearchBar';

const Recetas = () => {
  const [recetas, setRecetas] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [frascos, setFrascos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReceta, setEditingReceta] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [showImagenModal, setShowImagenModal] = useState(false);
  const [editingImagenReceta, setEditingImagenReceta] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recetasRes, materialesRes, frascosRes] = await Promise.all([
        recetasAPI.getAll({ activo: 'true' }),
        materialesAPI.getAll({ activo: 'true' }),
        frascosAPI.getAll({ activo: 'true' })
      ]);
      
      setRecetas(recetasRes.data);
      setMateriales(materialesRes.data);
      setFrascos(frascosRes.data);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Recetas error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (recetaData) => {
    try {
      const response = await recetasAPI.create(recetaData);
      
      // Mostrar mensaje según si es duplicada o nueva
      if (response.data.esRecetaDuplicada) {
        alert(`✅ ${response.data.mensaje}`);
        // Si es duplicada, no agregar a la lista (ya existe)
      } else {
        // Si es nueva, agregar a la lista
        setRecetas([response.data.receta, ...recetas]);
      }
      
      setShowForm(false);
      fetchData(); // Refrescar para actualizar inventarios
    } catch (err) {
      setError('Error al crear la receta');
      console.error('Create receta error:', err);
    }
  };

  const handleUpdate = async (id, recetaData) => {
    try {
      const response = await recetasAPI.update(id, recetaData);
      setRecetas(recetas.map(r => r._id === id ? response.data : r));
      setEditingReceta(null);
    } catch (err) {
      setError('Error al actualizar la receta');
      console.error('Update receta error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta receta?')) {
      try {
        await recetasAPI.delete(id);
        setRecetas(recetas.filter(r => r._id !== id));
      } catch (err) {
        setError('Error al eliminar la receta');
        console.error('Delete receta error:', err);
      }
    }
  };

  const handleEdit = (receta) => {
    setEditingReceta(receta);
    setShowForm(true);
  };

  const handleViewDetails = (receta) => {
    setSelectedReceta(receta);
    setShowDetalleModal(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReceta(null);
  };

  const handleCloseDetalleModal = () => {
    setShowDetalleModal(false);
    setSelectedReceta(null);
  };

  const handleEditImage = (receta) => {
    setEditingImagenReceta(receta);
    setShowImagenModal(true);
  };

  const handleSaveImage = async (recetaId, imagenUrl) => {
    try {
      const response = await recetasAPI.update(recetaId, { imagenUrl });
      setRecetas(recetas.map(r => r._id === recetaId ? response.data : r));
      setShowImagenModal(false);
      setEditingImagenReceta(null);
      // Refrescar datos para asegurar que se actualice todo
      fetchData();
    } catch (err) {
      console.error('Error al actualizar imagen:', err);
      throw err;
    }
  };

  const handleCloseImagenModal = () => {
    setShowImagenModal(false);
    setEditingImagenReceta(null);
  };

  const handleToggleVisibilidad = async (recetaId, estadoActual) => {
    try {
      const response = await recetasAPI.toggleVisibilidad(recetaId);
      
      // Actualizar la lista de recetas con el nuevo estado
      setRecetas(recetas.map(r => 
        r._id === recetaId 
          ? { ...r, activo: response.data.activo }
          : r
      ));
      
      // Mostrar mensaje
      alert(`✅ ${response.data.mensaje}`);
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
      alert('❌ Error al cambiar la visibilidad de la receta');
    }
  };

  // Función para filtrar recetas según el término de búsqueda
  const filterRecetas = (recetas, searchTerm) => {
    if (!searchTerm.trim()) return recetas;
    
    const term = searchTerm.toLowerCase();
    
    return recetas.filter(receta => {
      // Buscar por código
      if (receta.codigo && receta.codigo.toLowerCase().includes(term)) return true;
      
      // Buscar por nombre
      if (receta.nombre && receta.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por descripción
      if (receta.descripcion && receta.descripcion.toLowerCase().includes(term)) return true;
      
      // Buscar por frasco
      if (receta.frasco?.nombre && receta.frasco.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por tipo de cera
      if (receta.cera?.material?.nombre && receta.cera.material.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por esencia/fragancia
      if (receta.esencia?.material?.nombre && receta.esencia.material.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por aditivo
      if (receta.aditivo?.material?.nombre && receta.aditivo.material.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por precio (convertir a string)
      if (receta.precioVentaSugerido && receta.precioVentaSugerido.toString().includes(term)) return true;
      
      return false;
    });
  };

  const recetasFiltradas = filterRecetas(recetas, searchTerm);

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Recetas</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={materiales.length === 0 || frascos.length === 0}
        >
          ➕ Nueva Receta
        </button>
      </div>

      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar por código, nombre, frasco, cera, fragancia, precio..."
      />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {(materiales.length === 0 || frascos.length === 0) && (
        <div className="alert alert-warning" role="alert">
          <strong>⚠️ Atención:</strong> Necesitas tener al menos materiales y frascos registrados para crear recetas.
          {materiales.length === 0 && <div>• Agrega materiales en la sección <strong>Materiales</strong></div>}
          {frascos.length === 0 && <div>• Agrega frascos en la sección <strong>Frascos</strong></div>}
        </div>
      )}

      {recetas.length > 0 && recetasFiltradas.length === 0 && (
        <div className="alert alert-info" role="alert">
          No se encontraron recetas que coincidan con "<strong>{searchTerm}</strong>"
        </div>
      )}

      {/* Tabla de Recetas */}
      <RecetaTable 
        recetas={recetasFiltradas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onEditImage={handleEditImage}
        onToggleVisibilidad={handleToggleVisibilidad}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <RecetaForm
          receta={editingReceta}
          materiales={materiales}
          frascos={frascos}
          onSubmit={editingReceta ? 
            (data) => handleUpdate(editingReceta._id, data) : 
            handleCreate
          }
          onClose={handleCloseForm}
        />
      )}

      {/* Modal de Detalles */}
      <RecetaDetalleModal
        show={showDetalleModal}
        onHide={handleCloseDetalleModal}
        receta={selectedReceta}
      />

      {/* Modal de Editar Imagen */}
      {showImagenModal && editingImagenReceta && (
        <RecetaImagenModal
          show={showImagenModal}
          onHide={handleCloseImagenModal}
          receta={editingImagenReceta}
          onSave={handleSaveImage}
        />
      )}
    </div>
  );
};

export default Recetas;
