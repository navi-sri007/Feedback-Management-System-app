import React, { useState, useEffect } from "react";
import { auditLogAPI } from "../../utils/api";
import { formatDate } from "../../utils/helpers";
import Sidebar from "./Sidebar";

const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedAction, setSelectedAction] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (filter) {
      filtered = filtered.filter(
        (log) =>
          log.action?.toLowerCase().includes(filter.toLowerCase()) ||
          log.entityType?.toLowerCase().includes(filter.toLowerCase()) ||
          log.details?.toLowerCase().includes(filter.toLowerCase()) ||
          log.adminUsername?.toLowerCase().includes(filter.toLowerCase()),
      );
    }

    if (selectedAction !== "all") {
      filtered = filtered.filter((log) => log.action === selectedAction);
    }

    setFilteredLogs(filtered);
  }, [filter, logs, selectedAction]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditLogAPI.getAll();
      setLogs(response.data || []);
      setFilteredLogs(response.data || []);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch audit logs";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      STATUS_CHANGED: "🔄",
      DELETED: "🗑️",
      CATEGORY_ASSIGNED: "🏷️",
      CATEGORY_CREATED: "📝",
      CATEGORY_DELETED: "🗑️",
      LOGIN: "🔑",
      LOGOUT: "🚪",
      FEEDBACK_SUBMITTED: "📨",
    };
    return icons[action] || "📋";
  };

  const getActionColor = (action) => {
    if (action?.includes("DELETE") || action?.includes("DELETED"))
      return "#dc3545";
    if (action?.includes("CREATE") || action?.includes("CREATED"))
      return "#28a745";
    if (action?.includes("UPDATE") || action?.includes("CHANGED"))
      return "#fd7e14";
    if (action?.includes("LOGIN")) return "#007bff";
    if (action?.includes("LOGOUT")) return "#6c757d";
    return "#6c757d";
  };

  const getActionBgColor = (action) => {
    if (action?.includes("DELETE") || action?.includes("DELETED"))
      return "#fde8e8";
    if (action?.includes("CREATE") || action?.includes("CREATED"))
      return "#e8f5e9";
    if (action?.includes("UPDATE") || action?.includes("CHANGED"))
      return "#fff3e0";
    if (action?.includes("LOGIN")) return "#e3f2fd";
    if (action?.includes("LOGOUT")) return "#f5f5f5";
    return "#f5f5f5";
  };

  const getActionLabel = (action) => {
    return action?.replace(/_/g, " ") || "Unknown Action";
  };

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map((log) => log.action))].filter(
    Boolean,
  );

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading audit logs...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="audit-page-header">
          <div className="page-header-left">
            <h1 className="page-title">📋 Audit Logs</h1>
            <p className="page-subtitle">
              Track all administrative actions across the system
            </p>
          </div>
          <div className="page-header-right">
            <span className="log-count">{filteredLogs.length} logs</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            ❌ {error}
            <button onClick={() => setError(null)} className="close-btn">
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="audit-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="🔍 Search logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-input-modern"
            />
          </div>
          <div className="filter-group">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="filter-select-modern"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setFilter("");
              setSelectedAction("all");
            }}
            className="filter-clear-btn"
          >
            ✕ Clear
          </button>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon">📭</div>
            <h3>No Audit Logs Found</h3>
            <p>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="audit-timeline-modern">
            {filteredLogs.map((log, index) => (
              <div key={log.id} className="audit-item-modern">
                <div
                  className="audit-item-icon"
                  style={{
                    backgroundColor: getActionBgColor(log.action),
                    color: getActionColor(log.action),
                  }}
                >
                  {getActionIcon(log.action)}
                </div>
                <div className="audit-item-content">
                  <div className="audit-item-header">
                    <div className="audit-item-action">
                      <span
                        className="action-badge"
                        style={{
                          backgroundColor: getActionBgColor(log.action),
                          color: getActionColor(log.action),
                        }}
                      >
                        {getActionLabel(log.action)}
                      </span>
                      <span className="audit-item-entity">
                        {log.entityType} #{log.entityId}
                      </span>
                    </div>
                    <span className="audit-item-time">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <div className="audit-item-details">
                    {log.details || "No details provided"}
                  </div>
                  <div className="audit-item-admin">
                    <span className="admin-avatar">
                      {log.adminUsername?.charAt(0).toUpperCase() || "U"}
                    </span>
                    <span className="admin-name">
                      {log.adminUsername || "Unknown User"}
                    </span>
                    <span className="admin-email">
                      {log.adminEmail || "No email"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AuditLogList;
