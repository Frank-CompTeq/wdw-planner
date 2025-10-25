// Types spécifiques aux voyages

export interface TripFormData {
  name: string;
  startDate: Date;
  endDate: Date;
  useDVC: boolean;
  dvcContractId?: string;
}

export interface DayFormData {
  date: Date;
  park: string;
  hotel: string;
  meals: {
    breakfast?: MealFormData;
    lunch?: MealFormData;
    dinner?: MealFormData;
  };
}

export interface MealFormData {
  restaurantId: string;
  restaurantName: string;
  time: string;
  status: 'planned' | 'reserved' | 'confirmed';
}

export interface TripFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  park?: string;
  hasDVC?: boolean;
}

export interface TripStats {
  totalDays: number;
  parksVisited: string[];
  restaurantsPlanned: number;
  dvcPointsUsed?: number;
}

// Re-export from main types
export type { Trip, TripDay, TripMetadata, CreateTripInput, CreateDayInput, CreateMealInput } from './index';
