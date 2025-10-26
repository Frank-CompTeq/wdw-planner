import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, Surface, Chip, Button } from 'react-native-paper';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { useTrips } from '../../hooks/useTrips';
import TripCard from '../../components/TripCard';
import { Trip } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

interface TripsListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TripsList'>;
}

export default function TripsListScreen({ navigation }: TripsListScreenProps) {
  const [user] = useAuthState(auth);
  const { data: trips, isLoading, error, refetch } = useTrips(user?.uid || '');

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripDetail', { tripId: trip.id });
  };

  const handleCreateTrip = () => {
    navigation.navigate('CreateTrip');
  };

  const handleDVCContracts = () => {
    navigation.navigate('DVCContracts');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading your trips...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading trips: {error.message}</Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          My WDW Trips
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Plan your magical Disney World adventures
        </Text>
        
        <View style={styles.statsContainer}>
          <Chip icon="calendar" style={styles.statChip}>
            {trips?.length || 0} trips
          </Chip>
          <Chip icon="diamond" style={styles.statChip}>
            DVC Ready
          </Chip>
        </View>
      </Surface>

      {trips && trips.length > 0 ? (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={() => handleTripPress(item)}
              onEdit={() => handleTripPress(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No trips yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Create your first Disney World adventure!
          </Text>
          <Button
            mode="contained"
            onPress={handleCreateTrip}
            style={styles.createButton}
            icon="plus"
          >
            Create Your First Trip
          </Button>
        </View>
      )}

      <View style={styles.quickActions}>
        <Button
          mode="outlined"
          onPress={handleDVCContracts}
          style={styles.actionButton}
          icon="diamond"
        >
          DVC Contracts
        </Button>
        <Button
          mode="outlined"
          onPress={handleSettings}
          style={styles.actionButton}
          icon="cog"
        >
          Settings
        </Button>
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateTrip}
        label="New Trip"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  title: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    backgroundColor: '#E3F2FD',
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#999',
  },
  createButton: {
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
});
