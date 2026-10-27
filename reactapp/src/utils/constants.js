// API endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",

  // Feedback (Public)
  SUBMIT_FEEDBACK: "/feedback",

  // Feedback (Admin)
  ADMIN_FEEDBACK: "/v1/feedback",
  ADMIN_FEEDBACK_BY_ID: (id) => `/v1/feedback/${id}`,
  ADMIN_FEEDBACK_STATUS: (id) => `/v1/feedback/${id}/status`,

  // Categories
  CATEGORIES: "/v1/categories",
  CATEGORY_BY_ID: (id) => `/v1/categories/${id}`,

  // Admin Management (Super Admin only)
  ADMINS: "/admins",
  ADMIN_BY_ID: (id) => `/admins/${id}`,
  ADMIN_STATUS: (id) => `/admins/${id}/status`,
  ADMIN_ROLES: (id) => `/admins/${id}/roles`,
  ADMIN_RESET_PASSWORD: (id) => `/admins/${id}/reset-password`,

  // Dashboard
  DASHBOARD_SUMMARY: "/v1/dashboard/summary",

  // Audit Logs
  AUDIT_LOGS: "/v1/audit-logs",
  AUDIT_LOGS_BY_ENTITY: (entityId, entityType) =>
    `/v1/audit-logs/entity/${entityId}/${entityType}`,
  AUDIT_LOGS_BY_ADMIN: (adminId) => `/v1/audit-logs/admin/${adminId}`,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Feedback Status
export const FEEDBACK_STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  ARCHIVED: "ARCHIVED",
};

export const FEEDBACK_STATUS_OPTIONS = [
  { value: "NEW", label: "New", color: "#2196F3" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#FF9800" },
  { value: "RESOLVED", label: "Resolved", color: "#4CAF50" },
  { value: "ARCHIVED", label: "Archived", color: "#9E9E9E" },
];

// Roles
export const ROLES = {
  SUPER_ADMIN: "ROLE_SUPER_ADMIN",
  ADMIN: "ROLE_ADMIN",
};

export const ROLE_OPTIONS = [
  { value: "ROLE_ADMIN", label: "General Admin" },
  { value: "ROLE_SUPER_ADMIN", label: "Super Admin" },
];

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "accessToken",
  USER: "user",
};

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 0,
  SIZE: 10,
  SORT_BY: "submittedAt",
  SORT_DIR: "DESC",
};

// Messages
export const MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  LOGIN_FAILED: "Invalid username or password",
  LOGOUT_SUCCESS: "Logged out successfully",
  FEEDBACK_SUBMITTED: "Feedback submitted successfully!",
  FEEDBACK_UPDATED: "Feedback updated successfully!",
  FEEDBACK_DELETED: "Feedback deleted successfully!",
  STATUS_UPDATED: "Status updated successfully!",
  CATEGORY_CREATED: "Category created successfully!",
  CATEGORY_DELETED: "Category deleted successfully!",
  ADMIN_CREATED: "Admin created successfully!",
  ADMIN_UPDATED: "Admin updated successfully!",
  ADMIN_DELETED: "Admin deleted successfully!",
  PASSWORD_RESET: "Password reset successfully!",
  UNAUTHORIZED: "Session expired. Please login again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "Resource not found.",
  SERVER_ERROR: "An unexpected error occurred.",
  NETWORK_ERROR: "Network error. Please check your connection.",
};
