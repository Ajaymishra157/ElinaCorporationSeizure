import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Image, Animated} from 'react-native';

const SplashScreen = () => {
  // State for opacity and scale animation
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity 0
  const [scaleAnim] = useState(new Animated.Value(0.5)); // Initial scale 0.5

  useEffect(() => {
    // Start the animation when the component mounts
    Animated.sequence([
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade to fully visible
        duration: 1000, // 1 second
        useNativeDriver: true,
      }),
      // Scale up animation
      Animated.timing(scaleAnim, {
        toValue: 2, // Scale to original size
        duration: 1000, // 1 second
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Apply the animated styles */}
      <Animated.Image
        source={require('../assets/images/logo.png')} // Replace with your logo file path
        style={[
          styles.logo,
          {
            opacity: fadeAnim, // Animated opacity
            transform: [{scale: scaleAnim}], // Animated scale
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 380,
    height: 380,
    borderRadius: 150,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
