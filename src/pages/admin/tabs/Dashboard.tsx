import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import { formatEventDate } from '../../../utils/storage';

const Dashboard: React.FC = () => {
  const { state, updateSettings } = useAppContext();
  
  const [eventDate, setEventDate] = useState(state.settings.eventDate);
  const [receptionDate, setReceptionDate] = useState(state.settings.receptionDate || '');
  const [maxSeats, setMaxSeats] = useState(state.settings.maxSeats);
  const [seatsPerTable, setSeatsPerTable] = useState(state.settings.seatsPerTable);
  const [coupleNames, setCoupleNames] = useState(state.settings.coupleNames);
  const [venue, setVenue] = useState(state.settings.venue);
  const [receptionVenue, setReceptionVenue] = useState(state.settings.receptionVenue || '');
  const [welcomeImage, setWelcomeImage] = useState(state.settings.welcomeImage || '');
  const [welcomeImages, setWelcomeImages] = useState<string[]>(state.settings.welcomeImages || []);
  
  // Stats calculations
  const totalGuests = Object.keys(state.guests).filter(code => code !== 'ADMIN').length;
  const arrivedGuests = Object.values(state.guests)
    .filter(guest => guest.arrived).length;
  const confirmedGuests = Object.values(state.guests)
    .filter(guest => guest.seatNumber !== null).length;
  const mealsServed = Object.values(state.guests)
    .filter(guest => guest.mealServed).length;
  const drinksServed = Object.values(state.guests)
    .filter(guest => guest.drinkServed).length;
  
  const handleSaveSettings = () => {
    updateSettings({
      eventDate,
      receptionDate,
      maxSeats,
      seatsPerTable,
      coupleNames,
      venue,
      receptionVenue,
      welcomeImage,
      welcomeImages
    });
    
    toast.success('Settings saved successfully!');
  };

  const handleAddWelcomeImage = () => {
    if (welcomeImages.length >= 6) {
      toast.error('Maximum 6 welcome images allowed');
      return;
    }
    setWelcomeImages([...welcomeImages, '']);
  };

  const handleUpdateWelcomeImage = (index: number, url: string) => {
    const updatedImages = [...welcomeImages];
    updatedImages[index] = url;
    setWelcomeImages(updatedImages);
  };

  const handleRemoveWelcomeImage = (index: number) => {
    const updatedImages = welcomeImages.filter((_, i) => i !== index);
    setWelcomeImages(updatedImages);
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-theme-card-bg p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl mb-2 font-semibold">Total Guests</h3>
          <p className="text-3xl text-theme-primary font-bold">{totalGuests}</p>
          <p className="text-sm text-theme-text mt-2">Maximum capacity: {state.settings.maxSeats}</p>
        </div>
        
        <div className="bg-theme-card-bg p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl mb-2 font-semibold">Arrived Guests</h3>
          <p className="text-3xl text-green-600 font-bold">{arrivedGuests}</p>
          <p className="text-sm text-theme-text mt-2">Out of {confirmedGuests} confirmed</p>
        </div>
        
        <div className="bg-theme-card-bg p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl mb-2 font-semibold">Meals Served</h3>
          <p className="text-3xl text-amber-600 font-bold">{mealsServed}</p>
          <p className="text-sm text-theme-text mt-2">Drinks served: {drinksServed}</p>
        </div>
      </div>
      
      {/* Quick Settings Card */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl mb-4 font-semibold">Quick Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="couple-names" className="block text-theme-text mb-2">Couple Names</label>
            <input 
              type="text" 
              id="couple-names" 
              value={coupleNames}
              onChange={(e) => setCoupleNames(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
          
          <div>
            <label htmlFor="event-date" className="block text-theme-text mb-2">Wedding Ceremony Date & Time</label>
            <input 
              type="datetime-local" 
              id="event-date" 
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
          
          <div>
            <label htmlFor="venue" className="block text-theme-text mb-2">Wedding Ceremony Venue</label>
            <input 
              type="text" 
              id="venue" 
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
          
          <div>
            <label htmlFor="reception-date" className="block text-theme-text mb-2">Reception Date & Time</label>
            <input 
              type="datetime-local" 
              id="reception-date" 
              value={receptionDate}
              onChange={(e) => setReceptionDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="reception-venue" className="block text-theme-text mb-2">Reception Venue</label>
            <input 
              type="text" 
              id="reception-venue" 
              value={receptionVenue}
              onChange={(e) => setReceptionVenue(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
              placeholder="Enter reception venue (if different from ceremony venue)"
            />
          </div>
        </div>
        
        <button 
          onClick={handleSaveSettings}
          className="mt-6 bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
        >
          Save Settings
        </button>
      </div>
      
      {/* Welcome Images Card */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl mb-4 font-semibold">Welcome Images</h3>
        
        <div className="mb-6">
          <label htmlFor="welcome-image" className="block text-theme-text mb-2">Primary Welcome Image URL</label>
          <input 
            type="text" 
            id="welcome-image" 
            value={welcomeImage}
            onChange={(e) => setWelcomeImage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            placeholder="Enter primary image URL for welcome page"
          />
          {welcomeImage && (
            <div className="mt-2">
              <img 
                src={welcomeImage} 
                alt="Welcome preview" 
                className="w-full max-w-md h-48 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        {/* Welcome Images Slider Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-theme-text">Welcome Page Photo Slider (Max 6 photos)</h4>
            <button
              onClick={handleAddWelcomeImage}
              disabled={welcomeImages.length >= 6}
              className="px-4 py-2 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Photo
            </button>
          </div>
          
          <div className="space-y-4">
            {welcomeImages.map((imageUrl, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <label className="block text-theme-text mb-2">Photo {index + 1} URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => handleUpdateWelcomeImage(index, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
                    placeholder="Enter image URL"
                  />
                </div>
                
                {imageUrl && (
                  <div className="w-24 h-16">
                    <img
                      src={imageUrl}
                      alt={`Welcome ${index + 1}`}
                      className="w-full h-full object-cover rounded border"
                    />
                  </div>
                )}
                
                <button
                  onClick={() => handleRemoveWelcomeImage(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Remove
                </button>
              </div>
            ))}
            
            {welcomeImages.length === 0 && (
              <div className="text-center py-8 text-theme-text border-2 border-dashed border-gray-300 rounded-lg">
                <p>No welcome images added yet. Click "Add Photo" to start building your photo slider.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Seating Configuration Card */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl mb-4 font-semibold">Seating Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="max-seats" className="block text-theme-text mb-2">Total Seats (max 300)</label>
            <input 
              type="number" 
              id="max-seats" 
              min="1" 
              max="300" 
              value={maxSeats}
              onChange={(e) => setMaxSeats(parseInt(e.target.value) || 300)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
            <p className="text-sm text-theme-text mt-1">
              This determines the maximum number of guests that can be accommodated.
            </p>
          </div>
          
          <div>
            <label htmlFor="seats-per-table" className="block text-theme-text mb-2">Seats Per Table</label>
            <input 
              type="number" 
              id="seats-per-table" 
              min="1" 
              max="20" 
              value={seatsPerTable}
              onChange={(e) => setSeatsPerTable(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
            <p className="text-sm text-theme-text mt-1">
              Table mapping: Seats 1-{seatsPerTable} = Table 1, Seats {seatsPerTable + 1}-{seatsPerTable * 2} = Table 2, etc.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Guest Management</h4>
          <p className="text-blue-700 text-sm mb-2">
            Access codes for guests are automatically generated in the Guest Management section based on your seating configuration.
          </p>
          <p className="text-blue-600 text-sm">
            Current capacity: <span className="font-semibold">{totalGuests} guests</span> out of <span className="font-semibold">{maxSeats} total seats</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;