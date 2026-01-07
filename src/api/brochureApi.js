// client/src/api/brochureApi.js

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// This must match your working list endpoint (GET http://localhost:5000/api/brochure)
const ENDPOINT = "/brochure";

const brochureAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

brochureAxios.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

brochureAxios.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error)
);

export const brochureAPI = {
  async getActive() {
    try {
      const res = await brochureAxios.get(ENDPOINT);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const active =
        list.find((b) => b.isActive) || list[0] || null;

      if (!active) {
        return {
          success: false,
          data: null,
          message: "No active brochure found",
        };
      }

      return {
        success: true,
        data: active,
      };
    } catch (error) {
      console.warn("Failed to get active brochure from list:", error);
      return {
        success: false,
        data: null,
        message: error.message || "Failed to get active brochure",
      };
    }
  },

  async getAll(params = {}) {
    return brochureAxios.get(ENDPOINT, { params });
  },

  async getById(id) {
    if (!id) throw new Error("Brochure ID is required");
    return brochureAxios.get(`${ENDPOINT}/${id}`);
  },

  // 🔧 FIXED HERE
  async uploadBrochure(file, metadata = {}) {
    if (!file) throw new Error("File is required");
    if (!metadata.title) throw new Error("Title is required");

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (!validTypes.includes(file.type)) {
      throw new Error("Only PDF, DOC, DOCX, PPT, PPTX files are allowed");
    }
    if (file.size > 50 * 1024 * 1024) {
      throw new Error("File size must be less than 50MB");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", metadata.title);
    formData.append("description", metadata.description || "");
    formData.append("isActive", String(metadata.isActive ?? true));

    // ⬇️ CHANGE: use POST /api/brochure instead of /api/brochure/upload
    return brochureAxios.post(ENDPOINT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async update(id, data) {
    if (!id) throw new Error("Brochure ID is required");
    return brochureAxios.put(`${ENDPOINT}/${id}`, data);
  },

  async delete(id) {
    if (!id) throw new Error("Brochure ID is required");
    return brochureAxios.delete(`${ENDPOINT}/${id}`);
  },

  getDownloadUrl(fileUrl) {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }
    const base = API_BASE_URL.replace("/api", "");
    return `${base}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
  },
};