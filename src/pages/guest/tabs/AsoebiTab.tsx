import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import BackgroundImage from '../../../components/common/BackgroundImage';
import FlowerBorder from '../../../components/common/FlowerBorder';

const AsoebiTab: React.FC = () => {
  const { state } = useAppContext();
  
  return (
    <BackgroundImage imageUrl={state.settings.welcomeImage}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-center mb-8 text-theme-primary font-dancing">Wedding Attire (Asoebi)</h2>
        
        <div className="bg-theme-card-bg rounded-lg shadow-md p-8 mb-8 text-center">
          <p className="mb-6 text-theme-text">
            We have selected beautiful attire options for our wedding. 
            To purchase any of these items, please contact us via WhatsApp.
          </p>
          
          <div className="bg-theme-secondary p-4 rounded-lg inline-block">
            <h4 className="font-semibold mb-2 text-theme-text">Bank Details for Payments:</h4>
            <p className="text-theme-text">Account Name: {state.paymentDetails.accountName}</p>
            <p className="text-theme-text">Account Number: {state.paymentDetails.accountNumber}</p>
            <p className="text-theme-text">Bank: {state.paymentDetails.bankName}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {state.asoebiItems.map((item, index) => (
            <div 
              key={index}
              className="bg-theme-card-bg rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-theme-text">{item.title}</h3>
                <p className="text-theme-text text-sm mb-3 line-clamp-2">{item.description}</p>
                <p className="text-theme-primary font-bold text-lg mb-4">₦{item.price.toLocaleString()}</p>
                
                <a
                  href={`https://wa.me/${state.paymentDetails.whatsappNumber}?text=I want to order: ${item.title} (₦${item.price.toLocaleString()})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-theme-primary hover:bg-theme-accent text-theme-button-text py-2 px-4 rounded-lg text-center transition-colors duration-300"
                >
                  Order Now
                </a>
              </div>
            </div>
          ))}
          
          {state.asoebiItems.length === 0 && (
            <div className="col-span-full text-center py-12 bg-theme-card-bg rounded-lg shadow-md">
              <p className="text-theme-text">Asoebi options coming soon</p>
            </div>
          )}
        </div>
        
        <FlowerBorder />
      </div>
    </BackgroundImage>
  );
};

export default AsoebiTab;