// Types spécifiques aux restaurants Disney

export interface RestaurantFilters {
  park?: string;
  cuisine?: string;
  difficulty?: 'easy' | 'moderate' | 'hard';
  priceRange?: string;
  requiresReservation?: boolean;
}

export interface RestaurantSearchParams {
  query?: string;
  filters: RestaurantFilters;
  sortBy?: 'name' | 'difficulty' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface RestaurantAvailability {
  restaurantId: string;
  availableTimes: string[];
  nextAvailableDate: Date;
  bookingDifficulty: 'easy' | 'moderate' | 'hard';
}

export interface DiningReservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  date: Date;
  time: string;
  partySize: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  confirmationNumber?: string;
  notes?: string;
}

export interface RestaurantReview {
  id: string;
  restaurantId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  visitDate: Date;
  createdAt: Date;
}

export interface RestaurantStats {
  totalRestaurants: number;
  byPark: Record<string, number>;
  byCuisine: Record<string, number>;
  byDifficulty: Record<string, number>;
  averageRating: number;
}

// Re-export from main types
export type { Restaurant } from './index';
