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
      <div className="space-y-6">
        {filteredItems.map((item, index) => {
          const actualIndex = items.findIndex(i => i === item);
          return (
            <div 
              key={index} 
              className="bg-theme-card-bg rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="md:flex">
                {/* Image Section - Larger Display */}
                <div className="md:w-1/3">
                  <div className="h-64 md:h-full overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>
                
                {/* Content Section - Full Information */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-theme-text mb-2">{item.name}</h3>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="inline-block px-3 py-1 bg-theme-secondary text-theme-primary rounded-full text-sm font-medium capitalize">
                          {item.category.replace('-', ' ')}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          item.guestCategory === 'VVIP' ? 'bg-purple-100 text-purple-800' :
                          item.guestCategory === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.guestCategory} Guests
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => handleEditItem(item, type, actualIndex)}
                        className="px-4 py-2 bg-theme-primary text-theme-button-text rounded-lg hover:bg-theme-accent transition duration-300 flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(actualIndex)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-theme-text text-lg leading-relaxed">{item.description}</p>
                  
                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-theme-secondary">
                    <div className="grid grid-cols-2 gap-4 text-sm text-theme-text opacity-75">
                      <div>
                        <span className="font-medium">Category:</span> {item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('-', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Access Level:</span> {item.guestCategory} and above
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-theme-secondary rounded-lg border-2 border-dashed border-theme-primary border-opacity-30">
            <p className="text-theme-text text-lg">No items available in this category.</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      {/* Add Forms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
          <h3 className="text-xl mb-4 font-semibold text-theme-text">Add Food Item</h3>
          
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
              VVIP: Only VVIP guests can see this item<br/>
              Premium: VVIP and premium guests can see this item<br/>
              Family: All guests can see this item
            </p>
          </div>
          
          <button 
            onClick={handleAddFood}
            className="bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
          >
            Add Food Item
          </button>
        </div>
        
        <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
          <h3 className="text-xl mb-4 font-semibold text-theme-text">Add Drink Item</h3>
          
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
              VVIP: Only VVIP guests can see this item<br/>
              Premium: VVIP and premium guests can see this item<br/>
              Family: All guests can see this item
            </p>
          </div>
          
          <button 
            onClick={handleAddDrink}
            className="bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
          >
            Add Drink Item
          </button>
        </div>
      </div>

      {/* Food Menu Display */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
        <h3 className="text-2xl mb-6 font-semibold text-theme-primary">Food Menu Management</h3>
        
        <div className="space-y-8">
          <div>
            <h4 className="text-xl mb-4 font-medium text-theme-text border-b-2 border-theme-secondary pb-2">Main Courses</h4>
            {renderMenuSection(state.foodMenu, 'main', 'food', removeFoodItem)}
          </div>
          
          <div>
            <h4 className="text-xl mb-4 font-medium text-theme-text border-b-2 border-theme-secondary pb-2">Appetizers</h4>
            {renderMenuSection(state.foodMenu, 'appetizer', 'food', removeFoodItem)}
          </div>
          
          <div>
            <h4 className="text-xl mb-4 font-medium text-theme-text border-b-2 border-theme-secondary pb-2">Desserts</h4>
            {renderMenuSection(state.foodMenu, 'dessert', 'food', removeFoodItem)}
          </div>
        </div>
      </div>

      {/* Drink Menu Display */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
        <h3 className="text-2xl mb-6 font-semibold text-theme-primary">Drinks Menu Management</h3>
        
        <div className="space-y-8">
          <div>
            <h4 className="text-xl mb-4 font-medium text-theme-text border-b-2 border-theme-secondary pb-2">Alcoholic Beverages</h4>
            {renderMenuSection(state.drinkMenu, 'alcoholic', 'drink', removeDrinkItem)}
          </div>
          
          <div>
            <h4 className="text-xl mb-4 font-medium text-theme-text border-b-2 border-theme-secondary pb-2">Non-Alcoholic Beverages</h4>
            {renderMenuSection(state.drinkMenu, 'non-alcoholic', 'drink', removeDrinkItem)}
          </div>
          
          <div>
            <h4 className="text-xl mb-4 font-medium text-theme-text border-b-2 border-theme-secondary pb-2">Water</h4>
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