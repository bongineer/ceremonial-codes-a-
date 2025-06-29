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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredItems.map((item, index) => (
        <div 
          key={index} 
          className="bg-theme-card-bg rounded-lg overflow-hidden shadow-md menu-item hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="aspect-square overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="p-3">
            <h3 className="font-semibold mb-1 text-theme-text text-sm">{item.name}</h3>
            <p className="text-theme-text mb-3 text-xs line-clamp-2">{item.description}</p>
            
            {onSelect && !isAdmin && (
              <button 
                onClick={() => onSelect(item.name)} 
                className="w-full px-3 py-2 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300 text-xs"
              >
                Select
              </button>
            )}
            
            {isAdmin && onDelete && (
              <button 
                onClick={() => onDelete(
                  items.findIndex(i => i.name === item.name)
                )} 
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 text-xs"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      {filteredItems.length === 0 && (
        <div className="col-span-full text-center py-10 text-gray-500">
          No items available in this category.
        </div>
      )}
    </div>
  );
};

export default MenuItems;