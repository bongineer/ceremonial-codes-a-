import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import BackgroundImage from '../../../components/common/BackgroundImage';
import FlowerBorder from '../../../components/common/FlowerBorder';

const WeddingPartyTab: React.FC = () => {
  const { state } = useAppContext();
  
  const brideMembers = state.weddingParty.filter(member => member.side === 'bride');
  const groomMembers = state.weddingParty.filter(member => member.side === 'groom');
  
  return (
    <BackgroundImage imageUrl={state.settings.welcomeImage}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-center mb-8 text-theme-primary font-dancing">Our Wedding Party</h2>
        
        <div className="bg-theme-card-bg rounded-lg shadow-md p-8 mb-8 hover:shadow-lg transition-shadow duration-300">
          <p className="text-center mb-6 text-theme-text">Meet the special people who will be standing with us on our big day!</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Groom's Side - Right Column */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 text-theme-primary text-center">Groomsmen</h3>
            <div className="space-y-8">
              {groomMembers.map((member, index) => (
                <div key={index} className="bg-theme-card-bg rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 space-y-4 sm:space-y-0">
                    <div className="relative">
                      <img 
                        src={member.imageUrl} 
                        alt={member.name}
                        className="w-40 h-40 rounded-full object-cover border-4 border-theme-secondary"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-xl font-semibold text-theme-text">{member.name}</h4>
                      <p className="text-theme-primary font-medium text-lg">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {groomMembers.length === 0 && (
                <div className="text-center py-8 bg-theme-card-bg rounded-lg shadow-md">
                  <p className="text-theme-text">No groomsmen added yet.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Bride's Side - Left Column */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 text-theme-primary text-center">Bridesmaids</h3>
            <div className="space-y-8">
              {brideMembers.map((member, index) => (
                <div key={index} className="bg-theme-card-bg rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 space-y-4 sm:space-y-0">
                    <div className="relative">
                      <img 
                        src={member.imageUrl} 
                        alt={member.name}
                        className="w-40 h-40 rounded-full object-cover border-4 border-theme-secondary"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-xl font-semibold text-theme-text">{member.name}</h4>
                      <p className="text-theme-primary font-medium text-lg">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {brideMembers.length === 0 && (
                <div className="text-center py-8 bg-theme-card-bg rounded-lg shadow-md">
                  <p className="text-theme-text">No bridesmaids added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <FlowerBorder />
      </div>
    </BackgroundImage>
  );
};

export default WeddingPartyTab;