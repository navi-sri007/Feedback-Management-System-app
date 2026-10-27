import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../../utils/api";
import { FEEDBACK_STATUS_OPTIONS } from "../../utils/constants";
import Sidebar from "./Sidebar";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardAPI.getSummary();
      setSummary(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-error">
            <p>❌ {error}</p>
            <button onClick={fetchSummary} className="btn-retry">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const statusBreakdown = summary?.statusBreakdown || {};
  const total = summary?.totalFeedback || 0;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Overview of your feedback system</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <span className="stat-value">{summary?.totalFeedback || 0}</span>
              <span className="stat-label">Total Feedback</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-value">
                {summary?.averageRating?.toFixed(1) || "N/A"}
              </span>
              <span className="stat-label">Average Rating</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🆕</div>
            <div className="stat-content">
              <span className="stat-value">
                {summary?.newFeedbackCount || 0}
              </span>
              <span className="stat-label">New Feedback</span>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="dashboard-section">
          <h2>Status Breakdown</h2>
          <div className="status-breakdown">
            {FEEDBACK_STATUS_OPTIONS.map((status) => {
              const count = statusBreakdown[status.value] || 0;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={status.value} className="status-item">
                  <div className="status-info">
                    <span
                      className="status-label"
                      style={{ color: status.color }}
                    >
                      {status.label}
                    </span>
                    <span className="status-count">{count}</span>
                  </div>
                  <div className="status-bar-wrapper">
                    <div
                      className="status-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: status.color,
                      }}
                    />
                  </div>
                  <span className="status-percentage">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="dashboard-section">
          <h2>Category Distribution</h2>
          {summary?.categoryDistribution &&
          Object.keys(summary.categoryDistribution).length > 0 ? (
            <div className="category-grid">
              {Object.entries(summary.categoryDistribution).map(
                ([name, count]) => (
                  <div key={name} className="category-card">
                    <span className="category-name">{name}</span>
                    <span className="category-count">{count}</span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="empty-message">No categories with feedback yet</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
