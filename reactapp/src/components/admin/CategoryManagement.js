import React, { useState, useEffect } from "react";
import { categoryAPI } from "../../utils/api";
import { formatDate } from "../../utils/helpers";
import Sidebar from "./Sidebar";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data || []);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch categories";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await categoryAPI.create({ name: newCategoryName.trim() });
      setSuccess(
        `✨ Category "${newCategoryName.trim()}" created successfully!`,
      );
      setNewCategoryName("");
      fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to create category";
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete category "${name}"? This will remove it from all feedbacks.`,
      )
    ) {
      return;
    }

    try {
      await categoryAPI.delete(id);
      setSuccess(`🗑️ Category "${name}" deleted successfully!`);
      fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete category";
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  const getCategoryColor = (name) => {
    const colors = [
      "#667eea",
      "#764ba2",
      "#f093fb",
      "#4facfe",
      "#43e97b",
      "#fa709a",
      "#fee140",
      "#a18cd1",
      "#fbc2eb",
      "#a6c1ee",
      "#fbc2eb",
      "#84fab0",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading categories...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="category-page-header">
          <div className="page-header-left">
            <h1 className="page-title">🏷️ Categories</h1>
            <p className="page-subtitle">
              Organize feedback with custom categories
            </p>
          </div>
          <div className="page-header-right">
            <span className="category-count">
              {categories.length} categories
            </span>
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

        {success && (
          <div className="alert alert-success">
            ✅ {success}
            <button onClick={() => setSuccess(null)} className="close-btn">
              ×
            </button>
          </div>
        )}

        {/* Create Category Card */}
        <div className="create-category-card">
          <div className="create-category-header">
            <span className="create-icon">➕</span>
            <h3>Add New Category</h3>
          </div>
          <form
            onSubmit={handleCreateCategory}
            className="create-category-form"
          >
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="category-input-modern"
                disabled={isCreating}
                maxLength="50"
              />
              <button
                type="submit"
                className="btn-create-category-modern"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Category"}
              </button>
            </div>
            <div className="input-hint">
              {newCategoryName.length}/50 characters
            </div>
          </form>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon">🏷️</div>
            <h3>No Categories Yet</h3>
            <p>Create your first category using the form above</p>
          </div>
        ) : (
          <div className="categories-grid-modern">
            {categories.map((category) => {
              const color = getCategoryColor(category.name);
              const feedbackCount = category.feedbackCount || 0;

              return (
                <div key={category.id} className="category-card-modern">
                  <div className="category-card-header">
                    <div
                      className="category-color-dot"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="category-name-modern">
                      {category.name}
                    </span>
                    <button
                      onClick={() =>
                        handleDeleteCategory(category.id, category.name)
                      }
                      className="category-delete-btn"
                      title="Delete category"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="category-card-body">
                    <div className="category-stats">
                      <div className="stat-item">
                        <span className="stat-value">{feedbackCount}</span>
                        <span className="stat-label">Feedbacks</span>
                      </div>
                    </div>
                  </div>
                  <div className="category-card-footer">
                    <div className="category-feedback-preview">
                      {feedbackCount > 0 ? (
                        <span>
                          📝 {feedbackCount} feedback
                          {feedbackCount > 1 ? "s" : ""} in this category
                        </span>
                      ) : (
                        <span className="empty-feedback-text">
                          No feedbacks yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryManagement;
