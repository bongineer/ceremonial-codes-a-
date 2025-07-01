import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LoginScreen from './pages/LoginScreen';
import AdminDashboard from './pages/admin/AdminDashboard';
import GuestDashboard from './pages/guest/GuestDashboard';
import UsherDashboard from './pages/usher/UsherDashboard';

// Context
import { AppProvider } from './context/AppContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-rose-600 font-dancing mb-4">Wedding Portal</h1>
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto"></div>
          <div style={{
            position: "fixed",
            bottom: 30,
            right: 30,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}>
            <a href="https://wa.me/+2347043486896" target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" 
                alt="WhatsApp" 
                style={{ width: 50, height: 50 }} 
              />
            </a>
            <a href="tel:+2347043486896" title="Call Us">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3059/3059518.png" 
                alt="Call" 
                style={{ width: 50, height: 50 }} 
              />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/guest/*" element={<GuestDashboard />} />
          <Route path="/usher" element={<UsherDashboard />} />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </AppProvider>
  );
}

export default App;