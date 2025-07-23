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
      <ToastContainer 
        position="bottom-right"
        newestOnTop={false}
        limit={2}
        autoClose={3000}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </AppProvider>
  );
}

export default App;