import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import BackgroundImage from '../../../components/common/BackgroundImage';
import FlowerBorder from '../../../components/common/FlowerBorder';

const ContactTab: React.FC = () => {
  const { state } = useAppContext();
  
  return (
    <BackgroundImage imageUrl={state.settings.welcomeImage}>
      <div>
        <h2 className="text-3xl md:text-4xl text-center mb-8 text-theme-primary font-dancing">Contact Us</h2>
        
        <div className="bg-theme-card-bg rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
          <div className="text-center mb-8">
            <p className="mb-4 text-theme-text">If you have any questions or need assistance, please don't hesitate to contact us.</p>
            
            <a 
              href={`https://wa.me/${state.paymentDetails.whatsappNumber}`}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Contact via WhatsApp
            </a>
          </div>
          
          <div className="md:flex md:space-x-8">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h3 className="text-xl mb-4 font-semibold text-theme-text">Venue Information</h3>
              
              <p className="mb-2 text-theme-text">{state.settings.venue}</p>
              <p className="mb-4 text-theme-text">123 Wedding Lane, Celebration City</p>
              
              <div className="bg-theme-secondary p-4 rounded-lg">
                <p className="mb-2 font-semibold text-theme-text">Directions:</p>
                <p className="text-theme-text">From the airport, take the main highway north for 15 minutes. Turn right at Wedding Boulevard and continue for 2 miles. The venue will be on your right.</p>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h3 className="text-xl mb-4 font-semibold text-theme-text">Accommodation</h3>
              
              <div className="mb-4">
                <p className="font-semibold text-theme-text">Royal Hotel</p>
                <p className="mb-1 text-theme-text">10% discount for wedding guests</p>
                <p className="text-theme-text">Booking Code: JSWED2024</p>
              </div>
              
              <div>
                <p className="font-semibold text-theme-text">Luxury Suites</p>
                <p className="mb-1 text-theme-text">15% discount for wedding guests</p>
                <p className="text-theme-text">Booking Code: JSCOUPLE24</p>
              </div>
            </div>
          </div>
        </div>
        
        <FlowerBorder />
      </div>
    </BackgroundImage>
  );
};

export default ContactTab;