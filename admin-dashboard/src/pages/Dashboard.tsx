// src/pages/Dashboard.tsx
// Admin Dashboard Home Page - Overview and stats

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import { dashboardAPI } from '../services/api';
import { DashboardStats, Booking } from '../types';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = (bookings: Booking[]) => {
    return bookings
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + parseFloat(b.total_amount.toString()), 0);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <Sidebar />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  const recentBookings = stats?.bookings.slice(0, 5) || [];
  const totalRevenue = stats ? calculateRevenue(stats.bookings) : 0;

  return (
    <div className="dashboard-layout">
      <Navbar />
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's your equipment rental overview.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard
            icon="camera"
            title="Total Equipment"
            value={stats?.totalEquipment || 0}
            variant="primary"
          />
          <StatsCard
            icon="calendar"
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            variant="success"
          />
          <StatsCard
            icon="dollar-sign"
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            variant="warning"
          />
          <StatsCard
            icon="folder"
            title="Categories"
            value={stats?.totalCategories || 0}
            variant="info"
          />
        </div>

        {/* Recent Bookings */}
        <div className="section">
          <h2>Recent Bookings</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Equipment</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        {booking.first_name} {booking.last_name}
                      </td>
                      <td>{booking.equipment_name}</td>
                      <td>
                        {new Date(booking.start_date).toLocaleDateString()} -{' '}
                        {new Date(booking.end_date).toLocaleDateString()}
                      </td>
                      <td>${parseFloat(booking.total_amount.toString()).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
