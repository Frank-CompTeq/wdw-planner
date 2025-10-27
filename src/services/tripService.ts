import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Trip,
  TripDay,
  TripMetadata,
  CreateTripInput,
  CreateDayInput,
  Meal,
  MealStatus,
  MealType
} from '../types';

type FirestoreMeal = {
  type: MealType;
  restaurant: string;
  restaurant_name?: string;
  restaurant_id?: string;
  time?: string;
  status?: MealStatus;
  notes?: string;
};

const toDate = (value: any): Date => {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  return new Date(value);
};

const deserializeMeal = (rawMeal: any, fallbackType?: MealType): Meal | null => {
  if (!rawMeal) return null;

  const type = (rawMeal.type ?? fallbackType) as MealType | undefined;
  if (!type) return null;

  return {
    type,
    restaurant: rawMeal.restaurant ?? rawMeal.restaurant_name ?? '',
    restaurantId: rawMeal.restaurantId ?? rawMeal.restaurant_id ?? undefined,
    time: rawMeal.time ?? undefined,
    status: (rawMeal.status ?? 'planned') as MealStatus,
    notes: rawMeal.notes ?? undefined
  };
};

const normalizeMeals = (rawMeals: any): Meal[] => {
  if (!rawMeals) return [];

  if (Array.isArray(rawMeals)) {
    return rawMeals
      .map(meal => deserializeMeal(meal, meal?.type))
      .filter((meal): meal is Meal => Boolean(meal));
  }

  if (typeof rawMeals === 'object') {
    return Object.entries(rawMeals)
      .map(([type, meal]) => deserializeMeal(meal, type as MealType))
      .filter((meal): meal is Meal => Boolean(meal));
  }

  return [];
};

const serializeMeal = (meal: Meal): FirestoreMeal => {
  const serialized: FirestoreMeal = {
    type: meal.type,
    restaurant: meal.restaurant,
    restaurant_name: meal.restaurant,
    status: meal.status ?? 'planned'
  };

  if (meal.restaurantId) {
    serialized.restaurant_id = meal.restaurantId;
  }

  if (meal.time) {
    serialized.time = meal.time;
  }

  if (meal.notes) {
    serialized.notes = meal.notes;
  }

  return serialized;
};

const serializeMeals = (meals?: Meal[]): FirestoreMeal[] => {
  if (!meals || meals.length === 0) {
    return [];
  }

  return meals.map(serializeMeal);
};

const deserializeTripDay = (tripId: string, dayDoc: any): TripDay => {
  const dayData = dayDoc.data();

  return {
    id: dayDoc.id,
    trip_id: tripId,
    date: toDate(dayData.date),
    park: dayData.park ?? null,
    hotel: dayData.hotel ?? null,
    meals: normalizeMeals(dayData.meals),
    notes: typeof dayData.notes === 'string' ? dayData.notes : undefined
  };
};

const deserializeTripMetadata = (metadata: any): TripMetadata => ({
  name: metadata.name,
  start_date: toDate(metadata.start_date),
  end_date: toDate(metadata.end_date),
  owner_id: metadata.owner_id,
  shared_with: Array.isArray(metadata.shared_with) ? metadata.shared_with : [],
  created_at: toDate(metadata.created_at),
  updated_at: toDate(metadata.updated_at)
});
  
  // ============= TRIPS =============
  
export const createTrip = async (userId: string, input: CreateTripInput): Promise<string> => {
  const metadata = {
    name: input.name,
    start_date: Timestamp.fromDate(input.start_date),
    end_date: Timestamp.fromDate(input.end_date),
    owner_id: userId,
    shared_with: [],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  };

  const tripRef = await addDoc(collection(db, 'trips'), {
    metadata,
    ...(input.use_dvc && input.dvc_contract_id && {
      dvc_booking: {
        contract_used: input.dvc_contract_id,
        points_used: 0,
        booking_window: '11_month',
        reservation_date: Timestamp.now()
      }
    })
  });

  return tripRef.id;
};

export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  const tripsQuery = query(
    collection(db, 'trips'),
    where('metadata.owner_id', '==', userId)
  );

  const snapshot = await getDocs(tripsQuery);

  const trips: Trip[] = await Promise.all(
    snapshot.docs.map(async (tripDoc) => {
      const tripData = tripDoc.data();

      const daysSnapshot = await getDocs(
        collection(db, 'trips', tripDoc.id, 'days')
      );

      const days: TripDay[] = daysSnapshot.docs
        .map((dayDoc) => deserializeTripDay(tripDoc.id, dayDoc))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      return {
        id: tripDoc.id,
        metadata: deserializeTripMetadata(tripData.metadata),
        dvc_booking: tripData.dvc_booking
          ? {
              ...tripData.dvc_booking,
              reservation_date: toDate(tripData.dvc_booking.reservation_date)
            }
          : undefined,
        days
      };
    })
  );

  return trips.sort((a, b) =>
    b.metadata.start_date.getTime() - a.metadata.start_date.getTime()
  );
};

export const getTrip = async (tripId: string): Promise<Trip | null> => {
  const tripDoc = await getDoc(doc(db, 'trips', tripId));

  if (!tripDoc.exists()) return null;

  const tripData = tripDoc.data();

  const daysSnapshot = await getDocs(
    collection(db, 'trips', tripId, 'days')
  );

  const days: TripDay[] = daysSnapshot.docs
    .map((dayDoc) => deserializeTripDay(tripId, dayDoc))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    id: tripDoc.id,
    metadata: deserializeTripMetadata(tripData.metadata),
    dvc_booking: tripData.dvc_booking
      ? {
          ...tripData.dvc_booking,
          reservation_date: toDate(tripData.dvc_booking.reservation_date)
        }
      : undefined,
    days
  };
};

export const updateTrip = async (tripId: string, updates: any): Promise<void> => {
  const updateData: any = {
    'metadata.updated_at': Timestamp.now()
  };

  if (updates.name) {
    updateData['metadata.name'] = updates.name;
  }

  if (updates.start_date) {
    updateData['metadata.start_date'] = Timestamp.fromDate(updates.start_date);
  }

  if (updates.end_date) {
    updateData['metadata.end_date'] = Timestamp.fromDate(updates.end_date);
  }

  if (updates.use_dvc !== undefined) {
    if (updates.use_dvc && updates.dvc_contract_id) {
      updateData['dvc_booking'] = {
        contract_used: updates.dvc_contract_id,
        points_used: 0,
        booking_window: '11_month',
        reservation_date: Timestamp.now()
      };
    } else {
      updateData['dvc_booking'] = null;
    }
  }

  await updateDoc(doc(db, 'trips', tripId), updateData);
};
  
export const deleteTrip = async (tripId: string): Promise<void> => {
  const daysSnapshot = await getDocs(
    collection(db, 'trips', tripId, 'days')
  );

  await Promise.all(
    daysSnapshot.docs.map(dayDoc => deleteDoc(dayDoc.ref))
  );

  await deleteDoc(doc(db, 'trips', tripId));
};

export const shareTrip = async (tripId: string, userEmail: string): Promise<void> => {
  const tripRef = doc(db, 'trips', tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) throw new Error('Trip not found');

  const currentShared = tripDoc.data().metadata.shared_with || [];

  await updateDoc(tripRef, {
    'metadata.shared_with': [...currentShared, userEmail],
    'metadata.updated_at': Timestamp.now()
  });
};

// ============= DAYS =============
  
export const createDay = async (input: CreateDayInput): Promise<string> => {
  const dayData = {
    trip_id: input.trip_id,
    date: Timestamp.fromDate(input.date),
    park: input.park ?? null,
    hotel: input.hotel ?? null,
    meals: serializeMeals(input.meals),
    notes: input.notes ?? ''
  };

  const dayRef = await addDoc(
    collection(db, 'trips', input.trip_id, 'days'),
    dayData
  );

  return dayRef.id;
};

export const updateDay = async (
  tripId: string,
  dayId: string,
  updates: Partial<Omit<TripDay, 'id' | 'trip_id'>>
): Promise<void> => {
  const updateData: any = {};

  if (updates.date) {
    updateData.date = Timestamp.fromDate(updates.date);
  }

  if (updates.park !== undefined) {
    updateData.park = updates.park ?? null;
  }

  if (updates.hotel !== undefined) {
    updateData.hotel = updates.hotel ?? null;
  }

  if (updates.meals !== undefined) {
    updateData.meals = serializeMeals(updates.meals);
  }

  if (updates.notes !== undefined) {
    updateData.notes = updates.notes ?? '';
  }

  await updateDoc(
    doc(db, 'trips', tripId, 'days', dayId),
    updateData
  );
};

export const deleteDay = async (tripId: string, dayId: string): Promise<void> => {
  await deleteDoc(doc(db, 'trips', tripId, 'days', dayId));
};

// ============= MEALS =============

export const addMeal = async (
  tripId: string,
  dayId: string,
  mealType: MealType,
  restaurantId: string,
  restaurantName: string,
  time: string
): Promise<void> => {
  const dayRef = doc(db, 'trips', tripId, 'days', dayId);
  const daySnapshot = await getDoc(dayRef);

  if (!daySnapshot.exists()) {
    throw new Error('Day not found');
  }

  const currentMeals = normalizeMeals(daySnapshot.data().meals);
  const filteredMeals = currentMeals.filter((meal) => meal.type !== mealType);

  const updatedMeals: Meal[] = [
    ...filteredMeals,
    {
      type: mealType,
      restaurant: restaurantName,
      restaurantId,
      time,
      status: 'planned'
    }
  ];

  await updateDoc(dayRef, {
    meals: serializeMeals(updatedMeals)
  });
};

export const removeMeal = async (
  tripId: string,
  dayId: string,
  mealType: MealType
): Promise<void> => {
  const dayRef = doc(db, 'trips', tripId, 'days', dayId);
  const daySnapshot = await getDoc(dayRef);

  if (!daySnapshot.exists()) {
    throw new Error('Day not found');
  }

  const currentMeals = normalizeMeals(daySnapshot.data().meals);
  const updatedMeals = currentMeals.filter((meal) => meal.type !== mealType);

  await updateDoc(dayRef, {
    meals: serializeMeals(updatedMeals)
  });
};