import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface VenueMapProps {
  ceremonyVenue: string;
  receptionVenue?: string;
}

const VenueMap: React.FC<VenueMapProps> = ({ ceremonyVenue, receptionVenue }) => {
  // Function to generate Google Maps search URL
  const getMapUrl = (venue: string) => {
    const encodedVenue = encodeURIComponent(venue);
    return `https://www.google.com/maps/search/?api=1&query=${encodedVenue}`;
  };

  // Function to generate directions URL
  const getDirectionsUrl = (venue: string) => {
    const encodedVenue = encodeURIComponent(venue);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedVenue}`;
  };

  return (
    <div className="bg-theme-card-bg rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-2xl mb-6 text-theme-primary text-center flex items-center justify-center gap-2">
        <MapPin className="w-6 h-6" />
        Venue Locations
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wedding Ceremony Venue */}
        <div className="bg-theme-secondary p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-theme-text flex items-center gap-2">
            <MapPin className="w-5 h-5 text-theme-primary" />
            Wedding Ceremony
          </h4>
          
          <p className="text-theme-text mb-4">{ceremonyVenue}</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={getMapUrl(ceremonyVenue)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300 text-sm"
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </a>
            
            <a
              href={getDirectionsUrl(ceremonyVenue)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-theme-accent text-theme-button-text rounded-lg hover:bg-theme-primary transition duration-300 text-sm"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </div>

        {/* Reception Venue */}
        <div className="bg-theme-secondary p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-theme-text flex items-center gap-2">
            <MapPin className="w-5 h-5 text-theme-primary" />
            Reception
          </h4>
          
          <p className="text-theme-text mb-4">{receptionVenue || ceremonyVenue}</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={getMapUrl(receptionVenue || ceremonyVenue)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300 text-sm"
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </a>
            
            <a
              href={getDirectionsUrl(receptionVenue || ceremonyVenue)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-theme-accent text-theme-button-text rounded-lg hover:bg-theme-primary transition duration-300 text-sm"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-theme-primary bg-opacity-10 rounded-lg">
        <p className="text-theme-text text-sm text-center">
          <strong>💡 Tip:</strong> Click "Get Directions" to open navigation in your preferred maps app, or "View on Map" to see the location details.
        </p>
      </div>
    </div>
  );
};

export default VenueMap;