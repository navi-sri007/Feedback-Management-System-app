import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminFeedbackAPI, categoryAPI, auditLogAPI } from '../../utils/api';
import { 
  formatDate, 
  renderStars, 
  getStatusColor,
  getStatusBgColor,
} from '../../utils/helpers';
import { FEEDBACK_STATUS_OPTIONS } from '../../utils/constants';
import Sidebar from './Sidebar';

const AdminFeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [feedback, setFeedback] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFeedbackAPI.getById(id);
      setFeedback(response.data);
      setSelectedStatus(response.data.status);
      
      try {
        const logsResponse = await auditLogAPI.getByEntity(id, 'Feedback');
        setAuditLogs(logsResponse.data || []);
      } catch (logErr) {
        console.error('Failed to fetch audit logs:', logErr);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch feedback details';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === feedback?.status) {
      return;
    }
    
    setUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      await adminFeedbackAPI.updateStatus(id, selectedStatus);
      setSuccess('Status updated successfully!');
      fetchFeedback();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update status';
      setError(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }
    
    setUpdating(true);
    try {
      await adminFeedbackAPI.delete(id);
      navigate('/feedbacks', { state: { message: 'Feedback deleted successfully!' } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete feedback';
      setError(errorMsg);
      setUpdating(false);
    }
  };

  const getStatusLabel = (status) => {
    const option = FEEDBACK_STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      NEW: '🆕',
      IN_PROGRESS: '🔄',
      RESOLVED: '✅',
      ARCHIVED: '📦'
    };
    return icons[status] || '📝';
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading feedback details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !feedback) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="error-container">
            <p>❌ {error}</p>
            <button onClick={fetchFeedback} className="btn-retry">Try Again</button>
          </div>
        </main>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="empty-container">
            <p>📭 Feedback not found</p>
            <button onClick={() => navigate('/feedbacks')} className="btn-retry">
              Back to Feedbacks
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Header */}
        <div className="detail-header-modern">
          <div className="detail-header-left">
            <button onClick={() => navigate('/feedbacks')} className="btn-back-modern">
              ← Back
            </button>
            <div>
              <h1 className="detail-title">Feedback #{feedback.id}</h1>
              <div className="detail-meta">
                <span className="meta-item">
                  <span className="meta-icon">📅</span> {formatDate(feedback.submittedAt)}
                </span>
                <span className="meta-item">
                  <span className="meta-icon">👤</span> {feedback.submitterName || 'Anonymous'}
                </span>
              </div>
            </div>
          </div>
          <div className="detail-header-right">
            <button onClick={handleDelete} className="btn-delete-modern" disabled={updating}>
              🗑️ Delete
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError(null)} className="close-btn">×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            ✅ {success}
            <button onClick={() => setSuccess(null)} className="close-btn">×</button>
          </div>
        )}

        <div className="detail-grid-modern">
          {/* Main Feedback Card */}
          <div className="detail-card-modern main-card-modern">
            <div className="card-header-modern">
              <h2>📝 Feedback Details</h2>
              <span 
                className="status-badge-modern"
                style={{ 
                  backgroundColor: getStatusBgColor(feedback.status),
                  color: getStatusColor(feedback.status),
                }}
              >
                {getStatusIcon(feedback.status)} {getStatusLabel(feedback.status)}
              </span>
            </div>
            
            <div className="detail-grid-2col">
              <div className="detail-item">
                <label>Submitter Name</label>
                <div className="detail-value-highlight">{feedback.submitterName || 'Anonymous'}</div>
              </div>
              <div className="detail-item">
                <label>Email Address</label>
                <div className="detail-value-highlight">{feedback.submitterEmail}</div>
              </div>
              <div className="detail-item">
                <label>Rating</label>
                <div className="detail-value-highlight rating-display">{renderStars(feedback.rating)}</div>
              </div>
              <div className="detail-item">
                <label>Category</label>
                <div className="detail-value-highlight">
                  <span className="category-tag-modern">
                    {feedback.category?.name || 'Uncategorized'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <label>Submitted</label>
                <div className="detail-value-highlight">{formatDate(feedback.submittedAt)}</div>
              </div>
              <div className="detail-item">
                <label>Last Updated</label>
                <div className="detail-value-highlight">{feedback.updatedAt ? formatDate(feedback.updatedAt) : 'Never'}</div>
              </div>
            </div>
            
            <div className="detail-item full-width">
              <label>Feedback Content</label>
              <div className="feedback-content-box">
                {feedback.feedbackContent}
              </div>
            </div>
          </div>

          {/* Status Update Card */}
          <div className="detail-card-modern status-card-modern">
            <h2>⚙️ Update Status</h2>
            <div className="status-update-container">
              <div className="current-status-display">
                <span className="current-status-label">Current Status</span>
                <span 
                  className="current-status-value"
                  style={{ 
                    backgroundColor: getStatusBgColor(feedback.status),
                    color: getStatusColor(feedback.status),
                  }}
                >
                  {getStatusIcon(feedback.status)} {getStatusLabel(feedback.status)}
                </span>
              </div>
              
              <div className="status-select-container">
                <label htmlFor="statusSelect">Change to</label>
                <select
                  id="statusSelect"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="status-select-modern"
                >
                  {FEEDBACK_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={handleStatusUpdate} 
                className="btn-update-status-modern"
                disabled={updating || selectedStatus === feedback.status}
              >
                {updating ? '⏳ Updating...' : '🔄 Update Status'}
              </button>
              
              {selectedStatus !== feedback.status && (
                <div className="status-change-preview">
                  <span className="preview-arrow">→</span>
                  <span 
                    className="preview-status"
                    style={{ 
                      backgroundColor: getStatusBgColor(selectedStatus),
                      color: getStatusColor(selectedStatus),
                    }}
                  >
                    {getStatusIcon(selectedStatus)} {getStatusLabel(selectedStatus)}
                  </span>
                </div>
              )}
            </div>

            <div className="divider"></div>

            <div className="category-info-section">
              <h3>🏷️ Category</h3>
              <div className="category-display-modern">
                <span className="category-tag-large">
                  {feedback.category?.name || 'Uncategorized'}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Logs Card */}
          <div className="detail-card-modern audit-card-modern full-width">
            <div className="audit-header">
              <h2>📋 Audit Logs</h2>
              <span className="audit-count">{auditLogs.length} logs</span>
            </div>
            {auditLogs.length === 0 ? (
              <div className="empty-audit">
                <p>📭 No audit logs found for this feedback</p>
              </div>
            ) : (
              <div className="audit-timeline">
                {auditLogs.map((log, index) => (
                  <div key={log.id} className="audit-timeline-item">
                    <div className="timeline-marker">
                      <div className="timeline-dot"></div>
                      {index < auditLogs.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="audit-content-modern">
                      <div className="audit-header-modern">
                        <span className="audit-action-modern">
                          {getActionIcon(log.action)} {log.action.replace('_', ' ')}
                        </span>
                        <span className="audit-time-modern">{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="audit-details-modern">{log.details}</div>
                      <div className="audit-admin-modern">
                        👤 {log.adminUsername || 'Unknown'} ({log.adminEmail || 'No email'})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper function for action icons
const getActionIcon = (action) => {
  const icons = {
    'STATUS_CHANGED': '🔄',
    'DELETED': '🗑️',
    'CATEGORY_ASSIGNED': '🏷️',
    'CATEGORY_CREATED': '📝',
    'CATEGORY_DELETED': '🗑️',
    'LOGIN': '🔑',
    'LOGOUT': '🚪',
  };
  return icons[action] || '📋';
};

export default AdminFeedbackDetail;