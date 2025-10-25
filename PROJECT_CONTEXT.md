# WDW Planner - Project Context

## Vue d'ensemble
Application mobile/desktop pour planifier et gérer les voyages à Walt Disney World avec gestion DVC (Disney Vacation Club).

**Propriétaire**: François, CompTeq Digital  
**Stack**: React Native (Expo) + Firebase  
**Objectif**: Usage familial → Commercialisation éventuelle en Floride

## Fonctionnalités V1 (MVP)

### Core Features
- ✅ Gestion multi-voyages (dates, parcs visités, hôtels par jour)
- ✅ Planification repas (breakfast/lunch/dinner avec choix restaurants)
- ✅ Notifications/rappels: 60 jours avant date voyage à 6:00 AM pour réservations restaurants
- ✅ Gestion points DVC (solde par contrat + règles de réservation)
- ✅ Partage read-only par voyage OU accès famille via compte principal
- ✅ Migration 3 voyages existants depuis Notion

### Features futures (post-MVP)
- Calcul automatique points DVC requis selon hôtel/saison
- Alertes si booking impossible selon points disponibles
- Météo intégrée
- Wait times attractions temps réel
- Gestion budget/dépenses
- Itinéraires optimisés

## Architecture technique

### Stack
- **Frontend**: React Native + Expo (iOS/Android/Web)
- **Backend**: Firebase (Firestore, Auth, Cloud Functions, Cloud Messaging)
- **State Management**: React Query + Zustand
- **UI Components**: React Native Paper
- **Calendrier**: react-native-calendars
- **Notifications**: Firebase Cloud Messaging + Cloud Scheduler

### Structure Firestore
```
users/
  {userId}/
    profile: {name, email, family_role}
    dvc_contracts: [
      {
        contract_id: string,
        home_resort: string,
        annual_points: number,
        use_year: string (ex: "Feb"),
        banked_points: number,
        borrowed_points: number
      }
    ]
    
trips/
  {tripId}/
    metadata: {
      name: string,
      start_date: timestamp,
      end_date: timestamp,
      owner_id: string,
      shared_with: string[], // user IDs avec accès read-only
      created_at: timestamp
    }
    dvc_booking: {
      contract_used: string, // contract_id
      points_used: number,
      booking_window: "11_month" | "7_month",
      reservation_date: timestamp
    }
    
    days/
      {dayId}/
        date: timestamp,
        park: "Magic Kingdom" | "EPCOT" | "Hollywood Studios" | "Animal Kingdom" | null,
        hotel: string,
        
        meals/
          breakfast: {
            restaurant_id: string,
            restaurant_name: string,
            time: string,
            reservation_date: timestamp,
            status: "planned" | "reserved" | "confirmed"
          }
          lunch: {...}
          dinner: {...}

restaurants/
  {restaurantId}/
    name: string,
    park_location: string,
    difficulty: "easy" | "moderate" | "hard",
    booking_window_days: 60,
    requires_reservation: boolean

notifications/
  {notifId}/
    trip_id: string,
    user_id: string,
    type: "dining_alert",
    meal_type: "breakfast" | "lunch" | "dinner",
    restaurant_name: string,
    trigger_date: timestamp, // 60 jours avant - 6:00 AM
    trigger_time: "06:00",
    sent: boolean,
    created_at: timestamp
```

### Cloud Functions

#### 1. scheduleDiningNotifications (Trigger: onCreate trip)
```typescript
// Quand un voyage est créé/modifié avec des repas
// Calcule 60 jours avant chaque date de repas
// Crée documents dans /notifications avec trigger_date
```

#### 2. sendDiningAlerts (Cron: daily 5:55 AM EST)
```typescript
// Scan toutes les notifications non-envoyées où trigger_date = aujourd'hui
// Envoie push notification via FCM à 6:00 AM
// Marque notification.sent = true
```

#### 3. calculateDVCPoints (Trigger: onUpdate booking)
```typescript
// Valide points disponibles selon contrat sélectionné
// Applique règles:
//   - 11 mois avant: home resort uniquement
//   - 7 mois avant: tous les resorts
//   - Banking: points non-utilisés année précédente
//   - Borrowing: emprunter année suivante
// Retourne erreur si insuffisant
```

#### 4. validateDVCBooking (Callable function)
```typescript
// Avant création trip, vérifie:
//   - Points suffisants
//   - Fenêtre de réservation respectée
//   - Contrat valide
// Retourne: { valid: boolean, message: string, points_required: number }
```

## Règles DVC (Disney Vacation Club)

### Fenêtres de réservation
- **11 mois avant**: Réservation au home resort du contrat
- **7 mois avant**: Réservation dans tous les resorts DVC
- **Points requis**: Varient selon resort/saison/type chambre

### Gestion points
- **Annual points**: Reçus chaque année selon use year
- **Banking**: Points non-utilisés transférés année suivante (expire après)
- **Borrowing**: Emprunter points année suivante (doit être remboursé)
- **Priorité utilisation**: 1) Points à expirer, 2) Points current year, 3) Points borrowed

## Plan de développement - Phase 1 (4-6 semaines)

### Semaine 1-2: Setup + Auth + Base
- [x] Init Expo project avec TypeScript
- [x] Config Firebase (Auth, Firestore, Functions)
- [ ] Setup React Navigation
- [ ] Écrans: Login/Register
- [ ] Écran Home (liste voyages)
- [ ] Structure types TypeScript
- [ ] Firestore Security Rules basiques

### Semaine 3-4: Core Features
- [ ] CRUD Trips (create/read/update/delete)
- [ ] Calendrier visuel par voyage (react-native-calendars)
- [ ] Gestion jours: sélection parc + hôtel
- [ ] Liste restaurants Disney (seed data Firestore)
- [ ] Assignation repas par jour (breakfast/lunch/dinner)
- [ ] Écran détail voyage avec timeline

### Semaine 5-6: DVC + Notifications
- [ ] Module gestion contrats DVC (CRUD)
- [ ] Écran solde points (visual progress bars)
- [ ] Logique validation booking selon règles 11/7 mois
- [ ] Cloud Function: scheduleDiningNotifications
- [ ] Cloud Function: sendDiningAlerts (cron)
- [ ] Setup Firebase Cloud Messaging (push notifications)
- [ ] Testing notifications locales + remote
- [ ] Partage voyage (génération lien read-only)

### Semaine 7: Migration + Polish
- [ ] Script migration 3 voyages Notion → Firestore
- [ ] Testing end-to-end avec données réelles
- [ ] UI/UX polish (loading states, error handling)
- [ ] Documentation code

## Structure projet
```
wdw-planner/
├── src/
│   ├── config/
│   │   └── firebase.ts              # Firebase initialization
│   ├── types/
│   │   ├── index.ts                 # Types globaux
│   │   ├── trip.types.ts
│   │   ├── dvc.types.ts
│   │   └── restaurant.types.ts
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── trips/
│   │   │   ├── TripsListScreen.tsx
│   │   │   ├── TripDetailScreen.tsx
│   │   │   ├── CreateTripScreen.tsx
│   │   │   └── EditDayScreen.tsx
│   │   ├── dvc/
│   │   │   ├── DVCContractsScreen.tsx
│   │   │   └── DVCPointsScreen.tsx
│   │   └── settings/
│   │       └── SettingsScreen.tsx
│   ├── components/
│   │   ├── TripCard.tsx
│   │   ├── DayCalendar.tsx
│   │   ├── MealPicker.tsx
│   │   ├── RestaurantCard.tsx
│   │   └── DVCPointsBar.tsx
│   ├── hooks/
│   │   ├── useTrips.ts
│   │   ├── useDVC.ts
│   │   └── useNotifications.ts
│   ├── services/
│   │   ├── tripService.ts           # CRUD trips + days
│   │   ├── dvcService.ts            # Logique DVC
│   │   ├── restaurantService.ts     # Get restaurants
│   │   └── notificationService.ts   # Setup FCM
│   ├── utils/
│   │   ├── dateHelpers.ts
│   │   └── dvcCalculations.ts
│   └── navigation/
│       └── AppNavigator.tsx
├── functions/                        # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts
│   │   ├── scheduleDiningNotifications.ts
│   │   ├── sendDiningAlerts.ts
│   │   └── dvcValidation.ts
│   └── package.json
├── firestore.rules                   # Security rules
├── app.json                          # Expo config
└── package.json
```

## Commandes essentielles
```bash
# Installation
npx create-expo-app wdw-planner --template blank-typescript
cd wdw-planner

# Dépendances
npx expo install firebase
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-notifications expo-device
npx expo install react-native-paper react-native-vector-icons
npx expo install @tanstack/react-query zustand
npx expo install react-native-calendars

# Dev
npm start                  # Démarre Expo
npm run android           # Build Android
npm run ios               # Build iOS

# Firebase Functions
cd functions
npm install
npm run deploy            # Déploie functions
```

## Firebase Config

Créer `src/config/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
```

## Notes importantes

- **Time zone**: Toutes les notifications doivent être en EST (Disney World time)
- **Dining reservations**: Ouvrent exactement 60 jours avant à 6:00 AM EST
- **DVC booking windows**: Calculés depuis check-in date, pas création trip
- **Partage read-only**: Pas de modification possible pour invités
- **Migration Notion**: 3 voyages existants à importer en premier test

## Ressources

- [Expo Docs](https://docs.expo.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Disney Dining Reservations Info](https://disneyworld.disney.go.com/dining/)
- [DVC Info](https://disneyvacationclub.disney.go.com/)

## Contact

François - CompTeq Digital  
Projet: Usage personnel/familial → Commercialisation future