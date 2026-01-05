import { 
  Factory,
  Zap,
  Shield,
  Settings,
  CheckCircle,
  Star,
  ArrowRight,
  Info,
  FileText,
  Phone,
  Download,
  Eye,
  Award,
  Boxes,
  Grid3x3,
  List,
  Filter,
  TrendingUp,
  Package,
  ChevronRight,
  Lightbulb,
  Battery,
  Wrench,
  BookOpen,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { productAPI } from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  // ✅ Pagination state
  const [displayCount, setDisplayCount] = useState(8);
  const PRODUCTS_PER_LOAD = 4;

  // ✅ Updated categories matching backend exactly
  const categories = [
    { 
      id: 'all', 
      name: 'All Products', 
      icon: Boxes,
      backendName: null
    },
    { 
      id: 'power-distribution', 
      name: 'Power Distribution Panels', 
      icon: Zap,
      backendName: 'Power Distribution Panels',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'motor-control', 
      name: 'Motor Control & Protection', 
      icon: Settings,
      backendName: 'Motor Control & Protection',
      gradient: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'automation', 
      name: 'Automation & Control', 
      icon: Cpu,
      backendName: 'Automation & Control',
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'power-quality', 
      name: 'Power Quality & Energy Saving', 
      icon: Lightbulb,
      backendName: 'Power Quality & Energy Saving',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      id: 'generator', 
      name: 'Generator & Power Backup', 
      icon: Battery,
      backendName: 'Generator & Power Backup',
      gradient: 'from-red-500 to-red-600'
    },
    { 
      id: 'marketing', 
      name: 'Marketing / Customer Resources', 
      icon: BookOpen,
      backendName: 'Marketing / Customer Resources',
      gradient: 'from-pink-500 to-pink-600'
    },
  ];

  // Fetch products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await productAPI.getProducts();

        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.products)) {
          list = res.products;
        } else if (res.success && Array.isArray(res.data)) {
          list = res.data;
        } else {
          console.warn('Unexpected products response structure:', res);
        }

        // ✅ Normalize fields matching backend schema
        const normalized = list.map(p => ({
          _id: p._id || p.id || String(Math.random()),
          name: p.name || 'Unnamed Product',
          desc: p.description || p.desc || '',
          category: p.category || 'Uncategorized',
          img: p.imageUrl || p.image || null,
          featured: p.featured || false,
          certified: p.certified || false,
          custom: p.custom || false,
          popular: p.popular || false,
          features: p.features || [],
          price: p.price || 0,
          sku: p.sku || '',
          status: p.status || 'Active',
        }));

        console.log('📦 Total products loaded:', normalized.length);
        setProducts(normalized);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError(err.message || 'Failed to load products.');
        
        // Fallback mock data
        setProducts([
          {
            _id: 'demo1',
            name: 'PCC Control Panel 500A',
            desc: 'Power Control Center panel with 500A capacity for industrial automation and distribution systems',
            category: 'Power Distribution Panels',
            img: null,
            featured: true,
            certified: true,
            features: ['IP65 Protection', 'Modular Design', 'Remote Monitoring']
          },
          {
            _id: 'demo2',
            name: 'VFD Panel 75kW',
            desc: 'Variable Frequency Drive panel for precise motor speed control and energy efficiency optimization',
            category: 'Motor Control & Protection',
            img: null,
            featured: true,
            popular: true,
            features: ['Energy Efficient', 'Soft Start/Stop', 'Overload Protection']
          },
          {
            _id: 'demo3',
            name: 'PLC Automation System',
            desc: 'Complete programmable logic controller system for manufacturing automation and process control',
            category: 'Automation & Control',
            img: null,
            certified: true,
            features: ['HMI Interface', 'Real-time Monitoring', 'Scalable Architecture']
          },
          {
            _id: 'demo4',
            name: 'APFC Panel 200kVAR',
            desc: 'Automatic Power Factor Correction panel for energy optimization and utility cost savings',
            category: 'Power Quality & Energy Saving',
            img: null,
            featured: true,
            certified: true,
            features: ['Auto Switching', 'Energy Analytics', 'Cost Reduction']
          },
          {
            _id: 'demo5',
            name: 'AMF Panel 1000kVA',
            desc: 'Auto Mains Failure panel with intelligent generator backup management and seamless switching',
            category: 'Generator & Power Backup',
            img: null,
            popular: true,
            features: ['Auto Changeover', 'Load Management', 'Battery Backup']
          },
          {
            _id: 'demo6',
            name: 'Product Catalog 2024',
            desc: 'Comprehensive digital catalog featuring all electrical products, solutions, and technical specifications',
            category: 'Marketing / Customer Resources',
            img: null,
            features: ['Technical Specs', 'Case Studies', 'Installation Guides']
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ✅ Reset display count when category changes
  useEffect(() => {
    setDisplayCount(8);
  }, [activeCategory]);

  // ✅ Filter products based on category
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => {
        const selectedCategory = categories.find(c => c.id === activeCategory);
        return p.category === selectedCategory?.backendName;
      });

  // ✅ Slice products to show limited count
  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  // ✅ Load more function
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + PRODUCTS_PER_LOAD);
  };

  // ✅ Scroll to contact section
  const handleGetQuoteClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/#contact';
    }
  };

  // ✅ Call "Talk to Expert" with confirmation
  const handleTalkToExpertClick = () => {
    const phone = '+91951876038';
    const confirmed = window.confirm(`Do you want to call ${phone}?`);
    if (confirmed) {
      window.location.href = `tel:${phone}`;
    }
  };

  // Product features/badges
  const getProductBadges = (product) => {
    const badges = [];
    if (product.featured)   badges.push({ text: 'Featured',      color: 'yellow' });
    if (product.certified)  badges.push({ text: 'ISO Certified', color: 'green' });
    if (product.custom)     badges.push({ text: 'Customizable',  color: 'blue' });
    if (product.popular)    badges.push({ text: 'Popular',       color: 'orange' });
    return badges;
  };

  const badgeColors = {
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    green:  'bg-green-100 text-green-700 border-green-300',
    blue:   'bg-blue-100 text-blue-700 border-blue-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
  };

  // Get category icon with proper styling
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.backendName === categoryName);
    return category?.icon || Package;
  };

  const getCategoryGradient = (categoryName) => {
    const category = categories.find(c => c.backendName === categoryName);
    return category?.gradient || 'from-gray-500 to-gray-600';
  };

  return (
    <section id="products" className="relative py-16 md:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900/5 to-slate-800/5 border border-slate-900/10 rounded-full px-4 py-2 mb-6">
            <Package className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-slate-700">Our Product Range</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Engineered for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600">
              Excellence
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive range of industrial electrical solutions, 
            control panels, and automation systems designed to meet your specific needs.
          </p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium">Loading products...</span>
            </div>
          </div>
        )}
        
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
              <Info className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-700 font-medium mb-2">Unable to load products</p>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-2">Showing demo products for preview</p>
          </div>
        )}

        {/* Category Filters & View Toggle */}
        {!loading && (
          <>
            <div className="mb-10">
              {/* Desktop Tabs */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-md border border-gray-200 overflow-x-auto">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const count = category.id === 'all' 
                      ? products.length 
                      : products.filter(p => p.category === category.backendName).length;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                          activeCategory === category.id
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-400/30'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden xl:inline">{category.name}</span>
                        <span className="xl:hidden">{category.name.split(' ')[0]}</span>
                        {count > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            activeCategory === category.id
                              ? 'bg-white text-slate-900'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 shadow-md border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-slate-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Grid View"
                  >
                    <Grid3x3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-slate-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="List View"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* ✅ UPDATED: Tablet/Mobile: Scrollable Category Pills with more bottom margin */}
              <div className="lg:hidden mb-8 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="flex gap-3 min-w-max">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const count = category.id === 'all' 
                      ? products.length 
                      : products.filter(p => p.category === category.backendName).length;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                          activeCategory === category.id
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{category.name.split(' ')[0]}</span>
                        {count > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            activeCategory === category.id
                              ? 'bg-white text-slate-900'
                              : 'bg-gray-100'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ✅ UPDATED: Results Count with top margin for mobile separation */}
              <div className="flex items-center justify-between text-sm text-gray-600 border-b border-gray-200 pb-4 mt-2 lg:mt-0">
                <span>
                  Showing <strong className="text-slate-900">{displayedProducts.length}</strong> of{' '}
                  <strong className="text-yellow-600">{filteredProducts.length}</strong> product
                  {filteredProducts.length !== 1 ? 's' : ''}
                  {activeCategory !== 'all' && (
                    <span> in <strong className="text-yellow-600">
                      {categories.find(c => c.id === activeCategory)?.name}
                    </strong></span>
                  )}
                </span>
                
                {/* ✅ UPDATED: Mobile View Toggle with left margin for separation */}
                <div className="flex lg:hidden items-center gap-1.5 bg-white rounded-lg p-1.5 shadow-sm border border-gray-200 ml-4">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-md transition-all ${
                      viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-md transition-all ${
                      viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8' 
                : 'space-y-6'
            }>
              {displayedProducts.map((product, index) => {
                const badges = getProductBadges(product);
                const CategoryIcon = getCategoryIcon(product.category);
                const categoryGradient = getCategoryGradient(product.category);
                
                if (viewMode === 'list') {
                  // List View Layout
                  return (
                    <div
                      key={product._id}
                      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-200 hover:border-yellow-400/50 transition-all duration-300 overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="relative md:w-80 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          {product.img ? (
                            <img
                              src={product.img}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <CategoryIcon className="h-24 w-24 text-gray-300" />
                            </div>
                          )}
                          {badges.length > 0 && (
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              {badges.map((badge, i) => (
                                <span
                                  key={i}
                                  className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColors[badge.color]} backdrop-blur-sm`}
                                >
                                  {badge.text}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Category Badge */}
                          <div className="absolute bottom-4 right-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoryGradient} backdrop-blur-sm shadow-lg`}>
                              <CategoryIcon className="h-3.5 w-3.5" />
                              {product.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 flex flex-col">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                              {product.desc}
                            </p>
                            
                            {/* Features */}
                            {product.features && product.features.length > 0 && (
                              <div className="space-y-2 mb-4">
                                {product.features.slice(0, 3).map((feature, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={handleGetQuoteClick}
                              className="flex-1 sm:flex-none bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-yellow-400/30 transition-all hover:scale-105"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <FileText className="h-4 w-4" />
                                Get Quote
                              </span>
                            </button>
                            <button className="flex-1 sm:flex-none border-2 border-slate-900 text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-900 hover:text-white transition-all">
                              <span className="flex items-center justify-center gap-2">
                                <Info className="h-4 w-4" />
                                Details
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Grid View Layout
                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-200 hover:border-yellow-400/50 transition-all duration-300 overflow-hidden hover:-translate-y-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image Container */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {product.img ? (
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CategoryIcon className="h-20 w-20 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      {badges.length > 0 && (
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {badges.map((badge, i) => (
                            <span
                              key={i}
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColors[badge.color]} backdrop-blur-sm`}
                            >
                              {badge.text}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoryGradient} backdrop-blur-sm shadow-lg`}>
                          <CategoryIcon className="h-3 w-3" />
                        </span>
                      </div>

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <Eye className="h-4 w-4" />
                          Quick View
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-yellow-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {product.desc}
                      </p>

                      {/* Features (if available) */}
                      {product.features && product.features.length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          {product.features.slice(0, 2).map((feature, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-700 line-clamp-1">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rating/Certification */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        {product.certified && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Award className="h-4 w-4" />
                            <span className="font-semibold">ISO Certified</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleGetQuoteClick}
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-4 py-2.5 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-yellow-400/30 transition-all hover:scale-105"
                        >
                          Get Quote
                        </button>
                        <button className="border-2 border-slate-900 text-slate-900 p-2.5 rounded-lg hover:bg-slate-900 hover:text-white transition-all group/btn">
                          <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ Load More Button */}
            {hasMore && (
              <div className="mt-12 text-center">
                <div className="inline-flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-600">
                    Showing <strong className="text-slate-900">{displayedProducts.length}</strong> of{' '}
                    <strong className="text-yellow-600">{filteredProducts.length}</strong> products
                  </p>
                  <button
                    onClick={handleLoadMore}
                    className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-yellow-400/50 transition-all hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                      Load More Products
                      <span className="bg-slate-900 text-yellow-400 px-2.5 py-1 rounded-full text-xs">
                        +{Math.min(PRODUCTS_PER_LOAD, filteredProducts.length - displayCount)}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeCategory !== 'all' 
                    ? 'Try selecting a different category or view all products'
                    : 'No products available at the moment'
                  }
                </p>
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-yellow-400/30 transition-all"
                  >
                    View All Products
                  </button>
                )}
              </div>
            )}

            {/* Bottom CTA Section */}
            <div className="mt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>

              <div className="relative max-w-3xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/10 rounded-full mb-6">
                  <Settings className="h-8 w-8 text-yellow-400" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Need a Custom Solution?
                </h3>
                
                <p className="text-lg text-gray-300 mb-8">
                  Our expert team can design and manufacture control panels and electrical systems 
                  tailored to your exact specifications.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={handleGetQuoteClick}
                    className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-yellow-400/50 transition-all hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5" />
                      Request Custom Quote
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  
                  {/* Talk to Expert with confirmation */}
                  <button
                    type="button"
                    onClick={handleTalkToExpertClick}
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    Talk to Expert
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-6 lg:gap-8 mt-10 pt-8 border-t border-white/10">
                  {[
                    { icon: Shield, text: 'Quality Assured' },
                    { icon: Award, text: 'ISO Certified' },
                    { icon: CheckCircle, text: 'Custom Design' },
                    { icon: Phone, text: '24/7 Support' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 text-gray-300">
                        <Icon className="h-5 w-5 text-yellow-400" />
                        <span className="font-semibold text-sm">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}