import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import { WeddingPartyMember } from '../../../types';

const WeddingPartyTab: React.FC = () => {
  const { state, addWeddingPartyMember, removeWeddingPartyMember } = useAppContext();
  
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [role, setRole] = useState('');
  const [side, setSide] = useState<'bride' | 'groom'>('bride');
  
  const handleAddMember = () => {
    if (!name.trim() || !imageUrl.trim() || !role.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    
    const newMember: WeddingPartyMember = {
      name: name.trim(),
      imageUrl: imageUrl.trim(),
      role: role.trim(),
      side
    };
    
    addWeddingPartyMember(newMember);
    
    // Clear form
    setName('');
    setImageUrl('');
    setRole('');
    
    toast.success('Wedding party member added!');
  };
  
  const brideMembers = state.weddingParty.filter(member => member.side === 'bride');
  const groomMembers = state.weddingParty.filter(member => member.side === 'groom');
  
  return (
    <div>
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl mb-4 font-semibold text-theme-primary">Add Wedding Party Member</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="member-name" className="block text-theme-text mb-2">Name</label>
            <input 
              type="text" 
              id="member-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label htmlFor="member-role" className="block text-theme-text mb-2">Role</label>
            <input 
              type="text" 
              id="member-role" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
              placeholder="e.g., Maid of Honor, Best Man"
            />
          </div>
          
          <div>
            <label htmlFor="member-image" className="block text-theme-text mb-2">Image URL</label>
            <input 
              type="text" 
              id="member-image" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
              placeholder="Enter image URL"
            />
          </div>
          
          <div>
            <label htmlFor="member-side" className="block text-theme-text mb-2">Side</label>
            <select 
              id="member-side" 
              value={side}
              onChange={(e) => setSide(e.target.value as 'bride' | 'groom')}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            >
              <option value="bride">Bride's Side</option>
              <option value="groom">Groom's Side</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={handleAddMember}
          className="mt-4 bg-theme-primary text-theme-button-text py-2 px-6 rounded-lg hover:bg-theme-accent transition duration-300"
        >
          Add Member
        </button>
      </div>
      
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
        <h3 className="text-xl mb-6 font-semibold text-theme-primary">Wedding Party</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bride's Side */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-theme-primary">Bride's Side</h4>
            <div className="space-y-4">
              {brideMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img 
                    src={member.imageUrl} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-theme-secondary"
                  />
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-theme-text">{member.name}</h5>
                    <p className="text-theme-primary font-medium">{member.role}</p>
                  </div>
                  <button 
                    onClick={() => {
                      removeWeddingPartyMember(state.weddingParty.findIndex(m => m === member));
                      toast.success('Member removed');
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {brideMembers.length === 0 && (
                <div className="text-center py-8 bg-theme-secondary rounded-lg">
                  <p className="text-theme-text">No members added for bride's side yet.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Groom's Side */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-theme-primary">Groom's Side</h4>
            <div className="space-y-4">
              {groomMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img 
                    src={member.imageUrl} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-theme-secondary"
                  />
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-theme-text">{member.name}</h5>
                    <p className="text-theme-primary font-medium">{member.role}</p>
                  </div>
                  <button 
                    onClick={() => {
                      removeWeddingPartyMember(state.weddingParty.findIndex(m => m === member));
                      toast.success('Member removed');
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {groomMembers.length === 0 && (
                <div className="text-center py-8 bg-theme-secondary rounded-lg">
                  <p className="text-theme-text">No members added for groom's side yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingPartyTab;