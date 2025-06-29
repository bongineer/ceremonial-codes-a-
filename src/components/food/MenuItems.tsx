import React from 'react';
import { FoodItem, DrinkItem } from '../../types';

interface MenuItemsProps {
  items: FoodItem[] | DrinkItem[];
  category: string;
  onSelect?: (itemName: string) => void;
  isAdmin?: boolean;
  onDelete?: (index: number) => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({ 
  items, 
  category, 
  onSelect, 
  isAdmin = false,
  onDelete
}) => {
  const filteredItems = items.filter(item => 'category' in item && item.category === category);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredItems.map((item, index) => (
        <div 
          key={index} 
          className="bg-theme-card-bg rounded-lg overflow-hidden shadow-md menu-item hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
        >
          <div className="aspect-[4/5] overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-2 text-theme-text text-lg">{item.name}</h3>
            <p className="text-theme-text mb-4 text-sm line-clamp-3">{item.description}</p>
            
            {/* Guest Category Badge */}
            {'guestCategory' in item && (
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  item.guestCategory === 'VVIP' ? 'bg-purple-100 text-purple-800' :
                  item.guestCategory === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.guestCategory} Guest
                </span>
              </div>
            )}
            
            {onSelect && !isAdmin && (
              <button 
                onClick={() => onSelect(item.name)} 
                className="w-full px-4 py-3 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300 font-medium"
              >
                Select This Item
              </button>
            )}
            
            {isAdmin && onDelete && (
              <button 
                onClick={() => onDelete(
                  items.findIndex(i => i.name === item.name)
                )} 
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 font-medium"
              >
                Remove Item
              </button>
            )}
          </div>
        </div>
      ))}

      {filteredItems.length === 0 && (
        <div className="col-span-full text-center py-12 bg-theme-card-bg rounded-lg shadow-md">
          <p className="text-theme-text text-lg">No items available in this category.</p>
        </div>
      )}
    </div>
  );
};

export default MenuItems;