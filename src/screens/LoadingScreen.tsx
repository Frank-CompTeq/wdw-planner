import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, useColorScheme } from 'react-native';
import { ActivityIndicator, Text, ProgressBar } from 'react-native-paper';

const LOADING_MESSAGES = [
  'Preparing the magic...',
  'Opening the castle gates...',
  'Summoning your Disney dreams...',
  'Loading pixie dust...',
  'Consulting the magic mirror...',
  'Gathering your adventures...',
  'Setting up your magical journey...',
  'Waking up Mickey...',
  'Polishing the magic wand...',
  'Checking the fairy godmother\'s schedule...',
];

export default function LoadingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [loadingMessage, setLoadingMessage] = useState(
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  );
  const [progress, setProgress] = useState(0);

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

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // Update progress value for the progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.95) return 0.95; // Cap at 95% until real loading completes
        return prev + 0.05;
      });
    }, 100);

    // Change loading message every 2 seconds
    const messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
      setLoadingMessage(LOADING_MESSAGES[randomIndex]);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [fadeAnim, scaleAnim, rotateAnim, progressAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Dynamic colors based on theme
  const colors = {
    background: isDark ? '#1a1a2e' : '#E3F2FD',
    primary: isDark ? '#64B5F6' : '#1976d2',
    text: isDark ? '#ffffff' : '#666',
    footer: isDark ? '#aaa' : '#999',
    progressBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text variant="headlineLarge" style={[styles.title, { color: colors.primary }]}>
          WDW Planner
        </Text>

        <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.text }]}>
          Your magical Disney World adventure awaits
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color={colors.primary}
            style={[styles.progressBar, { backgroundColor: colors.progressBg }]}
          />
          <Text variant="bodySmall" style={[styles.progressText, { color: colors.text }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
          <Animated.View
            style={{
              opacity: fadeAnim,
            }}
          >
            <Text variant="bodySmall" style={[styles.loadingText, { color: colors.primary }]}>
              {loadingMessage}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text variant="bodySmall" style={[styles.footerText, { color: colors.footer }]}>
          Plan your perfect Disney vacation
        </Text>
        <Text variant="bodySmall" style={[styles.versionText, { color: colors.footer }]}>
          v1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
    maxWidth: 400,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 20,
    minHeight: 80,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontStyle: 'italic',
    textAlign: 'center',
    minHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 10,
    textAlign: 'center',
  },
});
