// client/src/components/BrochureDownload.jsx
import React, { useState, useEffect } from 'react';
import { Download, FileText, AlertCircle, RefreshCw, Calendar, Eye } from 'lucide-react';
import { brochureAPI } from '../api/brochureApi'; // ✅ Use brochureAPI, not uploadAPI

const BrochureDownload = () => {
  const [brochure, setBrochure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchActiveBrochure();
  }, []);

  const fetchActiveBrochure = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📄 Fetching active brochure (via brochureAPI.getActive)...');

      const response = await brochureAPI.getActive();
      console.log('✅ brochureAPI.getActive response:', response);

      if (response?.success && response?.data) {
        const b = response.data;
        const mapped = {
          id: b._id || b.id,
          title: b.title || b.fileName || 'Company Brochure',
          description: b.description || 'Download our company brochure',
          downloadCount: b.downloadCount || 0,
          fileUrl: b.fileUrl,
          filename: b.fileName || 'brochure.pdf',
          fileSize: b.fileSize,
          uploadedAt: b.createdAt,
        };
        console.log('📊 Parsed brochure data:', mapped);
        setBrochure(mapped);
      } else {
        console.warn('⚠️ No active brochure in response');
        setBrochure(null);
        setError(response?.message || 'No active brochure found');
      }
    } catch (err) {
      console.error('❌ Error fetching brochure:', err);
      setError(err.message || 'Failed to load brochure');
      setBrochure(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!brochure) return;

    try {
      setDownloading(true);
      console.log('📥 Downloading brochure:', brochure);

      if (!brochure.fileUrl) {
        throw new Error('No fileUrl available for brochure');
      }

      const downloadUrl = brochureAPI.getDownloadUrl(brochure.fileUrl);
      console.log('📥 Download URL:', downloadUrl);
      window.open(downloadUrl, '_blank');

      // Optimistically update download count in UI
      setTimeout(() => {
        setBrochure(prev =>
          prev
            ? { ...prev, downloadCount: (prev.downloadCount || 0) + 1 }
            : prev
        );
      }, 1000);
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Failed to download brochure. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading brochure...</p>
        </div>
      </div>
    );
  }

  // Error or no brochure
  if (error || !brochure) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">
              No Brochure Available
            </h3>
            <p className="text-sm text-red-700 mb-3">
              {error || 'No active brochure found in the system.'}
            </p>
            <button
              onClick={fetchActiveBrochure}
              className="text-sm px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Brochure Available
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-4 bg-yellow-400 rounded-xl">
          <FileText className="w-8 h-8 text-gray-900" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {brochure.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {brochure.description}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            {brochure.fileSize && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{formatFileSize(brochure.fileSize)}</span>
              </div>
            )}
            {brochure.uploadedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(brochure.uploadedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{brochure.downloadCount} downloads</span>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Brochure
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrochureDownload;