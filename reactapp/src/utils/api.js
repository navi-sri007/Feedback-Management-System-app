import axios from "axios";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  STORAGE_KEYS,
  MESSAGES,
} from "./constants";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status } = error.response;

      const requestUrl = error.config?.url || "";
      const isLoginRequest = requestUrl.includes("/auth/login");

      if (status === 401 && !isLoginRequest) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        const onLoginPage = window.location.pathname === "/login";
        if (!onLoginPage) {
          window.location.assign("/login");
        }
      }

      // Extract error message
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        MESSAGES.SERVER_ERROR;

      return Promise.reject({ ...error, message: errorMessage });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({ ...error, message: MESSAGES.NETWORK_ERROR });
    }
    return Promise.reject(error);
  },
);

// ============ AUTH API ============
export const authAPI = {
  login: (credentials) => api.post(API_ENDPOINTS.LOGIN, credentials),
};

// ============ FEEDBACK API (Public) ============
export const feedbackAPI = {
  submit: (data) => api.post(API_ENDPOINTS.SUBMIT_FEEDBACK, data),
};

// ============ ADMIN FEEDBACK API ============
export const adminFeedbackAPI = {
  getAll: (params = {}) => {
    const {
      page = 0,
      size = 10,
      sortBy = "submittedAt",
      sortDir = "DESC",
    } = params;
    return api.get(API_ENDPOINTS.ADMIN_FEEDBACK, {
      params: { page, size, sortBy, sortDir },
    });
  },

  getById: (id) => api.get(API_ENDPOINTS.ADMIN_FEEDBACK_BY_ID(id)),

  updateStatus: (id, status) =>
    api.patch(API_ENDPOINTS.ADMIN_FEEDBACK_STATUS(id), null, {
      params: { status },
    }),

  delete: (id) => api.delete(API_ENDPOINTS.ADMIN_FEEDBACK_BY_ID(id)),
};

// ============ CATEGORY API ============
export const categoryAPI = {
  getAll: () => api.get(API_ENDPOINTS.CATEGORIES),

  create: (data) => api.post(API_ENDPOINTS.CATEGORIES, data),

  delete: (id) => api.delete(API_ENDPOINTS.CATEGORY_BY_ID(id)),
};

// ============ ADMIN MANAGEMENT API (Super Admin Only) ============
export const adminManagementAPI = {
  getAll: () => api.get(API_ENDPOINTS.ADMINS),

  getById: (id) => api.get(API_ENDPOINTS.ADMIN_BY_ID(id)),

  create: (data) => api.post(API_ENDPOINTS.ADMINS, data),

  update: (id, data) => api.put(API_ENDPOINTS.ADMIN_BY_ID(id), data),

  delete: (id) => api.delete(API_ENDPOINTS.ADMIN_BY_ID(id)),

  toggleStatus: (id) => api.patch(API_ENDPOINTS.ADMIN_STATUS(id)),

  assignRole: (id, role) =>
    api.post(API_ENDPOINTS.ADMIN_ROLES(id), null, {
      params: { role },
    }),

  removeRole: (id, role) =>
    api.delete(API_ENDPOINTS.ADMIN_ROLES(id), {
      params: { role },
    }),

  resetPassword: (id, newPassword) =>
    api.patch(API_ENDPOINTS.ADMIN_RESET_PASSWORD(id), null, {
      params: { newPassword },
    }),
};

// ============ DASHBOARD API ============
export const dashboardAPI = {
  getSummary: () => api.get(API_ENDPOINTS.DASHBOARD_SUMMARY),
};

// ============ AUDIT LOG API ============
export const auditLogAPI = {
  getAll: () => api.get(API_ENDPOINTS.AUDIT_LOGS),

  getByEntity: (entityId, entityType) =>
    api.get(API_ENDPOINTS.AUDIT_LOGS_BY_ENTITY(entityId, entityType)),

  getByAdmin: (adminId) => api.get(API_ENDPOINTS.AUDIT_LOGS_BY_ADMIN(adminId)),
};

export default api;
