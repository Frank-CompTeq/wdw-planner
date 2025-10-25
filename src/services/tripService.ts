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
    orderBy,
    Timestamp 
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  import { Trip, TripMetadata, TripDay, CreateTripInput, CreateDayInput } from '../types';
  
  // ============= TRIPS =============
  
  export const createTrip = async (userId: string, input: CreateTripInput): Promise<string> => {
    const metadata: TripMetadata = {
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
          points_used: 0, // À calculer
          booking_window: '11_month', // Par défaut
          reservation_date: Timestamp.now()
        }
      })
    });
  
    return tripRef.id;
  };
  
export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  // Requête simplifiée sans orderBy pour éviter le besoin d'index
  const tripsQuery = query(
    collection(db, 'trips'),
    where('metadata.owner_id', '==', userId)
  );
  
    const snapshot = await getDocs(tripsQuery);
    
    const trips: Trip[] = await Promise.all(
      snapshot.docs.map(async (tripDoc) => {
        const tripData = tripDoc.data();
        
        // Récupère les jours du voyage
        const daysSnapshot = await getDocs(
          collection(db, 'trips', tripDoc.id, 'days')
        );
        
        const days: TripDay[] = daysSnapshot.docs.map(dayDoc => ({
          id: dayDoc.id,
          trip_id: tripDoc.id,
          ...dayDoc.data()
        } as TripDay));
  
        return {
          id: tripDoc.id,
          metadata: tripData.metadata as TripMetadata,
          dvc_booking: tripData.dvc_booking,
          days: days.sort((a, b) => a.date.seconds - b.date.seconds)
        };
      })
    );
  
    // Tri côté client par date de début (plus récent en premier)
    return trips.sort((a, b) => {
      const dateA = a.metadata.start_date instanceof Date ? a.metadata.start_date : a.metadata.start_date.toDate();
      const dateB = b.metadata.start_date instanceof Date ? b.metadata.start_date : b.metadata.start_date.toDate();
      return dateB.getTime() - dateA.getTime();
    });
  };
  
  export const getTrip = async (tripId: string): Promise<Trip | null> => {
    const tripDoc = await getDoc(doc(db, 'trips', tripId));
    
    if (!tripDoc.exists()) return null;
  
    const tripData = tripDoc.data();
    
    // Récupère les jours
    const daysSnapshot = await getDocs(
      collection(db, 'trips', tripId, 'days')
    );
    
    const days: TripDay[] = daysSnapshot.docs.map(dayDoc => ({
      id: dayDoc.id,
      trip_id: tripId,
      ...dayDoc.data()
    } as TripDay));
  
    return {
      id: tripDoc.id,
      metadata: tripData.metadata as TripMetadata,
      dvc_booking: tripData.dvc_booking,
      days: days.sort((a, b) => a.date.seconds - b.date.seconds)
    };
  };
  
  export const updateTrip = async (tripId: string, updates: Partial<TripMetadata>): Promise<void> => {
    await updateDoc(doc(db, 'trips', tripId), {
      'metadata': {
        ...updates,
        updated_at: Timestamp.now()
      }
    });
  };
  
  export const deleteTrip = async (tripId: string): Promise<void> => {
    // Supprime d'abord tous les jours
    const daysSnapshot = await getDocs(
      collection(db, 'trips', tripId, 'days')
    );
    
    await Promise.all(
      daysSnapshot.docs.map(dayDoc => deleteDoc(dayDoc.ref))
    );
  
    // Puis supprime le voyage
    await deleteDoc(doc(db, 'trips', tripId));
  };
  
  export const shareTrip = async (tripId: string, userEmail: string): Promise<void> => {
    // TODO: Récupérer userId depuis email
    // Pour l'instant, placeholder
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
    const dayData: Omit<TripDay, 'id'> = {
      trip_id: input.trip_id,
      date: Timestamp.fromDate(input.date),
      park: input.park,
      hotel: input.hotel,
      meals: {}
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
    await updateDoc(
      doc(db, 'trips', tripId, 'days', dayId),
      updates
    );
  };
  
  export const deleteDay = async (tripId: string, dayId: string): Promise<void> => {
    await deleteDoc(doc(db, 'trips', tripId, 'days', dayId));
  };
  
  // ============= MEALS =============
  
  export const addMeal = async (
    tripId: string,
    dayId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    restaurantId: string,
    restaurantName: string,
    time: string
  ): Promise<void> => {
    await updateDoc(doc(db, 'trips', tripId, 'days', dayId), {
      [`meals.${mealType}`]: {
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        time,
        status: 'planned'
      }
    });
  };
  
  export const removeMeal = async (
    tripId: string,
    dayId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner'
  ): Promise<void> => {
    await updateDoc(doc(db, 'trips', tripId, 'days', dayId), {
      [`meals.${mealType}`]: null
    });
  };