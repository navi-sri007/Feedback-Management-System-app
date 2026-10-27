import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminManagementAPI } from "../../utils/api";
import { ROLE_OPTIONS } from "../../utils/constants";
import {
  validateEmail,
  validateUsername,
  validatePassword,
} from "../../utils/helpers";
import Sidebar from "./Sidebar";

const AdminManagementCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    role: "ROLE_ADMIN",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!validateUsername(formData.username)) {
      newErrors.username =
        "Username must be 3-50 characters (letters, numbers, underscores)";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      await adminManagementAPI.create(formData);
      navigate("/admins", {
        state: { message: "Admin created successfully!" },
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to create admin";
      setServerError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="form-header">
          <button onClick={() => navigate("/admins")} className="btn-back">
            ← Back to Admins
          </button>
          <h1>Create New Admin</h1>
        </div>

        {serverError && (
          <div className="alert alert-error">
            {serverError}
            <button onClick={() => setServerError(null)} className="close-btn">
              ×
            </button>
          </div>
        )}

        <div className="create-admin-form-container">
          <form onSubmit={handleSubmit} className="create-admin-form">
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username (3-50 characters)"
                className={errors.username ? "error" : ""}
                disabled={loading}
              />
              {errors.username && (
                <span className="error-text">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={errors.email ? "error" : ""}
                disabled={loading}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 6 characters)"
                className={errors.password ? "error" : ""}
                disabled={loading}
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="help-text">
                Super Admins have full access including admin management.
                General Admins can manage feedback and categories.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/admins")}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminManagementCreate;
