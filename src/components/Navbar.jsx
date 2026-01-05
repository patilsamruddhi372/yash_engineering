// client/src/components/Navbar.jsx
import { Menu, X, Zap, Download, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { brochureAPI } from "../api/axios"; // ✅ Updated import path

export default function Navbar({
  isMenuOpen,
  setIsMenuOpen,
  activeSection,
  scrollToSection,
}) {
  const [brochure, setBrochure] = useState(null);
  const [loadingBrochure, setLoadingBrochure] = useState(false);
  const [fetchingBrochure, setFetchingBrochure] = useState(true);

  const navItems = [
    "Home",
    "About",
    "Products",
    "Services",
    "Clients",
    "Gallery",
    "Contact",
  ];

  useEffect(() => {
    fetchActiveBrochure();
  }, []);

  const fetchActiveBrochure = async () => {
    setFetchingBrochure(true);
    try {
      console.log("📄 Fetching active brochure...");
      const response = await brochureAPI.getActive();
      console.log("📄 Brochure response:", response);
      
      if (response.success && response.data) {
        setBrochure(response.data);
        console.log("✅ Active brochure found:", response.data.title);
      } else {
        setBrochure(null);
        console.log("⚠️ No active brochure");
      }
    } catch (error) {
      console.log("No active brochure available:", error.message);
      setBrochure(null);
    } finally {
      setFetchingBrochure(false);
    }
  };

  const handleDownload = () => {
    if (!brochure) {
      alert("No brochure available for download");
      return;
    }

    setLoadingBrochure(true);

    try {
      // ✅ Use fileUrl directly from brochure data
      const downloadUrl = brochureAPI.getDownloadUrl(brochure.fileUrl);
      console.log("📥 Downloading from:", downloadUrl);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = brochure.fileName || 'brochure.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download brochure. Please try again.");
    } finally {
      setTimeout(() => setLoadingBrochure(false), 1000);
    }
  };

  return (
    <nav className="bg-slate-950 text-white fixed w-full top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => scrollToSection("home")}
          >
            <Zap className="h-8 w-8 text-yellow-400" />
            <span className="ml-2 text-xl font-bold tracking-wide">
              Yash Engineering
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 ml-auto">
            {navItems.map((item) => {
              const isActive = activeSection === item.toLowerCase();
              return (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`relative text-sm font-medium transition-colors ${
                    isActive
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-400"
                  }`}
                >
                  {item}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full"></span>
                  )}
                </button>
              );
            })}

            {/* Download Brochure Button (Desktop) */}
            {fetchingBrochure ? (
              <div className="flex items-center gap-2 px-4 py-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : brochure ? (
              <button
                onClick={handleDownload}
                disabled={loadingBrochure}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 font-semibold hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                title={`Download: ${brochure.title}`}
              >
                {loadingBrochure ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} className="group-hover:animate-bounce" />
                    <span>Brochure</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={fetchActiveBrochure}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 transition-colors"
                title="No brochure available - Click to refresh"
              >
                <FileText size={16} />
                <span className="text-xs">No Brochure</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-slate-800 transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className={`block w-full text-left px-6 py-3 text-sm transition ${
                activeSection === item.toLowerCase()
                  ? "text-yellow-400 bg-slate-900"
                  : "text-gray-300 hover:bg-slate-700 hover:text-yellow-400"
              }`}
            >
              {item}
            </button>
          ))}

          {/* Download Brochure Button (Mobile) */}
          {fetchingBrochure ? (
            <div className="flex items-center gap-2 px-6 py-3 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading brochure...</span>
            </div>
          ) : brochure ? (
            <button
              onClick={() => {
                handleDownload();
                setIsMenuOpen(false);
              }}
              disabled={loadingBrochure}
              className="flex items-center gap-3 w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 font-semibold transition disabled:opacity-50"
            >
              {loadingBrochure ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <div className="flex flex-col items-start">
                    <span>Download Brochure</span>
                    <span className="text-xs text-slate-700 font-normal truncate max-w-[200px]">
                      {brochure.title}
                    </span>
                  </div>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 text-gray-500">
              <FileText size={16} />
              <span className="text-sm">No brochure available</span>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}