import React, { useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

// Guest tabs
import WelcomeTab from './tabs/WelcomeTab';
import GalleryTab from './tabs/GalleryTab';
import MenuTab from './tabs/MenuTab';
import AsoebiTab from './tabs/AsoebiTab';
import RegistryTab from './tabs/RegistryTab';
// import ContactTab from './tabs/ContactTab';
import WeddingPartyTab from './tabs/WeddingPartyTab';
import CountdownTimer from '../../components/common/CountdownTimer';
import CustomerCareFloat from '../../components/common/CustomerCareFloat';
import { formatEventDate } from '../../utils/storage';

const GuestDashboard: React.FC = () => {
  const { state, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isUserInteracting = useRef(false);
  const startTime = useRef<number>(0);
  const direction = useRef<1 | -1>(1); // 1 for right, -1 for left

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  // Smooth auto-scroll animation
  useEffect(() => {
    if (!navRef.current) return;

    const navElement = navRef.current;
    const isScrollable = navElement.scrollWidth > navElement.clientWidth;
    
    if (!isScrollable) return;

    const maxScrollLeft = navElement.scrollWidth - navElement.clientWidth;
    
    const animate = (timestamp: number) => {
      if (isUserInteracting.current) {
        // If user is interacting, pause animation but keep the reference
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!startTime.current) {
        startTime.current = timestamp;
      }

      const elapsed = timestamp - startTime.current;
      const duration = 4000; // 4 seconds
      
      // Calculate progress (0 to 1)
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function (ease-in-out)
      const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const easedProgress = easeInOut(progress);
      
      // Calculate target position based on direction
      const targetScroll = direction.current === 1 ? maxScrollLeft : 0;
      const currentScroll = navElement.scrollLeft;
      const startScroll = direction.current === 1 ? 0 : maxScrollLeft;
      
      // Interpolate between start and target
      const newScrollLeft = startScroll + (targetScroll - startScroll) * easedProgress;
      navElement.scrollLeft = newScrollLeft;
      
      // Check if animation is complete
      if (progress >= 1) {
        // Switch direction and reset timer
        direction.current = direction.current === 1 ? -1 : 1;
        startTime.current = timestamp;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Handle user interaction
    const handleInteractionStart = () => {
      isUserInteracting.current = true;
    };

    const handleInteractionEnd = () => {
      // Reset animation after user stops interacting
      setTimeout(() => {
        isUserInteracting.current = false;
        startTime.current = 0; // Reset timing
      }, 1000); // Wait 1 second after user stops interacting
    };

    // Add event listeners for user interaction
    navElement.addEventListener('touchstart', handleInteractionStart, { passive: true });
    navElement.addEventListener('touchend', handleInteractionEnd, { passive: true });
    navElement.addEventListener('mousedown', handleInteractionStart);
    navElement.addEventListener('mouseup', handleInteractionEnd);
    navElement.addEventListener('scroll', handleInteractionStart, { passive: true });

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      navElement.removeEventListener('touchstart', handleInteractionStart);
      navElement.removeEventListener('touchend', handleInteractionEnd);
      navElement.removeEventListener('mousedown', handleInteractionStart);
      navElement.removeEventListener('mouseup', handleInteractionEnd);
      navElement.removeEventListener('scroll', handleInteractionStart);
    };
  }, [state.currentUser, location.pathname]);

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
            className="flex overflow-x-auto py-4 no-scrollbar"
            style={{
              scrollBehavior: 'auto', // Let our animation handle the smoothness
            }}
          >
            <Link 
              to="/guest/welcome" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-300 ${getActiveTab('welcome')}`}
            >
              Welcome
            </Link>
            <Link 
              to="/guest/gallery" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-300 ${getActiveTab('gallery')}`}
            >
              Gallery
            </Link>
            <Link 
              to="/guest/wedding-party" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-300 ${getActiveTab('wedding-party')}`}
            >
              Wedding Party
            </Link>
            <Link 
              to="/guest/menu" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-300 ${getActiveTab('menu')}`}
            >
              Food & Drinks
            </Link>
            <Link 
              to="/guest/asoebi" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-300 ${getActiveTab('asoebi')}`}
            >
              Asoebi
            </Link>
            <Link 
              to="/guest/registry" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-300 ${getActiveTab('registry')}`}
            >
              Registry
            </Link>
            {/* Contact page hidden but code preserved for future use */}
            {/* <Link 
              to="/guest/contact" 
              className={`whitespace-nowrap px-4 py-2 mx-2 rounded-full transition-all duration-300 ${getActiveTab('contact')}`}
            >
              Contact
            </Link> */}
            <button 
              onClick={handleLogout}
              className="whitespace-nowrap px-4 py-2 mx-2 rounded-full bg-theme-card-bg text-theme-text hover:bg-gray-300 transition-all duration-300"
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
          {/* Contact route hidden but code preserved for future use */}
          {/* <Route path="/contact" element={<ContactTab />} /> */}
        </Routes>
      </div>
      
      {/* Customer Care Floating Button */}
      <CustomerCareFloat />
      
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