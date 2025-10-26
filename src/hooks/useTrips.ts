import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createTrip, 
  getUserTrips, 
  getTrip, 
  updateTrip, 
  deleteTrip,
  createDay,
  updateDay,
  deleteDay,
  addMeal,
  removeMeal
} from '../services/tripService';
import { CreateTripInput, CreateDayInput, UpdateTripInput, UpdateDayInput, Trip } from '../types';

// ============= TRIPS =============

export const useTrips = (userId: string) => {
  return useQuery({
    queryKey: ['trips', userId],
    queryFn: () => getUserTrips(userId),
    enabled: !!userId
  });
};

export const useTrip = (tripId: string) => {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip(tripId),
    enabled: !!tripId
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: CreateTripInput }) =>
      createTrip(userId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips', variables.userId] });
    }
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, updates }: { tripId: string; updates: UpdateTripInput }) =>
      updateTrip(tripId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => deleteTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });
};

// ============= DAYS =============

export const useCreateDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDayInput) => createDay(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trip', variables.trip_id] });
    }
  });
};

export const useUpdateDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripId,
      dayId,
      updates
    }: {
      tripId: string;
      dayId: string;
      updates: UpdateDayInput
    }) => updateDay(tripId, dayId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    }
  });
};

export const useDeleteDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, dayId }: { tripId: string; dayId: string }) =>
      deleteDay(tripId, dayId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    }
  });
};

// ============= MEALS =============

export const useAddMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripId,
      dayId,
      mealType,
      restaurantId,
      restaurantName,
      time
    }: {
      tripId: string;
      dayId: string;
      mealType: 'breakfast' | 'lunch' | 'dinner';
      restaurantId: string;
      restaurantName: string;
      time: string;
    }) => addMeal(tripId, dayId, mealType, restaurantId, restaurantName, time),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    }
  });
};

export const useRemoveMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripId,
      dayId,
      mealType
    }: {
      tripId: string;
      dayId: string;
      mealType: 'breakfast' | 'lunch' | 'dinner';
    }) => removeMeal(tripId, dayId, mealType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    }
  });
};