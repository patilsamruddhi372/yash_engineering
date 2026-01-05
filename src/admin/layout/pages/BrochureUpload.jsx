// client/src/components/admin/BrochureUpload.jsx
import React, { useState, useEffect } from "react";
import { brochureAPI } from "../../services/api";
import { 
  Upload, 
  Trash2, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Replace
} from "lucide-react";

const BrochureUpload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentBrochure, setCurrentBrochure] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchCurrentBrochure();
  }, []);

  const fetchCurrentBrochure = async () => {
    setLoading(true);
    try {
      const response = await brochureAPI.getAll();
      console.log("Fetched brochures:", response);
      
      if (response.success && response.data && response.data.length > 0) {
        // Get the first (and only) brochure
        setCurrentBrochure(response.data[0]);
        setShowUploadForm(false);
      } else {
        setCurrentBrochure(null);
        setShowUploadForm(true);
      }
    } catch (error) {
      console.error("Error fetching brochure:", error);
      setCurrentBrochure(null);
      setShowUploadForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    console.log("📤 Uploading file:", {
      fileName: file.name,
      fileSize: file.size,
      title: title,
    });

    setUploading(true);

    try {
      // If there's an existing brochure, delete it first
      if (currentBrochure) {
        console.log("🗑️ Deleting existing brochure first...");
        await brochureAPI.delete(currentBrochure._id);
      }

      // Upload new brochure (always set as active since we only have one)
      const response = await brochureAPI.uploadBrochure(file, {
        title: title.trim(),
        description: description.trim(),
        isActive: true // Always active since only one brochure
      });

      console.log("Upload response:", response);

      if (response.success) {
        alert("✅ Brochure uploaded successfully!");
        resetForm();
        fetchCurrentBrochure();
      } else {
        alert(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setShowUploadForm(false);
    const input = document.getElementById("brochure-file-input");
    if (input) input.value = "";
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      
      if (!validTypes.includes(selectedFile.type)) {
        alert("Please select a valid file (PDF, DOC, DOCX, PPT, PPTX)");
        return;
      }

      // Validate file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB");
        return;
      }

      console.log("Selected brochure file:", selectedFile);
      setFile(selectedFile);
    }
  };

  const handleDelete = async () => {
    if (!currentBrochure) return;

    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete the current brochure?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await brochureAPI.delete(currentBrochure._id);
      
      if (response.success) {
        alert("✅ Brochure deleted successfully");
        setCurrentBrochure(null);
        setShowUploadForm(true);
      } else {
        alert(response.message || "Failed to delete brochure");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete brochure");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    if (!currentBrochure) return;
    
    const downloadUrl = brochureAPI.getDownloadUrl(currentBrochure.fileUrl);
    window.open(downloadUrl, "_blank");
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading brochure...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-yellow-500" />
            Brochure Management
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage your company brochure. Only one brochure can be active at a time.
          </p>
        </div>
        <button
          onClick={fetchCurrentBrochure}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Current Brochure Display */}
      {currentBrochure && !showUploadForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4">
            <div className="flex items-center gap-2 text-black">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Active Brochure</span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* File Icon */}
              <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              
              {/* Brochure Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {currentBrochure.title}
                </h3>
                {currentBrochure.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {currentBrochure.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {currentBrochure.fileName}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(currentBrochure.fileSize)}</span>
                  <span>•</span>
                  <span>Uploaded: {formatDate(currentBrochure.createdAt)}</span>
                  {currentBrochure.downloadCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{currentBrochure.downloadCount} downloads</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <Download className="w-4 h-4" />
                Preview / Download
              </button>
              
              <button
                onClick={() => setShowUploadForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition font-medium"
              >
                <Replace className="w-4 h-4" />
                Replace Brochure
              </button>
              
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? "Deleting..." : "Delete Brochure"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Brochure State */}
      {!currentBrochure && !showUploadForm && (
        <div className="bg-white rounded-xl shadow-lg border border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Brochure Uploaded
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your company brochure to make it available for download on the website.
          </p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-semibold"
          >
            <Upload className="w-5 h-5" />
            Upload Brochure
          </button>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-yellow-500" />
              {currentBrochure ? "Replace Brochure" : "Upload New Brochure"}
            </h3>
            {currentBrochure && (
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Uploading a new brochure will replace the existing one.
              </p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                placeholder="e.g., Company Brochure 2024"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition resize-none"
                placeholder="Brief description of the brochure contents..."
                rows="3"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="brochure-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="brochure-file-input"
                  className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition ${
                    file 
                      ? "border-green-400 bg-green-50" 
                      : "border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"
                  }`}
                >
                  {file ? (
                    <div className="text-center">
                      <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.size)} • Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, PPT, PPTX (max 50MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading || !file || !title.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {currentBrochure ? "Replace Brochure" : "Upload Brochure"}
                  </>
                )}
              </button>
              
              {currentBrochure && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowUploadForm(false);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Only one brochure can be active at a time</li>
              <li>Uploading a new brochure will replace the existing one</li>
              <li>The brochure will be available for download on your website's navbar</li>
              <li>Supported formats: PDF, DOC, DOCX, PPT, PPTX (max 50MB)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrochureUpload;