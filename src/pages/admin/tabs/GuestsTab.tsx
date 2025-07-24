import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import EditableCell from '../../../components/common/EditableCell';
import EditableToggle from '../../../components/common/EditableToggle';
import { Guest } from '../../../types';
import { Upload, Users, Settings, GripVertical } from 'lucide-react';

const GuestsTab: React.FC = () => {
  // Get context functions and state
  const { state, updateGuestDetails, generateAccessCodes, assignSeat, updateSettings, autoAssignAllSeats } = useAppContext();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | null>(3);
  
  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Seating configuration state
  const [totalGuests, setTotalGuests] = useState(state.settings.maxSeats.toString());
  const [seatsPerTable, setSeatsPerTable] = useState(state.settings.seatsPerTable.toString());
  
  // Drag and drop state
  const [draggedTable, setDraggedTable] = useState<number | null>(null);
  const [dragOverTable, setDragOverTable] = useState<number | null>(null);
  const [tableOrder, setTableOrder] = useState<number[]>([]);
  
  // Table name/notes editing state
  const [editingTableNames, setEditingTableNames] = useState<Record<number, string>>({});
  const [saveTimeouts, setSaveTimeouts] = useState<Record<number, NodeJS.Timeout>>({});
  const [editingTableNotes, setEditingTableNotes] = useState<Record<number, string>>({});
  const [notesSaveTimeouts, setNotesSaveTimeouts] = useState<Record<number, NodeJS.Timeout>>({});

  // Calculate total tables needed
  const totalTables = Math.ceil(parseInt(totalGuests) / parseInt(seatsPerTable);
  
  // Initialize table order
  useEffect(() => {
    if (tableOrder.length !== totalTables) {
      setTableOrder(Array.from({ length: totalTables }, (_, i) => i + 1));
    }
  }, [totalTables, tableOrder.length]);

  // Calculate guest counts
  const currentGuestCount = Object.keys(state.guests).filter(code => code !== 'ADMIN').length;
  const remainingCapacity = parseInt(totalGuests) - currentGuestCount;

  // Initialize table names and notes if not set
  useEffect(() => {
    if (!state.settings.tableNames) {
      const defaultNames: Record<number, string> = {};
      for (let i = 1; i <= totalTables; i++) {
        defaultNames[i] = `Table ${i}`;
      }
      updateSettings({ tableNames: defaultNames });
    }
    if (!state.settings.tableNotes) {
      const defaultNotes: Record<number, string> = {};
      for (let i = 1; i <= totalTables; i++) {
        defaultNotes[i] = '';
      }
      updateSettings({ tableNotes: defaultNotes });
    }
  }, [totalTables, state.settings.tableNames, updateSettings]);

  // Save seating configuration
  const handleSaveSeatingSettings = async () => {
    try {
      const totalGuestsNum = parseInt(totalGuests) || 300;
      const seatsPerTableNum = parseInt(seatsPerTable) || 10;
      
      await updateSettings({
        maxSeats: totalGuestsNum,
        seatsPerTable: seatsPerTableNum
      });
      
      const targetGuestCount = totalGuestsNum;
      const currentGuestCount = Object.keys(state.guests).filter(code => code !== 'ADMIN').length;
      
      if (currentGuestCount < targetGuestCount) {
        const guestsToCreate = targetGuestCount - currentGuestCount;
        generateAccessCodes(guestsToCreate);
        
        setTimeout(() => {
          autoAssignAllSeats();
          toast.success(`Created ${guestsToCreate} new guests and assigned seats!`);
        }, 1000);
      } else if (currentGuestCount > targetGuestCount) {
        toast.warning('Reducing guest count - excess guests will need manual removal');
        setTimeout(() => {
          autoAssignAllSeats();
        }, 1000);
      } else {
        setTimeout(() => {
          autoAssignAllSeats();
          toast.success('Seating settings saved and guests reassigned!');
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
    const seatsPerTableNum = parseInt(seatsPerTable);
    const startSeat = (tableNumber - 1) * seatsPerTableNum + 1;
    const endSeat = tableNumber * seatsPerTableNum;
    
    return filteredGuests.filter(([code, guest]) => {
      return guest.seatNumber && guest.seatNumber >= startSeat && guest.seatNumber <= endSeat;
    });
  };

  // Get unassigned guests
  const getUnassignedGuests = () => {
    return filteredGuests.filter(([code, guest]) => !guest.seatNumber);
  };

  // Update guest details
  const handleUpdateGuest = (code: string, field: keyof Guest, value: any) => {
    updateGuestDetails(code, { [field]: value });
    toast.success(`Guest ${field} updated`);
  };

  // Assign seat to guest
  const handleAssignSeat = (guestCode: string, seatNumber: number) => {
    const success = assignSeat(guestCode, seatNumber);
    if (success) {
      toast.success(`Seat ${seatNumber} assigned to guest`);
    } else {
      toast.error('Seat is already taken');
    }
  };

  // Handle CSV file upload
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

        toast.success(`Successfully uploaded ${guestsToAdd.length} guests!`);
      }, 500);
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper functions for table info
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

  // Table name editing with debounce
  const handleTableNameChange = async (tableNumber: number, newName: string) => {
    setEditingTableNames(prev => ({ ...prev, [tableNumber]: newName }));
    
    if (saveTimeouts[tableNumber]) {
      clearTimeout(saveTimeouts[tableNumber]);
    }
    
    const timeoutId = setTimeout(async () => {
      const updatedTableNames = {
        ...state.settings.tableNames,
        [tableNumber]: newName.trim()
      };
      
      try {
        await updateSettings({ tableNames: updatedTableNames });
        setEditingTableNames(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
        setSaveTimeouts(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
        toast.success('Table name saved!');
      } catch (error) {
        console.error('Error saving table name:', error);
        toast.error('Failed to save table name');
        setEditingTableNames(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
      }
    }, 1000);
    
    setSaveTimeouts(prev => ({
      ...prev,
      [tableNumber]: timeoutId
    }));
  };

  // Table notes editing with debounce
  const handleTableNoteChange = async (tableNumber: number, newNote: string) => {
    const wordCount = newNote.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 150) {
      toast.error('Note cannot exceed 150 words');
      return;
    }

    setEditingTableNotes(prev => ({ ...prev, [tableNumber]: newNote }));
    
    if (notesSaveTimeouts[tableNumber]) {
      clearTimeout(notesSaveTimeouts[tableNumber]);
    }
    
    const timeoutId = setTimeout(async () => {
      const updatedTableNotes = {
        ...state.settings.tableNotes,
        [tableNumber]: newNote.trim()
      };
      
      try {
        await updateSettings({ tableNotes: updatedTableNotes });
        setEditingTableNotes(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
        setNotesSaveTimeouts(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
        toast.success('Table note saved!');
      } catch (error) {
        console.error('Error saving table note:', error);
        toast.error('Failed to save table note');
        setEditingTableNotes(prev => {
          const updated = { ...prev };
          delete updated[tableNumber];
          return updated;
        });
      }
    }, 1000);
    
    setNotesSaveTimeouts(prev => ({
      ...prev,
      [tableNumber]: timeoutId
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tableNumber: number) => {
    setDraggedTable(tableNumber);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    setDraggedTable(null);
    setDragOverTable(null);
  };

  const handleDragOver = (e: React.DragEvent, tableNumber: number) => {
    e.preventDefault();
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

    const newOrder = [...tableOrder];
    const draggedIndex = newOrder.indexOf(draggedTable);
    const dropIndex = newOrder.indexOf(dropTableNumber);
    
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedTable);
    
    setTableOrder(newOrder);
    setDragOverTable(null);
    toast.success('Table order updated!');
  };

  // Render guest row
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

  // Get current table name/note (editing or saved)
  const getCurrentTableName = (tableNumber: number): string => {
    if (editingTableNames[tableNumber] !== undefined) {
      return editingTableNames[tableNumber];
    }
    return state.settings.tableNames?.[tableNumber] || `Table ${tableNumber}`;
  };

  const getCurrentTableNote = (tableNumber: number): string => {
    if (editingTableNotes[tableNumber] !== undefined) {
      return editingTableNotes[tableNumber];
    }
    return state.settings.tableNotes?.[tableNumber] || '';
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeouts).forEach(timeout => clearTimeout(timeout));
      Object.values(notesSaveTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [saveTimeouts, notesSaveTimeouts]);

  // Reset editing state when tables change
  useEffect(() => {
    setEditingTableNames({});
    Object.values(saveTimeouts).forEach(timeout => clearTimeout(timeout));
    setSaveTimeouts({});
    setEditingTableNotes({});
    Object.values(notesSaveTimeouts).forEach(timeout => clearTimeout(timeout));
    setNotesSaveTimeouts({});
  }, [totalTables]);

  return (
    <div className="mx-auto max-w-[calc(100vw-32px)] px-2">
      {/* Seating Configuration Section */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-6 text-theme-primary flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Seating Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="total-guests" className="block text-theme-text mb-2 font-medium">Total Guests</label>
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
          Save Settings & Auto-Assign Guests
        </button>
      </div>

      {/* Guest Management Section */}
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-xl font-semibold mb-4 lg:mb-0 text-theme-primary">Guest Management</h3>
          
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
            <strong>CSV Upload Format:</strong> Columns: "name" (required), "category" (optional: VVIP, premium, family)
          </p>
          <p className="text-sm text-theme-text">
            Example: name,category<br/>
            John Doe,premium<br/>
            Jane Smith,family
          </p>
        </div>

        {/* Table Navigation */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 text-theme-text">Table Navigation</h4>
          <div className="bg-theme-secondary p-4 rounded-lg mb-4">
            <p className="text-sm text-theme-text mb-2">
              <strong>Tip:</strong> Drag and drop tables to rearrange display order.
            </p>
          </div>
          
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

      {/* Selected Table View */}
      {selectedTable && (
        <div className="bg-theme-card-bg rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h4 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Table {tableOrder.indexOf(selectedTable) + 1} - Seats {(selectedTable - 1) * parseInt(seatsPerTable) + 1} to {selectedTable * parseInt(seatsPerTable)}
              </h4>
              
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-theme-text whitespace-nowrap">Table Name:</label>
                <input
                  type="text"
                  value={getCurrentTableName(selectedTable)}
                  onChange={(e) => handleTableNameChange(selectedTable, e.target.value)}
                  className="w-full xs:w-48 px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent text-sm"
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
          </div>

          {/* Guest Table */}
          <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[1024px]">
              <table className="w-full bg-theme-card-bg">
                <thead>
                  <tr className="bg-theme-secondary">
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase w-[120px]">Code</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase min-w-[150px]">Name</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase w-[100px]">Category</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase w-[120px]">Seat</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase w-[80px]">Arrived</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase min-w-[120px]">Food</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase w-[100px]">Meal Served</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase min-w-[120px]">Drink</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-theme-text uppercase w-[100px]">Drink Served</th>
                  </tr>
                </thead>
                <tbody>
                  {getGuestsByTable(selectedTable).map(([code, guest]) => renderGuestRow(code, guest, true))}
                  
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
        </div>
      )}

      {/* Table Notes */}
      {selectedTable && (
        <div className="bg-theme-card-bg p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
              <Users className="w-5 h-5" />
              Table {tableOrder.indexOf(selectedTable) + 1} Notes
            </h4>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme-text mb-2">
              Notes for {getCurrentTableName(selectedTable)} (Max 150 words)
            </label>
            <textarea
              value={getCurrentTableNote(selectedTable)}
              onChange={(e) => handleTableNoteChange(selectedTable, e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none"
              placeholder="Add notes for this table..."
              rows={4}
            />
            <div className="mt-2 text-sm text-theme-text opacity-75">
              Word count: {getCurrentTableNote(selectedTable).trim().split(/\s+/).filter(word => word.length > 0).length}/150
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestsTab;