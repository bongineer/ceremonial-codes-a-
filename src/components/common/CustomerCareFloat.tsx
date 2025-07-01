import React, { useState } from 'react';
import { Headset, Phone, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const CustomerCareFloat: React.FC = () => {
  const { state } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hello! I need assistance with the wedding celebration.");
    window.open(`https://wa.me/${state.paymentDetails.whatsappNumber}?text=${message}`, '_blank');
  };

  const handlePhoneClick = () => {
    window.open(`tel:${state.paymentDetails.whatsappNumber}`, '_self');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Options */}
      {isExpanded && (
        <div className="mb-4 flex flex-col gap-3 animate-fade-in">
          {/* WhatsApp Option */}
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            title="Chat on WhatsApp"
          >
            <Headset className="w-5 h-5" />
            <span className="text-sm font-medium">WhatsApp</span>
          </button>

          {/* Phone Call Option */}
          <button
            onClick={handlePhoneClick}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            title="Call directly"
          >
            <Phone className="w-5 h-5" />
            <span className="text-sm font-medium">Call</span>
          </button>
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isExpanded 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-theme-primary hover:bg-theme-accent text-theme-button-text'
        }`}
        title={isExpanded ? "Close" : "Customer Care"}
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Headset className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default CustomerCareFloat;