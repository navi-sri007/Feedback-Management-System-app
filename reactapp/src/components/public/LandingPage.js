import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedbackAPI, categoryAPI } from '../../utils/api';
import { FEEDBACK_STATUS, MESSAGES } from '../../utils/constants';
import { validateEmail } from '../../utils/helpers';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    submitterName: '',
    submitterEmail: '',
    feedbackContent: '',
    rating: 0,
    categoryId: '',
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.submitterName.trim()) {
      newErrors.submitterName = 'Name is required';
    }
    
    if (!formData.submitterEmail) {
      newErrors.submitterEmail = 'Email is required';
    } else if (!validateEmail(formData.submitterEmail)) {
      newErrors.submitterEmail = 'Invalid email format';
    }
    
    if (!formData.feedbackContent.trim()) {
      newErrors.feedbackContent = 'Feedback content is required';
    } else if (formData.feedbackContent.length > 1000) {
      newErrors.feedbackContent = 'Feedback cannot exceed 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const feedbackData = {
        submitterName: formData.submitterName,
        submitterEmail: formData.submitterEmail,
        feedbackContent: formData.feedbackContent,
        rating: formData.rating || null,
        status: FEEDBACK_STATUS.NEW,
        category: formData.categoryId ? { id: parseInt(formData.categoryId) } : null,
      };
      
      await feedbackAPI.submit(feedbackData);
      
      setSubmitted(true);
      setFormData({
        submitterName: '',
        submitterEmail: '',
        feedbackContent: '',
        rating: 0,
        categoryId: '',
      });
      
      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit feedback';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Login Button in Top Right Corner */}
      <div className="admin-login-corner">
        <Link to="/login" className="admin-login-btn" title="Admin Login">
          <span className="admin-icon">🔐</span>
          <span className="admin-text">Admin</span>
        </Link>
      </div>

      <div className="landing-content">
        <div className="landing-header">
          <div className="company-logo">
            <h1>📋 Feedback</h1>
            <p className="company-name">Management System</p>
          </div>
          <p className="landing-subtitle">
            We value your feedback! Please share your experience with us.
          </p>
        </div>
        
        <div className="feedback-card">
          {error && (
            <div className="alert alert-error">
              ❌ {error}
              <button onClick={() => setError(null)} className="close-btn">×</button>
            </div>
          )}
          
          {submitted && (
            <div className="alert alert-success">
              ✅ {MESSAGES.FEEDBACK_SUBMITTED}
              <button onClick={() => setSubmitted(false)} className="close-btn">×</button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="submitterName">Full Name *</label>
                <input
                  type="text"
                  id="submitterName"
                  name="submitterName"
                  value={formData.submitterName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.submitterName ? 'error' : ''}
                  disabled={loading || submitted}
                />
                {errors.submitterName && <span className="error-text">{errors.submitterName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="submitterEmail">Email Address *</label>
                <input
                  type="email"
                  id="submitterEmail"
                  name="submitterEmail"
                  value={formData.submitterEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={errors.submitterEmail ? 'error' : ''}
                  disabled={loading || submitted}
                />
                {errors.submitterEmail && <span className="error-text">{errors.submitterEmail}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="categoryId">Category (Optional)</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={loading || submitted}
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
                    className={`star-btn ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(star)}
                    disabled={loading || submitted}
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
              <label htmlFor="feedbackContent">Your Feedback *</label>
              <textarea
                id="feedbackContent"
                name="feedbackContent"
                value={formData.feedbackContent}
                onChange={handleChange}
                placeholder="Tell us about your experience..."
                rows="6"
                className={errors.feedbackContent ? 'error' : ''}
                disabled={loading || submitted}
              />
              <div className="char-counter">
                {formData.feedbackContent.length}/1000
              </div>
              {errors.feedbackContent && <span className="error-text">{errors.feedbackContent}</span>}
            </div>
            
            <button 
              type="submit" 
              className="btn-submit-feedback"
              disabled={loading || submitted}
            >
              {loading ? 'Submitting...' : submitted ? 'Thank You! ✓' : 'Submit Feedback'}
            </button>
          </form>
          
          <div className="feedback-footer">
            <p>Your feedback helps us improve our services. Thank you for your time!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;