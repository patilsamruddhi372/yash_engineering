// client/src/services/api.js
// ============================================
// API Service - Production Ready with Railway Backend
// ============================================

// IMPORTANT: Update this with your actual Railway backend URL
const PRODUCTION_API_URL = "https://your-backend-production.up.railway.app/api";

// Auto-detect environment and set API URL
const getApiUrl = () => {
  // Check if we have an environment variable set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Use production URL if in production mode
  if (import.meta.env.MODE === 'production') {
    return PRODUCTION_API_URL;
  }
  
  // Default to localhost for development
  return "http://localhost:5000/api";
};

const API_URL = getApiUrl();

// Log current configuration (remove in production)
console.log(`
╔════════════════════════════════════════╗
║        🔗 API Configuration            ║
╚════════════════════════════════════════╝
📍 API URL: ${API_URL}
🌍 Mode: ${import.meta.env.MODE}
🚀 Environment: ${import.meta.env.VITE_API_URL ? 'Using ENV Variable' : 'Using Default'}
`);

// Request configuration
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// ============================================
// Utility Functions
// ============================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isNetworkError = (error) => {
  return error.message === 'Failed to fetch' || 
         error.message === 'Network request failed' ||
         error.code === 'ECONNABORTED';
};

// ============================================
// Base API Service Class - Enhanced
// ============================================

class ApiService {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
    this.interceptors = {
      request: [],
      response: []
    };
  }

  // Token Management
  getToken() {
    try {
      return (
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        ""
      );
    } catch (error) {
      console.error("Failed to get token:", error);
      return "";
    }
  }

  setToken(token, remember = true) {
    try {
      if (remember) {
        localStorage.setItem("adminToken", token);
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  }

  removeToken() {
    try {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Check if token is expired (if JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return !!token;
    }
  }

  // Headers Configuration
  getHeaders(options = {}) {
    const { 
      includeAuth = true, 
      contentType = "application/json",
      additionalHeaders = {} 
    } = options;

    const headers = {
      Accept: "application/json",
      ...additionalHeaders
    };

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // Add request ID for tracking
    headers["X-Request-ID"] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return headers;
  }

  // Response Handler
  async handleResponse(response) {
    // Handle no content
    if (response.status === 204) {
      return { success: true, message: "Operation successful" };
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    // Handle empty responses
    if (!contentType || contentLength === "0") {
      if (response.ok) {
        return { success: true };
      }
      throw new Error(`Request failed with status ${response.status}`);
    }

    let data;

    try {
      if (contentType?.includes("application/json")) {
        const text = await response.text();
        if (!text || text.trim() === "") {
          data = { success: response.ok };
        } else {
          data = JSON.parse(text);
        }
      } else if (contentType?.includes("text/")) {
        const text = await response.text();
        data = { success: response.ok, message: text };
      } else if (contentType?.includes("application/octet-stream")) {
        data = await response.blob();
      } else {
        data = await response.text();
      }
    } catch (parseError) {
      console.error("Response parse error:", parseError);
      if (response.ok) {
        return { success: true };
      }
      throw new Error("Invalid response format");
    }

    // Handle errors
    if (!response.ok) {
      const error = new Error(
        data?.message || 
        data?.error || 
        `Request failed with status ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      error.response = response;
      throw error;
    }

    return data;
  }

  // Handle 401 Unauthorized
  handleUnauthorized() {
    this.removeToken();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('unauthorized', { 
      detail: { message: 'Session expired' } 
    }));
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/admin/login";
    }
  }

  // Main Request Method with Retry Logic
  async request(endpoint, options = {}) {
    const {
      method = "GET",
      data = null,
      params = {},
      includeAuth = true,
      contentType = "application/json",
      timeout = REQUEST_TIMEOUT,
      retries = 0,
      maxRetries = MAX_RETRIES,
      retryDelay = RETRY_DELAY,
      additionalHeaders = {},
      signal = null,
    } = options;

    // Build URL with params
    let url = `${this.baseURL}${endpoint}`;
    
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Setup abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Merge signals if provided
    const finalSignal = signal || controller.signal;

    // Build request configuration
    const requestConfig = {
      method,
      headers: this.getHeaders({ includeAuth, contentType, additionalHeaders }),
      signal: finalSignal,
      credentials: 'include', // Include cookies
    };

    // Add body for non-GET requests
    if (data && method !== "GET") {
      if (data instanceof FormData) {
        requestConfig.body = data;
        delete requestConfig.headers["Content-Type"];
      } else if (typeof data === 'object') {
        requestConfig.body = JSON.stringify(data);
      } else {
        requestConfig.body = data;
      }
    }

    // Log request in development
    if (import.meta.env.MODE === 'development') {
      console.log("🚀 API Request:", {
        method,
        url,
        ...(data && { data }),
        headers: requestConfig.headers
      });
    }

    try {
      // Execute request interceptors
      for (const interceptor of this.interceptors.request) {
        await interceptor(requestConfig);
      }

      // Make the request
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error("Unauthorized. Please login again.");
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        throw new Error(`Rate limited. Try again in ${retryAfter} seconds.`);
      }

      // Process response
      const result = await this.handleResponse(response);

      // Execute response interceptors
      for (const interceptor of this.interceptors.response) {
        await interceptor(result, response);
      }

      // Log success in development
      if (import.meta.env.MODE === 'development') {
        console.log("✅ API Response:", {
          url,
          status: response.status,
          data: result,
        });
      }

      return result;

    } catch (error) {
      clearTimeout(timeoutId);

      // Log error
      console.error("❌ API Request Failed:", {
        url,
        method,
        error: error.message,
        status: error.status,
      });

      // Retry logic for network errors
      if (isNetworkError(error) && retries < maxRetries) {
        console.log(`🔄 Retrying request (${retries + 1}/${maxRetries})...`);
        await sleep(retryDelay * Math.pow(2, retries)); // Exponential backoff
        return this.request(endpoint, { ...options, retries: retries + 1 });
      }

      // Handle abort errors
      if (error.name === "AbortError") {
        const timeoutError = new Error("Request timed out. Please try again.");
        timeoutError.status = 408;
        throw timeoutError;
      }

      // Handle network errors
      if (error.message === "Failed to fetch") {
        const networkError = new Error(
          "Unable to connect to server. Please check your connection."
        );
        networkError.status = 0;
        throw networkError;
      }

      throw error;
    }
  }

  // Convenience methods
  async get(endpoint, params = {}, options = {}) {
    return this.request(endpoint, { ...options, method: "GET", params });
  }

  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", data });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", data });
  }

  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: "PATCH", data });
  }

  async deleteRequest(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // File upload helper
  async upload(endpoint, files, additionalData = {}, options = {}) {
    const formData = new FormData();

    // Handle different file input types
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append("files", file));
    } else if (files instanceof File) {
      formData.append("file", files);
    } else if (files instanceof FileList) {
      Array.from(files).forEach((file) => formData.append("files", file));
    } else if (typeof files === "object") {
      Object.entries(files).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((file) => formData.append(key, file));
        } else {
          formData.append(key, value);
        }
      });
    }

    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "object" && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return this.request(endpoint, {
      ...options,
      method: "POST",
      data: formData,
      contentType: null,
    });
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  // Batch requests
  async batch(requests) {
    return Promise.all(requests.map(req => 
      this.request(req.endpoint, req.options)
    ));
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// ============================================
// Auth API - Enhanced
// ============================================

class AuthAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/auth";
  }

  async login(credentials) {
    console.log("🔐 Attempting login...");

    const { email, password, remember = true } = credentials;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    try {
      const response = await this.post(
        `${this.endpoint}/login`,
        { email, password },
        { includeAuth: false }
      );

      if (response.success && response.token) {
        this.setToken(response.token, remember);
        
        if (response.user) {
          const storage = remember ? localStorage : sessionStorage;
          storage.setItem("user", JSON.stringify(response.user));
        }

        // Dispatch login event
        window.dispatchEvent(new CustomEvent('login', { 
          detail: response.user 
        }));
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async register(userData) {
    const response = await this.post(
      `${this.endpoint}/register`, 
      userData, 
      { includeAuth: false }
    );
    
    if (response.success && response.token) {
      this.setToken(response.token);
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    }
    
    return response;
  }

  async logout() {
    try {
      await this.post(`${this.endpoint}/logout`, {});
    } catch (error) {
      console.warn("Logout endpoint failed:", error);
    } finally {
      this.removeToken();
      window.dispatchEvent(new CustomEvent('logout'));
    }
    return { success: true };
  }

  async getProfile() {
    return this.get(`${this.endpoint}/profile`);
  }

  async updateProfile(data) {
    const response = await this.put(`${this.endpoint}/profile`, data);
    if (response.success && response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  }

  async changePassword(currentPassword, newPassword) {
    return this.put(`${this.endpoint}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email) {
    return this.post(
      `${this.endpoint}/forgot-password`,
      { email },
      { includeAuth: false }
    );
  }

  async resetPassword(token, password) {
    return this.post(
      `${this.endpoint}/reset-password`,
      { token, password },
      { includeAuth: false }
    );
  }

  async verifyEmail(token) {
    return this.post(
      `${this.endpoint}/verify-email`,
      { token },
      { includeAuth: false }
    );
  }

  async resendVerification(email) {
    return this.post(
      `${this.endpoint}/resend-verification`,
      { email },
      { includeAuth: false }
    );
  }

  async verifyToken() {
    try {
      return await this.get(`${this.endpoint}/verify`);
    } catch (error) {
      this.removeToken();
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await this.post(`${this.endpoint}/refresh-token`, {});
      if (response.token) {
        this.setToken(response.token);
      }
      return response;
    } catch (error) {
      this.removeToken();
      throw error;
    }
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
}

// ============================================
// Gallery API - Enhanced
// ============================================

class GalleryAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/gallery";
  }

  async getAll(params = {}) {
    const defaultParams = {
      page: 1,
      limit: 20,
      sort: '-createdAt',
      ...params
    };
    return this.get(this.endpoint, defaultParams);
  }

  async getImages(params = {}) {
    return this.getAll(params);
  }

  async getImage(id) {
    if (!id) throw new Error("Image ID is required");
    return this.get(`${this.endpoint}/${id}`);
  }

  async getByCategory(category, params = {}) {
    return this.get(this.endpoint, { ...params, category });
  }

  async getFeatured(limit = 10) {
    return this.get(`${this.endpoint}/featured`, { limit });
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async uploadImage(file, metadata = {}) {
    if (!file) throw new Error("File is required");
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }
    
    return this.upload(this.endpoint, file, metadata);
  }

  async uploadImages(files, metadata = {}) {
    if (!files || files.length === 0) {
      throw new Error("At least one file is required");
    }
    
    return this.upload(`${this.endpoint}/multiple`, files, metadata);
  }

  async create(data) {
    return this.post(this.endpoint, data);
  }

  async update(id, data) {
    if (!id) throw new Error("Gallery item ID is required");
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id) {
    if (!id) throw new Error("Gallery item ID is required");
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of gallery item IDs is required");
    }
    return this.post(`${this.endpoint}/bulk-delete`, { ids });
  }

  async toggleFeatured(id) {
    if (!id) throw new Error("Gallery item ID is required");
    return this.patch(`${this.endpoint}/${id}/toggle-featured`, {});
  }

  async reorder(orderedIds) {
    if (!Array.isArray(orderedIds)) {
      throw new Error("Array of ordered IDs is required");
    }
    return this.put(`${this.endpoint}/reorder`, { orderedIds });
  }

  async search(query, params = {}) {
    return this.get(`${this.endpoint}/search`, { q: query, ...params });
  }
}

// ============================================
// Enquiry API - Enhanced
// ============================================

class EnquiryAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/enquiries";
  }

  async createEnquiry(data) {
    // Validate required fields
    const required = ['name', 'email', 'message'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email address");
    }
    
    return this.post(this.endpoint, data, { includeAuth: false });
  }

  async getEnquiries(params = {}) {
    const defaultParams = {
      page: 1,
      limit: 20,
      sort: '-createdAt',
      ...params
    };
    return this.get(this.endpoint, defaultParams);
  }

  async getEnquiry(id) {
    if (!id) throw new Error("Enquiry ID is required");
    return this.get(`${this.endpoint}/${id}`);
  }

  async updateEnquiry(id, data) {
    if (!id) throw new Error("Enquiry ID is required");
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async deleteEnquiry(id) {
    if (!id) throw new Error("Enquiry ID is required");
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async markAsRead(id) {
    if (!id) throw new Error("Enquiry ID is required");
    return this.patch(`${this.endpoint}/${id}/read`, {});
  }

  async markAsUnread(id) {
    if (!id) throw new Error("Enquiry ID is required");
    return this.patch(`${this.endpoint}/${id}/unread`, {});
  }

  async reply(id, message) {
    if (!id) throw new Error("Enquiry ID is required");
    if (!message) throw new Error("Reply message is required");
    return this.post(`${this.endpoint}/${id}/reply`, { message });
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async bulkUpdate(ids, action, value = null) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of enquiry IDs is required");
    }
    return this.put(`${this.endpoint}/bulk-update`, { ids, action, value });
  }

  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of enquiry IDs is required");
    }
    return this.post(`${this.endpoint}/bulk-delete`, { ids });
  }

  async exportEnquiries(format = "csv", params = {}) {
    const response = await this.get(
      `${this.endpoint}/export`,
      { ...params, format },
      { responseType: 'blob' }
    );
    
    // Create download link
    const blob = new Blob([response], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enquiries-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  }

  async search(query, params = {}) {
    return this.get(`${this.endpoint}/search`, { q: query, ...params });
  }
}

// ============================================
// Product API - Enhanced
// ============================================

class ProductAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/products";
  }

  async getProducts(params = {}, options = {}) {
    const defaultParams = {
      page: 1,
      limit: 20,
      sort: '-createdAt',
      ...params
    };
    return this.get(this.endpoint, defaultParams, options);
  }

  async getProduct(idOrSlug, options = {}) {
    if (!idOrSlug) throw new Error("Product ID or slug is required");
    return this.get(`${this.endpoint}/${idOrSlug}`, {}, options);
  }

  async getBySlug(slug, options = {}) {
    return this.getProduct(slug, options);
  }

  async getCategories(options = {}) {
    return this.get(`${this.endpoint}/categories`, {}, { 
      includeAuth: false, 
      ...options 
    });
  }

  async getByCategory(category, params = {}, options = {}) {
    return this.get(this.endpoint, { ...params, category }, options);
  }

  async getFeatured(limit = 10, options = {}) {
    return this.get(`${this.endpoint}/featured`, { limit }, { 
      includeAuth: false, 
      ...options 
    });
  }

  async getRelated(productId, limit = 4) {
    if (!productId) throw new Error("Product ID is required");
    return this.get(`${this.endpoint}/${productId}/related`, { limit });
  }

  async createProduct(data) {
    // Validate required fields
    const required = ['name', 'price'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
    return this.post(this.endpoint, data);
  }

  async updateProduct(id, data) {
    if (!id) throw new Error("Product ID is required");
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async deleteProduct(id) {
    if (!id) throw new Error("Product ID is required");
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of product IDs is required");
    }
    return this.post(`${this.endpoint}/bulk-delete`, { ids });
  }

  async uploadImages(productId, files) {
    if (!productId) throw new Error("Product ID is required");
    if (!files || files.length === 0) {
      throw new Error("At least one file is required");
    }
    return this.upload(`${this.endpoint}/${productId}/images`, files);
  }

  async deleteImage(productId, imageId) {
    if (!productId || !imageId) {
      throw new Error("Product ID and Image ID are required");
    }
    return this.deleteRequest(`${this.endpoint}/${productId}/images/${imageId}`);
  }

  async updateStock(id, quantity, operation = 'set') {
    if (!id) throw new Error("Product ID is required");
    return this.patch(`${this.endpoint}/${id}/stock`, { quantity, operation });
  }

  async toggleFeatured(id) {
    if (!id) throw new Error("Product ID is required");
    return this.patch(`${this.endpoint}/${id}/toggle-featured`, {});
  }

  async toggleActive(id) {
    if (!id) throw new Error("Product ID is required");
    return this.patch(`${this.endpoint}/${id}/toggle-active`, {});
  }

  async search(query, params = {}) {
    return this.get(`${this.endpoint}/search`, { q: query, ...params });
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async exportProducts(format = "csv", params = {}) {
    return this.get(`${this.endpoint}/export`, { ...params, format });
  }

  async importProducts(file) {
    if (!file) throw new Error("Import file is required");
    return this.upload(`${this.endpoint}/import`, file);
  }

  // Aliases for compatibility
  async getAll(params = {}, options = {}) {
    return this.getProducts(params, options);
  }

  async getById(id, options = {}) {
    return this.getProduct(id, options);
  }

  async create(data) {
    return this.createProduct(data);
  }

  async update(id, data) {
    return this.updateProduct(id, data);
  }

  async delete(id) {
    return this.deleteProduct(id);
  }
}

// ============================================
// Service API - Enhanced
// ============================================

class ServiceAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/services";
  }

  async getServices(params = {}, options = {}) {
    const defaultParams = {
      page: 1,
      limit: 20,
      sort: 'order',
      ...params
    };
    return this.get(this.endpoint, defaultParams, { 
      includeAuth: false, 
      ...options 
    });
  }

  async getService(idOrSlug, options = {}) {
    if (!idOrSlug) throw new Error("Service ID or slug is required");
    return this.get(`${this.endpoint}/${idOrSlug}`, {}, { 
      includeAuth: false, 
      ...options 
    });
  }

  async getBySlug(slug, options = {}) {
    return this.getService(slug, options);
  }

  async getFeaturedServices(limit = 6) {
    return this.get(`${this.endpoint}/featured`, { limit }, { 
      includeAuth: false 
    });
  }

  async getCategories() {
    return this.get(`${this.endpoint}/categories`, {}, { 
      includeAuth: false 
    });
  }

  async getByCategory(category, params = {}) {
    return this.get(this.endpoint, { ...params, category }, { 
      includeAuth: false 
    });
  }

  async createService(data) {
    // Validate required fields
    const required = ['title', 'description'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
    return this.post(this.endpoint, data);
  }

  async updateService(id, data) {
    if (!id) throw new Error("Service ID is required");
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async deleteService(id) {
    if (!id) throw new Error("Service ID is required");
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of service IDs is required");
    }
    return this.post(`${this.endpoint}/bulk-delete`, { ids });
  }

  async uploadImages(serviceId, files) {
    if (!serviceId) throw new Error("Service ID is required");
    if (!files || files.length === 0) {
      throw new Error("At least one file is required");
    }
    return this.upload(`${this.endpoint}/${serviceId}/images`, files);
  }

  async deleteImage(serviceId, imageId) {
    if (!serviceId || !imageId) {
      throw new Error("Service ID and Image ID are required");
    }
    return this.deleteRequest(`${this.endpoint}/${serviceId}/images/${imageId}`);
  }

  async toggleFeatured(id) {
    if (!id) throw new Error("Service ID is required");
    return this.patch(`${this.endpoint}/${id}/toggle-featured`, {});
  }

  async toggleActive(id) {
    if (!id) throw new Error("Service ID is required");
    return this.patch(`${this.endpoint}/${id}/toggle-active`, {});
  }

  async reorder(orderedIds) {
    if (!Array.isArray(orderedIds)) {
      throw new Error("Array of ordered IDs is required");
    }
    return this.put(`${this.endpoint}/reorder`, { orderedIds });
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async search(query, params = {}) {
    return this.get(`${this.endpoint}/search`, { q: query, ...params });
  }

  // Aliases for compatibility
  async getAll(params = {}) {
    return this.getServices(params);
  }

  async getById(id) {
    return this.getService(id);
  }

  async getFeatured(limit) {
    return this.getFeaturedServices(limit);
  }

  async create(data) {
    return this.createService(data);
  }

  async update(id, data) {
    return this.updateService(id, data);
  }

  async delete(id) {
    return this.deleteService(id);
  }

  async remove(id) {
    return this.deleteService(id);
  }
}

// ============================================
// Client API - Enhanced
// ============================================

class ClientAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/clients";
  }

  async getClients(params = {}) {
    const defaultParams = {
      page: 1,
      limit: 20,
      sort: '-createdAt',
      ...params
    };
    return this.get(this.endpoint, defaultParams);
  }

  async getClient(id) {
    if (!id) throw new Error("Client ID is required");
    return this.get(`${this.endpoint}/${id}`);
  }

  async createClient(data) {
    // Validate required fields
    const required = ['name', 'email'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email address");
    }
    
    return this.post(this.endpoint, data);
  }

  async updateClient(id, data) {
    if (!id) throw new Error("Client ID is required");
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async deleteClient(id) {
    if (!id) throw new Error("Client ID is required");
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of client IDs is required");
    }
    return this.post(`${this.endpoint}/bulk-delete`, { ids });
  }

  async toggleActive(id) {
    if (!id) throw new Error("Client ID is required");
    return this.patch(`${this.endpoint}/${id}/toggle-active`, {});
  }

  async getClientActivity(id, params = {}) {
    if (!id) throw new Error("Client ID is required");
    return this.get(`${this.endpoint}/${id}/activity`, params);
  }

  async getClientProjects(id, params = {}) {
    if (!id) throw new Error("Client ID is required");
    return this.get(`${this.endpoint}/${id}/projects`, params);
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async exportClients(format = "csv", params = {}) {
    return this.get(`${this.endpoint}/export`, { ...params, format });
  }

  async importClients(file) {
    if (!file) throw new Error("Import file is required");
    return this.upload(`${this.endpoint}/import`, file);
  }

  async search(query, params = {}) {
    return this.get(`${this.endpoint}/search`, { q: query, ...params });
  }

  // Aliases
  async getAll(params = {}) {
    return this.getClients(params);
  }

  async getById(id) {
    return this.getClient(id);
  }

  async create(data) {
    return this.createClient(data);
  }

  async update(id, data) {
    return this.updateClient(id, data);
  }

  async delete(id) {
    return this.deleteClient(id);
  }
}

// ============================================
// Dashboard API - Enhanced
// ============================================

class DashboardAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/dashboard";
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async getOverview(period = '7days') {
    return this.get(`${this.endpoint}/overview`, { period });
  }

  async getRecentEnquiries(limit = 5) {
    return this.get(`${this.endpoint}/recent-enquiries`, { limit });
  }

  async getRecentOrders(limit = 5) {
    return this.get(`${this.endpoint}/recent-orders`, { limit });
  }

  async getRecentActivity(limit = 10) {
    return this.get(`${this.endpoint}/recent-activity`, { limit });
  }

  async getEnquiryTrends(period = '7days') {
    return this.get(`${this.endpoint}/enquiry-trends`, { period });
  }

  async getSalesTrends(period = '7days') {
    return this.get(`${this.endpoint}/sales-trends`, { period });
  }

  async getTopProducts(limit = 5, period = '30days') {
    return this.get(`${this.endpoint}/top-products`, { limit, period });
  }

  async getTopServices(limit = 5, period = '30days') {
    return this.get(`${this.endpoint}/top-services`, { limit, period });
  }

  async getTrafficStats(period = '7days') {
    return this.get(`${this.endpoint}/traffic-stats`, { period });
  }

  async getPerformanceMetrics() {
    return this.get(`${this.endpoint}/performance`);
  }

  async getNotifications(params = {}) {
    return this.get(`${this.endpoint}/notifications`, params);
  }

  async markNotificationRead(id) {
    if (!id) throw new Error("Notification ID is required");
    return this.patch(`${this.endpoint}/notifications/${id}/read`, {});
  }

  async dismissNotification(id) {
    if (!id) throw new Error("Notification ID is required");
    return this.deleteRequest(`${this.endpoint}/notifications/${id}`);
  }

  async getSystemHealth() {
    return this.get(`${this.endpoint}/health`);
  }

  async exportReport(type = 'overview', format = 'pdf', period = '30days') {
    return this.get(`${this.endpoint}/export-report`, { 
      type, 
      format, 
      period 
    });
  }
}

// ============================================
// Settings API - Enhanced
// ============================================

class SettingsAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/settings";
  }

  async getSettings() {
    return this.get(this.endpoint);
  }

  async getPublicSettings() {
    return this.get(`${this.endpoint}/public`, {}, { includeAuth: false });
  }

  async updateSettings(data) {
    return this.put(this.endpoint, data);
  }

  async updateSetting(key, value) {
    return this.patch(`${this.endpoint}/${key}`, { value });
  }

  async uploadLogo(file) {
    if (!file) throw new Error("Logo file is required");
    return this.upload(`${this.endpoint}/logo`, file);
  }

  async uploadFavicon(file) {
    if (!file) throw new Error("Favicon file is required");
    return this.upload(`${this.endpoint}/favicon`, file);
  }

  async getEmailSettings() {
    return this.get(`${this.endpoint}/email`);
  }

  async updateEmailSettings(data) {
    return this.put(`${this.endpoint}/email`, data);
  }

  async testEmailSettings(email) {
    return this.post(`${this.endpoint}/email/test`, { email });
  }

  async getSocialLinks() {
    return this.get(`${this.endpoint}/social`);
  }

  async updateSocialLinks(data) {
    return this.put(`${this.endpoint}/social`, data);
  }

  async getSEOSettings() {
    return this.get(`${this.endpoint}/seo`);
  }

  async updateSEOSettings(data) {
    return this.put(`${this.endpoint}/seo`, data);
  }

  async getBackupSettings() {
    return this.get(`${this.endpoint}/backup`);
  }

  async createBackup() {
    return this.post(`${this.endpoint}/backup/create`);
  }

  async restoreBackup(backupId) {
    if (!backupId) throw new Error("Backup ID is required");
    return this.post(`${this.endpoint}/backup/restore`, { backupId });
  }

  async clearCache() {
    return this.post(`${this.endpoint}/cache/clear`);
  }

  async getMaintenanceMode() {
    return this.get(`${this.endpoint}/maintenance`);
  }

  async toggleMaintenanceMode(enabled, message = '') {
    return this.put(`${this.endpoint}/maintenance`, { enabled, message });
  }
}

// ============================================
// Upload API - Enhanced
// ============================================

class UploadAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/uploads";
  }

  async uploadFile(file, folder = "general", options = {}) {
    if (!file) throw new Error("File is required");
    
    const { 
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [],
      onProgress 
    } = options;
    
    // Size validation
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }
    
    // Type validation
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
    
    return this.upload(this.endpoint, file, { folder }, { onProgress });
  }

  async uploadMultiple(files, folder = "general", options = {}) {
    if (!files || files.length === 0) {
      throw new Error("At least one file is required");
    }
    
    return this.upload(`${this.endpoint}/multiple`, files, { folder }, options);
  }

  async uploadFromURL(url, folder = "general") {
    if (!url) throw new Error("URL is required");
    return this.post(`${this.endpoint}/from-url`, { url, folder });
  }

  async deleteFile(fileId) {
    if (!fileId) throw new Error("File ID is required");
    return this.deleteRequest(`${this.endpoint}/${fileId}`);
  }

  async getFiles(params = {}) {
    const defaultParams = {
      page: 1,
      limit: 20,
      sort: '-uploadedAt',
      ...params
    };
    return this.get(this.endpoint, defaultParams);
  }

  async getFile(fileId) {
    if (!fileId) throw new Error("File ID is required");
    return this.get(`${this.endpoint}/${fileId}`);
  }

  async getFilesByFolder(folder, params = {}) {
    return this.get(this.endpoint, { ...params, folder });
  }

  async searchFiles(query, params = {}) {
    return this.get(`${this.endpoint}/search`, { q: query, ...params });
  }

  async getStorageStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async optimizeImage(fileId, options = {}) {
    if (!fileId) throw new Error("File ID is required");
    return this.post(`${this.endpoint}/${fileId}/optimize`, options);
  }

  async resizeImage(fileId, dimensions) {
    if (!fileId) throw new Error("File ID is required");
    if (!dimensions.width && !dimensions.height) {
      throw new Error("Width or height is required");
    }
    return this.post(`${this.endpoint}/${fileId}/resize`, dimensions);
  }
}

// ============================================
// Brochure API - Enhanced & Fixed
// ============================================

class BrochureAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/brochure";
  }

  /**
   * Get active brochure (public - no auth required)
   */
  async getActive() {
    console.log("📄 Fetching active brochure...");
    try {
      const response = await this.get(`${this.endpoint}/active`, {}, { 
        includeAuth: false 
      });
      return response;
    } catch (error) {
      console.warn("No active brochure found:", error.message);
      return { success: false, data: null, message: "No active brochure" };
    }
  }

  /**
   * Get all brochures (admin only)
   */
  async getAll(params = {}) {
    const defaultParams = {
      page: 1,
      limit: 20,
      sort: '-createdAt',
      ...params
    };
    
    try {
      const response = await this.get(this.endpoint, defaultParams);
      return response;
    } catch (error) {
      console.error("Error fetching brochures:", error.message);
      return { 
        success: false, 
        data: [], 
        count: 0, 
        message: error.message 
      };
    }
  }

  /**
   * Get brochure by ID
   */
  async getById(id) {
    if (!id) throw new Error("Brochure ID is required");
    return this.get(`${this.endpoint}/${id}`);
  }

  /**
   * Upload new brochure with file
   */
  async uploadBrochure(file, metadata = {}) {
    console.log("📤 Uploading brochure:", { 
      fileName: file?.name, 
      metadata 
    });

    if (!file) {
      throw new Error("PDF file is required");
    }

    if (!metadata.title) {
      throw new Error("Title is required");
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      throw new Error("Only PDF files are allowed");
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File size exceeds 20MB limit");
    }

    const additionalData = {
      title: metadata.title,
      description: metadata.description || "",
      version: metadata.version || "1.0",
      category: metadata.category || "general",
      tags: metadata.tags || [],
      isActive: String(metadata.isActive || false)
    };

    try {
      const response = await this.upload(
        `${this.endpoint}/upload`, 
        file, 
        additionalData, 
        { includeAuth: true }
      );
      
      console.log("✅ Brochure uploaded successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Brochure upload failed:", error);
      throw error;
    }
  }

  /**
   * Create brochure metadata (without file)
   */
  async create(data) {
    console.log("📝 Creating brochure entry:", data);
    
    if (!data.title) {
      throw new Error("Title is required");
    }
    
    return this.post(this.endpoint, data);
  }

  /**
   * Update brochure metadata
   */
  async update(id, data) {
    if (!id) throw new Error("Brochure ID is required");
    console.log("📝 Updating brochure:", { id, data });
    return this.put(`${this.endpoint}/${id}`, data);
  }

  /**
   * Replace brochure file
   */
  async replaceFile(id, file) {
    if (!id) throw new Error("Brochure ID is required");
    if (!file) throw new Error("PDF file is required");
    
    console.log("🔄 Replacing brochure file:", { id, fileName: file.name });
    return this.upload(`${this.endpoint}/${id}/replace`, file);
  }

  /**
   * Activate a specific brochure
   */
  async activate(id) {
    if (!id) throw new Error("Brochure ID is required");
    console.log("✅ Activating brochure:", id);
    return this.patch(`${this.endpoint}/${id}/activate`, {});
  }

  /**
   * Deactivate a specific brochure
   */
  async deactivate(id) {
    if (!id) throw new Error("Brochure ID is required");
    console.log("⏸️ Deactivating brochure:", id);
    return this.patch(`${this.endpoint}/${id}/deactivate`, {});
  }

  /**
   * Delete a brochure
   */
  async delete(id) {
    if (!id) throw new Error("Brochure ID is required");
    console.log("🗑️ Deleting brochure:", id);
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  /**
   * Get download URL for a brochure
   */
  getDownloadUrl(fileUrl) {
    if (!fileUrl) return null;
    
    // If already a full URL, return as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    // Build full URL
    const baseUrl = this.baseURL.replace('/api', '');
    return `${baseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  }

  /**
   * Download brochure file
   */
  async downloadBrochure(id, fileName = 'brochure.pdf') {
    if (!id) throw new Error("Brochure ID is required");
    
    try {
      const response = await fetch(`${this.baseURL}${this.endpoint}/${id}/download`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Track download
      this.trackDownload(id);
      
      return { success: true };
    } catch (error) {
      console.error("Download failed:", error);
      throw error;
    }
  }

  /**
   * Track download count
   */
  async trackDownload(id) {
    if (!id) return;
    try {
      await this.patch(`${this.endpoint}/${id}/track-download`, {});
    } catch (error) {
      console.warn("Failed to track download:", error.message);
    }
  }

  /**
   * Get brochure statistics
   */
  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  /**
   * Search brochures
   */
  async search(query, params = {}) {
    return this.get(`${this.endpoint}/search`, { q: query, ...params });
  }

  /**
   * Get brochure categories
   */
  async getCategories() {
    return this.get(`${this.endpoint}/categories`);
  }

  /**
   * Get brochures by category
   */
  async getByCategory(category, params = {}) {
    return this.get(this.endpoint, { ...params, category });
  }
}

// ============================================
// Analytics API (New)
// ============================================

class AnalyticsAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/analytics";
  }

  async getPageViews(period = '7days') {
    return this.get(`${this.endpoint}/pageviews`, { period });
  }

  async getVisitorStats(period = '7days') {
    return this.get(`${this.endpoint}/visitors`, { period });
  }

  async getTopPages(limit = 10, period = '7days') {
    return this.get(`${this.endpoint}/top-pages`, { limit, period });
  }

  async getTrafficSources(period = '7days') {
    return this.get(`${this.endpoint}/traffic-sources`, { period });
  }

  async getDeviceStats(period = '7days') {
    return this.get(`${this.endpoint}/devices`, { period });
  }

  async getBrowserStats(period = '7days') {
    return this.get(`${this.endpoint}/browsers`, { period });
  }

  async getConversionRate(period = '7days') {
    return this.get(`${this.endpoint}/conversion-rate`, { period });
  }

  async trackEvent(eventName, data = {}) {
    return this.post(`${this.endpoint}/track`, { 
      event: eventName, 
      ...data 
    }, { includeAuth: false });
  }
}

// ============================================
// Create and Export API Instances
// ============================================

// Create singleton instances
export const apiService = new ApiService();
export const authAPI = new AuthAPI();
export const galleryAPI = new GalleryAPI();
export const enquiryAPI = new EnquiryAPI();
export const productAPI = new ProductAPI();
export const serviceAPI = new ServiceAPI();
export const clientAPI = new ClientAPI();
export const dashboardAPI = new DashboardAPI();
export const settingsAPI = new SettingsAPI();
export const uploadAPI = new UploadAPI();
export const brochureAPI = new BrochureAPI();
export const analyticsAPI = new AnalyticsAPI();

// ============================================
// Default Export - API Object
// ============================================

const api = {
  // Base service
  service: apiService,
  
  // Auth shortcuts
  login: (credentials) => authAPI.login(credentials),
  register: (userData) => authAPI.register(userData),
  logout: () => authAPI.logout(),
  getProfile: () => authAPI.getProfile(),
  updateProfile: (data) => authAPI.updateProfile(data),
  isAuthenticated: () => authAPI.isAuthenticated(),
  getCurrentUser: () => authAPI.getCurrentUser(),
  
  // API instances
  auth: authAPI,
  gallery: galleryAPI,
  enquiry: enquiryAPI,
  product: productAPI,
  service: serviceAPI,
  client: clientAPI,
  dashboard: dashboardAPI,
  settings: settingsAPI,
  upload: uploadAPI,
  brochure: brochureAPI,
  analytics: analyticsAPI,
  
  // Utility methods
  setToken: (token) => apiService.setToken(token),
  removeToken: () => apiService.removeToken(),
  getToken: () => apiService.getToken(),
  healthCheck: () => apiService.healthCheck(),
};

export default api;

// ============================================
// React Hooks for API Usage
// ============================================

export const useApi = () => {
  return {
    auth: authAPI,
    gallery: galleryAPI,
    enquiry: enquiryAPI,
    product: productAPI,
    service: serviceAPI,
    client: clientAPI,
    dashboard: dashboardAPI,
    settings: settingsAPI,
    upload: uploadAPI,
    brochure: brochureAPI,
    analytics: analyticsAPI,
  };
};

// ============================================
// Initialize API Configuration
// ============================================

// Set up global error handler
window.addEventListener('unhandledrejection', event => {
  if (event.reason?.status === 401) {
    console.log('🔒 Unauthorized access detected');
    apiService.handleUnauthorized();
  }
});

// Export API URL for debugging
export const API_CONFIG = {
  url: API_URL,
  timeout: REQUEST_TIMEOUT,
  environment: import.meta.env.MODE,
};

console.log('✅ API Service initialized:', API_CONFIG);