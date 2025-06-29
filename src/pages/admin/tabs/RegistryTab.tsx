import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import { RegistryItem } from '../../../types';

const RegistryTab: React.FC = () => {
  const { state, addRegistryItem, removeRegistryItem, updatePaymentDetails } = useAppContext();
  
  // Registry form state
  const [item, setItem] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [link, setLink] = useState('');
  
  // Payment details form state
  const [accountName, setAccountName] = useState(state.paymentDetails.accountName);
  const [accountNumber, setAccountNumber] = useState(state.paymentDetails.accountNumber);
  const [bankName, setBankName] = useState(state.paymentDetails.bankName);
  const [whatsappNumber, setWhatsappNumber] = useState(state.paymentDetails.whatsappNumber);
  
  const handleAddRegistry = () => {
    if (!item.trim() || !description.trim() || !imageUrl.trim() || !price.trim()) {
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    const newItem: RegistryItem = {
      item: item.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      price: priceValue,
      link: link.trim() || '#'
    };
    
    addRegistryItem(newItem);
    
    // Clear form
    setItem('');
    setDescription('');
    setImageUrl('');
    setPrice('');
    setLink('');
    
    toast.success('Registry item added!');
  };
  
  const handleSavePaymentDetails = () => {
    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim()) {
      toast.error('Please fill all required payment details');
      return;
    }
    
    updatePaymentDetails({
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      whatsappNumber: whatsappNumber.trim()
    });
    
    toast.success('Payment details saved!');
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
        <h3 className="text-xl mb-4 font-semibold text-theme-primary">Wedding Registry</h3>
        
        <div className="mb-4">
          <label htmlFor="registry-item" className="block text-theme-text mb-2">Gift Item</label>
          <input 
            type="text" 
            id="registry-item" 
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter gift item"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="registry-description" className="block text-theme-text mb-2">Description</label>
          <textarea 
            id="registry-description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter description" 
            rows={2}
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="registry-image" className="block text-theme-text mb-2">Image URL</label>
          <input 
            type="text" 
            id="registry-image" 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter image URL"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="registry-price" className="block text-theme-text mb-2">Estimated Price</label>
          <input 
            type="number" 
            id="registry-price" 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter price"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="registry-link" className="block text-theme-text mb-2">Store Link (optional)</label>
          <input 
            type="text" 
            id="registry-link" 
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter link to buy"
          />
        </div>
        
        <button 
          onClick={handleAddRegistry}
          className="bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
        >
          Add Registry Item
        </button>
        
        <div className="mt-8">
          <h4 className="font-semibold mb-4 text-theme-text">Current Registry Items</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.registryItems.map((item, index) => (
              <div 
                key={index} 
                className="bg-theme-card-bg rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.item} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold mb-1 text-sm text-theme-text">{item.item}</h3>
                  <p className="text-theme-primary font-semibold mb-2 text-sm">₦{item.price.toLocaleString()}</p>
                  <p className="text-xs text-theme-text mb-3 line-clamp-2">{item.description}</p>
                  
                  <button 
                    onClick={() => {
                      removeRegistryItem(index);
                      toast.success('Registry item removed');
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 w-full text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            {state.registryItems.length === 0 && (
              <div className="col-span-2 text-center py-10 text-theme-text">
                No registry items available yet.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
        <h3 className="text-xl mb-4 font-semibold text-theme-primary">Payment Details</h3>
        
        <div className="mb-4">
          <label htmlFor="account-name" className="block text-theme-text mb-2">Account Name</label>
          <input 
            type="text" 
            id="account-name" 
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter account name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="account-number" className="block text-theme-text mb-2">Account Number</label>
          <input 
            type="text" 
            id="account-number" 
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter account number"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="bank-name" className="block text-theme-text mb-2">Bank Name</label>
          <input 
            type="text" 
            id="bank-name" 
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter bank name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="whatsapp-number" className="block text-theme-text mb-2">WhatsApp Number</label>
          <input 
            type="text" 
            id="whatsapp-number" 
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
            placeholder="Enter WhatsApp number"
          />
        </div>
        
        <button 
          onClick={handleSavePaymentDetails}
          className="bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
        >
          Save Payment Details
        </button>
        
        <div className="mt-8">
          <h4 className="font-semibold mb-2 text-theme-text">Payment Notifications</h4>
          <div className="border p-4 rounded-lg max-h-80 overflow-y-auto bg-theme-secondary">
            <p className="text-theme-text text-center py-4">No payment notifications yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistryTab;