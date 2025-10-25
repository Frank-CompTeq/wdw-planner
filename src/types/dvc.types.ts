// Types spécifiques au Disney Vacation Club

export interface DVCPointCalculation {
  totalRequired: number;
  availablePoints: number;
  pointsToExpire: number;
  currentYearPoints: number;
  borrowedPoints: number;
  canBook: boolean;
  message: string;
}

export interface DVCBookingWindow {
  type: '11_month' | '7_month';
  availableResorts: string[];
  bookingDate: Date;
  expirationDate: Date;
}

export interface DVCPointUsage {
  contractId: string;
  pointsUsed: number;
  bookingDate: Date;
  resort: string;
  roomType: string;
  season: string;
}

export interface DVCContractFormData {
  homeResort: string;
  annualPoints: number;
  useYear: string;
  bankedPoints: number;
  borrowedPoints: number;
}

export interface DVCPointHistory {
  date: Date;
  type: 'earned' | 'used' | 'banked' | 'borrowed' | 'expired';
  points: number;
  description: string;
}

export interface DVCResort {
  id: string;
  name: string;
  location: string;
  isHomeResort: boolean;
  pointsChart: DVCPointsChart;
}

export interface DVCPointsChart {
  [season: string]: {
    [roomType: string]: number;
  };
}

// Re-export from main types
export type { DVCContract, DVCBooking } from './index';
