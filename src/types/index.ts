// Basic types
export interface Settings {
  coupleNames: string;
  eventDate: string;
  venue: string;
  receptionVenue?: string;
  receptionDate?: string;
  maxSeats: number;
  seatsPerTable: number;
  welcomeImage?: string;
  welcomeImages: string[];
  backgroundImages: string[];
  guestPhotosLink?: string;
  theme: string;
  tableNames?: Record<number, string>;
}

export interface Guest {
  name: string;
  seatNumber: number | null;
  tableNumber?: number | null;
  arrived: boolean;
  mealServed: boolean;
  drinkServed: boolean;
  selectedFood?: string | null;
  selectedDrink?: string | null;
  category?: 'VVIP' | 'premium' | 'family';
}

export interface Seat {
  taken: boolean;
  guestCode: string | null;
}

export interface PaymentDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  whatsappNumber: string;
}

// Content types
export interface PhotoItem {
  title?: string;
  imageUrl: string;
  type: 'image' | 'video';
}

export interface FoodItem {
  name: string;
  description: string;
  imageUrl: string;
  category: 'main' | 'appetizer' | 'dessert';
  guestCategory: 'VVIP' | 'premium' | 'family';
}

export interface DrinkItem {
  name: string;
  description: string;
  imageUrl: string;
  category: 'alcoholic' | 'non-alcoholic' | 'water';
  guestCategory: 'VVIP' | 'premium' | 'family';
}

export interface AsoebiItem {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: 'NGN' | 'USD' | 'GBP' | 'EUR';
  gender: 'male' | 'female' | 'unisex';
}

export interface RegistryItem {
  item: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: 'NGN' | 'USD' | 'GBP' | 'EUR';
  link: string;
}

export interface WeddingPartyMember {
  name: string;
  imageUrl: string;
  role: string;
  side: 'bride' | 'groom';
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  cardBg: string;
  isGradient?: boolean;
}

// App state
export interface AppState {
  settings: Settings;
  gallery: PhotoItem[];
  foodMenu: FoodItem[];
  drinkMenu: DrinkItem[];
  asoebiItems: AsoebiItem[];
  registryItems: RegistryItem[];
  weddingParty: WeddingPartyMember[];
  paymentDetails: PaymentDetails;
  guests: Record<string, Guest>;
  seats: Record<number, Seat>;
  accessCodes: string[];
  currentUser: string | null;
  currentTheme: Theme;
}