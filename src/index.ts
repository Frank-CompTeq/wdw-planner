import { Timestamp } from 'firebase/firestore';

// ============= USER & AUTH =============

export interface User {
  id: string;
  email: string;
  name: string;
  family_role: 'owner' | 'member';
  created_at: Timestamp;
}

// ============= DVC (Disney Vacation Club) =============

export interface DVCContract {
  contract_id: string;
  home_resort: DVCResort;
  annual_points: number;
  use_year: string; // "Feb", "Mar", etc.
  banked_points: number;
  borrowed_points: number;
  current_points_available: number;
}

export type DVCResort = 
  | "Animal Kingdom Villas - Jambo House"
  | "Animal Kingdom Villas - Kidani Village"
  | "Bay Lake Tower"
  | "Beach Club Villas"
  | "BoardWalk Villas"
  | "Boulder Ridge Villas"
  | "Copper Creek Villas"
  | "Grand Floridian Villas"
  | "Old Key West"
  | "Polynesian Villas"
  | "Riviera Resort"
  | "Saratoga Springs";

export type BookingWindow = '11_month' | '7_month';

export interface DVCBooking {
  contract_used: string; // contract_id
  points_used: number;
  booking_window: BookingWindow;
  reservation_date: Timestamp;
}

// ============= TRIPS =============

export interface Trip {
  id: string;
  metadata: TripMetadata;
  dvc_booking?: DVCBooking;
  days: TripDay[];
}

export interface TripMetadata {
  name: string;
  start_date: Timestamp;
  end_date: Timestamp;
  owner_id: string;
  shared_with: string[]; // user IDs avec accès read-only
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TripDay {
  id: string;
  trip_id: string;
  date: Timestamp;
  park: Park | null;
  hotel: string;
  meals: Meals;
  notes?: string;
}

export type Park = 
  | "Magic Kingdom"
  | "EPCOT"
  | "Hollywood Studios"
  | "Animal Kingdom";

export interface Meals {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
}

export interface Meal {
  restaurant_id: string;
  restaurant_name: string;
  time: string; // "08:00", "12:30", etc.
  reservation_date?: Timestamp;
  status: MealStatus;
  notes?: string;
}

export type MealStatus = 'planned' | 'reserved' | 'confirmed' | 'cancelled';

// ============= RESTAURANTS =============

export interface Restaurant {
  id: string;
  name: string;
  park_location: Park | 'Disney Springs' | 'Resort';
  location_detail?: string; // Ex: "Grand Floridian Resort"
  difficulty: 'easy' | 'moderate' | 'hard';
  booking_window_days: number; // Généralement 60
  requires_reservation: boolean;
  cuisine_type?: string;
  price_range: '$' | '$$' | '$$$' | '$$$$';
}

// ============= NOTIFICATIONS =============

export interface DiningNotification {
  id: string;
  trip_id: string;
  user_id: string;
  type: 'dining_alert';
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  restaurant_name: string;
  meal_date: Timestamp; // Date du repas
  trigger_date: Timestamp; // 60 jours avant à 6:00 AM
  trigger_time: string; // "06:00"
  sent: boolean;
  created_at: Timestamp;
}

// ============= API RESPONSES =============

export interface DVCValidationResult {
  valid: boolean;
  message: string;
  points_required?: number;
  points_available?: number;
  booking_window_opens?: Timestamp;
}

// ============= FORM INPUTS =============

export interface CreateTripInput {
  name: string;
  start_date: Date;
  end_date: Date;
  use_dvc: boolean;
  dvc_contract_id?: string;
}

export interface CreateDayInput {
  trip_id: string;
  date: Date;
  park: Park | null;
  hotel: string;
}

export interface AddMealInput {
  day_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  restaurant_id: string;
  time: string;
  notes?: string;
}