// client/src/sections/Gallery.jsx or client/src/pages/Gallery.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid3X3, Camera, AlertCircle, RefreshCw, Plus, ChevronDown } from 'lucide-react';
import { galleryAPI } from '../api/axios';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  // ✅ Pagination state
  const [displayCount, setDisplayCount] = useState(6); // Initially show 6 images
  const IMAGES_PER_LOAD = 6; // Load 6 more on each click

  // Fetch images from backend
  const loadGallery = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🖼️ Fetching gallery images...');

      const res = await galleryAPI.getAll();

      console.log('✅ Gallery API Response:', res);

      let list = [];

      // Parse response structure
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.images)) {
        list = res.images;
      } else if (res.success && Array.isArray(res.data)) {
        list = res.data;
      } else {
        console.warn('⚠️ Unexpected gallery response structure:', res);
      }

      console.log(`📊 Found ${list.length} images in gallery`);

      // Normalize image data
      const normalized = list.map((img, idx) => {
        const imageUrl = img.imageUrl || img.url || img.image || '';
        
        console.log(`📷 Image ${idx + 1}:`, {
          id: img._id || img.id,
          title: img.title || img.name,
          url: imageUrl,
          category: img.category
        });

        return {
          _id: img._id || img.id || `img-${Date.now()}-${idx}`,
          url: imageUrl,
          title: img.title || img.name || `Project ${idx + 1}`,
          category: img.category || 'Uncategorized',
          description: img.description || '',
        };
      });

      // Filter out images without valid URLs
      const validImages = normalized.filter(img => img.url && img.url.trim() !== '');

      console.log(`✅ ${validImages.length} valid images loaded`);

      if (validImages.length === 0) {
        setError('No images found in gallery');
      }

      setImages(validImages);
    } catch (err) {
      console.error('❌ Failed to load gallery:', err);
      setError(err.message || 'Failed to load gallery.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // ✅ Reset display count when filter changes
  useEffect(() => {
    setDisplayCount(6);
  }, [activeFilter]);

  // Retry function
  const handleRetry = () => {
    loadGallery();
  };

  // Base categories
  const BASE_CATEGORIES = [
    { id: 'all', label: 'All Projects' },
    { id: 'Uncategorized', label: 'Uncategorized' },
    { id: 'Products', label: 'Products' },
    { id: 'Projects', label: 'Projects' },
    { id: 'Team', label: 'Team' },
    { id: 'Events', label: 'Events' },
  ];

  // Build final category list
  const categories = useMemo(() => {
    const baseIds = new Set(BASE_CATEGORIES.map(c => c.id));
    const extra = Array.from(
      new Set(
        images
          .map(img => img.category)
          .filter(cat => cat && !baseIds.has(cat))
      )
    ).map(cat => ({ id: cat, label: cat }));

    return [...BASE_CATEGORIES, ...extra];
  }, [images]);

  // Filter images
  const filteredImages = useMemo(() => {
    if (activeFilter === 'all') return images;
    return images.filter(img => img.category === activeFilter);
  }, [images, activeFilter]);

  // ✅ Slice images to show limited count
  const displayedImages = useMemo(() => {
    return filteredImages.slice(0, displayCount);
  }, [filteredImages, displayCount]);

  // ✅ Check if there are more images to show
  const hasMore = displayCount < filteredImages.length;
  const remainingCount = filteredImages.length - displayCount;

  // ✅ Load more function
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + IMAGES_PER_LOAD);
  };

  // ✅ Show all function
  const handleShowAll = () => {
    setDisplayCount(filteredImages.length);
  };

  // Handle image selection
  const handleSelect = (img, index) => {
    // ✅ Find the actual index in filteredImages for proper navigation
    const actualIndex = filteredImages.findIndex(i => i._id === img._id);
    setSelected(img);
    setSelectedIndex(actualIndex >= 0 ? actualIndex : index);
  };

  // Navigate to previous image
  const handlePrev = useCallback(
    (e) => {
      e.stopPropagation();
      if (!filteredImages.length) return;
      const newIndex =
        selectedIndex === 0 ? filteredImages.length - 1 : selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelected(filteredImages[newIndex]);
    },
    [selectedIndex, filteredImages]
  );

  // Navigate to next image
  const handleNext = useCallback(
    (e) => {
      e.stopPropagation();
      if (!filteredImages.length) return;
      const newIndex =
        selectedIndex === filteredImages.length - 1 ? 0 : selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelected(filteredImages[newIndex]);
    },
    [selectedIndex, filteredImages]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selected) return;
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'ArrowLeft') handlePrev(e);
      if (e.key === 'ArrowRight') handleNext(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, handlePrev, handleNext]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selected]);

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-sm font-semibold tracking-wide uppercase mb-4">
            <Camera className="w-4 h-4" />
            Our Portfolio
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Project Gallery
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our collection of completed projects showcasing our commitment
            to excellence and attention to detail.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Loading gallery...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Failed to Load Gallery
              </h3>
              <p className="text-red-700 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveFilter(cat.id);
                    setSelected(null);
                    setSelectedIndex(0);
                  }}
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300
                    ${
                      activeFilter === cat.id
                        ? 'bg-yellow-500 text-gray-900 shadow-md scale-105'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200 hover:border-yellow-400'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Gallery Grid - ✅ Now using displayedImages instead of filteredImages */}
            {displayedImages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedImages.map((img, index) => (
                    <div
                      key={img._id || index}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl 
                                 cursor-pointer shadow-sm hover:shadow-xl border-2 border-gray-200
                                 hover:border-yellow-400 transition-all duration-500"
                      onClick={() => handleSelect(img, index)}
                    >
                      {/* Image */}
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover transition-transform duration-700 
                                   group-hover:scale-110"
                        onError={(e) => {
                          console.error('❌ Failed to load image:', img.url);
                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                        }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                                      opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 
                                        group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {img.title}
                          </h3>
                          {img.category && (
                            <span className="inline-block px-3 py-1 bg-yellow-500 
                                             rounded-full text-sm text-gray-900 font-medium">
                              {img.category}
                            </span>
                          )}
                        </div>

                        {/* Zoom Icon */}
                        <div className="absolute top-4 right-4 p-3 bg-yellow-500 
                                        rounded-lg opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-300 transform scale-75 
                                        group-hover:scale-100">
                          <ZoomIn className="w-5 h-5 text-gray-900" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ See More / Load More Button */}
                {hasMore && (
                  <div className="mt-12 text-center">
                    <div className="inline-flex flex-col items-center gap-4">
                      {/* Progress indicator */}
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="h-1 w-24 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${(displayCount / filteredImages.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {displayedImages.length} of {filteredImages.length}
                        </span>
                      </div>

                      {/* Load More Button */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleLoadMore}
                          className="group inline-flex items-center justify-center gap-2 px-8 py-4 
                                     bg-gradient-to-r from-yellow-400 to-orange-500 
                                     text-gray-900 font-bold rounded-xl shadow-lg 
                                     hover:shadow-yellow-400/50 transition-all duration-300 
                                     hover:scale-105"
                        >
                          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                          Load More
                          <span className="px-2.5 py-1 bg-gray-900 text-yellow-400 text-xs font-bold rounded-full">
                            +{Math.min(IMAGES_PER_LOAD, remainingCount)}
                          </span>
                        </button>

                        {/* Show All Button (optional - for larger galleries) */}
                        {remainingCount > IMAGES_PER_LOAD && (
                          <button
                            onClick={handleShowAll}
                            className="inline-flex items-center justify-center gap-2 px-6 py-4 
                                       border-2 border-gray-300 text-gray-700 font-semibold 
                                       rounded-xl hover:border-yellow-400 hover:text-gray-900 
                                       transition-all duration-300"
                          >
                            <Grid3X3 className="w-5 h-5" />
                            Show All ({filteredImages.length})
                          </button>
                        )}
                      </div>

                      {/* Remaining count text */}
                      <p className="text-sm text-gray-500">
                        {remainingCount} more {remainingCount === 1 ? 'image' : 'images'} to explore
                      </p>
                    </div>
                  </div>
                )}

                {/* ✅ Show "Showing all" message when all images are displayed */}
                {!hasMore && filteredImages.length > 6 && (
                  <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-full">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-700 font-medium">
                        Showing all {filteredImages.length} images
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-20">
                <Grid3X3 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Images Found</h3>
                <p className="text-gray-500 text-lg mb-6">
                  {activeFilter === 'all'
                    ? 'The gallery is empty. Please add some images.'
                    : `No images in "${activeFilter}" category.`}
                </p>
                {activeFilter !== 'all' && (
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold transition-colors"
                  >
                    View All Projects
                  </button>
                )}
              </div>
            )}

            {/* Image Count - ✅ Updated to show displayed vs total */}
            {displayedImages.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500">
                  Showing <span className="font-semibold text-gray-900">{displayedImages.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{filteredImages.length}</span> projects
                  {activeFilter !== 'all' && (
                    <span className="text-yellow-600"> in {activeFilter}</span>
                  )}
                </p>
              </div>
            )}

            {/* Lightbox Modal */}
            {selected && (
              <div
                className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center 
                           justify-center z-50 animate-fadeIn"
                onClick={() => setSelected(null)}
              >
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-yellow-500 
                             rounded-lg transition-all duration-300 group z-10"
                  onClick={() => setSelected(null)}
                >
                  <X className="w-6 h-6 text-white group-hover:text-gray-900 group-hover:rotate-90 transition-all duration-300" />
                </button>

                {/* Navigation - Previous */}
                {filteredImages.length > 1 && (
                  <button
                    className="absolute left-4 md:left-8 p-3 md:p-4 bg-white/10 hover:bg-yellow-500 
                               rounded-lg transition-all duration-300 group z-10
                               hover:scale-110"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-gray-900
                                             group-hover:-translate-x-1 transition-all" />
                  </button>
                )}

                {/* Navigation - Next */}
                {filteredImages.length > 1 && (
                  <button
                    className="absolute right-4 md:right-8 p-3 md:p-4 bg-white/10 hover:bg-yellow-500 
                               rounded-lg transition-all duration-300 group z-10
                               hover:scale-110"
                    onClick={handleNext}
                  >
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-gray-900
                                              group-hover:translate-x-1 transition-all" />
                  </button>
                )}

                {/* Image Container */}
                <div
                  className="relative max-w-6xl max-h-[85vh] mx-4 animate-scaleIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={selected.url}
                    alt={selected.title}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border-4 border-yellow-500/20"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                    }}
                  />

                  {/* Image Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 
                                  bg-gradient-to-t from-black/90 to-transparent rounded-b-lg">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selected.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      {selected.category && (
                        <span className="px-4 py-1.5 bg-yellow-500 
                                         rounded-full text-sm text-gray-900 font-semibold">
                          {selected.category}
                        </span>
                      )}
                      <span className="text-white/70 text-sm font-medium">
                        {selectedIndex + 1} / {filteredImages.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {filteredImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 
                                  hidden md:flex gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-lg max-w-[90vw] overflow-x-auto">
                    {filteredImages.slice(0, 10).map((img, index) => (
                      <button
                        key={img._id || index}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(img, index);
                        }}
                        className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 flex-shrink-0
                          ${
                            selectedIndex === index
                              ? 'ring-2 ring-yellow-500 scale-110'
                              : 'opacity-50 hover:opacity-100'
                          }`}
                      >
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64x48?text=N/A';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}