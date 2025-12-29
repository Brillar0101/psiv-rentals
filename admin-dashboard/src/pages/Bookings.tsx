// src/pages/Bookings.tsx
// Bookings Management Page - View and manage all bookings

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { bookingAPI } from '../services/api';
import { Booking } from '../types';
import '../styles/Bookings.css';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await bookingAPI.getAll(params);
      setBookings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await bookingAPI.updateStatus(bookingId, newStatus);
      alert('Booking status updated!');
      fetchBookings();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
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
          <h1>Bookings Management</h1>
          
          <div className="filter-group">
            <label>Filter by status:</label>
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

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Equipment</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Booking Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center' }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div>
                        <strong>{booking.first_name} {booking.last_name}</strong>
                        <br />
                        <small>{booking.email}</small>
                      </div>
                    </td>
                    <td>
                      <strong>{booking.equipment_name}</strong>
                      <br />
                      <small>{booking.brand} {booking.model}</small>
                    </td>
                    <td>{new Date(booking.start_date).toLocaleDateString()}</td>
                    <td>{new Date(booking.end_date).toLocaleDateString()}</td>
                    <td>{booking.total_days}</td>
                    <td>${parseFloat(booking.total_amount.toString()).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge payment-${booking.payment_status}`}>
                        {booking.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="btn-edit"
                            style={{ marginRight: '5px' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="btn-delete"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'active')}
                          className="btn-edit"
                        >
                          Mark Active
                        </button>
                      )}
                      {booking.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                          className="btn-edit"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Bookings;
