import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import EditableCell from '../../../components/common/EditableCell';
import EditableToggle from '../../../components/common/EditableToggle';
import { Guest } from '../../../types';
import { Upload, Users, Settings, GripVertical } from 'lucide-react';

const GuestsTab: React.FC = () => {
  const { state, updateGuestDetails, generateAccessCodes, assignSeat, updateSettings, autoAssignAllSeats } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | null>(3); // Default to table 3
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Seating configuration state
  const [totalGuests, setTotalGuests] = useState(state.settings.maxSeats.toString());
  const [seatsPerTable, setSeatsPerTable] = useState(state.settings.seatsPerTable.toString());
  
  // Drag and drop state
  const [draggedTable, setDraggedTable] = useState<number | null>(null);
  const [dragOverTable, setDragOverTable] = useState<number | null>(null);
  const [tableOrder, setTableOrder] = useState<number[]>([]);
  
  // Table name editing state
  const [editingTableNames, setEditingTableNames] = useState<Record<number, string>>({});
  const [editingTableNotes, setEditingTableNotes] = useState<Record<number, string>>({});
  const [saveTimeouts, setSaveTimeouts] = useState<Record<number, NodeJS.Timeout>>({});
  const [notesSaveTimeouts, setNotesSaveTimeouts] = useState<Record<number, NodeJS.Timeout>>({});
  
  // Calculate total number of tables
  const totalTables = Math.ceil(parseInt(totalGuests) / parseInt(seatsPerTable));
  
  // Initialize table order
  React.useEffect(() => {
    if (tableOrder.length !== totalTables) {
      setTableOrder(Array.from({ length: totalTables }, (_, i) => i + 1));
    }
  }, [totalTables, tableOrder.length]);
  
  // Calculate current guest count (excluding ADMIN)
  const currentGuestCount = Object.keys(state.guests).filter(code => code !== 'ADMIN').length;
  const remainingCapacity = parseInt(totalGuests) - currentGuestCount;
  
  // Initialize table names with default values if not set
  React.useEffect(() => {
    if (!state.settings.tableNames || !state.settings.tableNotes) {
      const defaultNames: Record<number, string> = {};
      const defaultNotes: Record<number, string> = {};
      for (let i = 1; i <= totalTables; i++) {
        defaultNames[i] = `Table ${i}`;
        defaultNotes[i] = '';
      }
      updateSettings({ 
        tableNames: state.settings.tableNames || defaultNames,
        tableNotes: state.settings.tableNotes || defaultNotes
      });
    }

  const handleSaveSeatingSettings = async () => {
    try {
      const totalGuestsNum = parseInt(totalGuests) || 300;
      const seatsPerTableNum = parseInt(seatsPerTable) || 10;
      
      // First, update the settings
      await updateSettings({
        maxSeats: totalGuestsNum,
        seatsPerTable: seatsPerTableNum
      });
      
      // Calculate how many guests we need
      const targetGuestCount = totalGuestsNum;
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
  
  // Group guests by table (using original table numbers, not reordered)
  const getGuestsByTable = (originalTableNumber: number) => {
    const seatsPerTableNum = parseInt(seatsPerTable);
    const startSeat = (originalTableNumber - 1) * seatsPerTableNum + 1;
    const endSeat = originalTableNumber * seatsPerTableNum;
    
    return filteredGuests.filter(([code, guest]) => {
      return guest.seatNumber && guest.seatNumber >= startSeat && guest.seatNumber <= endSeat;
    });
  };
  
  const handleTableNoteChange = async (tableNumber: number, newNote: string) => {
    // Update local editing state immediately for responsive UI
    setEditingTableNotes(prev => ({
      ...prev,
      [tableNumber]: newNote
    }));
    
    // Clear existing timeout for this table
    if (notesSaveTimeouts[tableNumber]) {
      clearTimeout(notesSaveTimeouts[tableNumber]);
    }
    
    // Set new timeout to save after user stops typing
    const timeoutId = setTimeout(async () => {
      const updatedTableNotes = {
        ...state.settings.tableNotes,
        [tableNumber]: newNote.trim()
      };
      
      try {
        await updateSettings({ tableNotes: updatedTableNotes });
        
        // Clear the editing state for this table after successful save
        setEditingTableNotes(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
        
        // Clear the timeout reference
        setNotesSaveTimeouts(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
        
        toast.success('Table note saved successfully!');
      } catch (error) {
        console.error('Error saving table note:', error);
        toast.error('Failed to save table note');
        
        // Revert local state on error
        setEditingTableNotes(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
      }
    }, 1000); // Save 1 second after user stops typing
    
    // Store timeout reference
    setNotesSaveTimeouts(prev => ({
      ...prev,
      [tableNumber]: timeoutId
    }));
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
    return Math.ceil(seatNumber / parseInt(seatsPerTable));
  };

  const getTableName = (tableNumber: number | null): string => {
    if (!tableNumber) return '';
    return state.settings.tableNames?.[tableNumber] || `Table ${tableNumber}`;
  };

  const getAvailableSeatsForTable = (tableNumber: number) => {
    const seatsPerTableNum = parseInt(seatsPerTable);
    const startSeat = (tableNumber - 1) * seatsPerTableNum + 1;
    const endSeat = tableNumber * seatsPerTableNum;
    const availableSeats = [];
    
    for (let seat = startSeat; seat <= endSeat; seat++) {
      const seatTaken = Object.values(state.guests).some(guest => guest.seatNumber === seat);
      if (!seatTaken) {
        availableSeats.push(seat);
      }
    }
    
    return availableSeats;
  };

  const handleTableNameChange = async (tableNumber: number, newName: string) => {
    // Update local editing state immediately for responsive UI
    setEditingTableNames(prev => ({
      ...prev,
      [tableNumber]: newName
    }));
    
    // Clear existing timeout for this table
    if (saveTimeouts[tableNumber]) {
      clearTimeout(saveTimeouts[tableNumber]);
    }
    
    // Set new timeout to save after user stops typing
    const timeoutId = setTimeout(async () => {
      const updatedTableNames = {
        ...state.settings.tableNames,
        [tableNumber]: newName.trim()
      };
      
      try {
        await updateSettings({ tableNames: updatedTableNames });
        
        // Clear the editing state for this table after successful save
        setEditingTableNames(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
        
        // Clear the timeout reference
        setSaveTimeouts(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
        
        toast.success('Table name saved successfully!');
      } catch (error) {
        console.error('Error saving table name:', error);
        toast.error('Failed to save table name');
        
        // Revert local state on error
        setEditingTableNames(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
      }
    }, 1000); // Save 1 second after user stops typing
    
    // Store timeout reference
    setSaveTimeouts(prev => ({
      ...prev,
      [tableNumber]: timeoutId
    }));
  };

  // Get current table name (either from editing state or saved state)
  const getCurrentTableName = (tableNumber: number): string => {
    if (editingTableNames[tableNumber] !== undefined) {
      return editingTableNames[tableNumber];
    }
    return state.settings.tableNames?.[tableNumber] || `Table ${tableNumber}`;
  };

  // Get current table note (either from editing state or saved state)
  const getCurrentTableNote = (tableNumber: number): string => {
    if (editingTableNotes[tableNumber] !== undefined) {
      return editingTableNotes[tableNumber];
    }
    return state.settings.tableNotes?.[tableNumber] || '';
  };

  // Clear editing state when component unmounts or table count changes
  React.useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      Object.values(saveTimeouts).forEach(timeout => clearTimeout(timeout));
      Object.values(notesSaveTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [saveTimeouts, notesSaveTimeouts]);

  // Reset editing state when total tables change
  React.useEffect(() => {
    setEditingTableNames({});
    setEditingTableNotes({});
    Object.values(saveTimeouts).forEach(timeout => clearTimeout(timeout));
    Object.values(notesSaveTimeouts).forEach(timeout => clearTimeout(timeout));
    setSaveTimeouts({});
    setNotesSaveTimeouts({});
  }, [totalTables]);

  const handleTableNameChange_OLD = async (tableNumber: number, newName: string) => {
    const updatedTableNames = {
      ...state.settings.tableNames,
      [tableNumber]: newName
    };
    
    try {
      await updateSettings({ tableNames: updatedTableNames });
      toast.success('Table name saved successfully!');
    } catch (error) {
      console.error('Error saving table name:', error);
      toast.error('Failed to save table name');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, tableNumber: number) => {
    setDraggedTable(tableNumber);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    setDraggedTable(null);
    setDragOverTable(null);
  };

  const handleDragOver = (e: React.DragEvent, tableNumber: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTable(tableNumber);
  };

  const handleDragLeave = () => {
    setDragOverTable(null);
  };

  const handleDrop = (e: React.DragEvent, dropTableNumber: number) => {
    e.preventDefault();
    
    if (draggedTable === null || draggedTable === dropTableNumber) {
      return;
    }

    // Reorder the tables
    const newOrder = [...tableOrder];
    const draggedIndex = newOrder.indexOf(draggedTable);
    const dropIndex = newOrder.indexOf(dropTableNumber);
    
    // Remove dragged table and insert at new position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedTable);
    
    setTableOrder(newOrder);
    setDragOverTable(null);
    
    toast.success('Table order updated! Note: This only changes display order, not seat assignments.');
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
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-6 text-theme-primary flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Seating Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="total-guests" className="block text-theme-text mb-2 font-medium">Total Number of Guests</label>
            <input 
              type="number" 
              id="total-guests" 
              min="1" 
              max="500" 
              value={totalGuests}
              onChange={(e) => setTotalGuests(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
          
          <div>
            <label htmlFor="seats-per-table" className="block text-theme-text mb-2 font-medium">Seats Per Table</label>
            <input 
              type="number" 
              id="seats-per-table" 
              min="1" 
              max="20" 
              value={seatsPerTable}
              onChange={(e) => setSeatsPerTable(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
        </div>

        <div className="bg-theme-secondary p-4 rounded-lg mb-6">
          <p className="text-theme-text text-sm">
            Current capacity: <span className="font-semibold">{currentGuestCount} guests</span> out of <span className="font-semibold">{parseInt(totalGuests) || 0} total seats</span>
          </p>
          <p className="text-theme-text text-sm">
            Tables to be created: <span className="font-semibold">{totalTables} tables</span> with <span className="font-semibold">{parseInt(seatsPerTable) || 0} seats each</span>
          </p>
        </div>

        <button 
          onClick={handleSaveSeatingSettings}
          className="bg-theme-primary text-theme-button-text py-3 px-8 rounded-lg hover:bg-theme-accent transition duration-300 flex items-center gap-2 font-medium"
        >
          <Settings className="w-5 h-5" />
          Save Settings & Auto-Create/Assign Guests
        </button>
      </div>

      {/* Header Controls */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-xl font-semibold mb-4 lg:mb-0 text-theme-primary">Guest Management by Tables</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent" 
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
                className="flex items-center gap-2 px-4 py-2 bg-theme-accent text-theme-button-text rounded-lg hover:bg-theme-primary transition duration-300"
              >
                <Upload size={16} />
                Upload CSV
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-theme-secondary rounded-lg">
          <p className="text-sm text-theme-text mb-2">
            <strong>CSV Upload Format:</strong> Your CSV file should have columns: "name" (required), "category" (optional: VVIP, premium, family)
          </p>
          <p className="text-sm text-theme-text">
            Example: name,category<br/>
            John Doe,premium<br/>
            Jane Smith,family
          </p>
        </div>

        {/* Table Navigation Tabs - Fixed responsive layout without horizontal scroll */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-theme-text">Table Navigation</h4>
          <div className="bg-theme-secondary p-4 rounded-lg mb-4">
            <p className="text-sm text-theme-text mb-2">
              <strong>💡 Tip:</strong> You can drag and drop the table tabs below to rearrange their display order. 
              This changes how tables are numbered and displayed, but doesn't affect actual seat assignments.
            </p>
          </div>
          
          {/* Fixed grid layout - no horizontal scrolling */}
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {tableOrder.map((originalTableNum, displayIndex) => {
                const displayTableNum = displayIndex + 1;
                const tableGuests = getGuestsByTable(originalTableNum);
                const availableSeats = getAvailableSeatsForTable(originalTableNum);
                const isSelected = selectedTable === originalTableNum;
                const seatsPerTableNum = parseInt(seatsPerTable);
                
                return (
                  <div
                    key={originalTableNum}
                    draggable
                    onDragStart={(e) => handleDragStart(e, originalTableNum)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, originalTableNum)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, originalTableNum)}
                    onClick={() => setSelectedTable(originalTableNum)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'border-theme-primary bg-theme-primary text-theme-button-text shadow-lg' 
                        : dragOverTable === originalTableNum
                        ? 'border-theme-accent bg-theme-accent text-theme-button-text'
                        : 'border-gray-200 hover:border-theme-primary bg-theme-card-bg hover:bg-theme-secondary'
                    }`}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <GripVertical className="w-3 h-3 mr-1 opacity-50" />
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="font-semibold text-xs mb-1">Table {displayTableNum}</div>
                      <div className="text-xs opacity-75 mb-1 truncate">
                        {getCurrentTableName(originalTableNum)}
                      </div>
                      <div className="text-xs opacity-75 mb-1">
                        {tableGuests.length}/{seatsPerTableNum}
                      </div>
                      <div className="text-xs opacity-75 mb-1">
                        {availableSeats.length} free
                      </div>
                      <div className="text-xs opacity-75">
                        {(originalTableNum - 1) * seatsPerTableNum + 1}-{originalTableNum * seatsPerTableNum}
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
        <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
              <Users className="w-5 h-5" />
              Table {tableOrder.indexOf(selectedTable) + 1} - Seats {(selectedTable - 1) * parseInt(seatsPerTable) + 1} to {selectedTable * parseInt(seatsPerTable)}
            </h4>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-theme-text">Table Name:</label>
              <input
                type="text"
                value={getCurrentTableName(selectedTable)}
                onChange={(e) => handleTableNameChange(selectedTable, e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent text-sm"
                placeholder="Enter table name"
              />
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-theme-secondary rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-theme-text">Occupied:</span> {getGuestsByTable(selectedTable).length}
              </div>
              <div>
                <span className="font-semibold text-theme-text">Available:</span> {getAvailableSeatsForTable(selectedTable).length}
              </div>
              <div>
                <span className="font-semibold text-theme-text">Capacity:</span> {parseInt(seatsPerTable)}
              </div>
              <div>
                <span className="font-semibold text-theme-text">Available Seats:</span> {getAvailableSeatsForTable(selectedTable).join(', ') || 'None'}
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
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Seat Assignment</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Arrived</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Food</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Meal Served</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Drink</th>
                  <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase">Drink Served</th>
                </tr>
              </thead>
              <tbody>
                {getGuestsByTable(selectedTable).map(([code, guest]) => renderGuestRow(code, guest, true))}
                
                {getGuestsByTable(selectedTable).length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-theme-text">
                      No guests assigned to this table yet. Click "Save Settings & Auto-Create/Assign Guests" above to automatically assign guests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Table Notes Section */}
        {selectedTable && (
          <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
              📝 Table {tableOrder.indexOf(selectedTable) + 1} Notes
            </h4>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-h-[120px]">
              <label className="block text-sm font-medium text-theme-text mb-2">
                Add notes for this table (e.g., "Only children will be assigned to this table", "VIP guests only", etc.)
              </label>
              <textarea
                value={getCurrentTableNote(selectedTable)}
                onChange={(e) => handleTableNoteChange(selectedTable, e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none"
                placeholder="Enter any special notes or instructions for this table..."
              />
              <div className="text-xs text-gray-500 mt-2">
                Notes are automatically saved as you type and will be visible to ushers.
              </div>
            </div>
          </div>
        )}
      )}
    </div>
  );
};

export default GuestsTab;