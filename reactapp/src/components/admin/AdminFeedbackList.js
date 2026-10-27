import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminFeedbackAPI } from "../../utils/api";
import {
  formatDate,
  renderStars,
  truncateText,
  getStatusColor,
  getStatusBgColor,
} from "../../utils/helpers";
import {
  FEEDBACK_STATUS_OPTIONS,
  PAGINATION_DEFAULTS,
} from "../../utils/constants";
import Sidebar from "./Sidebar";

const AdminFeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(PAGINATION_DEFAULTS.PAGE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(PAGINATION_DEFAULTS.SIZE);
  const [sortBy, setSortBy] = useState(PAGINATION_DEFAULTS.SORT_BY);
  const [sortDir, setSortDir] = useState(PAGINATION_DEFAULTS.SORT_DIR);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFeedbackAPI.getAll({
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDir,
      });
      setFeedbacks(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortDir]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      await adminFeedbackAPI.delete(id);
      fetchFeedbacks();
    } catch (err) {
      alert("Failed to delete feedback");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortDir("DESC");
    }
  };

  const getStatusLabel = (status) => {
    const option = FEEDBACK_STATUS_OPTIONS.find((opt) => opt.value === status);
    return option ? option.label : status;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading feedbacks...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="list-header">
          <h1>Feedback Management</h1>
          <span className="total-count">{totalElements} feedbacks</span>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("id")}>
                  ID {sortBy === "id" && (sortDir === "ASC" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("submitterName")}>
                  Name{" "}
                  {sortBy === "submitterName" &&
                    (sortDir === "ASC" ? "↑" : "↓")}
                </th>
                <th>Email</th>
                <th onClick={() => handleSort("feedbackContent")}>
                  Feedback{" "}
                  {sortBy === "feedbackContent" &&
                    (sortDir === "ASC" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("rating")}>
                  Rating{" "}
                  {sortBy === "rating" && (sortDir === "ASC" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("status")}>
                  Status{" "}
                  {sortBy === "status" && (sortDir === "ASC" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("submittedAt")}>
                  Date{" "}
                  {sortBy === "submittedAt" && (sortDir === "ASC" ? "↑" : "↓")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedback) => (
                <tr key={feedback.id}>
                  <td>#{feedback.id}</td>
                  <td>{feedback.submitterName || "Anonymous"}</td>
                  <td>{feedback.submitterEmail}</td>
                  <td className="content-cell">
                    {truncateText(feedback.feedbackContent, 60)}
                  </td>
                  <td>{renderStars(feedback.rating)}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusBgColor(feedback.status),
                        color: getStatusColor(feedback.status),
                      }}
                    >
                      {getStatusLabel(feedback.status)}
                    </span>
                  </td>
                  <td>{formatDate(feedback.submittedAt)}</td>
                  <td className="action-cell">
                    <Link
                      to={`/feedbacks/${feedback.id}`}
                      className="btn-action view"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="btn-action delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="page-btn"
            >
              Previous
            </button>

            {[...Array(Math.min(totalPages, 5)).keys()].map((i) => {
              let page = i;
              if (totalPages > 5 && currentPage > 2) {
                page = Math.min(currentPage - 2 + i, totalPages - 1);
                if (page >= totalPages) return null;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`page-btn ${currentPage === page ? "active" : ""}`}
                >
                  {page + 1}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage >= totalPages - 1}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminFeedbackList;
