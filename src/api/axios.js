// client/src/services/api.js
// ============================================
// API Service - Complete with GalleryAPI + BrochureAPI
// ============================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Request timeout
const REQUEST_TIMEOUT = 30000;

// ============================================
// Base API Service Class
// ============================================

class ApiService {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
  }

  getToken() {
    try {
      return (
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        ""
      );
    } catch {
      return "";
    }
  }

  setToken(token) {
    try {
      localStorage.setItem("adminToken", token);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  }

  removeToken() {
    try {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getHeaders(options = {}) {
    const { includeAuth = true, contentType = "application/json" } = options;

    const headers = {
      Accept: "application/json",
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

    return headers;
  }

  async handleResponse(response) {
    if (response.status === 204) {
      return { success: true, message: "Deleted successfully" };
    }

    const contentType = response.headers.get("content-type");

    if (!contentType || response.headers.get("content-length") === "0") {
      if (response.ok) {
        return { success: true };
      }
    }

    let data;

    if (contentType?.includes("application/json")) {
      try {
        const text = await response.text();
        if (!text || text.trim() === "") {
          data = { success: response.ok };
        } else {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        if (response.ok) {
          return { success: true };
        }
        data = { message: "Invalid response format" };
      }
    } else {
      const text = await response.text();
      if (response.ok) {
        return { success: true, message: text || "Success" };
      }
      data = { message: text || "Unknown error" };
    }

    if (!response.ok) {
      const error = new Error(
        data.message || data.error || `HTTP Error: ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  handleUnauthorized() {
    this.removeToken();
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/admin/login";
    }
  }

  async request(endpoint, options = {}) {
    const {
      method = "GET",
      data = null,
      params = {},
      includeAuth = true,
      contentType = "application/json",
      timeout = REQUEST_TIMEOUT,
    } = options;

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestConfig = {
      method,
      headers: this.getHeaders({ includeAuth, contentType }),
      signal: controller.signal,
    };

    if (data && method !== "GET") {
      if (data instanceof FormData) {
        requestConfig.body = data;
        delete requestConfig.headers["Content-Type"];
      } else {
        requestConfig.body = JSON.stringify(data);
      }
    }

    console.log("🚀 API Request:", { method, url, data });

    try {
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);

      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error("Unauthorized. Please login again.");
      }

      const result = await this.handleResponse(response);

      console.log("✅ API Response:", {
        url,
        status: response.status,
        data: result,
      });

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      console.error("❌ API Request Failed:", {
        url,
        method,
        error: error.message,
        status: error.status,
        data: error.data,
      });

      if (error.name === "AbortError") {
        const timeoutError = new Error(
          "Request timed out. Please try again."
        );
        timeoutError.status = 408;
        throw timeoutError;
      }

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

  async upload(endpoint, files, additionalData = {}, options = {}) {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((file) => formData.append("files", file));
    } else if (files instanceof File) {
      formData.append("file", files);
    } else if (typeof files === "object") {
      Object.entries(files).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((file) => formData.append(key, file));
        } else {
          formData.append(key, value);
        }
      });
    }

    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : String(value)
        );
      }
    });

    return this.request(endpoint, {
      ...options,
      method: "POST",
      data: formData,
      contentType: null,
    });
  }
}

// ============================================
// Auth API
// ============================================

class AuthAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/auth";
  }

  async login(credentials) {
    console.log("🔐 AuthAPI.login called with:", credentials);

    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const response = await this.post(
      `${this.endpoint}/login`,
      { email, password },
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

  async register(userData) {
    return this.post(`${this.endpoint}/register`, userData, {
      includeAuth: false,
    });
  }

  async logout() {
    try {
      await this.post(`${this.endpoint}/logout`, {});
    } finally {
      this.removeToken();
    }
    return { success: true };
  }

  async getProfile() {
    return this.get(`${this.endpoint}/profile`);
  }

  async updateProfile(data) {
    return this.put(`${this.endpoint}/profile`, data);
  }

  async changePassword(currentPassword, newPassword) {
    return this.put(`${this.endpoint}/password`, {
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

  async verifyToken() {
    return this.get(`${this.endpoint}/verify`);
  }
}

// ============================================
// Gallery API
// ============================================

class GalleryAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/gallery";
  }

  async getAll(params = {}) {
    console.log("📷 GalleryAPI.getAll called with params:", params);
    return this.get(this.endpoint, params);
  }

  async getImages(params = {}) {
    return this.getAll(params);
  }

  async getGallery(params = {}) {
    return this.getAll(params);
  }

  async getImage(id) {
    if (!id) throw new Error("Image ID is required");
    return this.get(`${this.endpoint}/${id}`);
  }

  async getById(id) {
    return this.getImage(id);
  }

  async getCount() {
    return this.get(`${this.endpoint}/count`);
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async uploadImage(file, data = {}) {
    console.log("📤 GalleryAPI.uploadImage called");
    return super.upload(this.endpoint, file, data);
  }

  async uploadImages(files, data = {}) {
    console.log("📤 GalleryAPI.uploadImages called with", files.length, "files");
    return super.upload(`${this.endpoint}/multiple`, files, data);
  }

  async create(data) {
    console.log("📤 GalleryAPI.create called with:", data);
    return this.post(this.endpoint, data);
  }

  async update(id, data) {
    if (!id) throw new Error("Gallery item ID is required");
    console.log("📝 GalleryAPI.update called:", { id, data });
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id) {
    if (!id) throw new Error("Gallery item ID is required");
    console.log("🗑️ GalleryAPI.delete called with id:", id);
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of gallery item IDs is required");
    }
    console.log("🗑️ GalleryAPI.bulkDelete called with ids:", ids);
    return this.post(`${this.endpoint}/bulk/delete`, { ids });
  }

  async toggleFeatured(id) {
    if (!id) throw new Error("Gallery item ID is required");
    return this.patch(`${this.endpoint}/${id}/featured`, {});
  }

  async getByCategory(category, params = {}) {
    return this.get(this.endpoint, { ...params, category });
  }

  async getFeatured(limit = 10) {
    return this.get(`${this.endpoint}/featured`, { limit });
  }

  async reorder(orderedIds) {
    if (!Array.isArray(orderedIds)) {
      throw new Error("Array of ordered IDs is required");
    }
    return this.put(`${this.endpoint}/reorder`, { orderedIds });
  }
}

// ============================================
// Enquiry API
// ============================================

class EnquiryAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/enquiries";
  }

  async createEnquiry(data) {
    return this.post(this.endpoint, data, { includeAuth: false });
  }

  async getEnquiries(params = {}) {
    return this.get(this.endpoint, params);
  }

  async getAll(params = {}) {
    return this.getEnquiries(params);
  }

  async getEnquiry(id) {
    return this.get(`${this.endpoint}/${id}`);
  }

  async updateEnquiry(id, data) {
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async deleteEnquiry(id) {
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async bulkUpdate(ids, action, value = null) {
    return this.put(`${this.endpoint}/bulk`, { ids, action, value });
  }

  async exportEnquiries(format = "csv", params = {}) {
    return this.get(`${this.endpoint}/export`, { ...params, format });
  }
}

// ============================================
// Product API
// ============================================

class ProductAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/products";
  }

  async getProducts(params = {}, options = {}) {
    const { includeAuth = true } = options;
    return this.get(this.endpoint, params, { includeAuth });
  }

  async getAll(params = {}, options = {}) {
    return this.getProducts(params, options);
  }

  async getProduct(idOrSlug, options = {}) {
    const { includeAuth = true } = options;
    return this.get(`${this.endpoint}/${idOrSlug}`, {}, { includeAuth });
  }

  async getById(id, options = {}) {
    return this.getProduct(id, options);
  }

  async getCategories(options = {}) {
    const { includeAuth = false } = options;
    return this.get(`${this.endpoint}/categories`, {}, { includeAuth });
  }

  async getFeatured(options = {}) {
    const { includeAuth = false } = options;
    return this.get(`${this.endpoint}/featured`, {}, { includeAuth });
  }

  async createProduct(data) {
    return this.post(this.endpoint, data);
  }

  async create(data) {
    return this.createProduct(data);
  }

  async updateProduct(id, data) {
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async update(id, data) {
    return this.updateProduct(id, data);
  }

  async deleteProduct(id) {
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async delete(id) {
    return this.deleteProduct(id);
  }

  async uploadImages(productId, files) {
    return this.upload(`${this.endpoint}/${productId}/images`, files);
  }

  async deleteImage(productId, imageId) {
    return this.deleteRequest(`${this.endpoint}/${productId}/images/${imageId}`);
  }
}

// ============================================
// Service API
// ============================================

class ServiceAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/services";
  }

  async getServices(params = {}) {
    return this.get(this.endpoint, params, { includeAuth: false });
  }

  async getAll(params = {}) {
    return this.getServices(params);
  }

  async getService(idOrSlug) {
    return this.get(`${this.endpoint}/${idOrSlug}`, {}, { includeAuth: false });
  }

  async getById(id) {
    return this.getService(id);
  }

  async getFeaturedServices() {
    return this.get(`${this.endpoint}/featured`, {}, { includeAuth: false });
  }

  async getFeatured() {
    return this.getFeaturedServices();
  }

  async getCategories() {
    return this.get(`${this.endpoint}/categories`, {}, { includeAuth: false });
  }

  async createService(data) {
    console.log("📤 ServiceAPI.createService called with:", data);
    return this.post(this.endpoint, data);
  }

  async create(data) {
    return this.createService(data);
  }

  async updateService(id, data) {
    if (!id) throw new Error("Service ID is required for update");
    console.log("📤 ServiceAPI.updateService called:", { id, data });
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async update(id, data) {
    return this.updateService(id, data);
  }

  async deleteService(id) {
    if (!id) throw new Error("Service ID is required for delete");
    console.log("🗑️ ServiceAPI.deleteService called with id:", id);
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async delete(id) {
    return this.deleteService(id);
  }

  async remove(id) {
    return this.deleteService(id);
  }

  async uploadImages(serviceId, files) {
    if (!serviceId) throw new Error("Service ID is required for image upload");
    return this.upload(`${this.endpoint}/${serviceId}/images`, files);
  }

  async deleteImage(serviceId, imageId) {
    if (!serviceId || !imageId)
      throw new Error("Service ID and Image ID are required");
    return this.deleteRequest(`${this.endpoint}/${serviceId}/images/${imageId}`);
  }

  async toggleFeatured(id) {
    if (!id) throw new Error("Service ID is required");
    return this.patch(`${this.endpoint}/${id}/featured`, {});
  }

  async toggleActive(id) {
    if (!id) throw new Error("Service ID is required");
    return this.patch(`${this.endpoint}/${id}/active`, {});
  }

  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of service IDs is required");
    }
    return this.post(`${this.endpoint}/bulk/delete`, { ids });
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

  async exportServices(format = "csv", params = {}) {
    return this.get(`${this.endpoint}/export`, { ...params, format });
  }
}

// ============================================
// Client API
// ============================================

class ClientAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/clients";
  }

  async getClients(params = {}) {
    return this.get(this.endpoint, params);
  }

  async getAll(params = {}) {
    return this.getClients(params);
  }

  async getClient(id) {
    return this.get(`${this.endpoint}/${id}`);
  }

  async getById(id) {
    return this.getClient(id);
  }

  async createClient(data) {
    return this.post(this.endpoint, data);
  }

  async create(data) {
    return this.createClient(data);
  }

  async updateClient(id, data) {
    return this.put(`${this.endpoint}/${id}`, data);
  }

  async update(id, data) {
    return this.updateClient(id, data);
  }

  async deleteClient(id) {
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  async delete(id) {
    return this.deleteClient(id);
  }

  async bulkDelete(ids) {
    return this.post(`${this.endpoint}/bulk/delete`, { ids });
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async exportClients(format = "csv", params = {}) {
    return this.get(`${this.endpoint}/export`, { ...params, format });
  }

  async toggleActive(id) {
    return this.patch(`${this.endpoint}/${id}/active`, {});
  }

  async getClientActivity(id, params = {}) {
    return this.get(`${this.endpoint}/${id}/activity`, params);
  }
}

// ============================================
// Dashboard API
// ============================================

class DashboardAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/dashboard";
  }

  async getStats() {
    return this.get(`${this.endpoint}/stats`);
  }

  async getOverview() {
    return this.get(`${this.endpoint}/overview`);
  }

  async getRecentEnquiries(limit = 5) {
    return this.get(`${this.endpoint}/recent-enquiries`, { limit });
  }

  async getEnquiryTrends(period = "7days") {
    return this.get(`${this.endpoint}/trends`, { period });
  }

  async getTopProducts(limit = 5) {
    return this.get(`${this.endpoint}/top-products`, { limit });
  }
}

// ============================================
// Settings API
// ============================================

class SettingsAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/settings";
  }

  async getSettings() {
    return this.get(this.endpoint);
  }

  async updateSettings(data) {
    return this.put(this.endpoint, data);
  }

  async getPublicSettings() {
    return this.get(`${this.endpoint}/public`, {}, { includeAuth: false });
  }

  async uploadLogo(file) {
    return this.upload(`${this.endpoint}/logo`, file);
  }
}

// ============================================
// Upload API
// ============================================

class UploadAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/uploads";
  }

  async uploadFile(file, folder = "general") {
    return this.upload(this.endpoint, file, { folder });
  }

  async uploadMultiple(files, folder = "general") {
    return this.upload(`${this.endpoint}/multiple`, files, { folder });
  }

  async deleteFile(fileId) {
    return this.deleteRequest(`${this.endpoint}/${fileId}`);
  }

  async getFiles(params = {}) {
    return this.get(this.endpoint, params);
  }
}

// ============================================
// Brochure API (FIXED)
// ============================================

class BrochureAPI extends ApiService {
  constructor() {
    super();
    this.endpoint = "/brochure";
  }

  /**
   * Get active brochure (public - no auth required)
   * GET /api/brochure/active
   */
  async getActive() {
    console.log("📄 BrochureAPI.getActive called");
    try {
      return await this.get(`${this.endpoint}/active`, {}, { includeAuth: false });
    } catch (error) {
      console.warn("No active brochure found:", error.message);
      return { success: false, data: null };
    }
  }

  /**
   * Get all brochures
   * GET /api/brochure
   */
  async getAll(params = {}) {
    console.log("📄 BrochureAPI.getAll called");
    try {
      return await this.get(this.endpoint, params);
    } catch (error) {
      console.error("Error fetching brochures:", error.message);
      return { success: false, data: [], count: 0 };
    }
  }

  /**
   * Get brochure by ID
   * GET /api/brochure/:id
   */
  async getById(id) {
    if (!id) throw new Error("Brochure ID is required");
    return this.get(`${this.endpoint}/${id}`);
  }

  /**
   * Upload brochure with file
   * POST /api/brochure/upload
   */
  async uploadBrochure(file, metadata = {}) {
    console.log("📤 BrochureAPI.uploadBrochure called:", {
      fileName: file?.name,
      metadata
    });

    if (!file) {
      throw new Error("File is required");
    }

    if (!metadata.title) {
      throw new Error("Title is required");
    }

    const additionalData = {
      title: metadata.title,
      description: metadata.description || "",
      isActive: String(metadata.isActive || false)
    };

    // POST /api/brochure/upload
    return super.upload(`${this.endpoint}/upload`, file, additionalData, {
      includeAuth: true
    });
  }

  /**
   * Create brochure (without file upload - just metadata)
   * POST /api/brochure
   */
  async create(data) {
    console.log("📤 BrochureAPI.create called:", data);
    return this.post(this.endpoint, data);
  }

  /**
   * Update brochure
   * PUT /api/brochure/:id
   */
  async update(id, data) {
    if (!id) throw new Error("Brochure ID is required");
    console.log("📝 BrochureAPI.update called:", { id, data });
    return this.put(`${this.endpoint}/${id}`, data);
  }

  /**
   * Activate a brochure
   * PATCH /api/brochure/:id/activate
   */
  async activate(id) {
    if (!id) throw new Error("Brochure ID is required");
    console.log("✅ BrochureAPI.activate called:", id);
    return this.patch(`${this.endpoint}/${id}/activate`, {});
  }

  /**
   * Deactivate a brochure
   * PATCH /api/brochure/:id/deactivate
   */
  async deactivate(id) {
    if (!id) throw new Error("Brochure ID is required");
    console.log("⏸️ BrochureAPI.deactivate called:", id);
    return this.patch(`${this.endpoint}/${id}/deactivate`, {});
  }

  /**
   * Delete brochure
   * DELETE /api/brochure/:id
   */
  async delete(id) {
    if (!id) throw new Error("Brochure ID is required");
    console.log("🗑️ BrochureAPI.delete called:", id);
    return this.deleteRequest(`${this.endpoint}/${id}`);
  }

  /**
   * Get download URL for a brochure
   */
  getDownloadUrl(fileUrl) {
    if (!fileUrl) return null;
    
    // If already a full URL, return as is
    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }
    
    // Build full URL from base
    const baseUrl = this.baseURL.replace("/api", "");
    return `${baseUrl}${fileUrl}`;
  }

  /**
   * Track download (optional - increment download count)
   */
  async trackDownload(id) {
    if (!id) return;
    try {
      return await this.patch(`${this.endpoint}/${id}/download`, {});
    } catch (error) {
      console.warn("Failed to track download:", error.message);
    }
  }
}

// ============================================
// Create API Instances
// ============================================

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

// Default export for compatibility
const api = {
  // auth helpers
  login: (credentials) => authAPI.login(credentials),
  register: (userData) => authAPI.register(userData),
  logout: () => authAPI.logout(),
  getProfile: () => authAPI.getProfile(),
  updateProfile: (data) => authAPI.updateProfile(data),

  // instances
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
};

export default api;

// ============================================
// React Hook for API Calls
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
  };
};