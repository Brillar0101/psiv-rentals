// src/pages/Equipment.tsx
// Equipment Management Page - Add, edit, delete equipment with image upload

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Plus, Edit2, Trash2, X, Upload, Folder, ArrowRight } from 'react-feather';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { equipmentAPI, categoryAPI } from '../services/api';
import { Equipment as EquipmentType, Category } from '../types';
import '../styles/Equipment.css';

// Helper function to create cropped image
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  // Set canvas size to the cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      'image/jpeg',
      0.9
    );
  });
};

const Equipment: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImages, setCroppedImages] = useState<Blob[]>([]);

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
    setImages(item.images || []);
    setShowModal(true);
  };

  // Cropper callbacks
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingEquipment || !e.target.files || e.target.files.length === 0) {
      return;
    }

    const remainingSlots = 10 - images.length;
    if (e.target.files.length > remainingSlots) {
      alert(`Can only upload ${remainingSlots} more image(s). Maximum is 10.`);
      return;
    }

    // Store files and start cropping process
    const files = Array.from(e.target.files);
    setPendingFiles(files);
    setCroppedImages([]);
    setCurrentFileIndex(0);

    // Load first image for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(files[0]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      // Create cropped image blob
      const croppedBlob = await createCroppedImage(imageToCrop, croppedAreaPixels);
      const newCroppedImages = [...croppedImages, croppedBlob];
      setCroppedImages(newCroppedImages);

      // Check if there are more images to crop
      const nextIndex = currentFileIndex + 1;
      if (nextIndex < pendingFiles.length) {
        // Load next image
        setCurrentFileIndex(nextIndex);
        const reader = new FileReader();
        reader.onload = () => {
          setImageToCrop(reader.result as string);
          setCrop({ x: 0, y: 0 });
          setZoom(1);
        };
        reader.readAsDataURL(pendingFiles[nextIndex]);
      } else {
        // All images cropped, upload them
        setShowCropper(false);
        await uploadCroppedImages(newCroppedImages);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setPendingFiles([]);
    setCroppedImages([]);
    setCurrentFileIndex(0);
  };

  const uploadCroppedImages = async (blobs: Blob[]) => {
    if (!editingEquipment) return;

    setUploadingImages(true);
    try {
      // Convert blobs to files
      const dataTransfer = new DataTransfer();
      blobs.forEach((blob, index) => {
        const file = new File([blob], `image-${Date.now()}-${index}.jpg`, { type: 'image/jpeg' });
        dataTransfer.items.add(file);
      });

      const response = await equipmentAPI.uploadImages(editingEquipment.id, dataTransfer.files);
      setImages(response.data.data.images);
      alert('Images uploaded successfully!');
    } catch (error: any) {
      console.error('Failed to upload images:', error);
      alert(error.response?.data?.error || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      setPendingFiles([]);
      setCroppedImages([]);
      setCurrentFileIndex(0);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!editingEquipment) return;

    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await equipmentAPI.deleteImage(editingEquipment.id, imageUrl);
      setImages(response.data.data.images);
      alert('Image deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete image:', error);
      alert(error.response?.data?.error || 'Failed to delete image');
    }
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
    setImages([]);
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

                {/* Category Selection - Enhanced for editing */}
                <div className="form-group category-section">
                  <label>
                    <Folder size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    {editingEquipment ? 'Move to Category' : 'Category'}
                  </label>
                  {editingEquipment && editingEquipment.category_name && formData.category_id !== editingEquipment.category_id && (
                    <div className="category-change-indicator">
                      <span className="current-category">{editingEquipment.category_name}</span>
                      <ArrowRight size={16} />
                      <span className="new-category">
                        {categories.find(c => c.id === formData.category_id)?.name || 'No Category'}
                      </span>
                    </div>
                  )}
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className={editingEquipment && formData.category_id !== editingEquipment.category_id ? 'category-changed' : ''}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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

                {/* Image Upload Section - Only show when editing */}
                {editingEquipment && (
                  <div className="form-group image-upload-section">
                    <label>Equipment Images ({images.length}/10)</label>

                    {/* Image Gallery */}
                    {images.length > 0 && (
                      <div className="image-gallery">
                        {images.map((url, index) => (
                          <div key={index} className="image-item">
                            <img src={url} alt={`Equipment ${index + 1}`} />
                            <button
                              type="button"
                              className="image-delete-btn"
                              onClick={() => handleImageDelete(url)}
                              title="Delete image"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    {images.length < 10 && (
                      <div className="image-upload-controls">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          onChange={handleImageSelect}
                          style={{ display: 'none' }}
                          id="image-upload-input"
                        />
                        <button
                          type="button"
                          className="btn-upload"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImages}
                        >
                          {uploadingImages ? 'Uploading...' : '+ Add Images'}
                        </button>
                        <span className="upload-hint">
                          Max 5MB per image. Supported: JPEG, PNG, WebP, GIF
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {!editingEquipment && (
                  <div className="form-group">
                    <p className="info-note">
                      Save the equipment first, then edit it to add images.
                    </p>
                  </div>
                )}

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

        {/* Image Cropper Modal */}
        {showCropper && imageToCrop && (
          <div className="cropper-modal-overlay">
            <div className="cropper-modal">
              <div className="cropper-header">
                <h3>Crop Image ({currentFileIndex + 1} of {pendingFiles.length})</h3>
                <p>Drag to reposition, scroll to zoom. Images will be cropped to 1:1 square.</p>
              </div>

              <div className="cropper-container">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="cropper-controls">
                <label>
                  Zoom:
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </label>
              </div>

              <div className="cropper-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCropCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleCropConfirm}
                >
                  {currentFileIndex + 1 < pendingFiles.length ? 'Next Image' : 'Crop & Upload'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Equipment;
