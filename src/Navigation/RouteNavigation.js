import { ActivityIndicator, NativeEventEmitter, NativeModules, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../Screens/LoginScreen';
import HomeScreen from '../Screens/HomeScreen';
import AddStaffScreen from '../Screens/AddStaffScreen';
import SearchHistory from '../Screens/SearchHistory';
import AddScheduleScreen from '../Screens/AddScheduleScreen';
import StaffSchedule from '../Screens/StaffSchedule';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../CommonFiles/Colors';
import DashboardScreen from '../Screens/DashboardScreen';
import SearchVehicle from '../Screens/SearchVehicle';
import IntimationScreen from '../Screens/IntimationScreen';
import SplashScreen from '../Screens/SplashScreen';
import ListingScreen from '../Screens/ListingScreen';
import AreaList from '../Screens/AreaList';
import AddArea from '../Screens/AddArea';
import PDFViewerScreen from '../Screens/PDFViewerScreen ';
import CreateIntimation from '../Screens/CreateIntimation';

import FirstScreen from '../Screens/FirstScreen';
import Bottomtab from '../Component/Bottomtab';
import DetailScreen from '../Screens/DetailScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import LottieView from 'lottie-react-native';
import LoadingAnimation from '../assets/animations/Loading.json'
import SettingScreen from '../Screens/SettingScreen';
import IcardScreen from '../Screens/IcardScreen';
import StaffJoin from '../Screens/StaffJoin';
import OtpScreen from '../Screens/OtpScreen';
import Menus from '../CommonFiles/Menus';
import Downloaddata from '../Screens/Downloaddata';

const { DeviceEventManagerModule } = NativeModules;
const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

const RouteNavigation = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const id = await AsyncStorage.getItem('staff_id');

      if (id) {
        setInitialRoute('FirstScreen');
      } else {
        setInitialRoute('LoginScreen');
      }
    };

    checkLoginStatus();
  }, []);

  // 🔥 Listen for NotificationClick events from native module
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(DeviceEventManagerModule);
    const subscription = eventEmitter.addListener("NotificationClick", (event) => {
      console.log("📩 NotificationClick event received:", event);

      if (event?.targetScreen) {
        // Navigate after NavigationContainer is ready
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate(event.targetScreen);
          }
        }, 300);
      }
    });

    return () => subscription.remove();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Lottie Animation instead of ActivityIndicator */}
        <LottieView
          source={LoadingAnimation}  // Path to your Lottie animation file
          autoPlay
          loop
          style={{ width: 200, height: 200 }}  // Customize the size as needed
        />
      </View>
    );
  }
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddStaffScreen"
          component={AddStaffScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SearchHistory"
          component={SearchHistory}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="StaffSchedule"
          component={StaffSchedule}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddScheduleScreen"
          component={AddScheduleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DashboardScreen"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SearchVehicle"
          component={SearchVehicle}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="IntimationScreen"
          component={IntimationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name='ListingScreen' component={ListingScreen} options={{ headerShown: false }} />

        <Stack.Screen name='AreaList' component={AreaList} options={{ headerShown: false }} />
        <Stack.Screen name='AddArea' component={AddArea} options={{ headerShown: false }} />
        <Stack.Screen name='PDFViewerScreen' component={PDFViewerScreen} options={{ headerShown: false }} />
        <Stack.Screen name='CreateIntimation' component={CreateIntimation} options={{ headerShown: false }} />
        <Stack.Screen name='FirstScreen' component={FirstScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Bottomtab' component={Bottomtab} options={{ headerShown: false }} />
        <Stack.Screen name='DetailScreen' component={DetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name='ProfileScreen' component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name='SettingScreen' component={SettingScreen} options={{ headerShown: false }} />
        <Stack.Screen name='IcardScreen' component={IcardScreen} options={{ headerShown: false }} />
        <Stack.Screen name='StaffJoin' component={StaffJoin} options={{ headerShown: false }} />
        <Stack.Screen name='OtpScreen' component={OtpScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Menus' component={Menus} options={{ headerShown: false }} />
        <Stack.Screen name='Downloaddata' component={Downloaddata} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// const RouteNavigation = () => {
//   return (
//     <NavigationContainer>
//       <Drawer.Navigator
//         drawerContent={props => <DrawerNavigation {...props} />}>
//         <Drawer.Screen
//           name="MainStack"
//           component={MainStack}
//           options={{headerShown: false}}
//         />
//       </Drawer.Navigator>
//     </NavigationContainer>
//   );
// };

export default RouteNavigation;

const styles = StyleSheet.create({});
