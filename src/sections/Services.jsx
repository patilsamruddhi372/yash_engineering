import { 
  Wrench,
  Settings,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Phone,
  FileText,
  Clock,
  Users,
  Award,
  TrendingUp,
  Lightbulb,
  ClipboardCheck,
  Headphones,
  Star,
  ChevronRight,
  Factory,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { serviceAPI } from '../api/axios'; // ✅ use backend API

// Static meta to enrich services (features, rating, projects) by title
const SERVICE_META = {
  'Electrical Contracting & Consulting': {
    features: [
      'Industrial electrical consulting',
      'HT & LT electrical works',
      'Project planning & execution',
      'Compliance with safety standards',
    ],
    rating: 5.0,
    projects: 200,
    badge: 'Core Service',
  },
  'Control Panel Manufacturing': {
    features: [
      'APFC, MCC & PCC panels',
      'PLC & VFD panels',
      'Multi Party & Remote Desk panels',
      'Customized panel solutions',
    ],
    rating: 5.0,
    projects: 300,
    badge: 'In-House',
  },
  'HT & LT Substation Works': {
    features: [
      'Substation erection',
      'Transformer installation',
      'Testing & commissioning',
      'Preventive maintenance',
    ],
    rating: 5.0,
    projects: 150,
    badge: 'Advanced',
  },
};

// Map category to default icon
const getServiceIcon = (service, index) => {
  const byCategory = {
    Repair: Wrench,
    Maintenance: ClipboardCheck,
    Installation: Factory,
    Consultation: Headphones,
    Electrical: Wrench,
    Automation: Zap,
  };

  if (service.category && byCategory[service.category]) {
    return byCategory[service.category];
  }

  const fallback = [Wrench, Settings, Zap, Lightbulb, Factory, Target];
  return fallback[index % fallback.length];
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [showAll, setShowAll] = useState(false); // ✅ NEW: Toggle show all services

  const INITIAL_DISPLAY_COUNT = 6; // ✅ Show only 6 services initially

  const processSteps = [
    { icon: Phone,           title: 'Consultation',      description: 'Discuss your requirements with our expert team' },
    { icon: ClipboardCheck,  title: 'Site Assessment',   description: 'Detailed on-site evaluation and feasibility study' },
    { icon: Lightbulb,       title: 'Design & Planning', description: 'Custom solution design with technical drawings' },
    { icon: Settings,        title: 'Implementation',    description: 'Professional installation by certified engineers' },
    { icon: CheckCircle,     title: 'Testing & Handover',description: 'Rigorous testing and comprehensive documentation' },
    { icon: Headphones,      title: 'Support',           description: '24/7 ongoing maintenance and technical support' }
  ];

  const whyChooseUs = [
    { icon: Award, text: 'ISO 9001:2015 Certified' },
    { icon: Users, text: '50+ Expert Engineers' },
    { icon: Shield, text: 'Quality Guaranteed' },
    { icon: Clock, text: 'On-Time Delivery' }
  ];

  const phoneNumber = '+91 9518764038';

  const handleGetQuoteClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/#contact';
    }
  };

  const handleCallNowClick = () => {
    const tel = '+919518764038';
    const confirmed = window.confirm(`Do you want to call ${phoneNumber}?`);
    if (confirmed) {
      window.location.href = `tel:${tel}`;
    }
  };

  // ✅ NEW: Toggle show all services
  const handleSeeMoreClick = () => {
    setShowAll(!showAll);
    
    // Scroll to services section when collapsing
    if (showAll) {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Fetch services from backend
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await serviceAPI.getServices();

        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.services)) {
          list = res.services;
        } else if (res.success && Array.isArray(res.data)) {
          list = res.data;
        } else {
          console.warn('Unexpected services response structure:', res);
        }

        const normalized = list.map((s) => {
          const base = {
            _id: s._id || s.id || String(Math.random()),
            title: s.title || s.name || 'Untitled Service',
            desc: s.description || s.desc || '',
            category: s.category || 'Service',
            status: s.status || 'Active',
            duration: s.duration || '',
            price: s.price ?? null,
            image: s.image || s.imageUrl || null,
            featured: !!s.featured,
            features: s.features || [],
            rating: typeof s.rating === 'number' ? s.rating : undefined,
            projects: s.projects,
          };

          const meta = SERVICE_META[base.title] || {};
          return {
            ...base,
            features: base.features.length ? base.features : (meta.features || []),
            rating: base.rating ?? meta.rating ?? 5.0,
            projects: base.projects ?? meta.projects ?? 100,
            badge: meta.badge || (base.featured ? 'Featured' : null),
          };
        });

        setServices(normalized);
      } catch (err) {
        console.error('Failed to load services:', err);
        setError(err.message || 'Failed to load services.');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="relative py-16 md:py-24 bg-gray-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-lg">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="relative py-16 md:py-24 bg-gray-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 text-lg font-semibold">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ✅ NEW: Display services based on showAll state
  const displayedServices = showAll ? services : services.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreServices = services.length > INITIAL_DISPLAY_COUNT;

  return (
    <section id="services" className="relative py-16 md:py-24 bg-gray-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-6">
            <Wrench className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-gray-900">What We Do</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive Industrial Solutions
          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From design to installation and maintenance, we provide end-to-end electrical 
            and automation solutions for industries across Maharashtra.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {displayedServices.map((service, index) => {
            const Icon = getServiceIcon(service, index);
            const isActive = activeService === index;

            return (
              <div
                key={service._id}
                onMouseEnter={() => setActiveService(index)}
                onMouseLeave={() => setActiveService(null)}
                className={`group relative bg-white rounded-3xl shadow-sm border border-yellow-200 
                            transition-all duration-300 h-full flex flex-col 
                            ${isActive ? 'shadow-lg border-yellow-500' : 'hover:border-yellow-400 hover:shadow-lg'}`}
              >
                {/* Badge */}
                {service.badge && (
                  <div className="absolute top-6 right-6">
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200">
                      {service.badge}
                    </span>
                  </div>
                )}

                <div className="relative p-6 lg:p-8 flex flex-col h-full">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-50 rounded-lg mb-4 group-hover:bg-yellow-100 transition-colors duration-300">
                    <Icon className="h-7 w-7 text-yellow-600" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {service.desc}
                  </p>

                  {/* Features */}
                  {service.features && service.features.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rating & Projects */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">
                        {service.rating?.toFixed
                          ? service.rating.toFixed(1)
                          : service.rating || '5.0'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {service.projects || '100+'} Projects
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-gray-900 hover:bg-yellow-500 text-white hover:text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn mt-auto">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ NEW: See More / Show Less Button */}
        {hasMoreServices && (
          <div className="text-center mb-20">
            <button
              onClick={handleSeeMoreClick}
              className="group inline-flex items-center justify-center gap-3 bg-white hover:bg-yellow-500 text-gray-900 border-2 border-gray-900 hover:border-yellow-500 px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <span className="text-lg">
                {showAll ? 'Show Less Services' : `See All Services (${services.length})`}
              </span>
              {showAll ? (
                <ChevronUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
              ) : (
                <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
              )}
            </button>
            
            {!showAll && (
              <p className="text-gray-500 text-sm mt-3">
                Showing {INITIAL_DISPLAY_COUNT} of {services.length} services
              </p>
            )}
          </div>
        )}

        {/* Our Work Process */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Work Process
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A systematic approach ensuring quality, efficiency, and client satisfaction at every step
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={index} className="relative group">
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gray-200 z-0" />
                  )}

                  <div className="relative bg-white border-2 border-gray-200 hover:border-yellow-400 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                      {index + 1}
                    </div>

                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-4 group-hover:bg-yellow-50 transition-colors">
                      <Icon className="h-6 w-6 text-gray-700 group-hover:text-yellow-600 transition-colors" />
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h4>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white mb-20 border-4 border-yellow-500">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-500/20 rounded-lg mb-6">
              <Target className="h-7 w-7 text-yellow-500" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Yash Engineering?
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Three decades of excellence, innovation, and unwavering commitment to quality
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 hover:border-yellow-500/50 rounded-lg p-6 text-center hover:bg-white/10 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <p className="font-semibold text-base">{item.text}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-yellow-500/20">
            {[
              { num: '30+',  label: 'Years Experience' },
              { num: '500+', label: 'Projects Completed' },
              { num: '100+', label: 'Happy Clients' },
              { num: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">
                  {stat.num}
                </div>
                <div className="text-gray-400 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white border-2 border-gray-900 rounded-2xl p-8 md:p-12 text-center shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-gray-900">Get Started Today</span>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Power Your Business?
            </h3>

            <p className="text-lg text-gray-600 mb-8">
              Let our experts design the perfect electrical solution for your industrial needs. 
              Get a free consultation and quote today!
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleGetQuoteClick}
                className="group bg-yellow-500 hover:bg-gray-900 text-gray-900 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5" />
                  Get Free Quote
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                type="button"
                onClick={handleCallNowClick}
                className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                <div className="text-left">
                  <div className="text-xs opacity-60">Call Us Now</div>
                  <div className="text-sm font-bold">{phoneNumber}</div>
                </div>
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-gray-200">
              {[
                { icon: Shield,    text: 'Quality Guaranteed' },
                { icon: Clock,     text: 'On-Time Delivery' },
                { icon: Award,     text: 'ISO Certified' },
                { icon: Headphones,text: '24/7 Support' }
              ].map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <Icon className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-sm">{badge.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}