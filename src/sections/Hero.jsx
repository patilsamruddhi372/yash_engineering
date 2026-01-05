import { 
  Factory, 
  Phone, 
  FileText, 
  Shield, 
  Clock, 
  Users, 
  ChevronRight, 
  Zap, 
  CheckCircle,
  Sparkles,
  Award,
  TrendingUp,
  Star,
  ArrowRight,
  PlayCircle
} from 'lucide-react';

export default function Hero() {
  const stats = [
    { 
      icon: Clock, 
      num: '30+', 
      text: 'Years of Excellence', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-400/10',
      subtext: 'Since 1992'
    },
    { 
      icon: Factory, 
      num: '500+', 
      text: 'Projects Delivered', 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10',
      subtext: 'Across Industries'
    },
    { 
      icon: Users, 
      num: '100+', 
      text: 'Happy Clients', 
      color: 'text-green-400', 
      bg: 'bg-green-400/10',
      subtext: 'And Growing'
    },
    { 
      icon: Shield, 
      num: '24/7', 
      text: 'Expert Support', 
      color: 'text-purple-400', 
      bg: 'bg-purple-400/10',
      subtext: 'Always Available'
    },
  ];

  const features = [
    'Licensed & Certified Contractors',
    'Custom Engineering Solutions',
    'Pan-India Service Network'
  ];

  const services = [
    { icon: Zap, title: 'Electrical Contracting', subtitle: 'Industrial & Commercial' },
    { icon: Factory, title: 'Control Panels', subtitle: 'Custom Manufacturing' },
    { icon: TrendingUp, title: 'Automation Systems', subtitle: 'Smart Solutions' },
  ];

  const phoneNumber = '+91 9518764038';

  const handleScrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/#contact';
    }
  };

  const handleCallClick = () => {
    const confirmed = window.confirm(`Do you want to call ${phoneNumber}?`);
    if (confirmed) {
      // Remove spaces and trigger phone dialer
      window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    }
  };

  return (
    <section
      id="home"
      className="relative pt-16 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
          }}
        />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 rounded-full px-4 py-2 backdrop-blur-sm animate-fade-in">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              {/* <span className="text-sm font-semibold text-yellow-300">
                ISO Certified | Government Approved Contractor
              </span> */}
              <Award className="h-4 w-4 text-yellow-400" />
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                <span className="block mb-2">Yash Engineering</span>
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 animate-gradient">
                    Powering Industries
                  </span>
                  {/* Underline SVG */}
                  <svg 
                    className="absolute -bottom-2 left-0 w-full h-3" 
                    viewBox="0 0 300 12" 
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path 
                      d="M2 10C50 4 100 2 150 6C200 10 250 8 298 4" 
                      stroke="url(#gradient)" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      className="animate-draw"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                        <stop stopColor="#FBBF24"/>
                        <stop offset="1" stopColor="#F97316"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Expert <strong className="text-white">Electrical Contractors</strong> & 
                <strong className="text-white"> Control Panel Manufacturers</strong> delivering 
                trusted industrial solutions since <strong className="text-yellow-400">1992</strong>.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {features.map((feature, index) => (
                <div 
                  key={feature} 
                  className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              {/* Get Free Quote → Contact section */}
              <button
                onClick={handleScrollToContact}
                className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-8 py-4 rounded-xl font-bold shadow-2xl shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5" />
                  Get Free Quote
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              {/* Call Us Now → Confirm then tel: */}
              <button
                type="button"
                onClick={handleCallClick}
                className="group flex items-center justify-center gap-3 border-2 border-white/30 hover:border-white/50 bg-white/5 backdrop-blur-sm px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:bg-white/10 active:scale-95"
              >
                <div className="relative">
                  <Phone className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Call Us Now</div>
                  <div className="text-sm font-bold">{phoneNumber}</div>
                </div>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-6 border-t border-white/10">
              {/* Client Avatars */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {['SK', 'RP', 'AM', 'VK'].map((initials, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-slate-800 bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold"
                    >
                      {initials}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-yellow-400 flex items-center justify-center text-xs font-bold text-slate-900">
                    +96
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    <strong className="text-white">5.0</strong> from 100+ reviews
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-slate-700/60 to-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/50 shadow-2xl">
                
                {/* Service Grid */}
                <div className="space-y-4 mb-8">
                  {services.map((service, index) => {
                    const Icon = service.icon;
                    return (
                      <div 
                        key={service.title}
                        className="group flex items-center gap-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer border border-transparent hover:border-yellow-400/30"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="bg-yellow-400/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                          <Icon className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white">{service.title}</div>
                          <div className="text-sm text-gray-400">{service.subtitle}</div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })}
                </div>

                {/* Center Icon with Animation */}
                <div className="relative flex items-center justify-center py-8">
                  {/* Pulse Rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-56 h-56 bg-yellow-400/5 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 bg-yellow-400/10 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
                  </div>
                  
                  {/* Main Icon */}
                  <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-10 border-4 border-yellow-400/20 shadow-2xl shadow-yellow-400/20">
                    <Factory className="h-24 w-24 text-yellow-400 animate-float" />
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="text-center pt-6 border-t border-slate-700/50">
                  <div className="text-2xl font-bold text-white mb-1">
                    Industrial Excellence
                  </div>
                  <div className="text-gray-400">
                    Trusted Since <strong className="text-yellow-400">1992</strong>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-1/3 -right-12 w-20 h-20 border-4 border-dashed border-yellow-400/20 rounded-full animate-spin-slow" />
              <div className="absolute -bottom-4 right-1/4 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl rotate-45" />
              <div className="absolute top-1/4 -left-8 w-8 h-8 bg-yellow-400/30 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative bg-gradient-to-r from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-md border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
            {stats.map(({ icon: Icon, num, text, color, bg, subtext }, index) => (
              <div 
                key={text} 
                className="group text-center hover:scale-110 transition-all duration-300 cursor-default"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${bg} mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                  <Icon className={`h-8 w-8 ${color}`} />
                </div>
                
                {/* Number */}
                <div className={`text-4xl md:text-5xl lg:text-6xl font-bold ${color} mb-2`}>
                  {num}
                </div>
                
                {/* Text */}
                <div className="text-white text-base md:text-lg font-semibold mb-1">
                  {text}
                </div>
                
                {/* Subtext */}
                <div className="text-gray-400 text-sm">
                  {subtext}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes draw {
          from { stroke-dasharray: 0 300; }
          to { stroke-dasharray: 300 0; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-draw {
          stroke-dasharray: 300;
          animation: draw 2s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}