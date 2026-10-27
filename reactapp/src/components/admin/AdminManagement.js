import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminManagementAPI } from "../../utils/api";
import { formatDate } from "../../utils/helpers";
import { ROLE_OPTIONS } from "../../utils/constants";
import Sidebar from "./Sidebar";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminManagementAPI.getAll();
      setAdmins(response.data || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch admins";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (
      !window.confirm(`Are you sure you want to delete admin "${username}"?`)
    ) {
      return;
    }

    try {
      await adminManagementAPI.delete(id);
      setSuccess(`Admin "${username}" deleted successfully!`);
      fetchAdmins();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete admin";
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleStatus = async (id, username, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (
      !window.confirm(`Are you sure you want to ${action} admin "${username}"?`)
    ) {
      return;
    }

    try {
      await adminManagementAPI.toggleStatus(id);
      setSuccess(`Admin "${username}" ${action}d successfully!`);
      fetchAdmins();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || `Failed to ${action} admin`;
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAssignRole = async (adminId, role) => {
    try {
      await adminManagementAPI.assignRole(adminId, role);
      setSuccess(`Role assigned successfully!`);
      fetchAdmins();
      setShowRoleModal(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to assign role";
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveRole = async (adminId, role) => {
    if (!window.confirm(`Are you sure you want to remove this role?`)) {
      return;
    }

    try {
      await adminManagementAPI.removeRole(adminId, role);
      setSuccess(`Role removed successfully!`);
      fetchAdmins();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to remove role";
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleResetPassword = async (id, username) => {
    const newPassword = prompt(`Enter new password for "${username}":`);
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      await adminManagementAPI.resetPassword(id, newPassword);
      setSuccess(`Password reset for "${username}" successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to reset password";
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  const isSuperAdminUser = (admin) => {
    return admin.roles?.includes("ROLE_SUPER_ADMIN") || false;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading admins...</p>
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
          <div>
            <h1>Admin Management</h1>
            <p className="subtitle">Manage system administrators</p>
          </div>
          <Link to="/admins/create" className="btn-primary">
            + Create Admin
          </Link>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
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

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>#{admin.id}</td>
                  <td>
                    <strong>{admin.username}</strong>
                    {isSuperAdminUser(admin) && (
                      <span className="super-admin-badge">👑 Super</span>
                    )}
                  </td>
                  <td>{admin.email}</td>
                  <td>
                    <div className="role-tags">
                      {admin.roles?.map((role) => (
                        <span key={role} className="role-tag">
                          {role.replace("ROLE_", "")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${admin.active ? "active" : "inactive"}`}
                    >
                      {admin.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{formatDate(admin.createdAt)}</td>
                  <td className="action-cell">
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          admin.id,
                          admin.username,
                          admin.active,
                        )
                      }
                      className={`btn-action ${admin.active ? "deactivate" : "activate"}`}
                    >
                      {admin.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() =>
                        handleResetPassword(admin.id, admin.username)
                      }
                      className="btn-action edit"
                    >
                      Reset PW
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowRoleModal(true);
                      }}
                      className="btn-action view"
                    >
                      Roles
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id, admin.username)}
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

        {admins.length === 0 && (
          <div className="empty-container">
            <p>No admins found</p>
            <Link to="/admins/create" className="btn-primary">
              Create Admin
            </Link>
          </div>
        )}

        {/* Role Management Modal */}
        {showRoleModal && selectedAdmin && (
          <div
            className="modal-overlay"
            onClick={() => setShowRoleModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Manage Roles - {selectedAdmin.username}</h2>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="current-roles">
                  <h3>Current Roles</h3>
                  {selectedAdmin.roles?.length === 0 ? (
                    <p className="empty-message">No roles assigned</p>
                  ) : (
                    <div className="role-tags">
                      {selectedAdmin.roles?.map((role) => (
                        <span key={role} className="role-tag">
                          {role.replace("ROLE_", "")}
                          <button
                            onClick={() =>
                              handleRemoveRole(selectedAdmin.id, role)
                            }
                            className="remove-role-btn"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="add-role-section">
                  <h3>Add Role</h3>
                  <div className="add-role-buttons">
                    {ROLE_OPTIONS.map((option) => {
                      const alreadyHasRole = selectedAdmin.roles?.includes(
                        option.value,
                      );
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleAssignRole(selectedAdmin.id, option.value)
                          }
                          disabled={alreadyHasRole}
                          className={`role-add-btn ${alreadyHasRole ? "disabled" : ""}`}
                        >
                          {alreadyHasRole ? "✓ " : "+ "}
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminManagement;
