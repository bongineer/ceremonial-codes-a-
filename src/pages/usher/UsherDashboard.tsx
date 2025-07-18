import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { Users } from 'lucide-react';
import EditableToggle from '../../components/common/EditableToggle';
import { Guest } from '../../types';

const UsherDashboard: React.FC = () => {
  const { state, logout, updateGuestDetails } = useAppContext();
  const navigate = useNavigate();
  
  const [selectedTable, setSelectedTable] = useState<number | null>(3); // Default to table 3
  const [searchTerm, setSearchTerm] = useState('');
  
  const seatsPerTable = state.settings.seatsPerTable;
  const totalTables = Math.ceil(state.settings.maxSeats / seatsPerTable);

  useEffect(() => {
    // Redirect to login if not logged in or not usher
    if (!state.currentUser || state.currentUser !== 'USHER') {
      navigate('/');
    }
  }, [state.currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (state.currentUser !== 'USHER') {
    return null;
  }

  // Filter guests based on search term
  const filteredGuests = Object.entries(state.guests)
    .filter(([code, guest]) => {
      if (code === 'ADMIN' || code === 'USHER') return false;
      
      const lowerSearchTerm = searchTerm.toLowerCase();
      return code.toLowerCase().includes(lowerSearchTerm) || 
             guest.name.toLowerCase().includes(lowerSearchTerm);
    });

  // Group guests by table
  const getGuestsByTable = (tableNumber: number) => {
    const startSeat = (tableNumber - 1) * seatsPerTable + 1;
    const endSeat = tableNumber * seatsPerTable;
    
    return filteredGuests.filter(([code, guest]) => {
      return guest.seatNumber && guest.seatNumber >= startSeat && guest.seatNumber <= endSeat;
    });
  };

  const getTableName = (tableNumber: number | null): string => {
    if (!tableNumber) return '';
    return state.settings.tableNames?.[tableNumber] || `Table ${tableNumber}`;
  };

  // Handle editable toggles for usher-specific actions
  const handleUpdateGuest = (code: string, field: keyof Guest, value: any) => {
    updateGuestDetails(code, { [field]: value });
    
    const actionMessages = {
      arrived: value ? 'Guest marked as arrived' : 'Guest arrival status cleared',
      mealServed: value ? 'Meal marked as served' : 'Meal service status cleared',
      drinkServed: value ? 'Drink marked as served' : 'Drink service status cleared'
    };
    
    toast.success(actionMessages[field as keyof typeof actionMessages] || 'Guest updated');
  };

  const renderGuestRow = (code: string, guest: Guest) => (
    <tr key={code} className="hover:bg-gray-50">
      <td className="py-3 px-4 border-b border-gray-200">
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{code}</span>
      </td>
      <td className="py-3 px-4 border-b border-gray-200">
        <span className="text-theme-text">{guest.name}</span>
      </td>
      <td className="py-3 px-4 border-b border-gray-200">
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
          guest.category === 'VVIP' ? 'bg-purple-100 text-purple-800' :
          guest.category === 'premium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {guest.category?.toUpperCase() || 'VVIP'}
        </span>
      </td>
      <td className="py-3 px-4 border-b border-gray-200">
        {guest.seatNumber ? (
          <span className="text-green-600 font-semibold">Seat {guest.seatNumber}</span>
        ) : (
          <span className="text-orange-500">Unassigned</span>
        )}
      </td>
      <td className="py-3 px-4 border-b border-gray-200 text-center">
        <EditableToggle
          value={guest.arrived}
          onToggle={(newValue) => handleUpdateGuest(code, 'arrived', newValue)}
        />
      </td>
      <td className="py-3 px-4 border-b border-gray-200">
        <span className="text-sm text-theme-text">{guest.selectedFood || 'Not selected'}</span>
      </td>
      <td className="py-3 px-4 border-b border-gray-200 text-center">
        <EditableToggle
          value={guest.mealServed}
          onToggle={(newValue) => handleUpdateGuest(code, 'mealServed', newValue)}
        />
      </td>
      <td className="py-3 px-4 border-b border-gray-200">
        <span className="text-sm text-theme-text">{guest.selectedDrink || 'Not selected'}</span>
      </td>
      <td className="py-3 px-4 border-b border-gray-200 text-center">
        <EditableToggle
          value={guest.drinkServed}
          onToggle={(newValue) => handleUpdateGuest(code, 'drinkServed', newValue)}
        />
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--color-background)' }}>
      <header className="bg-theme-primary text-theme-text-inverse p-5 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-dancing">Usher Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-theme-card-bg text-theme-primary rounded-lg hover:bg-gray-100 transition duration-300 shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>
      
      <div className="container mx-auto p-5 overflow-x-hidden">
        {/* Header Controls */}
        <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-xl font-semibold mb-4 lg:mb-0 text-theme-primary">Guest Service Management</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
                placeholder="Search guests..."
              />
            </div>
          </div>
          
          <div className="mb-4 p-4 bg-theme-secondary rounded-lg">
            <p className="text-sm text-theme-text mb-2">
              <strong>Usher Instructions:</strong> Use this dashboard to track guest arrivals and service status.
            </p>
            <p className="text-sm text-theme-text">
              ✅ <strong>Arrived:</strong> Check when guest arrives at venue<br/>
              🍽️ <strong>Meal Served:</strong> Check when guest has been served their meal<br/>
              🥤 <strong>Drink Served:</strong> Check when guest has been served their drink
            </p>
          </div>

          {/* Table Navigation Tabs - Fixed responsive layout without horizontal scroll */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-theme-text">Table Navigation</h4>
            
            {/* Fixed grid layout - no horizontal scrolling */}
            <div className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {Array.from({ length: totalTables }, (_, index) => {
                  const tableNumber = index + 1;
                  const tableGuests = getGuestsByTable(tableNumber);
                  const isSelected = selectedTable === tableNumber;
                  
                  return (
                    <div
                      key={tableNumber}
                      onClick={() => setSelectedTable(tableNumber)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'border-theme-primary bg-theme-primary text-theme-button-text shadow-lg' 
                          : 'border-gray-200 hover:border-theme-primary bg-theme-card-bg hover:bg-theme-secondary'
                      }`}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-xs mb-1">Table {tableNumber}</div>
                        <div className="text-xs opacity-75 mb-1 truncate">
                          {getTableName(tableNumber)}
                        </div>
                        <div className="text-xs opacity-75 mb-1">
                          {tableGuests.length}/{seatsPerTable}
                        </div>
                        <div className="text-xs opacity-75 mb-1">
                          Arrived: {tableGuests.filter(([_, guest]) => guest.arrived).length}
                        </div>
                        <div className="text-xs opacity-75">
                          {(tableNumber - 1) * seatsPerTable + 1}-{tableNumber * seatsPerTable}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Table-specific view - Always show the selected table (default: Table 3) */}
        {selectedTable && (
          <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Table {selectedTable} - {getTableName(selectedTable)}
              </h4>
              
              <div className="text-sm text-theme-text">
                Seats {(selectedTable - 1) * seatsPerTable + 1} to {selectedTable * seatsPerTable}
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-theme-secondary rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-theme-text">Occupied:</span> {getGuestsByTable(selectedTable).length}
                </div>
                <div>
                  <span className="font-semibold text-theme-text">Arrived:</span> {getGuestsByTable(selectedTable).filter(([_, guest]) => guest.arrived).length}
                </div>
                <div>
                  <span className="font-semibold text-theme-text">Meals Served:</span> {getGuestsByTable(selectedTable).filter(([_, guest]) => guest.mealServed).length}
                </div>
                <div>
                  <span className="font-semibold text-theme-text">Drinks Served:</span> {getGuestsByTable(selectedTable).filter(([_, guest]) => guest.drinkServed).length}
                </div>
              </div>
            </div>
            
            {/* Responsive table with horizontal scroll only when necessary */}
            <div className="w-full overflow-x-auto">
              <table className="min-w-full bg-theme-card-bg">
                <thead>
                  <tr className="bg-theme-secondary">
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Code</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Name</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Category</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Seat</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Arrived</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Food Selection</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Meal Served</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Drink Selection</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Drink Served</th>
                  </tr>
                </thead>
                <tbody>
                  {getGuestsByTable(selectedTable).map(([code, guest]) => renderGuestRow(code, guest))}
                  
                  {getGuestsByTable(selectedTable).length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-theme-text">
                        No guests assigned to this table yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsherDashboard;