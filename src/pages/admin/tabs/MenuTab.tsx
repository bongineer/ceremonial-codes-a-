import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import MenuItems from '../../../components/food/MenuItems';
import { FoodItem, DrinkItem } from '../../../types';
import { Edit, Trash2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';

const MenuTab: React.FC = () => {
  const { state, addFoodItem, removeFoodItem, addDrinkItem, removeDrinkItem } = useAppContext();
  
  // Food form state
  const [foodName, setFoodName] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [foodImage, setFoodImage] = useState('');
  const [foodCategory, setFoodCategory] = useState<'main' | 'appetizer' | 'dessert'>('main');
  const [foodGuestCategory, setFoodGuestCategory] = useState<'VVIP' | 'premium' | 'family'>('VVIP');
  
  // Drink form state
  const [drinkName, setDrinkName] = useState('');
  const [drinkDescription, setDrinkDescription] = useState('');
  const [drinkImage, setDrinkImage] = useState('');
  const [drinkCategory, setDrinkCategory] = useState<'alcoholic' | 'non-alcoholic' | 'water'>('alcoholic');
  const [drinkGuestCategory, setDrinkGuestCategory] = useState<'VVIP' | 'premium' | 'family'>('VVIP');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'food' | 'drink'>('food');
  
  const handleAddFood = () => {
    if (!foodName.trim() || !foodDescription.trim() || !foodImage.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    
    const newFood: FoodItem = {
      name: foodName.trim(),
      description: foodDescription.trim(),
      imageUrl: foodImage.trim(),
      category: foodCategory,
      guestCategory: foodGuestCategory
    };
    
    addFoodItem(newFood);
    
    // Clear form
    setFoodName('');
    setFoodDescription('');
    setFoodImage('');
    
    toast.success('Food item added to menu!');
  };
  
  const handleAddDrink = () => {
    if (!drinkName.trim() || !drinkDescription.trim() || !drinkImage.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    
    const newDrink: DrinkItem = {
      name: drinkName.trim(),
      description: drinkDescription.trim(),
      imageUrl: drinkImage.trim(),
      category: drinkCategory,
      guestCategory: drinkGuestCategory
    };
    
    addDrinkItem(newDrink);
    
    // Clear form
    setDrinkName('');
    setDrinkDescription('');
    setDrinkImage('');
    
    toast.success('Drink item added to menu!');
  };

  const handleEditItem = (item: any, type: 'food' | 'drink', index: number) => {
    setEditItem({ ...item, index });
    setEditType(type);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editItem) return;

    // Remove old item and add updated one
    if (editType === 'food') {
      removeFoodItem(editItem.index);
      addFoodItem({
        name: editItem.name,
        description: editItem.description,
        imageUrl: editItem.imageUrl,
        category: editItem.category,
        guestCategory: editItem.guestCategory
      });
    } else {
      removeDrinkItem(editItem.index);
      addDrinkItem({
        name: editItem.name,
        description: editItem.description,
        imageUrl: editItem.imageUrl,
        category: editItem.category,
        guestCategory: editItem.guestCategory
      });
    }

    setShowEditModal(false);
    toast.success('Item updated successfully!');
  };

  const renderMenuSection = (items: any[], category: string, type: 'food' | 'drink', onDelete: (index: number) => void) => {
    const filteredItems = items.filter(item => item.category === category);
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item, index) => {
          const actualIndex = items.findIndex(i => i === item);
          return (
            <div 
              key={index} 
              className="bg-theme-card-bg rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold mb-1 text-sm text-theme-text">{item.name}</h3>
                <p className="text-xs text-theme-text mb-2 line-clamp-2">{item.description}</p>
                
                {/* Category and Guest Category Badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="inline-block px-2 py-1 bg-theme-secondary text-theme-primary rounded-full text-xs font-medium capitalize">
                    {item.category.replace('-', ' ')}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    item.guestCategory === 'VVIP' ? 'bg-purple-100 text-purple-800' :
                    item.guestCategory === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.guestCategory}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditItem(item, type, actualIndex)}
                    className="flex-1 px-3 py-2 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300 text-xs flex items-center justify-center gap-1"
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(actualIndex)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 text-xs flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-10 text-theme-text">
            No items available in this category.
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Food Menu Section */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
        <h3 className="text-xl mb-4 font-semibold text-theme-primary">Food Menu</h3>
        
        <div className="mb-4">
          <label htmlFor="food-name" className="block text-theme-text mb-2">Food Name</label>
          <input 
            type="text" 
            id="food-name" 
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter food name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="food-description" className="block text-theme-text mb-2">Description</label>
          <textarea 
            id="food-description" 
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter food description" 
            rows={2}
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="food-image" className="block text-theme-text mb-2">Image URL</label>
          <input 
            type="text" 
            id="food-image" 
            value={foodImage}
            onChange={(e) => setFoodImage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter image URL"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="food-category" className="block text-theme-text mb-2">Food Category</label>
          <select 
            id="food-category" 
            value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
          >
            <option value="main">Main Course</option>
            <option value="appetizer">Appetizer</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="food-guest-category" className="block text-theme-text mb-2">Guest Category</label>
          <select 
            id="food-guest-category" 
            value={foodGuestCategory}
            onChange={(e) => setFoodGuestCategory(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
          >
            <option value="VVIP">VVIP</option>
            <option value="premium">Premium</option>
            <option value="family">Family</option>
          </select>
          <p className="text-sm text-theme-text opacity-75 mt-1">
            VVIP: Only VVIP guests • Premium: VVIP and premium guests • Family: All guests
          </p>
        </div>
        
        <button 
          onClick={handleAddFood}
          className="bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
        >
          Add Food Item
        </button>
        
        <div className="mt-8">
          <h4 className="font-semibold mb-4 text-theme-text">Current Food Items</h4>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2 text-theme-text">Main Courses</h5>
            {renderMenuSection(state.foodMenu, 'main', 'food', removeFoodItem)}
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-2 text-theme-text">Appetizers</h5>
            {renderMenuSection(state.foodMenu, 'appetizer', 'food', removeFoodItem)}
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-2 text-theme-text">Desserts</h5>
            {renderMenuSection(state.foodMenu, 'dessert', 'food', removeFoodItem)}
          </div>
        </div>
      </div>
      
      {/* Drinks Menu Section */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
        <h3 className="text-xl mb-4 font-semibold text-theme-primary">Drinks Menu</h3>
        
        <div className="mb-4">
          <label htmlFor="drink-name" className="block text-theme-text mb-2">Drink Name</label>
          <input 
            type="text" 
            id="drink-name" 
            value={drinkName}
            onChange={(e) => setDrinkName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter drink name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="drink-description" className="block text-theme-text mb-2">Description</label>
          <textarea 
            id="drink-description" 
            value={drinkDescription}
            onChange={(e) => setDrinkDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter drink description" 
            rows={2}
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="drink-image" className="block text-theme-text mb-2">Image URL</label>
          <input 
            type="text" 
            id="drink-image" 
            value={drinkImage}
            onChange={(e) => setDrinkImage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter image URL"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="drink-category" className="block text-theme-text mb-2">Drink Category</label>
          <select 
            id="drink-category" 
            value={drinkCategory}
            onChange={(e) => setDrinkCategory(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
          >
            <option value="alcoholic">Alcoholic</option>
            <option value="non-alcoholic">Non-Alcoholic</option>
            <option value="water">Water</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="drink-guest-category" className="block text-theme-text mb-2">Guest Category</label>
          <select 
            id="drink-guest-category" 
            value={drinkGuestCategory}
            onChange={(e) => setDrinkGuestCategory(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
          >
            <option value="VVIP">VVIP</option>
            <option value="premium">Premium</option>
            <option value="family">Family</option>
          </select>
          <p className="text-sm text-theme-text opacity-75 mt-1">
            VVIP: Only VVIP guests • Premium: VVIP and premium guests • Family: All guests
          </p>
        </div>
        
        <button 
          onClick={handleAddDrink}
          className="bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
        >
          Add Drink Item
        </button>
        
        <div className="mt-8">
          <h4 className="font-semibold mb-4 text-theme-text">Current Drink Items</h4>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2 text-theme-text">Alcoholic Beverages</h5>
            {renderMenuSection(state.drinkMenu, 'alcoholic', 'drink', removeDrinkItem)}
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-2 text-theme-text">Non-Alcoholic Beverages</h5>
            {renderMenuSection(state.drinkMenu, 'non-alcoholic', 'drink', removeDrinkItem)}
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-2 text-theme-text">Water</h5>
            {renderMenuSection(state.drinkMenu, 'water', 'drink', removeDrinkItem)}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${editType === 'food' ? 'Food' : 'Drink'} Item`}
      >
        {editItem && (
          <div>
            <div className="mb-4">
              <label className="block text-theme-text mb-2">Name</label>
              <input 
                type="text" 
                value={editItem.name}
                onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-theme-text mb-2">Description</label>
              <textarea 
                value={editItem.description}
                onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
                rows={2}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-theme-text mb-2">Image URL</label>
              <input 
                type="text" 
                value={editItem.imageUrl}
                onChange={(e) => setEditItem({...editItem, imageUrl: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-theme-text mb-2">{editType === 'food' ? 'Food' : 'Drink'} Category</label>
              <select 
                value={editItem.category}
                onChange={(e) => setEditItem({...editItem, category: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
              >
                {editType === 'food' ? (
                  <>
                    <option value="main">Main Course</option>
                    <option value="appetizer">Appetizer</option>
                    <option value="dessert">Dessert</option>
                  </>
                ) : (
                  <>
                    <option value="alcoholic">Alcoholic</option>
                    <option value="non-alcoholic">Non-Alcoholic</option>
                    <option value="water">Water</option>
                  </>
                )}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-theme-text mb-2">Guest Category</label>
              <select 
                value={editItem.guestCategory}
                onChange={(e) => setEditItem({...editItem, guestCategory: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
              >
                <option value="VVIP">VVIP</option>
                <option value="premium">Premium</option>
                <option value="family">Family</option>
              </select>
            </div>
            
            <button 
              onClick={handleSaveEdit}
              className="w-full px-4 py-2 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300"
            >
              Save Changes
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MenuTab;