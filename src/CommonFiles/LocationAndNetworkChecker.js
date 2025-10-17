// LocationAndNetworkChecker.js
import React, { useEffect, useState } from "react";
import { View, Text, PermissionsAndroid, Platform, Linking, AppState, Modal, TouchableOpacity } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Geolocation from "react-native-geolocation-service";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";

const LocationAndNetworkChecker = ({ children }) => {
    const [internetConnected, setInternetConnected] = useState(true);
    const [locationPermission, setLocationPermission] = useState(false);
    const [gpsEnabled, setGpsEnabled] = useState(true);
    const [showGpsModal, setShowGpsModal] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    useEffect(() => {
        // checkAll();

        // Listen internet status (real internet check)
        const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
            if (state.isConnected && state.isInternetReachable !== false) {
                setInternetConnected(true);
            } else {
                setInternetConnected(false);
            }
        });

        // Listen when user comes back from Settings
        const subscription = AppState.addEventListener("change", (nextState) => {
            if (appState.match(/inactive|background/) && nextState === "active") {
                // checkGpsEnabled();
            }
            setAppState(nextState);
        });

        return () => {
            unsubscribeNetInfo();
            subscription.remove();
        };
    }, [appState]);

    // const checkAll = async () => {
    //     await checkLocationPermission();
    //     await checkGpsEnabled();
    // };

    // Request location permission
    // const checkLocationPermission = async () => {
    //     if (Platform.OS === "android") {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //             {
    //                 title: "Location Permission",
    //                 message: "This app needs access to your location.",
    //                 buttonNegative: "Cancel",
    //                 buttonPositive: "OK",
    //             }
    //         );

    //         setLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    //     } else {
    //         setLocationPermission(true);
    //     }
    // };

    //  // ✅ Check if GPS is enabled (with retry)
    //  const checkGpsEnabled = (retry = true) => {
    //     if (Platform.OS === "android") {
    //         Geolocation.getCurrentPosition(
    //             (pos) => {
    //                 // console.log("✅ GPS working:", pos);
    //                 setGpsEnabled(true);
    //                 setShowGpsModal(false);
    //             },
    //             (err) => {
    //                 // console.log("❌ GPS error:", err);

    //                 // Retry once if GPS provider not ready
    //                 if (retry && (err.code === 2 || err.code === 3)) {
    //                     console.log("⏳ Retrying GPS check in 2s...");
    //                     setTimeout(() => checkGpsEnabled(false), 2000);
    //                 } else {
    //                     setGpsEnabled(false);
    //                     // setShowGpsModal(true);
    //                 }
    //             },
    //             { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    //         );
    //     } else {
    //         setGpsEnabled(true);
    //     }
    // };

    // UI rendering
    if (!internetConnected) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
                <Feather name="wifi-off" size={36} color="#000" style={{ marginRight: 6 }} />
                <Text style={{ color: "red", fontFamily:'Inter-Medium', textAlign:'center' }}>
                    No Internet Access. Please connect to Wi-Fi or Mobile Data.
                </Text>
            </View>
        );
    }

    // if (!gpsEnabled) {
    //     return (
    //         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    //             <Ionicons name="location-outline" size={40} color="#000" />
    //             <Text style={{ color: "#000", fontSize: 16, marginTop: 5 }}>
    //                 You need to turn on GPS to access the app
    //             </Text>
    //         </View>
    //     );
    // }

    return (
        <View style={{ flex: 1 }}>
            {children}
        </View>
    );
};

export default LocationAndNetworkChecker;
