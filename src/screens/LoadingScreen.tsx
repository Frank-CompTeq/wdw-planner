import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Continuous rotation animation for the icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Icon with rotation */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <Text style={styles.icon}>🏰</Text>
        </Animated.View>

        {/* App Title */}
        <Text variant="headlineLarge" style={styles.title}>
          WDW Planner
        </Text>

        <Text variant="bodyMedium" style={styles.subtitle}>
          Your magical Disney World adventure awaits
        </Text>

        {/* Loading Indicator */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color="#1976d2"
            style={styles.loader}
          />
          <Text variant="bodySmall" style={styles.loadingText}>
            Loading your magic...
          </Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Plan your perfect Disney vacation
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 300,
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#1976d2',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    textAlign: 'center',
  },
});
