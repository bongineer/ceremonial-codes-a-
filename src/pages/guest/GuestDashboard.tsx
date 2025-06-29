import React, { useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

// Guest tabs
import WelcomeTab from './tabs/WelcomeTab';
import GalleryTab from './tabs/GalleryTab';
import MenuTab from './tabs/MenuTab';
import AsoebiTab from './tabs/AsoebiTab';
import RegistryTab from './tabs/RegistryTab';
import ContactTab from './tabs/ContactTab';
import WeddingPartyTab from './tabs/WeddingPartyTab';
import CountdownTimer from '../../components/common/CountdownTimer';
import { formatEventDate } from '../../utils/storage';

const GuestDashboard: React.FC = () => {
  const { state, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolled = useRef(false);

  useEffect(() => {
    // Redirect to login if not logged in or is admin
    if (!state.currentUser || state.currentUser === 'ADMIN') {
      navigate('/');
    }
    
    // Redirect to welcome if on root guest path
    if (location.pathname === '/guest') {
      navigate('/guest/welcome');
    }
  }, [state.currentUser, navigate, location.pathname]);

  // Initial gentle scroll animation on dashboard load
  useEffect(() => {
    if (state.currentUser && state.currentUser !== 'ADMIN' && !hasInitialScrolled.current) {
      const performInitialScroll = () => {
        if (navRef.current) {
          const navElement = navRef.current;
          const isScrollable = navElement.scrollWidth > navElement.clientWidth;
          
          if (isScrollable) {
            // Very slow initial scroll to show there are more options
            setTimeout(() => {
              navElement.scrollTo({
                left: 80, // Gentle scroll to show more content
                behavior: 'smooth'
              });
            }, 1000);
          }
          hasInitialScrolled.current = true;
        }
      };

      performInitialScroll();
    }
  }, [state.currentUser]);

  // Smooth scroll to active tab when route changes
  useEffect(() => {
    if (navRef.current && hasInitialScrolled.current) {
      const navElement = navRef.current;
      const activeLink = navElement.querySelector('.nav-active');
      
      if (activeLink) {
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = navElement.getBoundingClientRect();
        const linkCenter = linkRect.left + linkRect.width / 2;
        const navCenter = navRect.left + navRect.width / 2;
        const scrollOffset = linkCenter - navCenter;
        
        // Smooth scroll to center the active link
        setTimeout(() => {
          navElement.scrollTo({
            left: navElement.scrollLeft + scrollOffset,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!state.currentUser || state.currentUser === 'ADMIN') {
    return null;
  }

  // Determine active tab
  const getActiveTab = (path: string) => {
    const currentPath = location.pathname;
    const isActive = currentPath.includes(path);
    return isActive 
      ? "bg-theme-secondary text-theme-primary nav-active" 
      : "hover:bg-theme-secondary hover:text-theme-primary";
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <header className="bg-theme-primary text-theme-text-inverse py-5">
        <div className="container mx-auto text-center px-5">
          <h1 className="text-4xl md:text-5xl font-dancing mb-2">{state.settings.coupleNames}</h1>
          <p className="text-lg">{formatEventDate(state.settings.eventDate)}</p>
          <p className="mt-2">{state.settings.venue}</p>
          
          <div className="mt-4">
            <CountdownTimer targetDate={state.settings.eventDate} />
          </div>
        </div>
      </header>
      
      <nav className="bg-theme-card-bg shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-5">
          <div 
            ref={navRef}
            className="flex overflow-x-auto py-4 no-scrollbar scroll-smooth"
            style={{
              scrollBehavior: 'smooth',
              transition: 'scroll-left 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            <Link 
              to="/guest/welcome" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-500 ${getActiveTab('welcome')}`}
            >
              Welcome
            </Link>
            <Link 
              to="/guest/gallery" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-500 ${getActiveTab('gallery')}`}
            >
              Gallery
            </Link>
            <Link 
              to="/guest/wedding-party" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-500 ${getActiveTab('wedding-party')}`}
            >
              Wedding Party
            </Link>
            <Link 
              to="/guest/menu" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-500 ${getActiveTab('menu')}`}
            >
              Food & Drinks
            </Link>
            <Link 
              to="/guest/asoebi" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-500 ${getActiveTab('asoebi')}`}
            >
              Asoebi
            </Link>
            <Link 
              to="/guest/registry" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-500 ${getActiveTab('registry')}`}
            >
              Registry
            </Link>
            <Link 
              to="/guest/contact" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-500 ${getActiveTab('contact')}`}
            >
              Contact
            </Link>
            <button 
              onClick={handleLogout}
              className="whitespace-nowrap px-4 py-2 mx-2 rounded-full bg-theme-card-bg text-theme-text hover:bg-gray-300 transition-all duration-500"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto p-5">
        <Routes>
          <Route path="/welcome" element={<WelcomeTab />} />
          <Route path="/gallery" element={<GalleryTab />} />
          <Route path="/wedding-party" element={<WeddingPartyTab />} />
          <Route path="/menu" element={<MenuTab />} />
          <Route path="/asoebi" element={<AsoebiTab />} />
          <Route path="/registry" element={<RegistryTab />} />
          <Route path="/contact" element={<ContactTab />} />
        </Routes>
      </div>
      
      <footer className="bg-theme-primary text-theme-text-inverse py-8">
        <div className="container mx-auto px-5 text-center">
          <h3 className="text-2xl font-dancing mb-4">{state.settings.coupleNames}</h3>
          <p className="mb-4">{formatEventDate(state.settings.eventDate)}</p>
          
          <div className="mb-6 flex justify-center space-x-6">
            <a href="#" className="text-theme-text-inverse hover:text-theme-secondary transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="text-theme-text-inverse hover:text-theme-secondary transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href={`https://wa.me/${state.paymentDetails.whatsappNumber}`} className="text-theme-text-inverse hover:text-theme-secondary transition duration-300" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </a>
          </div>
          
          <p className="text-sm text-white">Thank you for celebrating with us!</p>
        </div>
      </footer>
    </div>
  );
};

export default GuestDashboard;