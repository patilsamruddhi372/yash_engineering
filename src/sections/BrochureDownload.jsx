// client/src/components/BrochureDownload.jsx
import React, { useState, useEffect } from 'react';
import { Download, FileText, AlertCircle, RefreshCw, Calendar, Eye } from 'lucide-react';
import { uploadAPI } from '../services/api'; // Use existing API service

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

      console.log('📄 Fetching active brochure...');

      // Try different endpoints
      let response;
      
      try {
        // Try custom brochure endpoint first
        response = await uploadAPI.get('/brochure/active');
        console.log('✅ Brochure API Response (custom):', response);
      } catch (err) {
        console.warn('⚠️ Custom endpoint failed, trying generic upload endpoint...');
        
        // Fallback to generic uploads endpoint with brochure filter
        response = await uploadAPI.getFiles({ 
          folder: 'brochure',
          active: true,
          limit: 1 
        });
        console.log('✅ Brochure API Response (generic):', response);
      }

      // Parse response
      let brochureData = null;

      if (response?.success && response?.brochure) {
        brochureData = response.brochure;
      } else if (response?.success && Array.isArray(response?.data) && response.data.length > 0) {
        brochureData = response.data[0];
      } else if (Array.isArray(response?.data) && response.data.length > 0) {
        brochureData = response.data[0];
      } else if (Array.isArray(response) && response.length > 0) {
        brochureData = response[0];
      }

      console.log('📊 Parsed brochure data:', brochureData);

      if (brochureData) {
        setBrochure({
          id: brochureData._id || brochureData.id,
          title: brochureData.title || brochureData.filename || 'Company Brochure',
          description: brochureData.description || 'Download our company brochure',
          downloadCount: brochureData.downloadCount || 0,
          fileUrl: brochureData.fileUrl || brochureData.url || brochureData.path,
          filename: brochureData.filename || brochureData.originalName || 'brochure.pdf',
          fileSize: brochureData.fileSize || brochureData.size,
          uploadedAt: brochureData.uploadedAt || brochureData.createdAt,
        });
      } else {
        setError('No active brochure found');
      }
    } catch (err) {
      console.error('❌ Error fetching brochure:', err);
      setError(err.message || 'Failed to load brochure');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!brochure) return;

    try {
      setDownloading(true);

      console.log('📥 Downloading brochure:', brochure);

      // Try to download via API endpoint first
      try {
        const downloadUrl = `/api/upload/brochure/download/${brochure.id}`;
        console.log('📥 Download URL:', downloadUrl);
        
        // Open in new tab
        window.open(downloadUrl, '_blank');
        
        // Update download count
        setTimeout(() => {
          setBrochure(prev => ({
            ...prev,
            downloadCount: (prev.downloadCount || 0) + 1
          }));
        }, 1000);
      } catch (err) {
        console.warn('⚠️ API download failed, trying direct file URL...');
        
        // Fallback to direct file URL
        if (brochure.fileUrl) {
          window.open(brochure.fileUrl, '_blank');
        } else {
          throw new Error('No download URL available');
        }
      }
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

  // Error State
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