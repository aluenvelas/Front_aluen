import React, { useState, useEffect } from 'react';
import { materialesAPI } from '../services/api';
import MaterialForm from '../components/MaterialForm';
import MaterialTable from '../components/MaterialTable';
import SearchBar from '../components/SearchBar';

const Materiales = () => {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    tipo: '',
    activo: 'true'
  });

  useEffect(() => {
    fetchMateriales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const fetchMateriales = async () => {
    try {
      setLoading(true);
      const response = await materialesAPI.getAll(filtros);
      setMateriales(response.data);
    } catch (err) {
      setError('Error al cargar los materiales');
      console.error('Materiales error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (materialData) => {
    try {
      const response = await materialesAPI.create(materialData);
      setMateriales([response.data, ...materiales]);
      setShowForm(false);
    } catch (err) {
      setError('Error al crear el material');
      console.error('Create material error:', err);
    }
  };

  const handleUpdate = async (id, materialData) => {
    try {
      const response = await materialesAPI.update(id, materialData);
      setMateriales(materiales.map(m => m._id === id ? response.data : m));
      setEditingMaterial(null);
    } catch (err) {
      setError('Error al actualizar el material');
      console.error('Update material error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este material?')) {
      try {
        await materialesAPI.delete(id);
        setMateriales(materiales.filter(m => m._id !== id));
      } catch (err) {
        setError('Error al eliminar el material');
        console.error('Delete material error:', err);
      }
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  const tiposMaterial = ['cera', 'aditivo', 'esencia', 'otro'];

  // Filtrar materiales por búsqueda
  const filterMateriales = (materiales, searchTerm) => {
    if (!searchTerm) return materiales;
    
    const term = searchTerm.toLowerCase();
    return materiales.filter(material => 
      material.nombre?.toLowerCase().includes(term) ||
      material.tipo?.toLowerCase().includes(term) ||
      material.proveedor?.toLowerCase().includes(term)
    );
  };

  const materialesFiltrados = filterMateriales(materiales, searchTerm);

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
        <h1 className="h3 mb-0">Materiales</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nuevo Material
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Buscador */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar por nombre, tipo o proveedor..."
      />

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Tipo de Material</label>
              <select 
                className="form-select"
                value={filtros.tipo}
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              >
                <option value="">Todos los tipos</option>
                {tiposMaterial.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Estado</label>
              <select 
                className="form-select"
                value={filtros.activo}
                onChange={(e) => setFiltros({...filtros, activo: e.target.value})}
              >
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
                <option value="">Todos</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  setFiltros({tipo: '', activo: 'true'});
                  setSearchTerm('');
                }}
              >
                🔄 Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Materiales */}
      <MaterialTable 
        materiales={materialesFiltrados}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <MaterialForm
          material={editingMaterial}
          onSubmit={editingMaterial ? 
            (data) => handleUpdate(editingMaterial._id, data) : 
            handleCreate
          }
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Materiales;


