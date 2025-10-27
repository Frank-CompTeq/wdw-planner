// Type definitions for Cloud Functions
// These mirror the client-side types but are designed for Firestore data

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type MealStatus = 'planned' | 'reserved' | 'confirmed' | 'cancelled';

export interface Meal {
  type: MealType;
  restaurant: string;
  restaurant_name?: string;
  restaurant_id?: string;
  time?: string;
  status?: MealStatus;
  notes?: string;
}

export interface TripDay {
  date: FirebaseFirestore.Timestamp;
  park: string | null;
  hotel: string | null;
  meals?: Meal[] | Record<MealType, Meal | null | undefined>;
  notes?: string;
}

export interface TripMetadata {
  name: string;
  start_date: FirebaseFirestore.Timestamp;
  end_date: FirebaseFirestore.Timestamp;
  owner_id: string;
  shared_with: string[];
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
}

export interface DVCBooking {
  contract_used: string;
  points_used: number;
  booking_window: '11_month' | '7_month';
  reservation_date: FirebaseFirestore.Timestamp;
}

export interface Trip {
  metadata: TripMetadata;
  dvc_booking?: DVCBooking;
}

export interface DVCContract {
  contract_id: string;
  home_resort: string;
  annual_points: number;
  use_year: string;
  banked_points: number;
  borrowed_points: number;
  current_points: number;
}

export interface ValidateDVCBookingRequest {
  contractId: string;
  pointsRequired: number;
  bookingDate: string;
  resort: string;
}

export interface ValidateDVCBookingResponse {
  success: boolean;
  message: string;
  pointsAvailable?: number;
}
