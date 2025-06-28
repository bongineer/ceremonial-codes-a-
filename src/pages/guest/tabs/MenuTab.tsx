import React from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import BackgroundImage from '../../../components/common/BackgroundImage';
import FlowerBorder from '../../../components/common/FlowerBorder';

const MenuTab: React.FC = () => {
  const { state, updateGuestFood, updateGuestDrink } = useAppContext();
  const guestCode = state.currentUser || '';
  const guest = guestCode ? state.guests[guestCode] : null;
  const guestCategory = guest?.category || 'VVIP';
  
  // Filter menu items based on guest category
  const getAvailableItems = (items: any[]) => {
    return items.filter(item => {
      const itemGuestCategory = item.guestCategory || 'VVIP';
      
      if (guestCategory === 'family') return true; // Family can access all
      if (guestCategory === 'premium') return itemGuestCategory === 'VVIP' || itemGuestCategory === 'premium';
      return itemGuestCategory === 'VVIP'; // VVIP only gets VVIP
    });
  };
  
  const availableFoodItems = getAvailableItems(state.foodMenu);
  const availableDrinkItems = getAvailableItems(state.drinkMenu);
  
  const handleSelectFood = (foodName: string) => {
    updateGuestFood(guestCode, foodName);
    toast.success(`You have selected ${foodName} as your meal.`);
  };
  
  const handleSelectDrink = (drinkName: string) => {
    updateGuestDrink(guestCode, drinkName);
    toast.success(`You have selected ${drinkName} as your drink.`);
  };

  // Component for horizontally scrollable menu items
  const HorizontalMenuItems: React.FC<{
    items: any[];
    category: string;
    onSelect: (itemName: string) => void;
  }> = ({ items, category, onSelect }) => {
    const filteredItems = items.filter(item => item.category === category);

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
          No items available in this category.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {filteredItems.map((item, index) => (
            <div 
              key={index} 
              className="bg-theme-card-bg rounded-lg overflow-hidden shadow-md menu-item hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-64"
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 text-theme-text text-lg">{item.name}</h3>
                <p className="text-theme-text mb-4 text-sm line-clamp-3">{item.description}</p>
                
                <button 
                  onClick={() => onSelect(item.name)} 
                  className="w-full px-4 py-2 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <BackgroundImage imageUrl={state.settings.welcomeImage}>
      <div>
        <h2 className="text-3xl md:text-4xl text-center mb-8 text-rose-700 font-dancing">Food & Drinks</h2>
        
        {guest && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center">Your Selections</h3>
            <div className="flex flex-col md:flex-row md:justify-around">
              <div className="mb-4 md:mb-0">
                <p className="font-medium">Selected Food:</p>
                <p className="text-rose-600">{guest.selectedFood || 'No selection yet'}</p>
              </div>
              <div>
                <p className="font-medium">Selected Drink:</p>
                <p className="text-rose-600">{guest.selectedDrink || 'No selection yet'}</p>
              </div>
            </div>
            <div className="text-center mt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                guestCategory === 'family' ? 'bg-blue-100 text-blue-800' :
                guestCategory === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {guestCategory.charAt(0).toUpperCase() + guestCategory.slice(1)} Guest
              </span>
            </div>
          </div>
        )}
        
        <div className="mb-12">
          <h3 className="text-2xl mb-6 text-center font-semibold">Food Menu</h3>
          
          <div className="mb-8">
            <h4 className="text-xl mb-4 border-b pb-2 font-medium">Main Course</h4>
            <HorizontalMenuItems 
              items={availableFoodItems} 
              category="main" 
              onSelect={handleSelectFood} 
            />
          </div>
          
          <div className="mb-8">
            <h4 className="text-xl mb-4 border-b pb-2 font-medium">Appetizers</h4>
            <HorizontalMenuItems 
              items={availableFoodItems} 
              category="appetizer" 
              onSelect={handleSelectFood} 
            />
          </div>
          
          <div className="mb-8">
            <h4 className="text-xl mb-4 border-b pb-2 font-medium">Desserts</h4>
            <HorizontalMenuItems 
              items={availableFoodItems} 
              category="dessert" 
              onSelect={handleSelectFood} 
            />
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-2xl mb-6 text-center font-semibold">Drinks</h3>
          
          <div className="mb-8">
            <h4 className="text-xl mb-4 border-b pb-2 font-medium">Alcoholic Beverages</h4>
            <HorizontalMenuItems 
              items={availableDrinkItems} 
              category="alcoholic" 
              onSelect={handleSelectDrink} 
            />
          </div>
          
          <div className="mb-8">
            <h4 className="text-xl mb-4 border-b pb-2 font-medium">Non-Alcoholic Beverages</h4>
            <HorizontalMenuItems 
              items={availableDrinkItems} 
              category="non-alcoholic" 
              onSelect={handleSelectDrink} 
            />
          </div>
          
          <div className="mb-8">
            <h4 className="text-xl mb-4 border-b pb-2 font-medium">Water</h4>
            <HorizontalMenuItems 
              items={availableDrinkItems} 
              category="water" 
              onSelect={handleSelectDrink} 
            />
          </div>
        </div>
        
        <FlowerBorder />
      </div>
    </BackgroundImage>
  );
};

export default MenuTab;