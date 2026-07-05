import React, { useState, useEffect } from 'react';
import api from '../api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';

const ConfigType = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState({ id: null, config_type: '', min_mentees: 1, max_mentees: 10 });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/config-type/list');
      if (response.data.status_code === 200) {
        setConfigs(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch configs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (config = null) => {
    if (config) {
      setCurrentConfig(config);
    } else {
      setCurrentConfig({ id: null, config_type: '', min_mentees: 1, max_mentees: 10 });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentConfig({ id: null, config_type: '', min_mentees: 1, max_mentees: 10 });
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const payload = {
        config_type: currentConfig.config_type,
        min_mentees: parseInt(currentConfig.min_mentees),
        max_mentees: parseInt(currentConfig.max_mentees),
      };
      
      let response;
      if (currentConfig.id) {
        // Update
        response = await api.put(`/config-type/update/${currentConfig.id}`, payload);
      } else {
        // Create
        response = await api.post('/config-type/save', payload);
      }
      
      if (response.data.status_code === 200) {
        fetchConfigs();
        handleCloseModal();
      } else {
        setError(response.data.message || 'Failed to save configuration');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        const response = await api.delete(`/config-type/delete/${id}`);
        if (response.data.status_code === 200) {
          fetchConfigs();
        }
      } catch (err) {
        console.error('Delete failed', err);
        alert('Failed to delete configuration');
      }
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Configuration Types', 14, 15);
    
    const tableColumn = ["ID", "Configuration Type", "Min Mentees", "Max Mentees"];
    const tableRows = [];

    configs.forEach(config => {
      const configData = [
        config.id,
        config.config_type,
        config.min_mentees,
        config.max_mentees,
      ];
      tableRows.push(configData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save(`configuration_types_${new Date().getTime()}.pdf`);
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Configuration Types</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportPDF} className="btn btn-success">
            <Download size={16} /> Export PDF
          </button>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus size={16} /> Add Config
          </button>
        </div>
      </div>

      <div className="glass-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : configs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No configurations found.</div>
        ) : (
          <table className="datatable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Config Type</th>
                <th>Min Mentees</th>
                <th>Max Mentees</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(config => (
                <tr key={config.id}>
                  <td>{config.id}</td>
                  <td style={{ fontWeight: 500 }}>{config.config_type}</td>
                  <td>{config.min_mentees}</td>
                  <td>{config.max_mentees}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(config)} className="btn" style={{ background: 'transparent', color: 'var(--primary-color)', padding: '6px' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(config.id)} className="btn" style={{ background: 'transparent', color: 'var(--danger)', padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>
              {currentConfig.id ? 'Edit Configuration' : 'Add Configuration'}
            </h3>
            
            {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Configuration Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={currentConfig.config_type}
                  onChange={e => setCurrentConfig({...currentConfig, config_type: e.target.value})}
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Min Mentees</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={currentConfig.min_mentees}
                    onChange={e => setCurrentConfig({...currentConfig, min_mentees: e.target.value})}
                    min="1"
                    required 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Max Mentees</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={currentConfig.max_mentees}
                    onChange={e => setCurrentConfig({...currentConfig, max_mentees: e.target.value})}
                    min={currentConfig.min_mentees}
                    required 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={handleCloseModal} className="btn" style={{ background: '#e5e7eb', color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigType;
