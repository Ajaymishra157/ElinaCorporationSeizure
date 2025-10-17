import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

import colors from '../CommonFiles/Colors';
import { useNavigation, useIsFocused, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../CommonFiles/Constant';

const { width } = Dimensions.get('window');

const Bottomtab = () => {
    const more = require('../assets/images/more.png')
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const route = useRoute();
    const [userType, setUsertype] = useState(null);
    const [activeTab, setActiveTab] = useState('inti');
    const [totaldays, setTotalDays] = useState(null);

    const UserWiseExpiryApi = async () => {
        const userId = await AsyncStorage.getItem('staff_id');
        if (!userId) {
            console.log("❌ User ID not found");
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.UserWiseExpiry}?user_id=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.code == 200 && result.payload) {
                const totaldays = result.payload.total_days;
                setTotalDays(totaldays);
            } else {
                console.log('❌ Error: Failed to load data');
            }
        } catch (error) {
            console.log('❌ Error fetching data:', error.message);
        }
    };

    useEffect(() => {
        if (isFocused) {
            const currentRoute = route.name;

            // Preventing unnecessary state update
            if (currentRoute === 'FirstScreen' && activeTab !== 'Home') {
                setActiveTab('Home');
            } else if (currentRoute === 'DashboardScreen' && activeTab !== 'Dashboard') {
                setActiveTab('Dashboard');
            } else if (currentRoute === 'SearchVehicle' && activeTab !== 'Inti') {
                setActiveTab('Inti');
            } else if (currentRoute === 'ProfileScreen' && activeTab !== 'Prof') {
                setActiveTab('Prof');
            } else if (currentRoute === 'SettingScreen' && activeTab !== 'sett') {
                setActiveTab('sett');
            }
        }
    }, [isFocused, route]);

    useFocusEffect(
        React.useCallback(() => {
            let usertype = null;

            const fetchUsertype = async () => {
                usertype = await AsyncStorage.getItem('user_type');
                setUsertype(usertype);
            };

            fetchUsertype();
            UserWiseExpiryApi(); // call on app start
        }, []),
    );

    // Handle Tab Press Logic
    const handleTabPress = tabName => {
        if (activeTab !== tabName) { // Only update state if tab is different
            setActiveTab(tabName);
        }

        if (tabName === 'Home') {
            navigation.navigate('FirstScreen');
        } else if (tabName === 'Dashboard') {
            navigation.navigate('DashboardScreen');
        } else if (tabName === 'Inti') {
            navigation.navigate('SearchVehicle');
        } else if (tabName === 'Prof') {
            navigation.navigate('ProfileScreen');
        } else if (tabName === 'sett') {
            navigation.navigate('SettingScreen');
        }

    };

    const getTabStyle = tabName => ({
        width: '50%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    });

    const getIconTintColor = tabName =>
        activeTab === tabName ? 'black' : 'grey';

    const getTextColor = tabName =>
        activeTab === tabName ? 'black' : 'grey';

    return (
        <View style={{ flexDirection: 'row', backgroundColor: '#fff', height: 60, borderTopWidth: 1, borderTopColor: '#ccc', }}>
            <TouchableOpacity
                style={getTabStyle('Home')}
                onPress={() => handleTabPress('Home')}
            >
                <Image source={require('../assets/images/search.png')} style={{ height: 25, width: 25, tintColor: getIconTintColor('Home'), resizeMode: 'contain' }} />

                <Text style={{ color: getTextColor('Home'), fontFamily: 'Inter-Regular', fontSize: 12, marginTop: 3 }}>
                    Search
                </Text>
            </TouchableOpacity>

            {totaldays != 0 &&
                <>
                    {/* {userType !== 'normal' && (
                        <TouchableOpacity
                            style={getTabStyle('Inti')}
                            onPress={() => handleTabPress('Inti')}
                        >
                            <Ionicons
                                name="notifications"
                                size={28}
                                color={getIconTintColor('Inti')}
                            />
                            <Text style={{ color: getTextColor('Inti'), fontFamily: 'Inter-Regular', fontSize: 12, marginTop: 3 }}>
                                Intimation
                            </Text>
                        </TouchableOpacity>
                    )}

                    {userType !== 'normal' && (
                        <TouchableOpacity
                            style={getTabStyle('Dashboard')}
                            onPress={() => handleTabPress('Dashboard')}
                        >
                            <Ionicons
                                name="ellipsis-horizontal-circle-sharp"
                                size={28}
                                color={getIconTintColor('Dashboard')}
                            />

                            <Text style={{ color: getTextColor('Dashboard'), fontFamily: 'Inter-Regular', fontSize: 12, marginTop: 3 }}>
                                More
                            </Text> 
                        </TouchableOpacity>
                    )} */}
                    {/* {userType === 'normal' && ( */}
                    <TouchableOpacity
                        style={getTabStyle('sett')}
                        onPress={() => handleTabPress('sett')}
                    >
                        <FontAwesome5 name="cog" size={28} color={getIconTintColor('sett')} />
                        <Text style={{ color: getTextColor('sett'), fontFamily: 'Inter-Regular', fontSize: 12, marginTop: 3 }}>
                            Setting
                        </Text>
                    </TouchableOpacity>
                    {/* )} */}

                </>
            }
            <TouchableOpacity
                style={getTabStyle('Prof')}
                onPress={() => handleTabPress('Prof')}
            >
                <Image source={require('../assets/images/human.png')} style={{ height: 28, width: 28, tintColor: getIconTintColor('Prof'), resizeMode: 'contain' }} />

                <Text style={{ color: getTextColor('Prof'), fontFamily: 'Inter-Regular', fontSize: 12, marginTop: 3 }}>
                    My Account
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Bottomtab;
