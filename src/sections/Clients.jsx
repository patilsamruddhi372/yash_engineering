import { useState, useEffect } from 'react';
import { clientAPI } from '../api/axios';
import { Building2, CheckCircle, Users, Award } from 'lucide-react';

export default function Clients() {
  const INITIAL_VISIBLE_CLIENTS = 8;

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllClients, setShowAllClients] = useState(false);

  const stats = [
    { icon: Users, value: '500+', label: 'Happy Clients' },
    { icon: CheckCircle, value: '1000+', label: 'Projects Completed' },
    { icon: Award, value: '15+', label: 'Years Experience' },
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching clients...');

        // ✅ Call API - returns array directly
        const response = await clientAPI.getClients({ status: 'Active' });
        
        console.log('📦 API Response:', response);

        // Response is already an array
        const clientsArray = Array.isArray(response) ? response : [];
        
        console.log('✅ Clients loaded:', clientsArray.length);
        
        const normalized = clientsArray.map(c => ({
          _id: c._id || c.id || String(Math.random()),
          name: c.name || 'Unnamed Client',
          category: c.category || 'Enterprise Partner',
          status: c.status || 'Active',
        }));
        
        setClients(normalized);
        
      } catch (err) {
        console.error('❌ Failed to load clients:', err);
        
        // User-friendly error message
        if (err.message?.includes('Network') || err.message?.includes('fetch')) {
          setError('Cannot connect to server. Please check your connection.');
        } else {
          setError(err.message || 'Failed to load clients');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const visibleClients = showAllClients
    ? clients
    : clients.slice(0, INITIAL_VISIBLE_CLIENTS);

  const hasMoreClients = clients.length > INITIAL_VISIBLE_CLIENTS;

  return (
    <section id="clients" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-sm font-semibold tracking-wide uppercase mb-4">
            Trusted Partners
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Valued Clients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're proud to partner with industry leaders who trust us to deliver 
            exceptional results and drive their success forward.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-sm border-2 border-gray-200 hover:border-yellow-400 transition-all duration-300"
            >
              <div className="p-3 bg-yellow-50 rounded-lg mb-4">
                <stat.icon className="w-8 h-8 text-yellow-600" />
              </div>
              <span className="text-4xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-gray-600 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500">Loading clients...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium mb-2">⚠️ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && clients.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No clients to display yet.</p>
          </div>
        )}

        {/* Clients Grid */}
        {!loading && !error && clients.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleClients.map((client) => (
                <div
                  key={client._id}
                  className="group relative bg-white p-8 rounded-xl border-2 border-gray-200 
                             shadow-sm hover:shadow-lg hover:border-yellow-400 
                             transition-all duration-300 ease-in-out
                             hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-yellow-50/50 
                                  opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
                  
                  <div className="relative flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-900 
                                    rounded-lg flex items-center justify-center mb-4
                                    group-hover:bg-yellow-500 transition-all duration-300
                                    shadow-md">
                      <Building2 className="w-8 h-8 text-yellow-500 group-hover:text-gray-900 transition-colors" />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-center text-lg group-hover:text-yellow-600 transition-colors">
                      {client.name}
                    </h3>
                    
                    <span className="mt-2 text-sm text-gray-500 group-hover:text-yellow-600 
                                     transition-colors duration-300">
                      {client.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {hasMoreClients && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowAllClients((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white 
                             font-semibold rounded-lg hover:bg-yellow-500 hover:text-gray-900
                             transition-all duration-300 shadow-md hover:shadow-lg
                             hover:-translate-y-0.5"
                >
                  {showAllClients ? 'Show Less Clients' : 'See More Clients'}
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      showAllClients ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Join our growing list of satisfied clients
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 text-gray-900 
                       font-semibold rounded-lg hover:bg-gray-900 hover:text-white
                       transition-all duration-300 shadow-md
                       hover:shadow-lg hover:-translate-y-0.5"
          >
            Become a Partner
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}