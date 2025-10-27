import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Chip, Card } from 'react-native-paper';
import { Meal, MealType } from '../types';

interface MealPickerProps {
  meals: Meal[];
  onMealChange: (mealType: MealType, restaurant: string) => void;
}

const MEAL_TYPES: Array<{ id: MealType; name: string; icon: string; time: string }> = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅', time: '07:00-10:00' },
  { id: 'lunch', name: 'Lunch', icon: '☀️', time: '11:00-14:00' },
  { id: 'dinner', name: 'Dinner', icon: '🌙', time: '17:00-21:00' },
];

const SAMPLE_RESTAURANTS = [
  { id: 'be-our-guest', name: 'Be Our Guest Restaurant', park: 'Magic Kingdom', type: 'Table Service' },
  { id: 'cinderella-royal', name: 'Cinderella\'s Royal Table', park: 'Magic Kingdom', type: 'Table Service' },
  { id: 'space-220', name: 'Space 220', park: 'EPCOT', type: 'Table Service' },
  { id: 'le-cellier', name: 'Le Cellier Steakhouse', park: 'EPCOT', type: 'Table Service' },
  { id: 'hollywood-brown', name: 'Hollywood Brown Derby', park: 'Hollywood Studios', type: 'Table Service' },
  { id: 'yak-yeti', name: 'Yak & Yeti Restaurant', park: 'Animal Kingdom', type: 'Table Service' },
  { id: 'ohana', name: '\'Ohana', park: 'Polynesian Resort', type: 'Table Service' },
  { id: 'california-grill', name: 'California Grill', park: 'Contemporary Resort', type: 'Table Service' },
];

export default function MealPicker({ meals, onMealChange }: MealPickerProps) {
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(null);

  const getMealForType = (mealType: MealType): Meal | undefined => {
    return meals.find(meal => meal.type === mealType);
  };

  const handleRestaurantSelect = (mealType: MealType, restaurant: string) => {
    onMealChange(mealType, restaurant);
    setExpandedMeal(null);
  };

  return (
    <View style={styles.container}>
      {MEAL_TYPES.map(mealType => {
        const meal = getMealForType(mealType.id);
        const isExpanded = expandedMeal === mealType.id;

        return (
          <Card key={mealType.id} style={styles.mealCard}>
            <Card.Content>
              <View style={styles.mealHeader}>
                <View style={styles.mealInfo}>
                  <Text variant="titleSmall" style={styles.mealTitle}>
                    {mealType.icon} {mealType.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.mealTime}>
                    {mealType.time}
                  </Text>
                </View>
                
                {meal ? (
                  <Chip 
                    icon="restaurant" 
                    style={styles.restaurantChip}
                    onPress={() => setExpandedMeal(isExpanded ? null : mealType.id)}
                  >
                    {meal.restaurant}
                  </Chip>
                ) : (
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => setExpandedMeal(isExpanded ? null : mealType.id)}
                    style={styles.addButton}
                  >
                    Add Restaurant
                  </Button>
                )}
              </View>

              {isExpanded && (
                <View style={styles.restaurantList}>
                  <Text variant="bodySmall" style={styles.restaurantListTitle}>
                    Select Restaurant:
                  </Text>
                  <View style={styles.restaurantGrid}>
                    {SAMPLE_RESTAURANTS.map(restaurant => (
                      <Chip
                        key={restaurant.id}
                        selected={meal?.restaurant === restaurant.name}
                        onPress={() => handleRestaurantSelect(mealType.id, restaurant.name)}
                        style={styles.restaurantOption}
                        icon="restaurant"
                      >
                        {restaurant.name}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  mealCard: {
    marginBottom: 8,
    elevation: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  mealTime: {
    color: '#666',
    marginTop: 2,
  },
  restaurantChip: {
    backgroundColor: '#E3F2FD',
  },
  addButton: {
    borderColor: '#1976d2',
  },
  restaurantList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  restaurantListTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  restaurantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  restaurantOption: {
    marginBottom: 6,
  },
});
