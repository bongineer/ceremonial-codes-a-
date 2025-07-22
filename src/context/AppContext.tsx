import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { isSupabaseReady } from '../lib/supabase';
import { applyTheme, getThemeById } from '../utils/themes';
import { initializeData, saveData } from '../utils/storage';
import { 
  Settings, 
  Guest, 
  Seat, 
  PhotoItem, 
  FoodItem, 
  DrinkItem,
  AsoebiItem,
  RegistryItem,
  PaymentDetails,
  WeddingPartyMember,
  AppState
} from '../types';
import { toast } from 'react-toastify';

const defaultSettings: Settings = {
  coupleNames: "Bonaventure & Joy",
  eventDate: "2024-06-15T11:00",
  venue: "Grand Ballroom, Royal Hotel",
  receptionVenue: "Grand Ballroom, Royal Hotel - Reception Hall",
  receptionDate: "2024-06-15T13:00",
  maxSeats: 300,
  seatsPerTable: 10,
  welcomeImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  welcomeImages: [],
  backgroundImages: [],
  theme: "classic-rose",
  tableNotes: {}
};

const defaultPaymentDetails: PaymentDetails = {
  accountName: "Bonaventure & Joy Wedding",
  accountNumber: "1234567890",
  bankName: "Wedding Bank",
  whatsappNumber: "+123456789"
};

const initialState: AppState = {
  settings: defaultSettings,
  gallery: [],
  foodMenu: [],
  drinkMenu: [],
  asoebiItems: [],
  registryItems: [],
  paymentDetails: defaultPaymentDetails,
  guests: { 
    'ADMIN': { name: 'Admin', seatNumber: null, arrived: false, mealServed: false, drinkServed: false },
    'USHER': { name: 'Usher', seatNumber: null, arrived: false, mealServed: false, drinkServed: false }
  },
  seats: {},
  accessCodes: ['ADMIN', 'USHER'],
  currentUser: null,
  weddingParty: [],
  currentTheme: getThemeById('classic-rose')
};

const AppContext = createContext<{
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
  generateAccessCodes: (count: number) => string[];
  assignSeat: (code: string, seatNumber: number) => boolean;
  confirmArrival: (code: string) => void;
  updateGuestFood: (code: string, foodName: string) => void;
  updateGuestDrink: (code: string, drinkName: string) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addGalleryPhoto: (photo: PhotoItem) => void;
  removeGalleryPhoto: (index: number) => void;
  addFoodItem: (item: FoodItem) => void;
  removeFoodItem: (index: number) => void;
  addDrinkItem: (item: DrinkItem) => void;
  removeDrinkItem: (index: number) => void;
  addAsoebiItem: (item: AsoebiItem) => void;
  removeAsoebiItem: (index: number) => void;
  addRegistryItem: (item: RegistryItem) => void;
  removeRegistryItem: (index: number) => void;
  updatePaymentDetails: (details: PaymentDetails) => void;
  updateGuestDetails: (code: string, updates: Partial<Guest>) => void;
  addWeddingPartyMember: (member: WeddingPartyMember) => void;
  removeWeddingPartyMember: (index: number) => void;
  refreshData: () => Promise<void>;
  autoAssignAllSeats: () => void;
}>({
  state: initialState,
  setState: () => {},
  login: () => Promise.resolve(false),
  logout: () => {},
  generateAccessCodes: () => [],
  assignSeat: () => false,
  confirmArrival: () => {},
  updateGuestFood: () => {},
  updateGuestDrink: () => {},
  updateSettings: () => {},
  addGalleryPhoto: () => {},
  removeGalleryPhoto: () => {},
  addFoodItem: () => {},
  removeFoodItem: () => {},
  addDrinkItem: () => {},
  removeDrinkItem: () => {},
  addAsoebiItem: () => {},
  removeAsoebiItem: () => {},
  addRegistryItem: () => {},
  removeRegistryItem: () => {},
  updatePaymentDetails: () => {},
  updateGuestDetails: () => {},
  addWeddingPartyMember: () => {},
  removeWeddingPartyMember: () => {},
  refreshData: () => Promise.resolve(),
  autoAssignAllSeats: () => {}
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const supabase = useSupabase();

  // Auto-assign seats function - assigns seats serially and maintains them
  const autoAssignAllSeats = () => {
    setState(prev => {
      const allGuests = Object.entries(prev.guests).filter(([code]) => code !== 'ADMIN' && code !== 'USHER');
      const updatedGuests = { ...prev.guests };
      const updatedSeats: Record<number, Seat> = {};
      
      // Initialize all seats as available
      for (let i = 1; i <= prev.settings.maxSeats; i++) {
        updatedSeats[i] = {
          taken: false,
          guestCode: null
        };
      }
      
      // First, preserve existing seat assignments
      allGuests.forEach(([code, guest]) => {
        if (guest.seatNumber && guest.seatNumber <= prev.settings.maxSeats) {
          updatedSeats[guest.seatNumber] = {
            taken: true,
            guestCode: code
          };
        }
      });
      
      // Then assign seats to guests who don't have one, using the next available seat
      let nextAvailableSeat = 1;
      allGuests.forEach(([code, guest]) => {
        if (!guest.seatNumber || guest.seatNumber > prev.settings.maxSeats) {
          // Find next available seat
          while (nextAvailableSeat <= prev.settings.maxSeats && updatedSeats[nextAvailableSeat].taken) {
            nextAvailableSeat++;
          }
          
          if (nextAvailableSeat <= prev.settings.maxSeats) {
            updatedGuests[code] = {
              ...updatedGuests[code],
              seatNumber: nextAvailableSeat
            };
            updatedSeats[nextAvailableSeat] = {
              taken: true,
              guestCode: code
            };
            
            // Update in Supabase if available
            if (isSupabaseReady) {
              supabase.updateGuest(code, { seatNumber: nextAvailableSeat });
            }
            
            nextAvailableSeat++;
          }
        }
      });
      
      const newState = {
        ...prev,
        guests: updatedGuests,
        seats: updatedSeats
      };
      
      if (!isSupabaseReady) {
        saveData(newState);
      }
      
      return newState;
    });
  };

  // Load all data from Supabase or localStorage
  const refreshData = async () => {
    try {
      if (isSupabaseReady) {
        supabase.setLoading(true);
        
        const [
          settings,
          guests,
          gallery,
          foodMenu,
          drinkMenu,
          asoebiItems,
          registryItems,
          paymentDetails,
          weddingParty
        ] = await Promise.all([
          supabase.getSettings(),
          supabase.getGuests(),
          supabase.getGallery(),
          supabase.getFoodMenu(),
          supabase.getDrinkMenu(),
          supabase.getAsoebiItems(),
          supabase.getRegistryItems(),
          supabase.getPaymentDetails(),
          supabase.getWeddingParty()
        ]);

        // Generate seats based on max seats
        const maxSeats = settings?.maxSeats || 300;
        const seats: Record<number, Seat> = {};
        for (let i = 1; i <= maxSeats; i++) {
          const guestCode = Object.keys(guests).find(code => guests[code].seatNumber === i);
          seats[i] = {
            taken: !!guestCode,
            guestCode: guestCode || null
          };
        }

        const finalSettings = settings || defaultSettings;
        
        // Apply theme
        const currentTheme = getThemeById(finalSettings.theme || 'classic-rose');
        applyTheme(currentTheme);

        setState({
          settings: finalSettings,
          gallery: gallery || [],
          foodMenu: foodMenu || [],
          drinkMenu: drinkMenu || [],
          asoebiItems: asoebiItems || [],
          registryItems: registryItems || [],
          paymentDetails: paymentDetails || defaultPaymentDetails,
          guests: guests || { 
            'ADMIN': { name: 'Admin', seatNumber: null, arrived: false, mealServed: false, drinkServed: false },
            'USHER': { name: 'Usher', seatNumber: null, arrived: false, mealServed: false, drinkServed: false }
          },
          seats,
          accessCodes: Object.keys(guests || { 'ADMIN': {}, 'USHER': {} }),
          currentUser: state.currentUser,
          weddingParty: weddingParty || [],
          currentTheme
        });
      } else {
        // Fallback to localStorage when Supabase is not configured
        console.log('Using localStorage fallback mode');
        const localData = initializeData(initialState);
        setState(localData);
        
        // Apply theme from local data
        const currentTheme = getThemeById(localData.settings.theme || 'classic-rose');
        applyTheme(currentTheme);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Fallback to localStorage on error
      console.log('Falling back to localStorage due to error');
      const localData = initializeData(initialState);
      setState(localData);
      
      if (isSupabaseReady) {
        toast.error('Failed to load data from database, using local storage');
      }
    } finally {
      if (isSupabaseReady) {
        supabase.setLoading(false);
      }
    }
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  // Add theme application effect here
  useEffect(() => {
    const themeId = state.settings.theme || 'classic-rose';
    const theme = getThemeById(themeId);
    applyTheme(theme);
  }, [state.settings.theme]);
  
  const login = async (code: string): Promise<boolean> => {
    const upperCode = code.trim().toUpperCase();
    if (state.accessCodes.includes(upperCode)) {
      setState(prev => ({
        ...prev,
        currentUser: upperCode
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      currentUser: null
    }));
  };

  const generateAccessCodes = (count: number): string[] => {
    const generateRandomCode = (length = 5) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    };
    
    const newCodes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      let code: string;
      do {
        code = generateRandomCode();
      } while (state.accessCodes.includes(code));
      
      newCodes.push(code);
    }
    
    // Add guests to Supabase if available, otherwise localStorage
    if (isSupabaseReady) {
      newCodes.forEach(async (code) => {
        await supabase.addGuest(code, `Guest ${code}`);
      });
      
      // Refresh data to get updated guest list
      setTimeout(() => refreshData(), 1000);
    } else {
      // Add to localStorage with serial seat assignment
      setState(prev => {
        const updatedGuests = { ...prev.guests };
        const updatedAccessCodes = [...prev.accessCodes];
        const updatedSeats = { ...prev.seats };
        
        // Find the next available seat number (serial assignment)
        let nextSeatNumber = 1;
        const existingSeats = Object.values(prev.guests)
          .map(guest => guest.seatNumber)
          .filter(seat => seat !== null)
          .sort((a, b) => (a || 0) - (b || 0));
        
        // Find the first gap or use the next number after the highest
        for (const seat of existingSeats) {
          if (seat === nextSeatNumber) {
            nextSeatNumber++;
          } else {
            break;
          }
        }
        
        newCodes.forEach((code, index) => {
          const seatNumber = nextSeatNumber + index;
          
          updatedGuests[code] = {
            name: `Guest ${code}`,
            seatNumber: seatNumber <= prev.settings.maxSeats ? seatNumber : null,
            arrived: false,
            mealServed: false,
            drinkServed: false,
            category: 'VVIP'
          };
          updatedAccessCodes.push(code);
          
          // Assign seat if within capacity
          if (seatNumber <= prev.settings.maxSeats) {
            updatedSeats[seatNumber] = {
              taken: true,
              guestCode: code
            };
          }
        });
        
        const newState = {
          ...prev,
          guests: updatedGuests,
          accessCodes: updatedAccessCodes,
          seats: updatedSeats
        };
        
        saveData(newState);
        return newState;
      });
    }
    
    return newCodes;
  };

  const assignSeat = (code: string, seatNumber: number): boolean => {
    if (!state.seats[seatNumber] || !state.seats[seatNumber].taken) {
      // Update guest in Supabase if available
      if (isSupabaseReady) {
        supabase.updateGuest(code, { seatNumber });
      }
      
      setState(prev => {
        const updatedSeats = { ...prev.seats };
        const updatedGuests = { ...prev.guests };
        
        // Clear previous seat if guest had one
        if (updatedGuests[code]?.seatNumber) {
          const oldSeat = updatedGuests[code].seatNumber as number;
          updatedSeats[oldSeat] = {
            taken: false,
            guestCode: null
          };
        }
        
        // Update seat status
        updatedSeats[seatNumber] = {
          taken: true,
          guestCode: code
        };
        
        // Update guest info
        if (updatedGuests[code]) {
          updatedGuests[code] = {
            ...updatedGuests[code],
            seatNumber: seatNumber
          };
        }
        
        const newState = {
          ...prev,
          seats: updatedSeats,
          guests: updatedGuests
        };
        
        if (!isSupabaseReady) {
          saveData(newState);
        }
        
        return newState;
      });
      
      return true;
    }
    return false;
  };

  const confirmArrival = (code: string) => {
    if (isSupabaseReady) {
      supabase.updateGuest(code, { arrived: true });
    }
    
    setState(prev => {
      const updatedGuests = { ...prev.guests };
      
      if (updatedGuests[code]) {
        updatedGuests[code] = {
          ...updatedGuests[code],
          arrived: true
        };
      }
      
      const newState = {
        ...prev,
        guests: updatedGuests
      };
      
      if (!isSupabaseReady) {
        saveData(newState);
      }
      
      return newState;
    });
  };

  const updateGuestFood = (code: string, foodName: string) => {
    if (isSupabaseReady) {
      supabase.updateGuest(code, { selectedFood: foodName });
    }
    
    setState(prev => {
      const updatedGuests = { ...prev.guests };
      
      if (updatedGuests[code]) {
        updatedGuests[code] = {
          ...updatedGuests[code],
          selectedFood: foodName
        };
      }
      
      const newState = {
        ...prev,
        guests: updatedGuests
      };
      
      if (!isSupabaseReady) {
        saveData(newState);
      }
      
      return newState;
    });
  };

  const updateGuestDrink = (code: string, drinkName: string) => {
    if (isSupabaseReady) {
      supabase.updateGuest(code, { selectedDrink: drinkName });
    }
    
    setState(prev => {
      const updatedGuests = { ...prev.guests };
      
      if (updatedGuests[code]) {
        updatedGuests[code] = {
          ...updatedGuests[code],
          selectedDrink: drinkName
        };
      }
      
      const newState = {
        ...prev,
        guests: updatedGuests
      };
      
      if (!isSupabaseReady) {
        saveData(newState);
      }
      
      return newState;
    });
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (isSupabaseReady) {
      const success = await supabase.updateSettings(newSettings);
      if (success) {
        setState(prev => {
          const updatedSettings = {
            ...prev.settings,
            ...newSettings
          };
          
          // Apply theme if it was updated
          if (newSettings.theme) {
            const newTheme = getThemeById(newSettings.theme);
            applyTheme(newTheme);
            return {
              ...prev,
              settings: updatedSettings,
              currentTheme: newTheme
            };
          }
          
          return {
            ...prev,
            settings: updatedSettings
          };
        });
        
        // Only refresh data if it's not a table names update (to avoid overwriting local state)
        if (!newSettings.tableNames) {
          // Don't refresh data for table names/notes updates to avoid logout
          if (!newSettings.tableNotes) {
            await refreshData();
          }
        }
      } else {
        console.error('Failed to update settings in Supabase');
      }
    } else {
      setState(prev => {
        const updatedSettings = {
          ...prev.settings,
          ...newSettings
        };
        
        // Apply theme if it was updated
        let newTheme = prev.currentTheme;
        if (newSettings.theme) {
          newTheme = getThemeById(newSettings.theme);
          applyTheme(newTheme);
        }
        
        const newState = {
          ...prev,
          settings: updatedSettings,
          currentTheme: newTheme
        };
        
        saveData(newState);
        return newState;
      });
    }
  };

  const addGalleryPhoto = async (photo: PhotoItem) => {
    if (isSupabaseReady) {
      const success = await supabase.addGalleryPhoto(photo);
      if (success) {
        setState(prev => ({
          ...prev,
          gallery: [...prev.gallery, photo]
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          gallery: [...prev.gallery, photo]
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const removeGalleryPhoto = async (index: number) => {
    if (isSupabaseReady) {
      const success = await supabase.removeGalleryPhoto(index);
      if (success) {
        setState(prev => ({
          ...prev,
          gallery: prev.gallery.filter((_, i) => i !== index)
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          gallery: prev.gallery.filter((_, i) => i !== index)
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const addFoodItem = async (item: FoodItem) => {
    if (isSupabaseReady) {
      const success = await supabase.addFoodItem(item);
      if (success) {
        setState(prev => ({
          ...prev,
          foodMenu: [...prev.foodMenu, item]
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          foodMenu: [...prev.foodMenu, item]
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const removeFoodItem = async (index: number) => {
    if (isSupabaseReady) {
      const success = await supabase.removeFoodItem(index);
      if (success) {
        setState(prev => ({
          ...prev,
          foodMenu: prev.foodMenu.filter((_, i) => i !== index)
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          foodMenu: prev.foodMenu.filter((_, i) => i !== index)
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const addDrinkItem = async (item: DrinkItem) => {
    if (isSupabaseReady) {
      const success = await supabase.addDrinkItem(item);
      if (success) {
        setState(prev => ({
          ...prev,
          drinkMenu: [...prev.drinkMenu, item]
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          drinkMenu: [...prev.drinkMenu, item]
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const removeDrinkItem = async (index: number) => {
    if (isSupabaseReady) {
      const success = await supabase.removeDrinkItem(index);
      if (success) {
        setState(prev => ({
          ...prev,
          drinkMenu: prev.drinkMenu.filter((_, i) => i !== index)
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          drinkMenu: prev.drinkMenu.filter((_, i) => i !== index)
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const addAsoebiItem = async (item: AsoebiItem) => {
    if (isSupabaseReady) {
      const success = await supabase.addAsoebiItem(item);
      if (success) {
        setState(prev => ({
          ...prev,
          asoebiItems: [...prev.asoebiItems, item]
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          asoebiItems: [...prev.asoebiItems, item]
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const removeAsoebiItem = async (index: number) => {
    if (isSupabaseReady) {
      const success = await supabase.removeAsoebiItem(index);
      if (success) {
        setState(prev => ({
          ...prev,
          asoebiItems: prev.asoebiItems.filter((_, i) => i !== index)
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          asoebiItems: prev.asoebiItems.filter((_, i) => i !== index)
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const addRegistryItem = async (item: RegistryItem) => {
    if (isSupabaseReady) {
      const success = await supabase.addRegistryItem(item);
      if (success) {
        setState(prev => ({
          ...prev,
          registryItems: [...prev.registryItems, item]
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          registryItems: [...prev.registryItems, item]
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const removeRegistryItem = async (index: number) => {
    if (isSupabaseReady) {
      const success = await supabase.removeRegistryItem(index);
      if (success) {
        setState(prev => ({
          ...prev,
          registryItems: prev.registryItems.filter((_, i) => i !== index)
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          registryItems: prev.registryItems.filter((_, i) => i !== index)
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const updatePaymentDetails = async (details: PaymentDetails) => {
    if (isSupabaseReady) {
      const success = await supabase.updatePaymentDetails(details);
      if (success) {
        setState(prev => ({
          ...prev,
          paymentDetails: {
            ...prev.paymentDetails,
            ...details
          }
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          paymentDetails: {
            ...prev.paymentDetails,
            ...details
          }
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const updateGuestDetails = async (code: string, updates: Partial<Guest>) => {
    if (isSupabaseReady) {
      const success = await supabase.updateGuest(code, updates);
      if (success) {
        setState(prev => {
          const updatedGuests = { ...prev.guests };
          
          if (updatedGuests[code]) {
            // Preserve the existing seat number when updating other details
            const currentSeatNumber = updatedGuests[code].seatNumber;
            updatedGuests[code] = {
              ...updatedGuests[code],
              ...updates
            };
            
            // If the update doesn't include seatNumber, preserve the existing one
            if (updates.seatNumber === undefined && currentSeatNumber !== null) {
              updatedGuests[code].seatNumber = currentSeatNumber;
            }
          }
          
          return {
            ...prev,
            guests: updatedGuests
          };
        });
      }
    } else {
      setState(prev => {
        const updatedGuests = { ...prev.guests };
        
        if (updatedGuests[code]) {
          // Preserve the existing seat number when updating other details
          const currentSeatNumber = updatedGuests[code].seatNumber;
          updatedGuests[code] = {
            ...updatedGuests[code],
            ...updates
          };
          
          // If the update doesn't include seatNumber, preserve the existing one
          if (updates.seatNumber === undefined && currentSeatNumber !== null) {
            updatedGuests[code].seatNumber = currentSeatNumber;
          }
        }
        
        const newState = {
          ...prev,
          guests: updatedGuests
        };
        
        saveData(newState);
        return newState;
      });
    }
  };

  const addWeddingPartyMember = async (member: WeddingPartyMember) => {
    if (isSupabaseReady) {
      const success = await supabase.addWeddingPartyMember(member);
      if (success) {
        setState(prev => ({
          ...prev,
          weddingParty: [...prev.weddingParty, member]
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          weddingParty: [...prev.weddingParty, member]
        };
        saveData(newState);
        return newState;
      });
    }
  };

  const removeWeddingPartyMember = async (index: number) => {
    if (isSupabaseReady) {
      const success = await supabase.removeWeddingPartyMember(index);
      if (success) {
        setState(prev => ({
          ...prev,
          weddingParty: prev.weddingParty.filter((_, i) => i !== index)
        }));
      }
    } else {
      setState(prev => {
        const newState = {
          ...prev,
          weddingParty: prev.weddingParty.filter((_, i) => i !== index)
        };
        saveData(newState);
        return newState;
      });
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      setState,
      login,
      logout,
      generateAccessCodes,
      assignSeat,
      confirmArrival,
      updateGuestFood,
      updateGuestDrink,
      updateSettings,
      addGalleryPhoto,
      removeGalleryPhoto,
      addFoodItem,
      removeFoodItem,
      addDrinkItem,
      removeDrinkItem,
      addAsoebiItem,
      removeAsoebiItem,
      addRegistryItem,
      removeRegistryItem,
      updatePaymentDetails,
      updateGuestDetails,
      addWeddingPartyMember,
      removeWeddingPartyMember,
      refreshData,
      autoAssignAllSeats
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);