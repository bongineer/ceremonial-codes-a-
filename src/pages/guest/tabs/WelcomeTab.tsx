import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { formatEventDate, formatEventTime } from '../../../utils/storage';
import BackgroundImage from '../../../components/common/BackgroundImage';
import FlowerBorder from '../../../components/common/FlowerBorder';
import WelcomeSlideshow from '../../../components/common/WelcomeSlideshow';

const WelcomeTab: React.FC = () => {
  const { state } = useAppContext();
  const guestCode = state.currentUser || '';
  const guest = guestCode ? state.guests[guestCode] : null;
  
  // Prepare welcome images for slideshow
  const welcomeImages = [];
  
  // Add welcome images from settings (up to 6)
  if (state.settings.welcomeImages && state.settings.welcomeImages.length > 0) {
    welcomeImages.push(...state.settings.welcomeImages.filter(img => img.trim() !== ''));
  }
  
  // If no welcome images or only one, add the primary welcome image
  if (welcomeImages.length === 0 && state.settings.welcomeImage) {
    welcomeImages.push(state.settings.welcomeImage);
  }
  
  // Fallback to default image if no images are set
  if (welcomeImages.length === 0) {
    welcomeImages.push("https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80");
  }

  const getTableNumber = (seatNumber: number | null): number | null => {
    if (!seatNumber) return null;
    return Math.ceil(seatNumber / state.settings.seatsPerTable);
  };

  const getTableName = (tableNumber: number | null): string => {
    if (!tableNumber) return '';
    return state.settings.tableNames?.[tableNumber] || `Table ${tableNumber}`;
  };
  
  return (
    <BackgroundImage imageUrl={welcomeImages[0]}>
      <div>
        <h2 className="text-3xl md:text-4xl text-center mb-8 text-theme-primary font-dancing">Welcome to Our Wedding</h2>
        
        <div className="bg-theme-card-bg rounded-lg shadow-md overflow-hidden mb-8 hover:shadow-lg transition-shadow duration-300">
          <div className="md:flex">
            <div className="md:w-2/3">
              <WelcomeSlideshow 
                images={welcomeImages}
                className="w-full h-85 md:h-full"
                interval={4000}
              />
            </div>
            
            <div className="md:w-1/3 p-8">
              <h3 className="text-2xl mb-4 text-theme-primary">Dear {guest?.name || 'Guest'},</h3>
              
              <p className="mb-4 text-theme-text">We are delighted to welcome you to our wedding celebration! Thank you for being a part of our special day.</p>
              
              <p className="mb-4 text-theme-text">This website will help you navigate our wedding events and provide you with all the information you need to enjoy the celebration.</p>
              
              <p className="mb-4 text-theme-text">Your access code: <span className="font-semibold text-theme-primary">{guestCode}</span></p>
              
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2 text-theme-text">Your Details:</h4>
                
                {/* Guest Category */}
                <p className="text-theme-text">
                  Guest Category: <span className="font-semibold capitalize text-theme-primary">{guest?.category || 'VVIP'}</span>
                </p>
                
                {guest?.seatNumber && (
                  <>
                    {/* Table Name */}
                    <p className="text-theme-text">
                      Table Name: <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {getTableName(getTableNumber(guest.seatNumber))}
                      </span>
                    </p>
                    
                    {/* Table Number */}
                    <p className="text-theme-text">
                      Table Number: <span className="font-semibold text-theme-primary">{getTableNumber(guest.seatNumber)}</span>
                    </p>
                    
                    {/* Seat Number */}
                    <p className="text-theme-text">
                      Seat Number: <span className="font-semibold text-theme-primary">{guest.seatNumber}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-theme-card-bg rounded-lg shadow-md p-8 mb-8 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-2xl mb-4 text-theme-primary text-center">Our Story</h3>
          
          <p className="mb-4 text-theme-text">We met in Lokoja. I was a 200L student, and he was working as an engineer ad Dangote. After a late class, I was walking back to my hostel when I saw a cab dropping off a passenger—him. Just as I was about to get in, he told the driver to wait. I thought he was paying for his ride, but he was trying to talk to me and get my contact.</p>
          
          <p className="text-theme-text">I was tired and a little upset, but I gave him my number and left on that same ride. That night started our journey—an unexpected moment that led to forever.</p>
        </div>
        
        <div className="bg-theme-card-bg rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-2xl mb-4 text-theme-primary text-center">Event Schedule</h3>
          
          <div className="md:flex md:space-x-8">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-2 text-theme-text">Wedding Ceremony</h4>
              <p className="mb-1 text-theme-text">Date: {formatEventDate(state.settings.eventDate)}</p>
              <p className="mb-1 text-theme-text">Time: {formatEventTime(state.settings.eventDate)}</p>
              <p className="text-theme-text">Venue: {state.settings.venue}</p>
            </div>
            
            <div className="md:w-1/2">
              <h4 className="text-lg font-semibold mb-2 text-theme-text">Reception</h4>
              <p className="mb-1 text-theme-text">
                Date: {state.settings.receptionDate ? formatEventDate(state.settings.receptionDate) : formatEventDate(state.settings.eventDate)}
              </p>
              <p className="mb-1 text-theme-text">
                Time: {state.settings.receptionDate ? formatEventTime(state.settings.receptionDate) : formatEventTime(new Date(new Date(state.settings.eventDate).getTime() + 120 * 60000).toISOString())}
              </p>
              <p className="text-theme-text">
                Venue: {state.settings.receptionVenue || state.settings.venue}
              </p>
            </div>
          </div>
        </div>
        
        <FlowerBorder />
      </div>
    </BackgroundImage>
  );
};

export default WelcomeTab;