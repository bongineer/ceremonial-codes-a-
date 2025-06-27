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
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden md:h-64">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold mb-1 text-gray-800 text-sm">{item.name}</h3>
                <p className="text-gray-600 mb-2 text-xs line-clamp-2">{item.description}</p>
                <p className="text-xs text-gray-500 mb-3">
                  Guest Category: <span className="font-medium capitalize">{item.guestCategory}</span>
                </p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditItem(item, type, actualIndex)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 text-xs flex items-center justify-center gap-1"
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
          <div className="col-span-full text-center py-10 text-gray-500">
            No items available in this category.
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl mb-4 font-semibold">Food Menu</h3>
        
        <div className="mb-4">
          <label htmlFor="food-name" className="block text-gray-700 mb-2">Food Name</label>
          <input 
            type="text" 
            id="food-name" 
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" 
            placeholder="Enter food name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="food-description" className="block text-gray-700 mb-2">Description</label>
          <textarea 
            id="food-description" 
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" 
            placeholder="Enter food description" 
            rows={2}
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="food-image" className="block text-gray-700 mb-2">Image URL</label>
          <input 
            type="text" 
            id="food-image" 
            value={foodImage}
            onChange={(e) => setFoodImage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" 
            placeholder="Enter image URL"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="food-category" className="block text-gray-700 mb-2">Food Category</label>
          <select 
            id="food-category" 
            value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="main">Main Course</option>
            <option value="appetizer">Appetizer</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="food-guest-category" className="block text-gray-700 mb-2">Guest Category</label>
          <select 
            id="food-guest-category" 
            value={foodGuestCategory}
            onChange={(e) => setFoodGuestCategory(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="VVIP">VVIP</option>
            <option value="premium">Premium</option>
            <option value="family">Family</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            VVIP: Only VVIP guests can see this item<br/>
            Premium: VVIP and premium guests can see this item<br/>
            Family: All guests can see this item
          </p>
        </div>
        
        <button 
          onClick={handleAddFood}
          className="bg-rose-600 text-white py-2 px-6 rounded-lg hover:bg-rose-700 transition duration-300"
        >
          Add Food Item
        </button>
        
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Current Food Items</h4>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2">Main Courses</h5>
            {renderMenuSection(state.foodMenu, 'main', 'food', removeFoodItem)}
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2">Appetizers</h5>
            {renderMenuSection(state.foodMenu, 'appetizer', 'food', removeFoodItem)}
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2">Desserts</h5>
            {renderMenuSection(state.foodMenu, 'dessert', 'food', removeFoodItem)}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl mb-4 font-semibold">Drinks Menu</h3>
        
        <div className="mb-4">
          <label htmlFor="drink-name" className="block text-gray-700 mb-2">Drink Name</label>
          <input 
            type="text" 
            id="drink-name" 
            value={drinkName}
            onChange={(e) => setDrinkName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" 
            placeholder="Enter drink name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="drink-description" className="block text-gray-700 mb-2">Description</label>
          <textarea 
            id="drink-description" 
            value={drinkDescription}
            onChange={(e) => setDrinkDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" 
            placeholder="Enter drink description" 
            rows={2}
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="drink-image" className="block text-gray-700 mb-2">Image URL</label>
          <input 
            type="text" 
            id="drink-image" 
            value={drinkImage}
            onChange={(e) => setDrinkImage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" 
            placeholder="Enter image URL"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="drink-category" className="block text-gray-700 mb-2">Drink Category</label>
          <select 
            id="drink-category" 
            value={drinkCategory}
            onChange={(e) => setDrinkCategory(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="alcoholic">Alcoholic</option>
            <option value="non-alcoholic">Non-Alcoholic</option>
            <option value="water">Water</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="drink-guest-category" className="block text-gray-700 mb-2">Guest Category</label>
          <select 
            id="drink-guest-category" 
            value={drinkGuestCategory}
            onChange={(e) => setDrinkGuestCategory(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="VVIP">VVIP</option>
            <option value="premium">Premium</option>
            <option value="family">Family</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            VVIP: Only VVIP guests can see this item<br/>
            Premium: VVIP and premium guests can see this item<br/>
            Family: All guests can see this item
          </p>
        </div>
        
        <button 
          onClick={handleAddDrink}
          className="bg-rose-600 text-white py-2 px-6 rounded-lg hover:bg-rose-700 transition duration-300"
        >
          Add Drink Item
        </button>
        
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Current Drink Items</h4>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2">Alcoholic Beverages</h5>
            {renderMenuSection(state.drinkMenu, 'alcoholic', 'drink', removeDrinkItem)}
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2">Non-Alcoholic Beverages</h5>
            {renderMenuSection(state.drinkMenu, 'non-alcoholic', 'drink', removeDrinkItem)}
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2">Water</h5>
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
              <label className="block text-gray-700 mb-2">Name</label>
              <input 
                type="text" 
                value={editItem.name}
                onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea 
                value={editItem.description}
                onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" 
                rows={2}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Image URL</label>
              <input 
                type="text" 
                value={editItem.imageUrl}
                onChange={(e) => setEditItem({...editItem, imageUrl: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">{editType === 'food' ? 'Food' : 'Drink'} Category</label>
              <select 
                value={editItem.category}
                onChange={(e) => setEditItem({...editItem, category: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
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
              <label className="block text-gray-700 mb-2">Guest Category</label>
              <select 
                value={editItem.guestCategory}
                onChange={(e) => setEditItem({...editItem, guestCategory: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="VVIP">VVIP</option>
                <option value="premium">Premium</option>
                <option value="family">Family</option>
              </select>
            </div>
            
            <button 
              onClick={handleSaveEdit}
              className="w-full px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition duration-300"
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