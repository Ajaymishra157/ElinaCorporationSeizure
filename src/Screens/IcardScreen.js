import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import LoadingAnimation from '../assets/animations/Loading.json'
import colors from '../CommonFiles/Colors';
import { useNavigation } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import { ENDPOINTS } from '../CommonFiles/Constant';

const IcardScreen = ({ route }) => {
    const navigation = useNavigation();
    const { type } = route.params;  // Get the type passed from ProfileScreen
    const [icardUrl, setIcardUrl] = useState(null);

    useEffect(() => {
        const fetchIcardUrl = async () => {
            const userId = await AsyncStorage.getItem('staff_id');  // Get user_id from AsyncStorage
            console.log("User ID Found:", userId);

            if (!userId) {
                console.log("❌ User ID not found");
                return;
            }

            // Construct the URL with both user_id and type
            const url = ENDPOINTS.ICard(userId, type);
            setIcardUrl(url);  // Set the constructed URL for the WebView
        };

        fetchIcardUrl();
    }, [type]);

    if (!icardUrl) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {/* Lottie Animation instead of ActivityIndicator */}
                <LottieView
                    source={LoadingAnimation}  // Path to your Lottie animation file
                    autoPlay
                    loop
                    style={{ width: 200, height: 200 }}  // Customize the size as needed
                />
            </View> // Show a loading message while the URL is being set
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>

            {/* Header Section */}
            <View
                style={{
                    backgroundColor: colors.Brown,
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <TouchableOpacity
                    style={{ position: 'absolute', top: 15, left: 15 }}
                    onPress={() => {
                        navigation.goBack();
                    }}>
                    <Entypo name="cross" size={30} color="white" />
                </TouchableOpacity>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}>
                    Elina Corporation
                </Text>

            </View>
            <WebView
                source={{ uri: icardUrl }}  // Show the URL in WebView
                style={{ flex: 1 }}
            />
        </View>
    );
};

export default IcardScreen;
