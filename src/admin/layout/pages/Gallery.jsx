import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Image,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Grid,
  LayoutGrid,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Share2,
  Info,
  Check,
  ImagePlus,
  Folder,
  Calendar,
  HardDrive,
  Maximize2,
  Copy,
  Camera,
  Loader2,
  RefreshCw,
  AlignLeft,
  Tag,
  Settings,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Gallery() {
  // State variables
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [gridSize, setGridSize] = useState("medium");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editData, setEditData] = useState(null);

  // Category management state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState(null);
  const [categoryError, setCategoryError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryLoadError, setCategoryLoadError] = useState(null);
  
  // Category count state - tracks how many images in each category
  const [categoryCounts, setCategoryCounts] = useState({});

  const itemsPerPage =
    gridSize === "large" ? 8 : gridSize === "medium" ? 12 : 16;

  // Load data effects
  useEffect(() => {
    loadGalleryImages();
    loadCategories();
  }, []);

  // Categories for filter dropdown - combines saved categories and any categories used in images
  const categories = useMemo(() => {
    // Get categories from existing category list
    const managedCategories = categoryList
      .filter(cat => cat && typeof cat === 'object' && cat.name)
      .map(cat => cat.name);
    
    // Get categories from images that might not be in the category list
    const imageCategories = galleryImages
      .map(img => img.category?.trim())
      .filter(Boolean)
      .filter(cat => cat !== "Uncategorized");

    // Combine and remove duplicates
    const allCategories = [
      ...new Set([...managedCategories, ...imageCategories, "Uncategorized"]),
    ];

    // Sort alphabetically
    allCategories.sort((a, b) => a.localeCompare(b));

    return ["All", ...allCategories];
  }, [galleryImages, categoryList]);

  // Category options for dropdowns (without "All") - only shows saved categories
  const categoryOptions = useMemo(() => {
    // Only return categories from categoryList with valid name property
    return categoryList
      .filter(cat => cat && typeof cat === 'object' && cat.name)
      .map(cat => cat.name);
  }, [categoryList]);

  // Load gallery images from API
  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/gallery`);
      
      // Ensure we're setting an array
      const imagesData = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response.data.data) 
          ? response.data.data 
          : Array.isArray(response.data.images) 
            ? response.data.images 
            : [];
      
      setGalleryImages(imagesData);
      
      // Calculate category counts
      const counts = {};
      imagesData.forEach(img => {
        const category = img.category || "Uncategorized";
        counts[category] = (counts[category] || 0) + 1;
      });
      setCategoryCounts(counts);
      
    } catch (error) {
      console.error("Load gallery error:", error);
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Load categories from API with proper handling for your specific API response format
  // Update the loadCategories function to make sure we initialize counts for all categories:
const loadCategories = async () => {
  try {
    setCategoryLoading(true);
    setCategoryLoadError(null);
    
    console.log("Loading categories...");
    // Request gallery type categories
    const response = await axios.get(`${API_URL}/categories?type=gallery`);
    console.log("Categories response:", response.data);
    
    // Your API returns a specific structure: { success, count, stats, data }
    // where data contains the actual categories array
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      console.log(`Found ${response.data.data.length} categories in response.data.data`);
      const categoriesData = response.data.data;
      setCategoryList(categoriesData);
      
      // Initialize counts for all categories (setting to 0)
      const newCounts = {...categoryCounts};
      categoriesData.forEach(cat => {
        if (cat && cat.name && !newCounts[cat.name]) {
          newCounts[cat.name] = 0;
        }
      });
      setCategoryCounts(newCounts);
    } 
    else {
      console.error("Invalid categories response format:", response.data);
      setCategoryList([]);
      setCategoryLoadError("Unexpected API response format");
    }
  } catch (error) {
    console.error("Load categories error:", error);
    setCategoryList([]);
    setCategoryLoadError(error.message || "Failed to load categories");
  } finally {
    setCategoryLoading(false);
  }
};

  // Filter images based on search term and selected category
  const filteredImages = galleryImages.filter((image) => {
    const matchesSearch =
      image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      (image.category || "Uncategorized") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedImages = filteredImages.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Grid size classes
  const getGridClasses = () => {
    switch (gridSize) {
      case "small":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
      case "large":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      default:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4";
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload only image files");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          url: reader.result,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category: uploadCategory || "Uncategorized",
          description: "",
          alt: file.name,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });

        if (newPreviews.length === files.length) {
          setUploadPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Update preview description
  const updatePreviewDescription = (index, description) => {
    setUploadPreviews((prev) =>
      prev.map((item, i) => (i === index ? { ...item, description } : item))
    );
  };

  // Update preview title
  const updatePreviewTitle = (index, title) => {
    setUploadPreviews((prev) =>
      prev.map((item, i) => (i === index ? { ...item, title } : item))
    );
  };

  // Update preview category
  const updatePreviewCategory = (index, category) => {
    setUploadPreviews((prev) =>
      prev.map((item, i) => (i === index ? { ...item, category } : item))
    );
  };

  // Remove upload preview
  const removeUploadPreview = (index) => {
    setUploadPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Close upload modal
  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadPreviews([]);
    setUploadCategory("");
    setUploadDescription("");
  };

  // Handle upload submit
  const handleUploadSubmit = async () => {
    if (uploadPreviews.length === 0) {
      alert("Please select images to upload");
      return;
    }

    try {
      setSaving(true);

      const uploadPromises = uploadPreviews.map((preview) =>
        axios.post(`${API_URL}/gallery`, {
          title: preview.title,
          url: preview.url,
          category: preview.category || uploadCategory || "Uncategorized",
          description: preview.description || uploadDescription || "",
          alt: preview.alt,
          fileName: preview.fileName,
          fileSize: preview.fileSize,
          fileType: preview.fileType
        })
      );

      const responses = await Promise.all(uploadPromises);
      const newImages = responses.map((res) => 
        // Handle both direct and nested response formats
        res.data && res.data.data ? res.data.data : res.data
      );

      // Update gallery images state
      setGalleryImages((prev) => [...newImages, ...prev]);
      
      // Update category counts
      const newCounts = {...categoryCounts};
      uploadPreviews.forEach(preview => {
        const category = preview.category || uploadCategory || "Uncategorized";
        newCounts[category] = (newCounts[category] || 0) + 1;
      });
      setCategoryCounts(newCounts);
      
      setUploadPreviews([]);
      setUploadCategory("");
      setUploadDescription("");
      setShowUploadModal(false);

      alert(`Successfully uploaded ${newImages.length} image(s)!`);
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        "Error uploading images: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle edit image file
  const handleEditImageFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
        setEditData((prev) => ({ 
          ...prev, 
          url: reader.result,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit click
  const handleEditClick = (image) => {
    setSelectedImage(image);
    setEditData({
      ...image,
      _id: image._id || image.id,
      description: image.description || "",
    });
    setEditImagePreview(image.url);
    setShowEditModal(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditData(null);
    setEditImagePreview(null);
    setSelectedImage(null);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!editData.title) {
      alert("Please enter a title");
      return;
    }

    const imageId = editData._id || editData.id;

    try {
      setSaving(true);
      
      // Track category change for updating counts
      const oldCategory = selectedImage.category || "Uncategorized";
      const newCategory = editData.category || "Uncategorized";
      const categoryChanged = oldCategory !== newCategory;

      if (imageId) {
        const response = await axios.put(`${API_URL}/gallery/${imageId}`, {
          title: editData.title,
          url: editData.url,
          category: editData.category,
          description: editData.description || "",
          alt: editData.alt,
          fileName: editData.fileName,
          fileSize: editData.fileSize,
          fileType: editData.fileType
        });

        // Handle both direct and nested response formats
        const updatedImage = response.data && response.data.data 
          ? response.data.data 
          : response.data;

        setGalleryImages((prev) =>
          prev.map((img) => {
            const imgId = img._id || img.id;
            return imgId === imageId ? updatedImage : img;
          })
        );
        
        // Update category counts if category changed
        if (categoryChanged) {
          setCategoryCounts(prev => {
            const newCounts = {...prev};
            newCounts[oldCategory] = Math.max(0, (newCounts[oldCategory] || 0) - 1);
            newCounts[newCategory] = (newCounts[newCategory] || 0) + 1;
            return newCounts;
          });
        }
      } else {
        setGalleryImages((prev) =>
          prev.map((img) => {
            if (
              img.url === selectedImage.url &&
              img.title === selectedImage.title
            ) {
              return { ...editData };
            }
            return img;
          })
        );
        
        // Update category counts if category changed
        if (categoryChanged) {
          setCategoryCounts(prev => {
            const newCounts = {...prev};
            newCounts[oldCategory] = Math.max(0, (newCounts[oldCategory] || 0) - 1);
            newCounts[newCategory] = (newCounts[newCategory] || 0) + 1;
            return newCounts;
          });
        }
      }

      setShowEditModal(false);
      setEditData(null);
      setEditImagePreview(null);
      setSelectedImage(null);

      alert("Image updated successfully!");
    } catch (error) {
      console.error("Edit error:", error);
      alert(
        "Error updating image: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle image selection for bulk actions
  const toggleImageSelection = (image, index) => {
    const globalIndex = startIndex + index;
    if (selectedImages.includes(globalIndex)) {
      setSelectedImages(selectedImages.filter((id) => id !== globalIndex));
    } else {
      setSelectedImages([...selectedImages, globalIndex]);
    }
  };

  // Handle lightbox open
  const openLightbox = (image, index) => {
    if (isSelectMode) {
      toggleImageSelection(image, index);
    } else {
      setSelectedImage(image);
      setLightboxIndex(startIndex + index);
      setShowLightbox(true);
    }
  };

  // Navigate through lightbox images
  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < filteredImages.length) {
      setLightboxIndex(newIndex);
      setSelectedImage(filteredImages[newIndex]);
    }
  };

  // Handle lightbox edit
  const handleLightboxEdit = () => {
    if (!selectedImage) return;
    setShowLightbox(false);
    handleEditClick(selectedImage);
  };

  // Handle lightbox delete
  const handleLightboxDelete = () => {
    if (!selectedImage) return;
    setShowLightbox(false);
    handleDelete(selectedImage);
  };

  // Handle delete
  const handleDelete = (image) => {
    setSelectedImage(image);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    const imageId = selectedImage._id || selectedImage.id;
    
    // Track category for updating counts
    const category = selectedImage.category || "Uncategorized";

    try {
      setSaving(true);

      if (imageId) {
        await axios.delete(`${API_URL}/gallery/${imageId}`);
      }

      setGalleryImages((prev) =>
        prev.filter((img) => {
          const imgId = img._id || img.id;
          if (imgId && imageId) {
            return imgId !== imageId;
          }
          return img.url !== selectedImage.url;
        })
      );
      
      // Update category counts
      setCategoryCounts(prev => {
        const newCounts = {...prev};
        newCounts[category] = Math.max(0, (newCounts[category] || 0) - 1);
        return newCounts;
      });

      setShowDeleteModal(false);
      setSelectedImage(null);

      alert("Image deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        "Error deleting image: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const imagesToDelete = selectedImages.map(
      (index) => filteredImages[index - startIndex]
    );

    if (
      !window.confirm(
        `Are you sure you want to delete ${imagesToDelete.length} image(s)?`
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      
      // Track categories for updating counts
      const categoriesToUpdate = {};
      imagesToDelete.forEach(img => {
        const category = img.category || "Uncategorized";
        categoriesToUpdate[category] = (categoriesToUpdate[category] || 0) + 1;
      });

      const deletePromises = imagesToDelete.map((img) => {
        const imgId = img._id || img.id;
        if (imgId) {
          return axios.delete(`${API_URL}/gallery/${imgId}`);
        }
        return Promise.resolve();
      });

      await Promise.all(deletePromises);

      setGalleryImages((prev) =>
        prev.filter((img) => !imagesToDelete.includes(img))
      );
      
      // Update category counts
      setCategoryCounts(prev => {
        const newCounts = {...prev};
        Object.keys(categoriesToUpdate).forEach(category => {
          newCounts[category] = Math.max(0, (newCounts[category] || 0) - categoriesToUpdate[category]);
        });
        return newCounts;
      });
      
      setSelectedImages([]);
      setIsSelectMode(false);

      alert(`Successfully deleted ${imagesToDelete.length} image(s)!`);
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert(
        "Error deleting images: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle info modal
  const openInfoModal = (image) => {
    setSelectedImage(image);
    setShowInfoModal(true);
  };

  // Copy URL to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  // Truncate text helper
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError("Category name cannot be empty");
      return;
    }

    // Check for duplicate
    if (categoryList.some(cat => 
      cat && cat.name && cat.name.toLowerCase() === newCategoryName.toLowerCase()
    )) {
      setCategoryError("This category already exists");
      return;
    }

    try {
      setSaving(true);
      setCategoryError("");
      
      const response = await axios.post(`${API_URL}/categories`, {
        name: newCategoryName.trim(),
        type: 'gallery' // Specify that this is a gallery category
      });

      // Handle both direct and nested response formats
      const newCategory = response.data && response.data.data 
        ? response.data.data 
        : response.data;

      setCategoryList([...categoryList, newCategory]);
      setNewCategoryName("");
      
    } catch (error) {
      console.error("Create category error:", error);
      setCategoryError(error.response?.data?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!editCategoryName.trim()) {
      setCategoryError("Category name cannot be empty");
      return;
    }

    // Check for duplicate
    if (categoryList.some(cat => 
      cat && cat.name && cat._id !== editCategoryId && 
      cat.name.toLowerCase() === editCategoryName.toLowerCase()
    )) {
      setCategoryError("This category already exists");
      return;
    }

    try {
      setSaving(true);
      setCategoryError("");
      
      const response = await axios.put(`${API_URL}/categories/${editCategoryId}`, {
        name: editCategoryName.trim(),
        type: 'gallery' // Ensure we keep the type as gallery
      });
      
      // Handle both direct and nested response formats
      const updatedCategory = response.data && response.data.data 
        ? response.data.data 
        : response.data;
      
      // Find the old category name to update counts
      const oldCategoryName = categoryList.find(cat => cat._id === editCategoryId)?.name;
      
      setCategoryList(
        categoryList.map(cat => 
          cat._id === editCategoryId ? updatedCategory : cat
        )
      );
      
      // Update all images using this category
      if (oldCategoryName) {
        setGalleryImages(
          galleryImages.map(img => 
            img.category === oldCategoryName ? { ...img, category: editCategoryName } : img
          )
        );
        
        // Update category counts
        if (categoryCounts[oldCategoryName]) {
          const newCounts = {...categoryCounts};
          newCounts[editCategoryName] = categoryCounts[oldCategoryName];
          delete newCounts[oldCategoryName];
          setCategoryCounts(newCounts);
        }
      }
      
      setEditCategoryId(null);
      setEditCategoryName("");
      
    } catch (error) {
      console.error("Update category error:", error);
      setCategoryError(error.response?.data?.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const confirmDeleteCategory = async () => {
    if (!selectedCategoryToDelete) return;
    
    try {
      setSaving(true);
      
      await axios.delete(`${API_URL}/categories/${selectedCategoryToDelete._id}`);

      // Remove from categoryList
      setCategoryList(categoryList.filter(cat => cat._id !== selectedCategoryToDelete._id));
      
      // Update images with this category to "Uncategorized"
      const categoryName = selectedCategoryToDelete.name;
      if (categoryName) {
        setGalleryImages(
          galleryImages.map(img => 
            img.category === categoryName ? { ...img, category: "Uncategorized" } : img
          )
        );
        
        // Update category counts
        if (categoryCounts[categoryName]) {
          const newCounts = {...categoryCounts};
          newCounts["Uncategorized"] = (newCounts["Uncategorized"] || 0) + categoryCounts[categoryName];
          delete newCounts[categoryName];
          setCategoryCounts(newCounts);
        }
      }

      setShowDeleteCategoryModal(false);
      setSelectedCategoryToDelete(null);

    } catch (error) {
      console.error("Delete category error:", error);
      alert("Error deleting category: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Open edit category form
  const handleEditCategoryClick = (category) => {
    setEditCategoryId(category._id);
    setEditCategoryName(category.name);
    setCategoryError("");
  };

  // Open delete category confirmation
  const handleDeleteCategoryClick = (category) => {
    setSelectedCategoryToDelete(category);
    setShowDeleteCategoryModal(true);
  };

  // Stats
  const stats = [
    {
      label: "Total Images",
      value: galleryImages.length,
      icon: Image,
    },
    {
      label: "Categories",
      value: categoryList.length,
      icon: Folder,
    },
    {
      label: "This Month",
      value: 8,
      icon: Calendar,
    },
    {
      label: "Storage Used",
      value: "2.4 GB",
      icon: HardDrive,
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-lg">
              <Image className="w-6 h-6 text-black" />
            </div>
            Gallery
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your image collection • {galleryImages.length} images
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Tag className="w-4 h-4" />
            Manage Categories
          </button>
          
          {isSelectMode && selectedImages.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete ({selectedImages.length})
            </button>
          )}
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedImages([]);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              isSelectMode
                ? "bg-yellow-400 text-black"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Select</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Upload Images
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md hover:border-yellow-400 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <Icon className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search images by title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white cursor-pointer min-w-[160px]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category} {category !== "All" && categoryCounts[category] ? `(${categoryCounts[category]})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Grid Size Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setGridSize("small")}
              className={`p-2 rounded-md transition-all ${
                gridSize === "small"
                  ? "bg-yellow-400 shadow-sm text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Small grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridSize("medium")}
              className={`p-2 rounded-md transition-all ${
                gridSize === "medium"
                  ? "bg-yellow-400 shadow-sm text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Medium grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridSize("large")}
              className={`p-2 rounded-md transition-all ${
                gridSize === "large"
                  ? "bg-yellow-400 shadow-sm text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Large grid"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedCategory !== "All") && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm border border-yellow-200">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-yellow-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm border border-yellow-200">
                {selectedCategory} ({categoryCounts[selectedCategory] || 0})
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="hover:text-yellow-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Select All Banner */}
      {isSelectMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-lg">
              <Check className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {selectedImages.length} of {paginatedImages.length} selected
              </p>
              <p className="text-sm text-gray-600">
                Click on images to select them
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setSelectedImages(paginatedImages.map((_, i) => startIndex + i))
              }
              className="text-sm text-gray-700 hover:text-black font-medium"
            >
              Select all
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setSelectedImages([])}
              className="text-sm text-gray-700 hover:text-black font-medium"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-700">
            {filteredImages.length > 0 ? startIndex + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700">
            {Math.min(startIndex + itemsPerPage, filteredImages.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700">
            {filteredImages.length}
          </span>{" "}
          images
        </p>
        <button
          onClick={loadGalleryImages}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Image Grid */}
      {paginatedImages.length > 0 ? (
        <div className={`grid ${getGridClasses()} gap-4`}>
          {paginatedImages.map((img, index) => {
            const globalIndex = startIndex + index;
            const isSelected = selectedImages.includes(globalIndex);

            return (
              <div
                key={img._id || img.id || index}
                className={`group relative bg-white rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isSelected
                    ? "border-yellow-400 ring-2 ring-yellow-400"
                    : "border-gray-200 hover:border-yellow-400"
                }`}
              >
                {/* Image Container */}
                <div
                  className={`relative overflow-hidden cursor-pointer ${
                    gridSize === "large" ? "aspect-video" : "aspect-square"
                  }`}
                  onClick={() => openLightbox(img, index)}
                >
                  <img
                    src={img.url}
                    alt={img.title || img.alt || "Gallery image"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                    }}
                  />

                  {/* Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
                      isSelectMode
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {isSelectMode && (
                      <div className="absolute top-3 left-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-yellow-400 border-yellow-500"
                              : "bg-white/80 border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-black" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isSelectMode && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInfoModal(img);
                          }}
                          className="p-2 bg-white/90 hover:bg-yellow-400 rounded-lg text-gray-700 hover:text-black transition-colors shadow-sm"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(img);
                          }}
                          className="p-2 bg-white/90 hover:bg-yellow-400 rounded-lg text-gray-700 hover:text-black transition-colors shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(img);
                          }}
                          className="p-2 bg-white/90 hover:bg-red-500 rounded-lg text-gray-700 hover:text-white transition-colors shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {img.title || "Untitled"}
                          </p>
                          {img.category && (
                            <span className="text-yellow-400 text-xs">
                              {img.category}
                            </span>
                          )}
                          {img.description && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlignLeft className="w-3 h-3 text-gray-300" />
                              <span className="text-gray-300 text-xs truncate">
                                {truncateText(img.description, 30)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zoom Icon */}
                  {!isSelectMode && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-3 bg-yellow-400 rounded-full shadow-lg">
                        <ZoomIn className="w-6 h-6 text-black" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer - Only show in large grid */}
                {gridSize === "large" && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {img.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {img.category || "Uncategorized"}
                      </p>
                      {img.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {img.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openLightbox(img, index)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditClick(img)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-black bg-yellow-400 hover:bg-yellow-500 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4 border border-yellow-200">
              <Image className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No images found
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Try adjusting your search or filter criteria, or upload new images
              to get started.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear filters
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Upload Images
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredImages.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-medium text-gray-700">{currentPage}</span> of{" "}
            <span className="font-medium text-gray-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-sm rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-yellow-400 text-black"
                        : "text-gray-600 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-yellow-400">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900">
              <h3 className="text-lg font-semibold text-yellow-400">
                Manage Categories
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Create New Category */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {editCategoryId ? 'Edit Category' : 'Create New Category'}
                </h4>
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editCategoryId ? editCategoryName : newCategoryName}
                      onChange={(e) => editCategoryId 
                        ? setEditCategoryName(e.target.value) 
                        : setNewCategoryName(e.target.value)
                      }
                      placeholder="Enter category name"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                    />
                    {categoryError && (
                      <p className="text-red-500 text-xs mt-1">{categoryError}</p>
                    )}
                  </div>
                  {editCategoryId ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateCategory}
                        disabled={saving || !editCategoryName.trim()}
                        className="px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setEditCategoryId(null);
                          setEditCategoryName("");
                          setCategoryError("");
                        }}
                        className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleCreateCategory}
                      disabled={saving || !newCategoryName.trim()}
                      className="px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Create
                    </button>
                  )}
                </div>
              </div>

              {/* Category List */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    Categories ({categoryList.length})
                  </h4>
                  <div>
                    <button
                      onClick={loadCategories}
                      disabled={categoryLoading}
                      className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                      {categoryLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      {categoryLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>

                {categoryLoadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <p>{categoryLoadError}</p>
                    <button 
                      onClick={loadCategories} 
                      className="ml-auto px-2 py-1 bg-red-100 rounded-md text-xs font-medium hover:bg-red-200"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  {categoryLoading ? (
                    <div className="p-6 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-2" />
                      <p className="text-gray-500">Loading categories...</p>
                    </div>
                  ) : categoryList.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {categoryList.map((category) => {
                        if (!category || !category.name) return null;
                        
                        // Get image count from categoryCounts
                        const imageCount = categoryCounts[category.name] || 0;
                        
                        return (
                          <li key={category._id} className="p-3 flex items-center justify-between hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-yellow-100 rounded-lg">
                                <Tag className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">{category.name}</h5>
                                <p className="text-xs text-gray-500">{imageCount} images</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditCategoryClick(category)}
                                className="p-1.5 text-gray-600 hover:text-black hover:bg-yellow-400 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategoryClick(category)}
                                disabled={saving}
                                className="p-1.5 text-gray-600 hover:text-white hover:bg-red-500 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No categories found. Create your first category above.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Uncategorized Images Count */}
              {categoryCounts["Uncategorized"] > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <Folder className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Uncategorized</h5>
                      <p className="text-xs text-gray-500">{categoryCounts["Uncategorized"]} images</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal - Only show saved categories */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border-2 border-yellow-400">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900">
              <h3 className="text-lg font-semibold text-yellow-400">
                Upload Images
              </h3>
              <button
                onClick={closeUploadModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Upload Area */}
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-yellow-400 hover:bg-yellow-50/50 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImagePlus className="w-8 h-8 text-black" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop images here or click to upload
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  PNG, JPG, GIF up to 10MB each
                </p>
                <span className="inline-block px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-semibold transition-colors">
                  Choose Files
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                />
              </label>

              {/* Image Previews with Individual Details */}
              {uploadPreviews.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Selected Images ({uploadPreviews.length})
                  </h4>
                  <div className="space-y-4">
                    {uploadPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        {/* Image Preview */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={preview.url}
                            alt={preview.title}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removeUploadPreview(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Image Details */}
                        <div className="flex-1 space-y-3">
                          {/* Title */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={preview.title}
                              onChange={(e) =>
                                updatePreviewTitle(index, e.target.value)
                              }
                              placeholder="Enter image title"
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                            />
                          </div>

                          {/* Category - Only show saved categories + Uncategorized */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Category
                            </label>
                            <div className="relative">
                              <select
                                value={preview.category}
                                onChange={(e) =>
                                  updatePreviewCategory(index, e.target.value)
                                }
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white appearance-none pr-10"
                              >
                                <option value="Uncategorized">
                                  Uncategorized
                                </option>
                                {categoryOptions.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Tag className="w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                            {categoryOptions.length === 0 && (
                              <p className="text-xs text-yellow-600 mt-1 flex items-center">
                                <Info className="w-3 h-3 mr-1" /> 
                                No saved categories. Images will be Uncategorized.
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Description
                            </label>
                            <textarea
                              value={preview.description}
                              onChange={(e) =>
                                updatePreviewDescription(index, e.target.value)
                              }
                              placeholder="Enter image description (optional)"
                              rows="2"
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Default Category & Description for all */}
              {uploadPreviews.length === 0 && (
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                      <span>Default Category</span>
                      <button
                        onClick={() => setShowCategoryModal(true)}
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <PlusCircle className="w-3 h-3 mr-1" /> Add Category
                      </button>
                    </label>
                    <div className="relative">
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none appearance-none pr-10"
                      >
                        <option value="">Select a category</option>
                        <option value="Uncategorized">Uncategorized</option>
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Tag className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                    
                    {categoryOptions.length === 0 && (
                      <p className="text-xs text-yellow-600 mt-1 flex items-center">
                        <Info className="w-3 h-3 mr-1" /> 
                        No categories created yet. Create categories to better organize your images.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Description
                    </label>
                    <textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Enter default description for all images"
                      rows="2"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeUploadModal}
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={saving || uploadPreviews.length === 0}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Upload{" "}
                    {uploadPreviews.length > 0 && `(${uploadPreviews.length})`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Only show saved categories */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-yellow-400">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900">
              <h3 className="text-lg font-semibold text-yellow-400">
                Edit Image
              </h3>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Image Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>

                  {editImagePreview ? (
                    <div className="relative">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <label className="absolute bottom-3 right-3 p-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors cursor-pointer shadow-sm">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleEditImageFile}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-all">
                      <Camera className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">
                        Click to change image
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleEditImageFile}
                      />
                    </label>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editData.title || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                      placeholder="Enter image title"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                      <span>Category</span>
                      <button
                        onClick={() => setShowCategoryModal(true)}
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <PlusCircle className="w-3 h-3 mr-1" /> Add Category
                      </button>
                    </label>
                    <div className="relative">
                      <select
                        value={editData.category || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none pr-10"
                      >
                        <option value="">Select a category</option>
                        <option value="Uncategorized">Uncategorized</option>
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Tag className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlignLeft className="w-4 h-4 inline mr-1" />
                    Description
                  </label>
                  <textarea
                    value={editData.description || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    placeholder="Enter a description for this image"
                    rows="3"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add a detailed description to help with search and
                    accessibility
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={editData.alt || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, alt: e.target.value })
                    }
                    placeholder="Enter alt text for accessibility"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeEditModal}
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={saving || !editData.title}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2 border-red-400">
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Delete Image
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to delete "
              <span className="font-semibold text-gray-700">
                {selectedImage?.title || "this image"}
              </span>
              "? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedImage(null);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {showDeleteCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2 border-red-400">
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Delete Category
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to delete "
              <span className="font-semibold text-gray-700">
                {selectedCategoryToDelete?.name || "this category"}
              </span>
              "? {categoryCounts[selectedCategoryToDelete?.name] > 0 && (
                <span className="text-red-500 font-semibold">
                  {categoryCounts[selectedCategoryToDelete?.name]} image(s) will be moved to "Uncategorized".
                </span>
              )}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteCategoryModal(false);
                  setSelectedCategoryToDelete(null);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Info Modal */}
      {showInfoModal && selectedImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-yellow-400">
            {/* Image Preview */}
            <div className="aspect-video bg-gray-100">
              <img
                src={selectedImage.url}
                alt={selectedImage.title || "Gallery image"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
                }}
              />
            </div>

            {/* Image Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {selectedImage.title || "Untitled"}
              </h3>

              {/* Description Section */}
              {selectedImage.description && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlignLeft className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Description
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {selectedImage.description}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Category</span>
                  <span className="font-medium text-gray-900">
                    {selectedImage.category || "Uncategorized"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Alt Text</span>
                  <span className="font-medium text-gray-900">
                    {selectedImage.alt || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">ID</span>
                  <span className="font-mono text-sm text-gray-700">
                    {selectedImage._id || selectedImage.id || "N/A"}
                  </span>
                </div>
              </div>

              {/* URL Copy */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {selectedImage.url?.substring(0, 40)}...
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedImage.url)}
                    className="p-1.5 text-gray-600 hover:text-black hover:bg-yellow-400 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowInfoModal(false);
                    setSelectedImage(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowInfoModal(false);
                    handleEditClick(selectedImage);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Edit Image
                </button>
                <button
                  onClick={() => {
                    setShowInfoModal(false);
                    handleDelete(selectedImage);
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && selectedImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          {/* Close Button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
            {lightboxIndex + 1} / {filteredImages.length}
          </div>

          {/* Top Actions */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleLightboxEdit}
              className="p-2 text-white/70 hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleLightboxDelete}
              className="p-2 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => navigateLightbox(-1)}
            disabled={lightboxIndex === 0}
            className="absolute left-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={() => navigateLightbox(1)}
            disabled={lightboxIndex === filteredImages.length - 1}
            className="absolute right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Main Image */}
          <div className="max-w-5xl max-h-[80vh] px-16">
            <img
              src={selectedImage.url}
              alt={selectedImage.title || selectedImage.alt || "Gallery image"}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
              }}
            />
          </div>

          {/* Image Info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg max-w-2xl">
            <h3 className="text-white font-semibold text-lg mb-1">
              {selectedImage.title || "Untitled"}
            </h3>
            {selectedImage.category && (
              <span className="text-yellow-400 text-sm block mb-1">
                {selectedImage.category}
              </span>
            )}
            {selectedImage.description && (
              <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                {selectedImage.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}