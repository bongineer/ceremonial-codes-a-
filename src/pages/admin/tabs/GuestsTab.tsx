import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import EditableCell from '../../../components/common/EditableCell';
import EditableToggle from '../../../components/common/EditableToggle';
import { Guest } from '../../../types';
import { Upload, Users, Settings } from 'lucide-react';

const GuestsTab: React.FC = () => {
  const { state, updateGuestDetails, generateAccessCodes, assignSeat, updateSettings, autoAssignAllSeats } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Seating configuration state
  const [totalGuests, setTotalGuests] = useState(state.settings.maxSeats);
  const [seatsPerTable, setSeatsPerTable] = useState(state.settings.seatsPerTable);
  
  // Calculate total number of tables
  const totalTables = Math.ceil(totalGuests / seatsPerTable);
  
  // Calculate current guest count (excluding ADMIN)
  const currentGuestCount = Object.keys(state.guests).filter(code => code !== 'ADMIN').length;
  const remainingCapacity = totalGuests - currentGuestCount;
  
  // Initialize table names with default values if not set
  React.useEffect(() => {
    if (!state.settings.tableNames) {
      const defaultNames: Record<number, string> = {};
      for (let i = 1; i <= totalTables; i++) {
        defaultNames[i] = `Table ${i}`;
      }
      updateSettings({ tableNames: defaultNames });
    }
  }, [totalTables, state.settings.tableNames, updateSettings]);

  const handleSaveSeatingSettings = async () => {
    try {
      // First, update the settings
      await updateSettings({
        maxSeats: totalGuests,
        seatsPerTable: seatsPerTable
      });
      
      // Calculate how many guests we need
      const targetGuestCount = totalGuests;
      const currentGuestCount = Object.keys(state.guests).filter(code => code !== 'ADMIN').length;
      
      if (currentGuestCount < targetGuestCount) {
        // Need to create more guests
        const guestsToCreate = targetGuestCount - currentGuestCount;
        console.log(`Creating ${guestsToCreate} new guests`);
        
        // Generate new access codes and create guests
        const newCodes = generateAccessCodes(guestsToCreate);
        
        // Wait a moment for guests to be created, then auto-assign all seats
        setTimeout(() => {
          autoAssignAllSeats();
          toast.success(`Created ${guestsToCreate} new guests and assigned all seats automatically!`);
        }, 1000);
        
      } else if (currentGuestCount > targetGuestCount) {
        // Need to remove excess guests (this would require additional logic)
        toast.warning('Reducing guest count - excess guests will need to be manually removed');
        setTimeout(() => {
          autoAssignAllSeats();
        }, 1000);
      } else {
        // Same number of guests, just reassign seats
        setTimeout(() => {
          autoAssignAllSeats();
          toast.success('Seating settings saved and all guests auto-assigned to seats!');
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error saving seating settings:', error);
      toast.error('Failed to save seating settings');
    }
  };
  
  // Filter guests based on search term
  const filteredGuests = Object.entries(state.guests)
    .filter(([code, guest]) => {
      if (code === 'ADMIN') return false;
      
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
  
  // Get unassigned guests
  const getUnassignedGuests = () => {
    return filteredGuests.filter(([code, guest]) => !guest.seatNumber);
  };
  
  const handleUpdateGuest = (code: string, field: keyof Guest, value: any) => {
    updateGuestDetails(code, { [field]: value });
    toast.success(`Guest ${field} updated`);
  };

  const handleAssignSeat = (guestCode: string, seatNumber: number) => {
    const success = assignSeat(guestCode, seatNumber);
    if (success) {
      toast.success(`Seat ${seatNumber} assigned to guest`);
    } else {
      toast.error('Seat is already taken');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const categoryIndex = headers.findIndex(h => h.includes('category'));
      
      if (nameIndex === -1) {
        toast.error('CSV must contain a "name" column');
        return;
      }

      const guestsToAdd: Array<{name: string, category: 'VVIP' | 'premium' | 'family'}> = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim());
        const name = values[nameIndex];
        const category = categoryIndex !== -1 ? 
          (values[categoryIndex]?.toLowerCase() as 'VVIP' | 'premium' | 'family') || 'VVIP' : 
          'VVIP';
        
        if (name) {
          guestsToAdd.push({ name, category });
        }
      }

      if (guestsToAdd.length === 0) {
        toast.error('No valid guest data found in CSV');
        return;
      }

      if (guestsToAdd.length > remainingCapacity) {
        toast.error(`Cannot upload ${guestsToAdd.length} guests. Only ${remainingCapacity} seats remaining.`);
        return;
      }

      const newCodes = generateAccessCodes(guestsToAdd.length);
      
      // Update guest names and categories after codes are generated
      setTimeout(() => {
        guestsToAdd.forEach((guestData, index) => {
          const code = newCodes[index];
          updateGuestDetails(code, {
            name: guestData.name,
            category: guestData.category,
            arrived: false,
            mealServed: false,
            drinkServed: false
          });
        });

        toast.success(`Successfully uploaded ${guestsToAdd.length} guests with automatic seat assignment!`);
      }, 500);
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTableNumber = (seatNumber: number | null): number | null => {
    if (!seatNumber) return null;
    return Math.ceil(seatNumber / seatsPerTable);
  };

  const getTableName = (tableNumber: number | null): string => {
    if (!tableNumber) return '';
    return state.settings.tableNames?.[tableNumber] || `Table ${tableNumber}`;
  };

  const getAvailableSeatsForTable = (tableNumber: number) => {
    const startSeat = (tableNumber - 1) * seatsPerTable + 1;
    const endSeat = tableNumber * seatsPerTable;
    const availableSeats = [];
    
    for (let seat = startSeat; seat <= endSeat; seat++) {
      const seatTaken = Object.values(state.guests).some(guest => guest.seatNumber === seat);
      if (!seatTaken) {
        availableSeats.push(seat);
      }
    }
    
    return availableSeats;
  };

  const handleTableNameChange = (tableNumber: number, newName: string) => {
    const updatedTableNames = {
      ...state.settings.tableNames,
      [tableNumber]: newName
    };
    updateSettings({ tableNames: updatedTableNames });
  };

  const renderGuestRow = (code: string, guest: Guest, showSeatAssignment = false) => (
    <tr key={code} className="hover:bg-gray-50">
      <td className="py-3 px-4 border-b border-gray-200">
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{code}</span>
      </td>
      <td className="py-3 px-4 border-b border-gray-200">
        <EditableCell
          value={guest.name}
          onSave={(newValue) => handleUpdateGuest(code, 'name', newValue)}
        />
      </td>
      <td className="py-3 px-4 border-b border-gray-200">
        <EditableCell
          value={guest.category || 'VVIP'}
          onSave={(newValue) => handleUpdateGuest(code, 'category', newValue)}
          type="select"
          options={['VVIP', 'premium', 'family']}
        />
      </td>
      {showSeatAssignment && (
        <td className="py-3 px-4 border-b border-gray-200">
          {guest.seatNumber ? (
            <span className="text-green-600 font-semibold">Seat {guest.seatNumber}</span>
          ) : (
            <span className="text-orange-500">Unassigned</span>
          )}
        </td>
      )}
      <td className="py-3 px-4 border-b border-gray-200 text-center">
        <EditableToggle
          value={guest.arrived}
          onToggle={(newValue) => handleUpdateGuest(code, 'arrived', newValue)}
        />
      </td>
      <td className="py-3 px-4 border-b border-gray-200">
        <span className="text-sm">{guest.selectedFood || 'Not selected'}</span>
      </td>
      <td className="py-3 px-4 border-b border-gray-200 text-center">
        <EditableToggle
          value={guest.mealServed}
          onToggle={(newValue) => handleUpdateGuest(code, 'mealServed', newValue)}
        />
      </td>
      <td className="py-3 px-4 border-b border-gray-200">
        <span className="text-sm">{guest.selectedDrink || 'Not selected'}</span>
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
    <div>
      {/* Seating Configuration Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-6 text-blue-800 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Seating Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="total-guests" className="block text-gray-700 mb-2 font-medium">Total Number of Guests</label>
            <input 
              type="number" 
              id="total-guests" 
              min="1" 
              max="500" 
              value={totalGuests}
              onChange={(e) => setTotalGuests(parseInt(e.target.value) || 300)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <p className="text-sm text-gray-600 mt-1">
              This determines the maximum number of guests that can be accommodated.
            </p>
          </div>
          
          <div>
            <label htmlFor="seats-per-table" className="block text-gray-700 mb-2 font-medium">Seats Per Table</label>
            <input 
              type="number" 
              id="seats-per-table" 
              min="1" 
              max="20" 
              value={seatsPerTable}
              onChange={(e) => setSeatsPerTable(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <p className="text-sm text-gray-600 mt-1">
              Table mapping: Seats 1-{seatsPerTable} = Table 1, Seats {seatsPerTable + 1}-{seatsPerTable * 2} = Table 2, etc.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">Automatic Guest Management</h4>
          <p className="text-blue-700 text-sm mb-2">
            When you save settings, guests will be automatically created and assigned seats sequentially. 
            If you need more guests than currently exist, new ones will be created automatically.
          </p>
          <p className="text-blue-600 text-sm">
            Current capacity: <span className="font-semibold">{currentGuestCount} guests</span> out of <span className="font-semibold">{totalGuests} total seats</span>
          </p>
          <p className="text-blue-600 text-sm">
            Tables to be created: <span className="font-semibold">{totalTables} tables</span> with <span className="font-semibold">{seatsPerTable} seats each</span>
          </p>
        </div>

        <button 
          onClick={handleSaveSeatingSettings}
          className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2 font-medium"
        >
          <Settings className="w-5 h-5" />
          Save Settings & Auto-Create/Assign Guests
        </button>
      </div>

      {/* Header Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-xl font-semibold mb-4 lg:mb-0">Guest Management by Tables</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" 
              placeholder="Search guests..."
            />
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-300"
              >
                <Upload size={16} />
                Upload CSV
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            <strong>CSV Upload Format:</strong> Your CSV file should have columns: "name" (required), "category" (optional: VVIP, premium, family)
          </p>
          <p className="text-sm text-gray-600">
            Example: name,category<br/>
            John Doe,premium<br/>
            Jane Smith,family
          </p>
          <p className="text-sm text-blue-600 mt-3">
            <strong>Automatic Assignment:</strong> All guests will be automatically assigned seats sequentially when uploaded.
          </p>
        </div>

        {/* Table Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {Array.from({ length: totalTables }, (_, i) => i + 1).map(tableNum => {
            const tableGuests = getGuestsByTable(tableNum);
            const availableSeats = getAvailableSeatsForTable(tableNum);
            
            return (
              <button
                key={tableNum}
                onClick={() => setSelectedTable(selectedTable === tableNum ? null : tableNum)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedTable === tableNum 
                    ? 'border-rose-500 bg-rose-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold text-sm">Table {tableNum}</div>
                  <div className="text-xs text-gray-600 mb-1">
                    {getTableName(tableNum)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {tableGuests.length}/{seatsPerTable} occupied
                  </div>
                  <div className="text-xs text-green-600">
                    {availableSeats.length} available
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unassigned Guests - Only show if there are any */}
      {getUnassignedGuests().length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-orange-500">
          <h4 className="text-lg font-semibold mb-4 text-orange-600 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Unassigned Guests ({getUnassignedGuests().length})
          </h4>
          
          <div className="bg-orange-50 p-4 rounded-lg mb-4">
            <p className="text-orange-700 text-sm">
              <strong>Note:</strong> These guests don't have seats assigned. Click "Save Settings & Auto-Create/Assign Guests" above to automatically assign them.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-orange-50">
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Arrived</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Food</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Meal Served</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Drink</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Drink Served</th>
                </tr>
              </thead>
              <tbody>
                {getUnassignedGuests().map(([code, guest]) => renderGuestRow(code, guest))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table-specific view */}
      {selectedTable && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-rose-600 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Table {selectedTable} - Seats {(selectedTable - 1) * seatsPerTable + 1} to {selectedTable * seatsPerTable}
            </h4>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Table Name:</label>
              <input
                type="text"
                value={state.settings.tableNames?.[selectedTable] || `Table ${selectedTable}`}
                onChange={(e) => handleTableNameChange(selectedTable, e.target.value)}
                className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
                placeholder="Enter table name"
              />
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold">Occupied:</span> {getGuestsByTable(selectedTable).length}
              </div>
              <div>
                <span className="font-semibold">Available:</span> {getAvailableSeatsForTable(selectedTable).length}
              </div>
              <div>
                <span className="font-semibold">Capacity:</span> {seatsPerTable}
              </div>
              <div>
                <span className="font-semibold">Available Seats:</span> {getAvailableSeatsForTable(selectedTable).join(', ') || 'None'}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-rose-50">
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Seat Assignment</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Arrived</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Food</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Meal Served</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Drink</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">Drink Served</th>
                </tr>
              </thead>
              <tbody>
                {getGuestsByTable(selectedTable).map(([code, guest]) => renderGuestRow(code, guest, true))}
                
                {getGuestsByTable(selectedTable).length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      No guests assigned to this table yet. Click "Save Settings & Auto-Create/Assign Guests" above to automatically assign guests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Tables Overview */}
      {!selectedTable && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: totalTables }, (_, i) => i + 1).map(tableNum => {
            const tableGuests = getGuestsByTable(tableNum);
            const availableSeats = getAvailableSeatsForTable(tableNum);
            
            return (
              <div key={tableNum} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-rose-600 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Table {tableNum}
                    </h4>
                    <p className="text-sm text-gray-600">{getTableName(tableNum)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTable(tableNum)}
                    className="px-3 py-1 bg-rose-600 text-white rounded text-sm hover:bg-rose-700 transition duration-200"
                  >
                    Manage
                  </button>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Seats: {(tableNum - 1) * seatsPerTable + 1}-{tableNum * seatsPerTable}</div>
                    <div>Occupied: {tableGuests.length}/{seatsPerTable}</div>
                    <div>Available: {availableSeats.length}</div>
                    <div>Arrived: {tableGuests.filter(([_, guest]) => guest.arrived).length}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {tableGuests.length > 0 ? (
                    tableGuests.map(([code, guest]) => (
                      <div key={code} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{guest.name}</span>
                          <span className="text-sm text-gray-600 ml-2">Seat {guest.seatNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {guest.arrived && <span className="w-2 h-2 bg-green-500 rounded-full" title="Arrived"></span>}
                          {guest.mealServed && <span className="w-2 h-2 bg-blue-500 rounded-full" title="Meal Served"></span>}
                          {guest.drinkServed && <span className="w-2 h-2 bg-purple-500 rounded-full" title="Drink Served"></span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No guests assigned to this table yet. Click "Save Settings & Auto-Create/Assign Guests" above.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuestsTab;