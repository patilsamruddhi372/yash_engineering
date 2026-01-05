import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

// Import all sections
import Hero from '../../sections/Hero';
import About from '../../sections/About';
import Products from '../../sections/Products';
import Services from '../../sections/Services';
import Clients from '../../sections/Clients';
import Gallery from '../../sections/Gallery';
import Contact from '../../sections/Contact';

export default function UserLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Scroll to section function
  const scrollToSection = (section) => {
    const sectionName = section.toLowerCase();
    const element = document.getElementById(sectionName);
    
    if (element) {
      const navbarHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setIsMenuOpen(false);
      setActiveSection(sectionName);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'products', 'services', 'clients', 'gallery', 'contact'];
      const navbarHeight = 64;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= navbarHeight + 100 && rect.bottom >= navbarHeight + 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent main content scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* All Sections on One Page */}
      <main>
        <section id="home">
          <Hero scrollToSection={scrollToSection} />
        </section>

        <section id="about">
          <About />
        </section>

        <section id="products">
          <Products />
        </section>

        <section id="services">
          <Services />
        </section>

        <section id="clients">
          <Clients />
        </section>

        <section id="gallery">
          <Gallery />
        </section>

        <section id="contact">
          <Contact />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-8 text-center">
        <p className="text-gray-400">
          &copy; {new Date().getFullYear()} Yash Engineering. All rights reserved.
        </p>
      </footer>
    </div>
  );
}