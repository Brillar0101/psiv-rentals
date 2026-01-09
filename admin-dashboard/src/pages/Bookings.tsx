// src/pages/Bookings.tsx
// Bookings Management Page - Full admin controls

import React, { useEffect, useState } from 'react';
import {
  Eye,
  XCircle,
  RefreshCw,
  Calendar,
  FileText,
  CreditCard,
  Check,
  Play,
  CheckCircle,
  X,
  AlertCircle,
  Clock,
  User,
  Mail,
  Phone,
  Package,
  Smartphone,
  DollarSign,
  Gift,
} from 'react-feather';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { bookingAPI } from '../services/api';
import { Booking } from '../types';
import '../styles/Bookings.css';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [extendDate, setExtendDate] = useState('');
  const [extendReason, setExtendReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [reactivateStatus, setReactivateStatus] = useState('pending');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const response = await bookingAPI.getAll(params);
      setBookings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = async (booking: Booking) => {
    try {
      const response = await bookingAPI.getDetails(booking.id);
      setSelectedBooking(response.data.data);
      setShowDetailsModal(true);
    } catch {
      setSelectedBooking(booking);
      setShowDetailsModal(true);
    }
  };

  const openCancelModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const openExtendModal = (booking: Booking) => {
    setSelectedBooking(booking);
    const currentEnd = new Date(booking.end_date);
    currentEnd.setDate(currentEnd.getDate() + 1);
    setExtendDate(currentEnd.toISOString().split('T')[0]);
    setExtendReason('');
    setShowExtendModal(true);
  };

  const openNotesModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.admin_notes || '');
    setShowNotesModal(true);
  };

  const openReactivateModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setReactivateStatus('pending');
    setShowReactivateModal(true);
  };

  const openPaymentModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setPaymentStatus(booking.payment_status);
    setShowPaymentModal(true);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await bookingAPI.updateStatus(bookingId, newStatus);
      fetchBookings();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleAdminCancel = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await bookingAPI.adminCancel(selectedBooking.id, cancelReason);
      setShowCancelModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!selectedBooking || !extendDate) return;
    setActionLoading(true);
    try {
      await bookingAPI.extend(selectedBooking.id, extendDate, extendReason);
      setShowExtendModal(false);
      fetchBookings();
    } catch (error: any) {
      console.error('Failed to extend booking:', error);
      alert(error.response?.data?.error || 'Failed to extend booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await bookingAPI.updateNotes(selectedBooking.id, adminNotes);
      setShowNotesModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Failed to update notes:', error);
      alert('Failed to update notes');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await bookingAPI.reactivate(selectedBooking.id, reactivateStatus);
      setShowReactivateModal(false);
      fetchBookings();
    } catch (error: any) {
      console.error('Failed to reactivate booking:', error);
      alert(error.response?.data?.error || 'Failed to reactivate booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentUpdate = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await bookingAPI.updatePaymentStatus(selectedBooking.id, paymentStatus);
      setShowPaymentModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} />;
      case 'confirmed':
        return <Check size={14} />;
      case 'active':
        return <Play size={14} />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'cancelled':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const getPaymentMethodDisplay = (booking: Booking) => {
    // If payment_method is set, use it. Otherwise infer from booking state
    const amount = parseFloat(booking.total_amount?.toString() || '0');
    const method =
      booking.payment_method ||
      (booking.stripe_payment_id ? 'card' : null) ||
      (amount === 0 && (booking.status === 'confirmed' || booking.status === 'active' || booking.status === 'completed')
        ? 'promo'
        : booking.status === 'pending'
          ? 'pending'
          : 'card');

    switch (method) {
      case 'card':
        return { icon: <CreditCard size={14} />, label: 'Card', className: 'method-card' };
      case 'debit':
        return { icon: <CreditCard size={14} />, label: 'Debit', className: 'method-debit' };
      case 'apple_pay':
        return { icon: <Smartphone size={14} />, label: 'Apple Pay', className: 'method-apple' };
      case 'google_pay':
        return { icon: <Smartphone size={14} />, label: 'Google Pay', className: 'method-google' };
      case 'cash':
        return { icon: <DollarSign size={14} />, label: 'Cash', className: 'method-cash' };
      case 'credit':
        return { icon: <DollarSign size={14} />, label: 'Credit', className: 'method-credit' };
      case 'promo':
        return { icon: <Gift size={14} />, label: 'Promo', className: 'method-promo' };
      default:
        return { icon: <Clock size={14} />, label: 'Pending', className: 'method-pending' };
    }
  };

  const closeAllModals = () => {
    setShowDetailsModal(false);
    setShowCancelModal(false);
    setShowExtendModal(false);
    setShowNotesModal(false);
    setShowReactivateModal(false);
    setShowPaymentModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <Sidebar />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading bookings...</p>
          </div>
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
          <div>
            <h1>Bookings Management</h1>
            <p>Manage all equipment rentals and booking requests</p>
          </div>

          <div className="filter-group">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bookings-stats">
          <div className="stat-card">
            <Clock size={20} />
            <span className="stat-value">{bookings.filter((b) => b.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <Play size={20} />
            <span className="stat-value">{bookings.filter((b) => b.status === 'active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <CheckCircle size={20} />
            <span className="stat-value">{bookings.filter((b) => b.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card cancelled">
            <XCircle size={20} />
            <span className="stat-value">{bookings.filter((b) => b.status === 'cancelled').length}</span>
            <span className="stat-label">Cancelled</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table bookings-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Equipment</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    <AlertCircle size={24} />
                    <p>No bookings found</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className={booking.status === 'cancelled' ? 'cancelled-row' : ''}>
                    <td>
                      <div className="customer-info">
                        <strong>
                          {booking.first_name} {booking.last_name}
                        </strong>
                        <small>{booking.email}</small>
                      </div>
                    </td>
                    <td>
                      <div className="equipment-info">
                        <strong>{booking.equipment_name}</strong>
                        <small>
                          {booking.equipment_brand || booking.brand}{' '}
                          {booking.equipment_model || booking.model}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="dates-info">
                        <span>{new Date(booking.start_date).toLocaleDateString()}</span>
                        <span className="date-separator">to</span>
                        <span>{new Date(booking.end_date).toLocaleDateString()}</span>
                        <small>{booking.total_days} days</small>
                      </div>
                    </td>
                    <td>
                      <strong>${parseFloat(booking.total_amount?.toString() || '0').toFixed(2)}</strong>
                    </td>
                    <td>
                      {(() => {
                        const methodInfo = getPaymentMethodDisplay(booking);
                        return (
                          <span className={`payment-method-badge ${methodInfo.className}`}>
                            {methodInfo.icon}
                            {methodInfo.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <span
                        className={`status-badge payment-${booking.payment_status}`}
                        onClick={() => openPaymentModal(booking)}
                        style={{ cursor: 'pointer' }}
                      >
                        {booking.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => openDetailsModal(booking)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <>
                            <button
                              className="action-btn notes"
                              onClick={() => openNotesModal(booking)}
                              title="Add Notes"
                            >
                              <FileText size={16} />
                            </button>

                            <button
                              className="action-btn extend"
                              onClick={() => openExtendModal(booking)}
                              title="Extend Booking"
                            >
                              <Calendar size={16} />
                            </button>

                            <button
                              className="action-btn cancel"
                              onClick={() => openCancelModal(booking)}
                              title="Cancel Booking"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {booking.status === 'cancelled' && (
                          <button
                            className="action-btn reactivate"
                            onClick={() => openReactivateModal(booking)}
                            title="Reactivate Booking"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}

                        {booking.status === 'pending' && (
                          <button
                            className="action-btn confirm"
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            title="Confirm Booking"
                          >
                            <Check size={16} />
                          </button>
                        )}

                        {booking.status === 'confirmed' && (
                          <button
                            className="action-btn activate"
                            onClick={() => handleStatusChange(booking.id, 'active')}
                            title="Mark as Active"
                          >
                            <Play size={16} />
                          </button>
                        )}

                        {booking.status === 'active' && (
                          <button
                            className="action-btn complete"
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            title="Mark as Completed"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal booking-details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Booking Details</h2>
                <button onClick={closeAllModals} className="modal-close">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="details-grid">
                  <div className="details-section">
                    <h3>
                      <User size={18} /> Customer Information
                    </h3>
                    <div className="detail-row">
                      <span className="label">Name:</span>
                      <span>
                        {selectedBooking.first_name} {selectedBooking.last_name}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">
                        <Mail size={14} /> Email:
                      </span>
                      <span>{selectedBooking.email}</span>
                    </div>
                    {selectedBooking.phone && (
                      <div className="detail-row">
                        <span className="label">
                          <Phone size={14} /> Phone:
                        </span>
                        <span>{selectedBooking.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="details-section">
                    <h3>
                      <Package size={18} /> Equipment
                    </h3>
                    <div className="detail-row">
                      <span className="label">Name:</span>
                      <span>{selectedBooking.equipment_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Brand/Model:</span>
                      <span>
                        {selectedBooking.equipment_brand || selectedBooking.brand}{' '}
                        {selectedBooking.equipment_model || selectedBooking.model}
                      </span>
                    </div>
                    {selectedBooking.category_name && (
                      <div className="detail-row">
                        <span className="label">Category:</span>
                        <span>{selectedBooking.category_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="details-section">
                    <h3>
                      <Calendar size={18} /> Booking Period
                    </h3>
                    <div className="detail-row">
                      <span className="label">Start Date:</span>
                      <span>{new Date(selectedBooking.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">End Date:</span>
                      <span>{new Date(selectedBooking.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Total Days:</span>
                      <span>{selectedBooking.total_days} days</span>
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>
                      <CreditCard size={18} /> Payment Details
                    </h3>
                    <div className="detail-row">
                      <span className="label">Daily Rate:</span>
                      <span>${parseFloat(selectedBooking.daily_rate?.toString() || '0').toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Subtotal:</span>
                      <span>${parseFloat(selectedBooking.subtotal?.toString() || '0').toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Tax:</span>
                      <span>${parseFloat(selectedBooking.tax?.toString() || '0').toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Damage Deposit:</span>
                      <span>${parseFloat(selectedBooking.damage_deposit?.toString() || '0').toFixed(2)}</span>
                    </div>
                    <div className="detail-row total">
                      <span className="label">Total Amount:</span>
                      <span>${parseFloat(selectedBooking.total_amount?.toString() || '0').toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Payment Status:</span>
                      <span className={`status-badge payment-${selectedBooking.payment_status}`}>
                        {selectedBooking.payment_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="details-section full-width">
                  <h3>Status & History</h3>
                  <div className="status-row">
                    <span className="label">Current Status:</span>
                    <span className={`status-badge status-${selectedBooking.status}`}>
                      {getStatusIcon(selectedBooking.status)}
                      {selectedBooking.status}
                    </span>
                  </div>

                  {selectedBooking.cancellation_reason && (
                    <div className="history-item cancelled">
                      <strong>Cancelled:</strong> {selectedBooking.cancellation_reason}
                      {selectedBooking.cancelled_at && (
                        <small> on {new Date(selectedBooking.cancelled_at).toLocaleString()}</small>
                      )}
                      {selectedBooking.cancelled_by_name && <small> by {selectedBooking.cancelled_by_name}</small>}
                    </div>
                  )}

                  {selectedBooking.extended_at && (
                    <div className="history-item extended">
                      <strong>Extended:</strong> {selectedBooking.extension_reason || 'No reason provided'}
                      <small> on {new Date(selectedBooking.extended_at).toLocaleString()}</small>
                      {selectedBooking.extended_by_name && <small> by {selectedBooking.extended_by_name}</small>}
                    </div>
                  )}

                  {selectedBooking.reactivated_at && (
                    <div className="history-item reactivated">
                      <strong>Reactivated:</strong>
                      <small> on {new Date(selectedBooking.reactivated_at).toLocaleString()}</small>
                      {selectedBooking.reactivated_by_name && <small> by {selectedBooking.reactivated_by_name}</small>}
                    </div>
                  )}
                </div>

                {(selectedBooking.notes || selectedBooking.admin_notes) && (
                  <div className="details-section full-width">
                    <h3>
                      <FileText size={18} /> Notes
                    </h3>
                    {selectedBooking.notes && (
                      <div className="note-block">
                        <strong>Customer Notes:</strong>
                        <p>{selectedBooking.notes}</p>
                      </div>
                    )}
                    {selectedBooking.admin_notes && (
                      <div className="note-block admin">
                        <strong>Admin Notes:</strong>
                        <p>{selectedBooking.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="details-footer">
                  <small>Created: {new Date(selectedBooking.created_at).toLocaleString()}</small>
                  <small>Updated: {new Date(selectedBooking.updated_at).toLocaleString()}</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && selectedBooking && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal cancel-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Cancel Booking</h2>
                <button onClick={closeAllModals} className="modal-close">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="warning-message">
                  <AlertCircle size={24} />
                  <p>
                    Are you sure you want to cancel the booking for{' '}
                    <strong>
                      {selectedBooking.first_name} {selectedBooking.last_name}
                    </strong>
                    ?
                  </p>
                </div>

                <div className="form-group">
                  <label>Cancellation Reason</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter the reason for cancellation..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeAllModals}>
                  Keep Booking
                </button>
                <button className="btn-danger" onClick={handleAdminCancel} disabled={actionLoading}>
                  {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extend Modal */}
        {showExtendModal && selectedBooking && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal extend-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Extend Booking</h2>
                <button onClick={closeAllModals} className="modal-close">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="current-dates">
                  <p>
                    Current end date:{' '}
                    <strong>{new Date(selectedBooking.end_date).toLocaleDateString()}</strong>
                  </p>
                </div>

                <div className="form-group">
                  <label>New End Date *</label>
                  <input
                    type="date"
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                    min={new Date(selectedBooking.end_date).toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Reason for Extension</label>
                  <textarea
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    placeholder="Enter the reason for extension..."
                    rows={2}
                  />
                </div>

                <div className="info-message">
                  <AlertCircle size={16} />
                  <span>The total amount will be recalculated based on the new end date.</span>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeAllModals}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleExtend} disabled={actionLoading || !extendDate}>
                  {actionLoading ? 'Extending...' : 'Extend Booking'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && selectedBooking && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal notes-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Admin Notes</h2>
                <button onClick={closeAllModals} className="modal-close">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <p className="modal-subtitle">
                  Add internal notes for booking #{selectedBooking.id.slice(0, 8)}
                </p>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter admin notes about this booking..."
                    rows={5}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeAllModals}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveNotes} disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reactivate Modal */}
        {showReactivateModal && selectedBooking && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal reactivate-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reactivate Booking</h2>
                <button onClick={closeAllModals} className="modal-close">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="info-message success">
                  <RefreshCw size={20} />
                  <p>
                    Reactivate the cancelled booking for{' '}
                    <strong>
                      {selectedBooking.first_name} {selectedBooking.last_name}
                    </strong>
                  </p>
                </div>

                {selectedBooking.cancellation_reason && (
                  <div className="previous-reason">
                    <strong>Previous cancellation reason:</strong>
                    <p>{selectedBooking.cancellation_reason}</p>
                  </div>
                )}

                <div className="form-group">
                  <label>Set Status To</label>
                  <select value={reactivateStatus} onChange={(e) => setReactivateStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeAllModals}>
                  Cancel
                </button>
                <button className="btn-success" onClick={handleReactivate} disabled={actionLoading}>
                  {actionLoading ? 'Reactivating...' : 'Reactivate Booking'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Modal */}
        {showPaymentModal && selectedBooking && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal payment-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Payment Status</h2>
                <button onClick={closeAllModals} className="modal-close">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="payment-info">
                  <p>
                    Total Amount: <strong>${parseFloat(selectedBooking.total_amount?.toString() || '0').toFixed(2)}</strong>
                  </p>
                  <p>
                    Current Status:{' '}
                    <span className={`status-badge payment-${selectedBooking.payment_status}`}>
                      {selectedBooking.payment_status}
                    </span>
                  </p>
                </div>

                <div className="form-group">
                  <label>New Payment Status</label>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                    <option value="partial_refund">Partial Refund</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeAllModals}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handlePaymentUpdate} disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookings;
