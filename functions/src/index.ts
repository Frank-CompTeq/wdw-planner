import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';

admin.initializeApp();

const db = admin.firestore();

// ============= DINING NOTIFICATIONS =============

export const scheduleDiningNotifications = functions.firestore
  .document('trips/{tripId}')
  .onCreate(async (snap: QueryDocumentSnapshot, context: functions.EventContext) => {
    const trip = snap.data();
    const tripId = context.params.tripId as string;
    
    console.log(`Scheduling dining notifications for trip: ${tripId}`);
    
    // Get all days with meals
    const daysSnapshot = await db.collection('trips').doc(tripId).collection('days').get();
    
    for (const dayDoc of daysSnapshot.docs) {
      const day = dayDoc.data();
      const dayId = dayDoc.id;
      
      // Check each meal type
      const mealTypes = ['breakfast', 'lunch', 'dinner'] as const;
      
      for (const mealType of mealTypes) {
        const meal = day.meals?.[mealType];
        if (meal && meal.restaurant_id) {
          // Calculate trigger date (60 days before meal date at 6:00 AM EST)
          const mealDate = day.date.toDate();
          const triggerDate = new Date(mealDate);
          triggerDate.setDate(triggerDate.getDate() - 60);
          triggerDate.setHours(6, 0, 0, 0); // 6:00 AM EST
          
          // Create notification
          await db.collection('notifications').add({
            trip_id: tripId,
            user_id: trip.metadata.owner_id,
            type: 'dining_alert',
            meal_type: mealType,
            restaurant_name: meal.restaurant_name,
            trigger_date: admin.firestore.Timestamp.fromDate(triggerDate),
            trigger_time: '06:00',
            sent: false,
            created_at: admin.firestore.Timestamp.now()
          });
          
          console.log(`Scheduled notification for ${meal.restaurant_name} on ${triggerDate.toISOString()}`);
        }
      }
    }
    
    return { success: true, notificationsScheduled: true };
  });

export const sendDiningAlerts = functions.pubsub
  .schedule('55 5 * * *') // Daily at 5:55 AM EST
  .timeZone('America/New_York')
  .onRun(async (context: functions.EventContext) => {
    console.log('Running daily dining alerts check...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all unsent notifications for today
    const notificationsSnapshot = await db.collection('notifications')
      .where('sent', '==', false)
      .where('trigger_date', '<=', admin.firestore.Timestamp.fromDate(today))
      .get();
    
    console.log(`Found ${notificationsSnapshot.size} notifications to send`);
    
    for (const notificationDoc of notificationsSnapshot.docs) {
      const notification = notificationDoc.data();
      
      // TODO: Send push notification via FCM
      console.log(`Sending notification for ${notification.restaurant_name}`);
      
      // Mark as sent
      await notificationDoc.ref.update({
        sent: true,
        sent_at: admin.firestore.Timestamp.now()
      });
    }
    
    return { success: true, notificationsSent: notificationsSnapshot.size };
  });

// ============= DVC VALIDATION =============

export const calculateDVCPoints = functions.firestore
  .document('trips/{tripId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext) => {
    const before = change.before.data();
    const after = change.after.data();
    const tripId = context.params.tripId as string;
    
    // Check if DVC booking was added or modified
    if (!before.dvc_booking && after.dvc_booking) {
      console.log(`Calculating DVC points for trip: ${tripId}`);
      
      const contractId = after.dvc_booking.contract_used;
      const pointsRequired = after.dvc_booking.points_used;
      
      // Get user's DVC contracts
      const userDoc = await db.collection('users').doc(after.metadata.owner_id).get();
      const userData = userDoc.data();
      const contracts = userData?.dvc_contracts || [];
      
      const contract = contracts.find((c: any) => c.contract_id === contractId);
      if (!contract) {
        throw new functions.https.HttpsError('not-found', 'DVC contract not found');
      }
      
      // Calculate available points
      const totalPoints = contract.annual_points + contract.banked_points + contract.borrowed_points;
      const availablePoints = contract.current_points;
      
      if (pointsRequired > availablePoints) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Insufficient points. Required: ${pointsRequired}, Available: ${availablePoints}`
        );
      }
      
      // Update contract with used points
      const updatedContracts = contracts.map((c: any) => {
        if (c.contract_id === contractId) {
          return {
            ...c,
            current_points: c.current_points - pointsRequired
          };
        }
        return c;
      });
      
      await db.collection('users').doc(after.metadata.owner_id).update({
        dvc_contracts: updatedContracts
      });
      
      console.log(`Updated DVC contract ${contractId} with ${pointsRequired} points used`);
    }
    
    return { success: true };
  });

export const validateDVCBooking = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { contractId, pointsRequired, bookingDate, resort } = data;
  const userId = context.auth.uid;
  
  // Get user's DVC contracts
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const contracts = userData?.dvc_contracts || [];
  
  const contract = contracts.find((c: any) => c.contract_id === contractId);
  if (!contract) {
    return {
      valid: false,
      message: 'DVC contract not found',
      pointsRequired: 0
    };
  }
  
  // Check booking window
  const bookingDateObj = new Date(bookingDate);
  const now = new Date();
  const monthsDiff = (bookingDateObj.getFullYear() - now.getFullYear()) * 12 + 
                    (bookingDateObj.getMonth() - now.getMonth());
  
  let bookingWindow: '11_month' | '7_month' = '7_month';
  if (monthsDiff >= 11) {
    bookingWindow = '11_month';
  } else if (monthsDiff >= 7) {
    bookingWindow = '7_month';
  } else {
    return {
      valid: false,
      message: 'Booking window not open yet',
      pointsRequired: pointsRequired
    };
  }
  
  // Check if resort is available for booking window
  if (bookingWindow === '11_month' && contract.home_resort !== resort) {
    return {
      valid: false,
      message: 'Can only book home resort 11 months in advance',
      pointsRequired: pointsRequired
    };
  }
  
  // Check available points
  const availablePoints = contract.current_points;
  if (pointsRequired > availablePoints) {
    return {
      valid: false,
      message: `Insufficient points. Required: ${pointsRequired}, Available: ${availablePoints}`,
      pointsRequired: pointsRequired
    };
  }
  
  return {
    valid: true,
    message: 'Booking is valid',
    pointsRequired: pointsRequired,
    bookingWindow: bookingWindow
  };
});
