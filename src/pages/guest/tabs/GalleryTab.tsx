import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import BackgroundImage from '../../../components/common/BackgroundImage';
import FlowerBorder from '../../../components/common/FlowerBorder';

const GalleryTab: React.FC = () => {
  const { state } = useAppContext();
  
  return (
    <BackgroundImage imageUrl={state.settings.welcomeImage}>
      <div>
        <h2 className="text-3xl md:text-4xl text-center mb-8 text-theme-primary font-dancing">Photo Gallery</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.gallery.map((photo, index) => (
            <div 
              key={index} 
              className="aspect-[4/5] overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              {photo.type === 'video' ? (
                <video 
                  src={photo.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  controls
                  poster={photo.imageUrl}
                />
              ) : (
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title || 'Wedding photo'} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              )}
            </div>
          ))}
          
          {state.gallery.length === 0 && (
            <div className="col-span-full text-center py-10 bg-theme-card-bg rounded-lg shadow-md">
              <p className="text-theme-text">No photos available yet.</p>
            </div>
          )}
        </div>
        
        {state.settings.guestPhotosLink && (
          <div className="text-center mt-8">
            <a 
              href={state.settings.guestPhotosLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Guest Photos
            </a>
          </div>
        )}
        
        <FlowerBorder />
      </div>
    </BackgroundImage>
  );
};

export default GalleryTab;