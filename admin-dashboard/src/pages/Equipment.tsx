// src/pages/Equipment.tsx
// Equipment Management Page - Add, edit, delete equipment

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { equipmentAPI, categoryAPI } from '../services/api';
import { Equipment as EquipmentType, Category } from '../types';
import '../styles/Equipment.css';

const Equipment: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    brand: '',
    model: '',
    description: '',
    daily_rate: '',
    weekly_rate: '',
    replacement_value: '',
    damage_deposit: '',
    quantity_total: '1',
    condition: 'excellent' as 'excellent' | 'good' | 'fair' | 'maintenance',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipmentRes, categoriesRes] = await Promise.all([
        equipmentAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setEquipment(equipmentRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        daily_rate: parseFloat(formData.daily_rate),
        weekly_rate: formData.weekly_rate ? parseFloat(formData.weekly_rate) : undefined,
        replacement_value: parseFloat(formData.replacement_value),
        damage_deposit: parseFloat(formData.damage_deposit),
        quantity_total: parseInt(formData.quantity_total),
      };

      if (editingEquipment) {
        await equipmentAPI.update(editingEquipment.id, payload);
        alert('Equipment updated successfully!');
      } else {
        await equipmentAPI.create(payload);
        alert('Equipment added successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save equipment:', error);
      alert(error.response?.data?.error || 'Failed to save equipment');
    }
  };

  const handleEdit = (item: EquipmentType) => {
    setEditingEquipment(item);
    setFormData({
      category_id: item.category_id || '',
      name: item.name,
      brand: item.brand || '',
      model: item.model || '',
      description: item.description || '',
      daily_rate: item.daily_rate.toString(),
      weekly_rate: item.weekly_rate?.toString() || '',
      replacement_value: item.replacement_value.toString(),
      damage_deposit: item.damage_deposit.toString(),
      quantity_total: item.quantity_total.toString(),
      condition: item.condition,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      await equipmentAPI.delete(id);
      alert('Equipment deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      alert('Failed to delete equipment');
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      name: '',
      brand: '',
      model: '',
      description: '',
      daily_rate: '',
      weekly_rate: '',
      replacement_value: '',
      damage_deposit: '',
      quantity_total: '1',
      condition: 'excellent',
    });
    setEditingEquipment(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <Sidebar />
        <main className="main-content">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <Sidebar />
      
      <main className="main-content">
        <div className="page-header">
          <h1>Equipment Management</h1>
          <button onClick={handleAddNew} className="btn-primary">
            + Add Equipment
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand/Model</th>
                <th>Category</th>
                <th>Daily Rate</th>
                <th>Available</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    No equipment found. Add your first item!
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.brand} {item.model}</td>
                    <td>{item.category_name || 'N/A'}</td>
                    <td>${item.daily_rate}</td>
                    <td>{item.quantity_available} / {item.quantity_total}</td>
                    <td>
                      <span className={`condition-badge condition-${item.condition}`}>
                        {item.condition}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingEquipment ? 'Edit Equipment' : 'Add Equipment'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="equipment-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Equipment Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Model</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Daily Rate ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="daily_rate"
                      value={formData.daily_rate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Weekly Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="weekly_rate"
                      value={formData.weekly_rate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Replacement Value ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="replacement_value"
                      value={formData.replacement_value}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Damage Deposit ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="damage_deposit"
                      value={formData.damage_deposit}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity_total"
                      value={formData.quantity_total}
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Condition *</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingEquipment ? 'Update' : 'Add'} Equipment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Equipment;
