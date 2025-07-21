import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { defaultSettings } from '../../../context/AppContext';
import { useSupabase } from '../../../hooks/useSupabase';
import { User, Edit3, Save, X, StickyNote } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  dietary_restrictions: string;
  table_number: number;
  seat_number: number;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  plus_one: boolean;
  plus_one_name?: string;
}

export default function GuestsTab() {
  const { state, updateSettings } = useAppContext();
  const settings = state.settings || defaultSettings;
  const { updateSettings: updateSupabaseSettings } = useSupabase();
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [editingTableNames, setEditingTableNames] = useState<{ [key: number]: string }>({});
  const [editingNotes, setEditingNotes] = useState<{ [key: number]: string }>({});
  const [saveTimeouts, setSaveTimeouts] = useState<{ [key: number]: NodeJS.Timeout }>({});
  const [noteTimeouts, setNoteTimeouts] = useState<{ [key: number]: NodeJS.Timeout }>({});
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [noteMessage, setNoteMessage] = useState<string>('');

  const totalTables = Math.ceil((settings.maxSeats || 30) / (settings.seatsPerTable || 10));
  const seatsPerTable = settings.seatsPerTable || 10;
  const tableNames = settings.tableNames || {};
  const tableNotes = settings.tableNotes || {};

  // Initialize editing states
  useEffect(() => {
    const initialTableNames: { [key: number]: string } = {};
    const initialNotes: { [key: number]: string } = {};
    
    for (let i = 1; i <= totalTables; i++) {
      initialTableNames[i] = tableNames[i] || `Table ${i}`;
      initialNotes[i] = tableNotes[i] || '';
    }
    
    setEditingTableNames(initialTableNames);
    setEditingNotes(initialNotes);
  }, [totalTables, tableNames, tableNotes]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeouts).forEach(timeout => clearTimeout(timeout));
      Object.values(noteTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [saveTimeouts, noteTimeouts]);

  const handleTableNameChange = (tableNumber: number, value: string) => {
    setEditingTableNames(prev => ({ ...prev, [tableNumber]: value }));

    // Clear existing timeout
    if (saveTimeouts[tableNumber]) {
      clearTimeout(saveTimeouts[tableNumber]);
    }

    // Set new timeout for auto-save
    const newTimeout = setTimeout(async () => {
      try {
        const newTableNames = { ...tableNames, [tableNumber]: value };
        await updateSupabaseSettings({ table_names: newTableNames });
        updateSettings({ tableNames: newTableNames });
        setSaveMessage('Table name saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        console.error('Error saving table name:', error);
        setSaveMessage('Error saving table name');
        setTimeout(() => setSaveMessage(''), 3000);
        // Revert to previous value on error
        setEditingTableNames(prev => ({ ...prev, [tableNumber]: tableNames[tableNumber] || `Table ${tableNumber}` }));
      }
    }, 1000);

    setSaveTimeouts(prev => ({ ...prev, [tableNumber]: newTimeout }));
  };

  const handleNotesChange = (tableNumber: number, value: string) => {
    setEditingNotes(prev => ({ ...prev, [tableNumber]: value }));

    // Clear existing timeout
    if (noteTimeouts[tableNumber]) {
      clearTimeout(noteTimeouts[tableNumber]);
    }

    // Set new timeout for auto-save
    const newTimeout = setTimeout(async () => {
      try {
        const newTableNotes = { ...tableNotes, [tableNumber]: value };
        await updateSupabaseSettings({ table_notes: newTableNotes });
        updateSettings({ tableNotes: newTableNotes });
        setNoteMessage('Notes saved successfully!');
        setTimeout(() => setNoteMessage(''), 3000);
      } catch (error) {
        console.error('Error saving table notes:', error);
        setNoteMessage('Error saving notes');
        setTimeout(() => setNoteMessage(''), 3000);
        // Revert to previous value on error
        setEditingNotes(prev => ({ ...prev, [tableNumber]: tableNotes[tableNumber] || '' }));
      }
    }, 1000);

    setNoteTimeouts(prev => ({ ...prev, [tableNumber]: newTimeout }));
  };

  const getTableRange = (tableNumber: number) => {
    const startSeat = (tableNumber - 1) * seatsPerTable + 1;
    const endSeat = tableNumber * seatsPerTable;
    return `Seats ${startSeat} to ${endSeat}`;
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Guest Management</h2>
        </div>

        {/* Table Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Table</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: totalTables }, (_, i) => i + 1).map((tableNumber) => (
              <button
                key={tableNumber}
                onClick={() => setSelectedTable(tableNumber)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedTable === tableNumber
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-25'
                }`}
              >
                <div className="text-sm font-medium">
                  {editingTableNames[tableNumber] || `Table ${tableNumber}`}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getTableRange(tableNumber)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Table Details */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {editingTableNames[selectedTable] || `Table ${selectedTable}`} - {getTableRange(selectedTable)}
            </h4>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Table Name
            </label>
            <input
              type="text"
              value={editingTableNames[selectedTable] || ''}
              onChange={(e) => handleTableNameChange(selectedTable, e.target.value)}
              onFocus={handleInputFocus}
              onKeyPress={handleInputKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={`Table ${selectedTable}`}
            />
            {saveMessage && (
              <p className={`mt-2 text-sm ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMessage}
              </p>
            )}
          </div>

          {/* Guest List for Selected Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Guest List</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RSVP Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plus One
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: seatsPerTable }, (_, i) => {
                    const seatNumber = (selectedTable - 1) * seatsPerTable + i + 1;
                    return (
                      <tr key={seatNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {seatNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            placeholder="Guest name"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="tel"
                            placeholder="Phone"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="declined">Declined</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Notes Section */}
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-5 h-5 text-indigo-600" />
              <label className="block text-sm font-medium text-gray-700">
                Table Notes
              </label>
            </div>
            <textarea
              value={editingNotes[selectedTable] || ''}
              onChange={(e) => handleNotesChange(selectedTable, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
              placeholder="Add notes for this table (e.g., 'Only children will be assigned to this table', 'VIP guests only', etc.)"
            />
            {noteMessage && (
              <p className={`mt-2 text-sm ${noteMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {noteMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}