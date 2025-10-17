import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import RouteNavigation from './src/Navigation/RouteNavigation';
import SplashScreen from './src/Screens/SplashScreen';

const App = () => {
  const [isSplashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds, then navigate to the main app
    setTimeout(() => {
      setSplashVisible(false);
    }, 2000); // Change the duration (in milliseconds) as required
  }, []);

  return isSplashVisible ? (
    <SplashScreen /> // Display splash screen
  ) : (
    <RouteNavigation />
  );
};

export default App;

const styles = StyleSheet.create({});
