import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  AlertCircle,
  CheckCircle,
  X,
  Camera,
  Download,
  Upload,
  Save,
  Zap,
  Settings,
  Cpu,
  Lightbulb,
  Battery,
  FileText,
  RefreshCw,
  Loader,
} from "lucide-react";

import { productAPI } from "../../../api/axios";

export default function Products() {
  const PRODUCT_CATEGORIES = [
    "Power Distribution Panels",
    "Motor Control & Protection",
    "Automation & Control",
    "Power Quality & Energy Saving",
    "Generator & Power Backup",
    "Marketing / Customer Resources",
  ];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Fetching products from:", productAPI.baseURL);

        const res = await productAPI.getProducts();

        console.log("📦 Raw backend response (parsed JSON):", res);

        let list = [];

        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.products)) {
          list = res.products;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        } else {
          console.warn("⚠️ Unexpected response structure:", res);
          list = [];
        }

        const normalized = list.map((p) => ({
          _id: p._id || p.id || String(Math.random()),
          name: p.name || "Unnamed Product",
          desc: p.description || p.desc || "",
          category: p.category || "Uncategorized",
          status: p.status || "Active",
          image: p.imageUrl || null,
        }));

        console.log("✅ Normalized products:", normalized);
        setProducts(normalized);
      } catch (err) {
        console.error("❌ Products load error:", err);
        setError(err.message || "Failed to load products");

        const mockProducts = [
          {
            _id: "mock1",
            name: "PCC Control Panel - 500A",
            desc: "Power Control Center panel with 500A capacity for industrial applications",
            category: "Power Distribution Panels",
            status: "Active",
            image: null,
          },
          {
            _id: "mock2",
            name: "VFD Panel - 75kW",
            desc: "Variable Frequency Drive panel for motor speed control",
            category: "Motor Control & Protection",
            status: "Active",
            image: null,
          },
          {
            _id: "mock3",
            name: "PLC Automation System",
            desc: "Complete PLC-based automation solution for manufacturing",
            category: "Automation & Control",
            status: "Active",
            image: null,
          },
          {
            _id: "mock4",
            name: "APFC Panel - 200kVAR",
            desc: "Automatic Power Factor Correction panel for energy optimization",
            category: "Power Quality & Energy Saving",
            status: "Active",
            image: null,
          },
          {
            _id: "mock5",
            name: "AMF Panel - 1000kVA",
            desc: "Auto Mains Failure panel for generator backup systems",
            category: "Generator & Power Backup",
            status: "Active",
            image: null,
          },
        ];
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    desc: "",
    category: PRODUCT_CATEGORIES[0],
    status: "Active",
    imageFile: null,
  });

  const [editProduct, setEditProduct] = useState({
    _id: "",
    name: "",
    desc: "",
    category: "",
    status: "",
    image: null,
    imageFile: null,
  });

  const itemsPerPage = 5;

  const allCategories = [
    "All",
    ...new Set([
      ...PRODUCT_CATEGORIES,
      ...products.map((p) => p.category).filter(Boolean),
    ]),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.desc?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Image upload for Add modal
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setNewProduct((prev) => ({
      ...prev,
      imageFile: file,
    }));
  };

  // Image upload for Edit modal
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setEditImagePreview(reader.result);
    reader.readAsDataURL(file);

    setEditProduct((prev) => ({
      ...prev,
      imageFile: file,
    }));
  };

  // Add product
  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.desc.trim()) {
      alert("Product name and description are required");
      return;
    }

    setIsSubmitting(true);

    try {
      let base64Image = null;
      if (newProduct.imageFile) {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(newProduct.imageFile);
        });
      }

      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.desc.trim(),
        category: newProduct.category,
        status: newProduct.status,
        imageUrl: base64Image,
      };

      console.log("📤 Adding product:", productData.name);

      const res = await productAPI.createProduct(productData);

      console.log("✅ Product added! Response:", res);

      const addedProduct = res.product || res.data || res;

      const normalized = {
        _id: addedProduct._id || String(Math.random()),
        name: addedProduct.name,
        desc: addedProduct.description,
        category: addedProduct.category,
        status: addedProduct.status,
        image: addedProduct.imageUrl || null,
      };

      setProducts((prev) => [...prev, normalized]);

      setShowAddModal(false);
      setImagePreview(null);
      setNewProduct({
        name: "",
        desc: "",
        category: PRODUCT_CATEGORIES[0],
        status: "Active",
        imageFile: null,
      });

      alert("Product added successfully!");
    } catch (err) {
      console.error("❌ Add product error:", err);
      const errorMessage =
        err.data?.error ||
        err.data?.message ||
        err.message ||
        "Failed to add product";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (!editProduct.name.trim() || !editProduct.desc.trim()) {
      alert("Product name and description are required");
      return;
    }

    setIsSubmitting(true);

    try {
      let base64Image = editProduct.image;

      if (editProduct.imageFile) {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(editProduct.imageFile);
        });
      }

      const productData = {
        name: editProduct.name.trim(),
        description: editProduct.desc.trim(),
        category: editProduct.category,
        status: editProduct.status,
        imageUrl: base64Image,
      };

      console.log("📤 Updating product:", editProduct._id);

      const res = await productAPI.updateProduct(editProduct._id, productData);

      console.log("✅ Product updated! Response:", res);

      const updatedProduct = res.product || res.data || res;

      setProducts((prev) =>
        prev.map((p) =>
          p._id === editProduct._id
            ? {
                _id: editProduct._id,
                name: updatedProduct.name || editProduct.name,
                desc: updatedProduct.description || editProduct.desc,
                category: updatedProduct.category || editProduct.category,
                status: updatedProduct.status || editProduct.status,
                image: updatedProduct.imageUrl || base64Image,
              }
            : p
        )
      );

      setShowEditModal(false);
      setEditImagePreview(null);
      setEditProduct({
        _id: "",
        name: "",
        desc: "",
        category: "",
        status: "",
        image: null,
        imageFile: null,
      });

      alert("Product updated successfully!");
    } catch (err) {
      console.error("❌ Update product error:", err);
      const errorMessage =
        err.data?.error ||
        err.data?.message ||
        err.message ||
        "Failed to update product";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const confirmDelete = async () => {
    if (!selectedProduct?._id) return;

    setIsSubmitting(true);

    try {
      console.log("🗑️ Deleting product:", selectedProduct._id);
      await productAPI.deleteProduct(selectedProduct._id);

      setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("❌ Delete failed:", err);
      const errorMessage =
        err.data?.message || err.message || "Failed to delete product";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRowClick = (p) => {
    setSelectedProduct(p);
    setShowViewModal(true);
  };

  const handleEdit = (product, e) => {
    e?.stopPropagation();
    setEditProduct({
      _id: product._id,
      name: product.name,
      desc: product.desc,
      category: product.category,
      status: product.status || "Active",
      image: product.image,
      imageFile: null,
    });
    setEditImagePreview(product.image);
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleDelete = (product, e) => {
    e?.stopPropagation();
    setSelectedProduct(product);
    setShowViewModal(false);
    setShowDeleteModal(true);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Power Distribution Panels": Zap,
      "Motor Control & Protection": Settings,
      "Automation & Control": Cpu,
      "Power Quality & Energy Saving": Lightbulb,
      "Generator & Power Backup": Battery,
      "Marketing / Customer Resources": FileText,
    };
    return icons[category] || Package;
  };

  const getStatusConfig = (status) => {
    const configs = {
      Active: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      },
      Inactive: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        dot: "bg-gray-400",
      },
      "Coming Soon": {
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-500",
      },
      Discontinued: {
        bg: "bg-red-50",
        text: "text-red-700",
        dot: "bg-red-500",
      },
    };
    return configs[status] || configs["Active"];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  const removeImage = () => {
    setImagePreview(null);
    setNewProduct((prev) => ({ ...prev, imageFile: null }));
  };

  const removeEditImage = () => {
    setEditImagePreview(null);
    setEditProduct((prev) => ({ ...prev, image: null, imageFile: null }));
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setImagePreview(null);
    setNewProduct({
      name: "",
      desc: "",
      category: PRODUCT_CATEGORIES[0],
      status: "Active",
      imageFile: null,
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditImagePreview(null);
    setEditProduct({
      _id: "",
      name: "",
      desc: "",
      category: "",
      status: "",
      image: null,
      imageFile: null,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Connection Issue</h3>
              <p className="text-sm text-amber-700 mt-1">{error}</p>
              <p className="text-xs text-amber-600 mt-2">
                Displaying sample data for preview
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-lg">
              <Package className="w-6 h-6 text-black" />
            </div>
            Products
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your product catalog • {products.length} items
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {PRODUCT_CATEGORIES.map((category) => {
          const count = products.filter((p) => p.category === category).length;
          const isSelected = selectedCategory === category;
          const IconComponent = getCategoryIcon(category);
          return (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(isSelected ? "All" : category)
              }
              className={`relative p-4 rounded-xl border transition-all text-left ${
                isSelected
                  ? "border-yellow-400 bg-yellow-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-yellow-300 hover:shadow-sm"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  isSelected ? "bg-yellow-400" : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 ${
                    isSelected ? "text-black" : "text-yellow-600"
                  }`}
                />
              </div>
              <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-tight">
                {category}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">{count}</p>
              {isSelected && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-yellow-500"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
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

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full lg:w-48 pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white cursor-pointer"
              >
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "table"
                    ? "bg-yellow-400 shadow-sm text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-yellow-400 shadow-sm text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

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
                {selectedCategory}
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

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-700">
            {filteredProducts.length > 0 ? startIndex + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700">
            {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700">
            {filteredProducts.length}
          </span>{" "}
          products
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 text-yellow-400">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                    Description
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => {
                    const CategoryIcon = getCategoryIcon(product.category);
                    const statusConfig = getStatusConfig(product.status);
                    return (
                      <tr
                        key={product._id}
                        onClick={() => handleRowClick(product)}
                        className="hover:bg-yellow-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-yellow-200">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <CategoryIcon className="w-6 h-6 text-yellow-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                ID: {product._id?.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            {product.desc}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <CategoryIcon className="w-3 h-3" />
                            <span className="hidden lg:inline">
                              {product.category}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                            ></span>
                            {product.status || "Active"}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => handleEdit(product, e)}
                              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(product, e)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4 border border-yellow-200">
                          <Package className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          No products found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Try adjusting your search or filter criteria
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("All");
                          }}
                          className="text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => {
              const CategoryIcon = getCategoryIcon(product.category);
              const statusConfig = getStatusConfig(product.status);
              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-yellow-400 transition-all group"
                >
                  <div
                    onClick={() => handleRowClick(product)}
                    className="cursor-pointer"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center relative overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CategoryIcon className="w-12 h-12 text-yellow-500 opacity-60" />
                      )}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                          ></span>
                          {product.status || "Active"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-yellow-600 transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mb-2">
                        <CategoryIcon className="w-3 h-3" />
                        {product.category}
                      </span>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.desc}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-0">
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        ID: {product._id?.slice(-8)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleEdit(product, e)}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(product, e)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-xl border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4 border border-yellow-200">
                    <Package className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                    }}
                    className="text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > itemsPerPage && (
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-yellow-400">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900">
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">
                  Add New Product
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Fill in the details to create a new product
                </p>
              </div>
              <button
                onClick={closeAddModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-600 rounded-lg transition-colors shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-all">
                      <Camera className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white"
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="desc"
                    value={newProduct.desc}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows="4"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newProduct.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeAddModal}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-yellow-400">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900">
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">
                  Edit Product
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Update the product details
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  {editImagePreview ? (
                    <div className="relative">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        onClick={removeEditImage}
                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-600 rounded-lg transition-colors shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-all">
                      <Camera className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editProduct.name}
                      onChange={handleEditInputChange}
                      placeholder="Enter product name"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={editProduct.category}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white"
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="desc"
                    value={editProduct.desc}
                    onChange={handleEditInputChange}
                    placeholder="Enter product description"
                    rows="4"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editProduct.status}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeEditModal}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border-2 border-yellow-400">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900">
              <h3 className="text-lg font-semibold text-yellow-400">
                Product Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                <div className="aspect-video bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (() => {
                      const CategoryIcon = getCategoryIcon(
                        selectedProduct.category
                      );
                      return (
                        <CategoryIcon className="w-16 h-16 text-yellow-500 opacity-50" />
                      );
                    })()
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Product Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProduct.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    {(() => {
                      const CategoryIcon = getCategoryIcon(
                        selectedProduct.category
                      );
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          <CategoryIcon className="w-4 h-4" />
                          {selectedProduct.category}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed border border-gray-200">
                    {selectedProduct.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    {(() => {
                      const statusConfig = getStatusConfig(
                        selectedProduct.status
                      );
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
                          ></span>
                          {selectedProduct.status || "Active"}
                        </span>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Product ID
                    </label>
                    <p className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                      {selectedProduct._id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={(e) => handleEdit(selectedProduct, e)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Product
              </button>
              <button
                onClick={(e) => handleDelete(selectedProduct, e)}
                className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
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
              Delete Product
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                "{selectedProduct?.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}