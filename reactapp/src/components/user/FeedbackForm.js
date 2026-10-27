import React, { useState, useEffect } from "react";
import { feedbackAPI, categoryAPI } from "../../utils/api";
import { FEEDBACK_STATUS, MESSAGES } from "../../utils/constants";
import { validateEmail } from "../../utils/helpers";

const FeedbackForm = ({ onSuccess, categories: initialCategories }) => {
  const [formData, setFormData] = useState({
    submitterName: "",
    submitterEmail: "",
    feedbackContent: "",
    rating: 0,
    categoryId: "",
  });

  const [categories, setCategories] = useState(initialCategories || []);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch categories if not provided
    if (!initialCategories) {
      fetchCategories();
    }
  }, [initialCategories]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.submitterName.trim()) {
      newErrors.submitterName = "Name is required";
    }

    if (!formData.submitterEmail) {
      newErrors.submitterEmail = "Email is required";
    } else if (!validateEmail(formData.submitterEmail)) {
      newErrors.submitterEmail = "Invalid email format";
    }

    if (!formData.feedbackContent.trim()) {
      newErrors.feedbackContent = "Feedback content is required";
    } else if (formData.feedbackContent.length > 1000) {
      newErrors.feedbackContent = "Feedback cannot exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create feedback object matching backend expectations
      const feedbackData = {
        submitterName: formData.submitterName,
        submitterEmail: formData.submitterEmail,
        feedbackContent: formData.feedbackContent,
        rating: formData.rating || null,
        status: FEEDBACK_STATUS.NEW,
        category: formData.categoryId
          ? { id: parseInt(formData.categoryId) }
          : null,
      };

      await feedbackAPI.submit(feedbackData);

      setSubmitted(true);
      setFormData({
        submitterName: "",
        submitterEmail: "",
        feedbackContent: "",
        rating: 0,
        categoryId: "",
      });

      if (onSuccess) {
        onSuccess(MESSAGES.FEEDBACK_SUBMITTED);
      }

      // Reset submitted state after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit feedback";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <h2>Submit Feedback</h2>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="close-btn">
            ×
          </button>
        </div>
      )}

      {submitted && (
        <div className="alert alert-success">
          ✅ {MESSAGES.FEEDBACK_SUBMITTED}
        </div>
      )}

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label htmlFor="submitterName">Name</label>
          <input
            type="text"
            id="submitterName"
            name="submitterName"
            value={formData.submitterName}
            onChange={handleChange}
            placeholder="Your name"
            className={errors.submitterName ? "error" : ""}
          />
          {errors.submitterName && (
            <span className="error-text">{errors.submitterName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="submitterEmail">Email</label>
          <input
            type="email"
            id="submitterEmail"
            name="submitterEmail"
            value={formData.submitterEmail}
            onChange={handleChange}
            placeholder="your@email.com"
            className={errors.submitterEmail ? "error" : ""}
          />
          {errors.submitterEmail && (
            <span className="error-text">{errors.submitterEmail}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Category (Optional)</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Rating (Optional)</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= formData.rating ? "active" : ""}`}
                onClick={() => handleRatingChange(star)}
              >
                ★
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="rating-label">{formData.rating} / 5</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="feedbackContent">Feedback</label>
          <textarea
            id="feedbackContent"
            name="feedbackContent"
            value={formData.feedbackContent}
            onChange={handleChange}
            placeholder="Tell us your feedback..."
            rows="5"
            className={errors.feedbackContent ? "error" : ""}
          />
          <div className="char-counter">
            {formData.feedbackContent.length}/1000
          </div>
          {errors.feedbackContent && (
            <span className="error-text">{errors.feedbackContent}</span>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
