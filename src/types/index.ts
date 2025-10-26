// Types globaux pour WDW Planner

export interface User {
  id: string;
  email: string;
  name: string;
  family_role: 'owner' | 'member' | 'guest';
  created_at: Date;
  updated_at: Date;
}

export interface DVCContract {
  contract_id: string;
  home_resort: string;
  annual_points: number;
  use_year: string; // ex: "Feb"
  banked_points: number;
  borrowed_points: number;
  current_points_available: number;
}

export interface TripMetadata {
  name: string;
  start_date: Date;
  end_date: Date;
  owner_id: string;
  shared_with: string[]; // user IDs avec accès read-only
  created_at: Date;
  updated_at: Date;
}

export interface DVCBooking {
  contract_used: string; // contract_id
  points_used: number;
  booking_window: '11_month' | '7_month';
  reservation_date: Date;
}

export interface Meal {
  restaurant_id: string;
  restaurant_name: string;
  time: string; // "08:00", "12:30", etc.
  reservation_date?: Date;
  status: MealStatus;
  notes?: string;
}

export type MealStatus = 'planned' | 'reserved' | 'confirmed' | 'cancelled';

export interface Meals {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
}

export interface TripDay {
  id: string;
  trip_id: string;
  date: Date;
  park: string | null;
  hotel: string | null;
  meals: Meals;
  notes?: string;
}

export interface Trip {
  id: string;
  metadata: TripMetadata;
  dvc_booking?: DVCBooking;
  days: TripDay[];
}

export interface Restaurant {
  id: string;
  name: string;
  park_location: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  booking_window_days: number;
  requires_reservation: boolean;
  cuisine_type: string;
  price_range: string;
  image_url?: string;
}

export interface Notification {
  id: string;
  trip_id: string;
  user_id: string;
  type: 'dining_alert';
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  restaurant_name: string;
  trigger_date: Date;
  trigger_time: string;
  sent: boolean;
  created_at: Date;
}

// Input types for mutations
export interface CreateTripInput {
  name: string;
  start_date: Date;
  end_date: Date;
  use_dvc?: boolean;
  dvc_contract_id?: string;
}

export interface UpdateTripInput {
  name?: string;
  start_date?: Date;
  end_date?: Date;
  use_dvc?: boolean;
  dvc_contract_id?: string;
}

export interface CreateDayInput {
  trip_id: string;
  date: Date;
  park?: string;
  hotel?: string;
  meals?: Meals;
  notes?: string;
}

export interface UpdateDayInput {
  park?: string | null;
  hotel?: string | null;
  meals?: Meals;
  notes?: string;
  date?: Date;
}

export interface CreateMealInput {
  trip_id: string;
  day_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  restaurant_id: string;
  time: string;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  TripsList: undefined;
  TripDetail: { tripId: string };
  CreateTrip: undefined;
  EditDay: { tripId: string; dayId?: string; date: string };
  DVCContracts: undefined;
  Settings: undefined;
};
