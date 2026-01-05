import { 
  Shield, 
  Award, 
  Settings, 
  Users, 
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  Factory,
  Briefcase,
  Star,
  Globe,
  ArrowRight,
  Quote,
  Lightbulb,
  Heart
} from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'ISO 9001:2015 certified with stringent quality controls',
      color: 'yellow',
      stats: '100% Compliance'
    },
    {
      icon: Award,
      title: 'Expert Team',
      description: '50+ skilled engineers with decades of experience',
      color: 'blue',
      stats: '50+ Engineers'
    },
    {
      icon: Settings,
      title: 'Advanced Tech',
      description: 'Latest automation and control panel technologies',
      color: 'purple',
      stats: 'Cutting-Edge'
    },
    {
      icon: Users,
      title: 'Client Focus',
      description: '24/7 support with dedicated project managers',
      color: 'green',
      stats: '24/7 Support'
    },
  ];

  const milestones = [
    { year: '1992', title: 'Company Founded', description: 'Started with a vision to power industries' },
    { year: '2005', title: 'ISO Certified', description: 'Achieved ISO 9001:2015 certification' },
    { year: '2015', title: '500+ Projects', description: 'Completed major industrial installations' },
    { year: '2024', title: 'Industry Leader', description: 'Recognized leader in electrical solutions' },
  ];

  const values = [
    { icon: Lightbulb, title: 'Innovation', description: 'Constantly evolving with technology' },
    { icon: Heart, title: 'Integrity', description: 'Honest and transparent in all dealings' },
    { icon: Target, title: 'Excellence', description: 'Committed to superior quality' },
    { icon: Users, title: 'Collaboration', description: 'Working together for success' },
  ];

  const certifications = [
    'ISO 9001:2015 Certified',
    'Government Approved Contractor',
    'Electrical License Class-A',
    'Safety Standards Compliant'
  ];

  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/30 group-hover:border-yellow-400',
      icon: 'text-yellow-400',
      gradient: 'from-yellow-400/5 to-orange-400/5'
    },
    blue: {
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/30 group-hover:border-blue-400',
      icon: 'text-blue-400',
      gradient: 'from-blue-400/5 to-cyan-400/5'
    },
    purple: {
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/30 group-hover:border-purple-400',
      icon: 'text-purple-400',
      gradient: 'from-purple-400/5 to-pink-400/5'
    },
    green: {
      bg: 'bg-green-400/10',
      border: 'border-green-400/30 group-hover:border-green-400',
      icon: 'text-green-400',
      gradient: 'from-green-400/5 to-emerald-400/5'
    }
  };

  // Scroll helpers
  const goToSection = (id, fallbackHash) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = fallbackHash;
    }
  };

  const handleStartProject = () => {
    goToSection('contact', '/#contact');
  };

  const handleViewProjects = () => {
    goToSection('gallery', '/#gallery');
  };

  return (
    <section id="about" className="relative py-16 md:py-24 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900/5 to-slate-800/5 border border-slate-900/10 rounded-full px-4 py-2 mb-6">
            <Factory className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-slate-700">About Us</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Powering Industries{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600">
              Since 1992
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Three decades of excellence in industrial electrical solutions, 
            trusted by leading companies across Maharashtra and beyond.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          {/* Left Column - Story */}
          <div className="space-y-6">
            {/* Quote Card */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
              <Quote className="absolute top-6 right-6 h-16 w-16 text-yellow-400/20" />
              <div className="relative">
                <p className="text-lg leading-relaxed mb-4">
                  "At <strong className="text-yellow-400">Yash Engineering</strong>, 
                  we don't just deliver electrical solutions—we build lasting partnerships 
                  that power businesses forward."
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-slate-900">
                    YE
                  </div>
                  <div>
                    <div className="font-semibold">Yash Engineering Team</div>
                    <div className="text-sm text-gray-400">Established 1992</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Text */}
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="text-lg">
                Established in <strong className="text-slate-900">1992</strong>, 
                Yash Engineering has grown from a small electrical contractor to 
                Maharashtra's trusted name in industrial electrical solutions.
              </p>
              
              <p>
                We specialize in designing and manufacturing <strong className="text-slate-900">
                custom control panels</strong>, <strong className="text-slate-900">
                electrical substations</strong>, and comprehensive <strong className="text-slate-900">
                automation systems</strong> for diverse industries.
              </p>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-lg p-5 my-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Our Mission</h4>
                    <p className="text-gray-700">
                      To deliver innovative, reliable, and sustainable electrical solutions 
                      that exceed client expectations while maintaining the highest safety 
                      and quality standards.
                    </p>
                  </div>
                </div>
              </div>

              <p>
                Our commitment to quality, innovation, and customer satisfaction has 
                earned us partnerships with over <strong className="text-slate-900">
                100+ leading companies</strong> and successful completion of <strong className="text-slate-900">
                500+ complex projects</strong>.
              </p>
            </div>

            {/* Certifications */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-yellow-600" />
                <h4 className="font-bold text-slate-900">Certifications & Approvals</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {certifications.map((cert) => (
                  <div key={cert} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Choose Us</h3>
            
            <div className="grid gap-4">
              {features.map((feature) => {
                const colors = colorClasses[feature.color];
                const Icon = feature.icon;
                
                return (
                  <div
                    key={feature.title}
                    className={`group relative bg-gradient-to-br ${colors.gradient} border-2 ${colors.border} rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${colors.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${colors.icon}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-900 text-lg">
                            {feature.title}
                          </h4>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.bg} ${colors.icon}`}>
                            {feature.stats}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      
                      <ArrowRight className={`h-5 w-5 ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 text-center">
                <Briefcase className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-sm text-gray-300">Projects Delivered</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">100+</div>
                <div className="text-sm text-white/90">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: Timeline Section with Fixed Height Cards */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">Our Journey</h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-400 hidden md:block" />
            
            {/* ✅ Added items-stretch to ensure equal height */}
            <div className="grid md:grid-cols-4 gap-6 md:gap-4 items-stretch">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="relative flex flex-col">
                  {/* Timeline Dot */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-yellow-400/30 z-10 hidden md:flex">
                    {index + 1}
                  </div>
                  
                  {/* ✅ Content Card with fixed minimum height and flex-grow */}
                  <div className="md:mt-24 bg-white border-2 border-gray-200 hover:border-yellow-400 rounded-xl p-6 hover:shadow-xl transition-all duration-300 group flex-1 flex flex-col min-h-[180px]">
                    {/* Year - Fixed height area */}
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2 flex-shrink-0">
                      {milestone.year}
                    </div>
                    
                    {/* Title - Fixed height area */}
                    <h4 className="font-bold text-slate-900 mb-2 group-hover:text-yellow-600 transition-colors flex-shrink-0 min-h-[28px]">
                      {milestone.title}
                    </h4>
                    
                    {/* Description - Flexible area that grows */}
                    <p className="text-sm text-gray-600 flex-grow">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: Core Values with Fixed Height Cards */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold mb-3">Our Core Values</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          {/* ✅ Added items-stretch for equal height */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div 
                  key={value.title} 
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 group flex flex-col min-h-[200px]"
                >
                  {/* Icon - Fixed */}
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-400/10 rounded-full mb-4 group-hover:scale-110 transition-transform mx-auto flex-shrink-0">
                    <Icon className="h-7 w-7 text-yellow-400" />
                  </div>
                  
                  {/* Title - Fixed */}
                  <h4 className="font-bold text-lg mb-2 flex-shrink-0">{value.title}</h4>
                  
                  {/* Description - Grows to fill space */}
                  <p className="text-sm text-gray-300 flex-grow">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleStartProject}
              className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-8 py-4 rounded-xl font-bold shadow-lg shadow-yellow-400/25 hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                Start Your Project
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button
              onClick={handleViewProjects}
              className="group border-2 border-slate-900 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <Globe className="h-5 w-5" />
                View Our Projects
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}