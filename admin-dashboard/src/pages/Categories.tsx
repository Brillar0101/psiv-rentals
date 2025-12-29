// src/pages/Categories.tsx
// Categories Management Page - Manage equipment categories

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { categoryAPI } from '../services/api';
import { Category } from '../types';
import '../styles/Categories.css';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll(true);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, formData);
        alert('Category updated successfully!');
      } else {
        await categoryAPI.create(formData);
        alert('Category added successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoryAPI.delete(id);
      alert('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setEditingCategory(null);
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
          <h1>Categories Management</h1>
          <button onClick={handleAddNew} className="btn-primary">
            + Add Category
          </button>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <h3>{category.name}</h3>
                <span className="equipment-count">
                  {category.equipment_count || 0} items
                </span>
              </div>
              <p className="category-description">
                {category.description || 'No description'}
              </p>
              <div className="category-actions">
                <button onClick={() => handleEdit(category)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => handleDelete(category.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="category-form">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Cameras"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe this category..."
                  />
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
                    {editingCategory ? 'Update' : 'Add'} Category
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

export default Categories;
