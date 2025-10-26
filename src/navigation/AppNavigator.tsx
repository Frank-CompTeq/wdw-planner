import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';

// Screens
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TripsListScreen from '../screens/trips/TripsListScreen';
import TripDetailScreen from '../screens/trips/TripDetailScreen';
import CreateTripScreen from '../screens/trips/CreateTripScreen';
import EditDayScreen from '../screens/trips/EditDayScreen';
import EditTripScreen from '../screens/trips/EditTripScreen';
import DVCContractsScreen from '../screens/dvc/DVCContractsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  TripsList: undefined;
  TripDetail: { tripId: string };
  CreateTrip: undefined;
  EditTrip: { tripId: string };
  EditDay: { tripId: string; dayId?: string; date: string };
  DVCContracts: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1976d2' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      {!user ? (
        // Auth Stack
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen 
            name="TripsList" 
            component={TripsListScreen}
            options={{ title: 'My WDW Trips' }}
          />
          <Stack.Screen 
            name="TripDetail" 
            component={TripDetailScreen}
            options={{ title: 'Trip Details' }}
          />
          <Stack.Screen 
            name="CreateTrip" 
            component={CreateTripScreen}
            options={{ title: 'New Trip' }}
          />
          <Stack.Screen 
            name="EditTrip" 
            component={EditTripScreen}
            options={{ title: 'Edit Trip' }}
          />
          <Stack.Screen 
            name="EditDay" 
            component={EditDayScreen}
            options={{ title: 'Edit Day' }}
          />
          <Stack.Screen 
            name="DVCContracts" 
            component={DVCContractsScreen}
            options={{ title: 'DVC Contracts' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}