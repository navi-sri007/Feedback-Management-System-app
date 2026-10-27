import React, { useState, useEffect, useCallback } from "react";
import { adminFeedbackAPI } from "../../utils/api";
import {
  formatDate,
  renderStars,
  truncateText,
  getStatusColor,
} from "../../utils/helpers";
import {
  FEEDBACK_STATUS_OPTIONS,
  PAGINATION_DEFAULTS,
} from "../../utils/constants";

const UserFeedbackList = ({ initialStatus = "NEW" }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(PAGINATION_DEFAULTS.PAGE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState(PAGINATION_DEFAULTS.SORT_BY);
  const [sortDir, setSortDir] = useState(PAGINATION_DEFAULTS.SORT_DIR);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        size: PAGINATION_DEFAULTS.SIZE,
        sortBy: sortBy,
        sortDir: sortDir,
      };

      const response = await adminFeedbackAPI.getAll(params);
      setFeedbacks(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch feedbacks";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortDir]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (field) => {
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading feedbacks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>❌ {error}</p>
        <button onClick={fetchFeedbacks} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="empty-container">
        <p>📭 No feedbacks found</p>
        <p className="empty-subtitle">Be the first to submit feedback!</p>
      </div>
    );
  }

  return (
    <div className="feedback-list-container">
      <div className="list-header">
        <h2>Feedbacks</h2>
        <div className="list-controls">
          <span className="total-count">{totalElements} feedbacks</span>
        </div>
      </div>

      <div className="list-table-wrapper">
        <table className="feedback-table">
          <thead>
            <tr>
              <th onClick={() => handleSortChange("id")}>
                ID {sortBy === "id" && (sortDir === "ASC" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSortChange("submitterName")}>
                Name{" "}
                {sortBy === "submitterName" && (sortDir === "ASC" ? "↑" : "↓")}
              </th>
              <th>Email</th>
              <th onClick={() => handleSortChange("feedbackContent")}>
                Feedback{" "}
                {sortBy === "feedbackContent" &&
                  (sortDir === "ASC" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSortChange("rating")}>
                Rating {sortBy === "rating" && (sortDir === "ASC" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSortChange("status")}>
                Status {sortBy === "status" && (sortDir === "ASC" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSortChange("submittedAt")}>
                Date{" "}
                {sortBy === "submittedAt" && (sortDir === "ASC" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback) => (
              <tr key={feedback.id}>
                <td>#{feedback.id}</td>
                <td>{feedback.submitterName || "Anonymous"}</td>
                <td>{feedback.submitterEmail}</td>
                <td className="content-cell">
                  {truncateText(feedback.feedbackContent, 80)}
                </td>
                <td>{renderStars(feedback.rating)}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(feedback.status) }}
                  >
                    {getStatusLabel(feedback.status)}
                  </span>
                </td>
                <td>{formatDate(feedback.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="page-btn"
          >
            Previous
          </button>

          {[...Array(Math.min(totalPages, 7)).keys()].map((i) => {
            let pageNum = i;
            if (totalPages > 7) {
              if (currentPage > 3) {
                pageNum = currentPage - 3 + i;
                if (pageNum >= totalPages) return null;
              }
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
              >
                {pageNum + 1}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserFeedbackList;
