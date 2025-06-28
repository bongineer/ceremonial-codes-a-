import { AppState } from '../types';

// Load data from localStorage
export const initializeData = (initialState: AppState): AppState => {
  try {
    const savedData = localStorage.getItem('weddingData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return { ...initialState, ...parsedData };
    }
    
    // Initialize seats if this is the first load
    const seats: Record<number, { taken: boolean; guestCode: string | null }> = {};
    for (let i = 1; i <= initialState.settings.maxSeats; i++) {
      seats[i] = {
        taken: false,
        guestCode: null
      };
    }
    
    const newState = {
      ...initialState,
      seats,
      gallery: [
        {
          title: "Engagement Photo",
          imageUrl: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          type: 'image' as const
        },
        {
          title: "First Date",
          imageUrl: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          type: 'image' as const
        },
        {
          title: "Our Proposal",
          imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          type: 'image' as const
        }
      ],
      foodMenu: [
        {
          name: "Grilled Salmon",
          description: "Atlantic salmon with lemon butter sauce and seasonal vegetables",
          imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          category: "main" as const,
          guestCategory: "VVIP" as const
        },
        {
          name: "Beef Wellington",
          description: "Prime beef tenderloin wrapped in puff pastry with mushroom duxelles",
          imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          category: "main" as const,
          guestCategory: "VVIP" as const
        },
        {
          name: "Bruschetta",
          description: "Toasted bread topped with diced tomatoes, basil, and balsamic glaze",
          imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          category: "appetizer" as const,
          guestCategory: "family" as const
        },
        {
          name: "Tiramisu",
          description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream",
          imageUrl: "https://images.unsplash.com/photo-1542124948-dc391252a940?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          category: "dessert" as const,
          guestCategory: "family" as const
        }
      ],
      drinkMenu: [
        {
          name: "Red Wine",
          description: "Premium Cabernet Sauvignon",
          imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          category: "alcoholic" as const,
          guestCategory: "VVIP" as const
        },
        {
          name: "Sparkling Water",
          description: "Refreshing carbonated water with lemon",
          imageUrl: "https://images.unsplash.com/photo-1605142859862-978be7eba909?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          category: "water" as const,
          guestCategory: "family" as const
        },
        {
          name: "Fruit Punch",
          description: "Blend of tropical fruit juices",
          imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          category: "non-alcoholic" as const,
          guestCategory: "family" as const
        }
      ],
      asoebiItems: [
        {
          title: "Men's Traditional Outfit",
          description: "High-quality blue and gold agbada set with cap",
          imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          price: 150,
          gender: "male" as const,
          currency: "NGN" as const
        },
        {
          title: "Women's Lace Gown",
          description: "Elegant rose gold lace gown with gele headwrap",
          imageUrl: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          price: 200,
          gender: "female" as const,
          currency: "NGN" as const
        }
      ],
      registryItems: [
        {
          item: "Kitchen Mixer",
          description: "Professional stand mixer for our new home",
          imageUrl: "https://images.unsplash.com/photo-1556910633-5099dc3971f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          price: 350,
          link: "#",
          currency: "NGN" as const
        },
        {
          item: "Honeymoon Fund",
          description: "Contribute to our dream honeymoon in Bali",
          imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          price: 500,
          link: "#",
          currency: "NGN" as const
        }
      ]
    };
    
    saveData(newState);
    return newState;
  } catch (error) {
    console.error('Error loading data:', error);
    return initialState;
  }
};

// Save data to localStorage
export const saveData = (data: AppState): void => {
  try {
    localStorage.setItem('weddingData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Format date to display
export const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format time to display
export const formatEventTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate time left until wedding
export const calculateTimeLeft = (dateString: string): { days: number; hours: number; minutes: number; seconds: number } => {
  const difference = new Date(dateString).getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000)
  };
};