import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CountdownTimer from '../components/common/CountdownTimer';
import { useAppContext } from '../context/AppContext';
import { isSupabaseReady } from '../lib/supabase';
import { formatEventDate } from '../utils/storage';

const LoginScreen: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, state } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!accessCode.trim()) {
      setError('Please enter your access code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(accessCode);
      
      if (success) {
        const upperCode = accessCode.toUpperCase();
        if (upperCode === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (upperCode === 'USHER') {
          navigate('/usher');
        } else {
          navigate('/guest/welcome');
        }
      } else {
        setError('Invalid access code. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred while logging in.');
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-5"
         style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')" }}>
      <div className="bg-theme-card-bg rounded-lg shadow-xl p-8 w-full max-w-md animate-fade-in-down">
        <h1 className="text-5xl text-center mb-4 text-theme-primary font-dancing animate-fade-in">
          {state.settings.coupleNames}
        </h1>
        <p className="text-center mb-6 text-theme-text font-bold text-lg">
          {formatEventDate(state.settings.eventDate)}
        </p>
        <p className="text-center mb-6 text-theme-text">Welcome to our wedding celebration portal</p>
        
        {!isSupabaseReady && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
            <p className="font-semibold">Demo Mode</p>
            <p>Database not connected. Using local storage for demonstration.</p>
          </div>
        )}
        
        <div className="mb-8">
          <CountdownTimer targetDate={state.settings.eventDate} />
        </div>
        
        <div className="mb-6">
          <label htmlFor="access-code" className="block text-theme-text mb-2">
          </label>
          <input
            type="text"
            id="access-code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all duration-200"
            placeholder="Enter access code"
            maxLength={5}
          />
          <p className="mt-2 text-sm text-theme-text">
            {isSupabaseReady 
              ? "Access code was sent with your invitation" 
              : "Try 'ADMIN' for admin panel, 'USHER' for usher dashboard, or any 5-letter code for guest view"
            }
          </p>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full bg-theme-primary text-theme-button-text py-3 px-4 rounded-lg hover:bg-theme-accent transition duration-300 font-medium ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-theme-button-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Enter'
          )}
        </button>
        
        {error && (
          <div className="mt-4 text-red-500 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;