// src/pages/PromoCodes.tsx
// Promo Codes Management Page - Create, view, and manage promo codes

import React, { useEffect, useState } from 'react';
import { Gift, Plus, Copy, Check, XCircle, DollarSign, Percent, CreditCard } from 'react-feather';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { promoAPI } from '../services/api';
import '../styles/PromoCodes.css';

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount' | 'credit';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  max_uses: number | null;
  current_uses: number;
  max_uses_per_user: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const PromoCodes: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Form state for creating new promo code
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'fixed_amount' as 'percentage' | 'fixed_amount' | 'credit',
    discount_value: '',
    min_order_amount: '0',
    max_discount: '',
    max_uses: '',
    max_uses_per_user: '1',
    expires_at: '',
  });

  // Form state for generating promo code
  const [generateFormData, setGenerateFormData] = useState({
    prefix: '',
    description: '',
    discount_type: 'fixed_amount' as 'percentage' | 'fixed_amount' | 'credit',
    discount_value: '',
    min_order_amount: '0',
    max_discount: '',
    max_uses: '1',
    max_uses_per_user: '1',
    expires_at: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await promoAPI.getAllCodes();
      setPromoCodes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
      alert('Failed to load promo codes');
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

  const handleGenerateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setGenerateFormData({
      ...generateFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : undefined,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
        max_uses_per_user: parseInt(formData.max_uses_per_user) || 1,
        expires_at: formData.expires_at || undefined,
      };

      await promoAPI.createCode(payload);
      alert('Promo code created successfully!');
      setShowModal(false);
      resetForm();
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Failed to create promo code:', error);
      alert(error.response?.data?.error || 'Failed to create promo code');
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        prefix: generateFormData.prefix || undefined,
        description: generateFormData.description || undefined,
        discount_type: generateFormData.discount_type,
        discount_value: parseFloat(generateFormData.discount_value),
        min_order_amount: parseFloat(generateFormData.min_order_amount) || 0,
        max_discount: generateFormData.max_discount ? parseFloat(generateFormData.max_discount) : undefined,
        max_uses: generateFormData.max_uses ? parseInt(generateFormData.max_uses) : undefined,
        max_uses_per_user: parseInt(generateFormData.max_uses_per_user) || 1,
        expires_at: generateFormData.expires_at || undefined,
      };

      const response = await promoAPI.generateCode(payload);
      setGeneratedCode(response.data.data.code);
      alert('Promo code generated successfully!');
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Failed to generate promo code:', error);
      alert(error.response?.data?.error || 'Failed to generate promo code');
    }
  };

  const handleDeactivate = async (codeId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this promo code?')) {
      return;
    }

    try {
      await promoAPI.deactivateCode(codeId);
      alert('Promo code deactivated successfully!');
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Failed to deactivate promo code:', error);
      alert(error.response?.data?.error || 'Failed to deactivate promo code');
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'fixed_amount',
      discount_value: '',
      min_order_amount: '0',
      max_discount: '',
      max_uses: '',
      max_uses_per_user: '1',
      expires_at: '',
    });
  };

  const resetGenerateForm = () => {
    setGenerateFormData({
      prefix: '',
      description: '',
      discount_type: 'fixed_amount',
      discount_value: '',
      min_order_amount: '0',
      max_discount: '',
      max_uses: '1',
      max_uses_per_user: '1',
      expires_at: '',
    });
    setGeneratedCode(null);
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent size={16} />;
      case 'credit':
        return <CreditCard size={16} />;
      default:
        return <DollarSign size={16} />;
    }
  };

  const formatDiscount = (code: PromoCode) => {
    if (code.discount_type === 'percentage') {
      return `${code.discount_value}% off`;
    } else if (code.discount_type === 'credit') {
      return `$${code.discount_value} credit`;
    } else {
      return `$${code.discount_value} off`;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
          <h1>
            <Gift size={28} style={{ marginRight: 12 }} />
            Promo Codes
          </h1>
          <div className="header-actions">
            <button
              onClick={() => {
                resetGenerateForm();
                setShowGenerateModal(true);
              }}
              className="btn-secondary"
            >
              Generate Code
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="btn-primary"
            >
              <Plus size={18} /> Create Code
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="promo-stats">
          <div className="stat-card">
            <div className="stat-icon active">
              <Gift size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{promoCodes.filter(c => c.is_active).length}</span>
              <span className="stat-label">Active Codes</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon used">
              <Check size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{promoCodes.reduce((sum, c) => sum + c.current_uses, 0)}</span>
              <span className="stat-label">Total Uses</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon credit">
              <CreditCard size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{promoCodes.filter(c => c.discount_type === 'credit').length}</span>
              <span className="stat-label">Credit Codes</span>
            </div>
          </div>
        </div>

        {/* Promo Codes Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Usage</th>
                <th>Min Order</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    No promo codes found. Create your first one!
                  </td>
                </tr>
              ) : (
                promoCodes.map((code) => (
                  <tr key={code.id} className={!code.is_active ? 'inactive-row' : ''}>
                    <td>
                      <div className="code-cell">
                        <span className="promo-code">{code.code}</span>
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(code.code)}
                          title="Copy code"
                        >
                          {copiedCode === code.code ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      {code.description && (
                        <span className="code-description">{code.description}</span>
                      )}
                    </td>
                    <td>
                      <span className={`type-badge type-${code.discount_type}`}>
                        {getDiscountTypeIcon(code.discount_type)}
                        {code.discount_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <strong>{formatDiscount(code)}</strong>
                      {code.max_discount && (
                        <span className="max-discount">max ${code.max_discount}</span>
                      )}
                    </td>
                    <td>
                      <span className="usage-info">
                        {code.current_uses} / {code.max_uses || 'Unlimited'}
                      </span>
                      <span className="per-user">({code.max_uses_per_user}/user)</span>
                    </td>
                    <td>
                      {code.min_order_amount > 0 ? `$${code.min_order_amount}` : 'None'}
                    </td>
                    <td>
                      <span className={isExpired(code.expires_at) ? 'expired-date' : ''}>
                        {formatDate(code.expires_at)}
                      </span>
                    </td>
                    <td>
                      {!code.is_active ? (
                        <span className="status-badge inactive">Inactive</span>
                      ) : isExpired(code.expires_at) ? (
                        <span className="status-badge expired">Expired</span>
                      ) : code.max_uses && code.current_uses >= code.max_uses ? (
                        <span className="status-badge depleted">Depleted</span>
                      ) : (
                        <span className="status-badge active">Active</span>
                      )}
                    </td>
                    <td>
                      {code.is_active && !isExpired(code.expires_at) && (
                        <button
                          onClick={() => handleDeactivate(code.id)}
                          className="btn-deactivate"
                          title="Deactivate"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create Promo Code Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Promo Code</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="promo-form">
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SUMMER20"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer sale 20% off"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Type *</label>
                    <select
                      name="discount_type"
                      value={formData.discount_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="fixed_amount">Fixed Amount ($)</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="credit">Credit (Wallet)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      {formData.discount_type === 'percentage' ? 'Percentage *' : 'Amount ($) *'}
                    </label>
                    <input
                      type="number"
                      step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                      name="discount_value"
                      value={formData.discount_value}
                      onChange={handleInputChange}
                      placeholder={formData.discount_type === 'percentage' ? '20' : '10.00'}
                      required
                      min="0"
                      max={formData.discount_type === 'percentage' ? '100' : undefined}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min Order Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="min_order_amount"
                      value={formData.min_order_amount}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {formData.discount_type === 'percentage' && (
                    <div className="form-group">
                      <label>Max Discount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="max_discount"
                        value={formData.max_discount}
                        onChange={handleInputChange}
                        placeholder="No limit"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Max Total Uses</label>
                    <input
                      type="number"
                      name="max_uses"
                      value={formData.max_uses}
                      onChange={handleInputChange}
                      placeholder="Unlimited"
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Uses Per User</label>
                    <input
                      type="number"
                      name="max_uses_per_user"
                      value={formData.max_uses_per_user}
                      onChange={handleInputChange}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    name="expires_at"
                    value={formData.expires_at}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Create Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Generate Promo Code Modal */}
        {showGenerateModal && (
          <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Generate Unique Code</h2>
                <button onClick={() => setShowGenerateModal(false)} className="modal-close">
                  ×
                </button>
              </div>

              {generatedCode ? (
                <div className="generated-code-display">
                  <p>Your generated promo code:</p>
                  <div className="generated-code-box">
                    <span className="generated-code">{generatedCode}</span>
                    <button
                      className="copy-btn-large"
                      onClick={() => copyToClipboard(generatedCode)}
                    >
                      {copiedCode === generatedCode ? <Check size={20} /> : <Copy size={20} />}
                      {copiedCode === generatedCode ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowGenerateModal(false);
                      resetGenerateForm();
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGenerateSubmit} className="promo-form">
                  <div className="form-group">
                    <label>Code Prefix (optional)</label>
                    <input
                      type="text"
                      name="prefix"
                      value={generateFormData.prefix}
                      onChange={handleGenerateInputChange}
                      placeholder="e.g., VIP, SPECIAL"
                      style={{ textTransform: 'uppercase' }}
                    />
                    <span className="form-hint">Leave empty for random code</span>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      name="description"
                      value={generateFormData.description}
                      onChange={handleGenerateInputChange}
                      placeholder="e.g., Special discount for VIP customer"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Discount Type *</label>
                      <select
                        name="discount_type"
                        value={generateFormData.discount_type}
                        onChange={handleGenerateInputChange}
                        required
                      >
                        <option value="fixed_amount">Fixed Amount ($)</option>
                        <option value="percentage">Percentage (%)</option>
                        <option value="credit">Credit (Wallet)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        {generateFormData.discount_type === 'percentage' ? 'Percentage *' : 'Amount ($) *'}
                      </label>
                      <input
                        type="number"
                        step={generateFormData.discount_type === 'percentage' ? '1' : '0.01'}
                        name="discount_value"
                        value={generateFormData.discount_value}
                        onChange={handleGenerateInputChange}
                        placeholder={generateFormData.discount_type === 'percentage' ? '20' : '10.00'}
                        required
                        min="0"
                        max={generateFormData.discount_type === 'percentage' ? '100' : undefined}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Total Uses</label>
                      <input
                        type="number"
                        name="max_uses"
                        value={generateFormData.max_uses}
                        onChange={handleGenerateInputChange}
                        placeholder="1"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Expiration Date</label>
                      <input
                        type="date"
                        name="expires_at"
                        value={generateFormData.expires_at}
                        onChange={handleGenerateInputChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowGenerateModal(false)}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit">
                      Generate Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PromoCodes;
