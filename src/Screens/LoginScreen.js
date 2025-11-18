import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Keyboard,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../CommonFiles/Colors';
import { ENDPOINTS } from '../CommonFiles/Constant';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from "react-native-geolocation-service";

const LoginScreen = () => {
  const logo = require('../assets/images/logo.png');
  const navigation = useNavigation();
  const [Email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [Loading, setLoading] = useState(false);

  const [myDeviceId, setMyDeviceId] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [EmailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const [locationPermission, setLocationPermission] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [showGpsModal, setShowGpsModal] = useState(false);


  const [Agencydata, setAgencyData] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agencyAddress, setAgencyAddress] = useState('');
  const [agencyMobile, setAgencyMobile] = useState('');



  const [showAgencyDetails, setShowAgencyDetails] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);



  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  const AgencyDetailApi = async () => {
    try {
      const response = await fetch(ENDPOINTS.AgencyDetail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();


      if (result.code === 200 && Array.isArray(result.payload)) {

        setAgencyData(result.payload);
        const agencyDetail = result.payload.find(
          item => item.type === 'agency_details_show'
        );



        if (agencyDetail && agencyDetail.value.toLowerCase() === 'yes') {

          setShowAgencyDetails(true); // show section

        } else {
          setShowAgencyDetails(false); // hide section
        }
        // Set individual states
        setAgencyName(agencyDetail?.agency_name || '');
        setAgencyAddress(agencyDetail?.agency_address || '');
        setAgencyMobile(agencyDetail?.agency_mobile || '');
      } else {
        setShowAgencyDetails(false);
        setAgencyName('');
        setAgencyAddress('');
        setAgencyMobile('');
      }

    } catch (error) {
      console.log('❌ Error fetching agency details:', error.message);
      setShowAgencyDetails(false); // default to hide
      setAgencyData([]);
    }
  };

  useEffect(() => {
    AgencyDetailApi();
  }, []);

  // ✅ Request Android Notification Permission (Android 13+)
  async function requestAndroidNotificationPermission() {
    if (Platform.OS !== "android") return true;
    if (Platform.Version < 33) return true;

    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  }

  const checkLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location.",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      setLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      setLocationPermission(true); // iOS permissions handled separately if needed
    }
  };

  const checkGpsEnabled = (retry = true) => {
    if (Platform.OS === "android") {
      Geolocation.getCurrentPosition(
        (pos) => {
          // GPS working
          // setGpsEnabled(true);
          // setShowGpsModal(false);
        },
        (err) => {
          // Retry if provider not ready
          if (retry && (err.code === 2 || err.code === 3)) {
            console.log("⏳ Retrying GPS check in 2s...");
            setTimeout(() => checkGpsEnabled(false), 2000);
          } else {
            // setGpsEnabled(false);
            // setShowGpsModal(false); // show modal to prompt user
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    } else {
      setGpsEnabled(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkLocationPermission();
      await requestAndroidNotificationPermission();
      checkGpsEnabled();
    };
    init();
  }, []);

  useEffect(() => {
    // Fetch the unique device ID
    DeviceInfo.getUniqueId()
      .then(uniqueId => {
        setMyDeviceId(uniqueId);
      })
      .catch(error => {
        console.error('Error fetching device ID:', error);
      });
  }, []);

  const handleLogin = async () => {
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');
    setLoginError('');

    // Validation for Mobile
    if (!Email) {
      setEmailError('Please Enter Mobile No');
      isValid = false;
    }

    // Password validation (minimum 4 characters)
    if (password.length < 6) {
      setPasswordError('Password Must be 6 Character');
      isValid = false;
    }

    if (isValid) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("username", Email);
        formData.append("password", password);
        formData.append("device_id", myDeviceId);

        const response = await fetch(ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: {

          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to connect to the server');
        }

        const data = await response.json();
        console.log(data);
        // Check response status
        if (data.code == 200) {
          ToastAndroid.show('Login Successfully', ToastAndroid.SHORT);
          const staffId = data.payload.id;
          const userType = data.payload.user_type;
          const userName = data.payload.name;

          await AsyncStorage.setItem('staff_id', staffId);
          await AsyncStorage.setItem('user_type', userType);
          await AsyncStorage.setItem('name', userName);


          navigation.reset({
            index: 0, // Reset the stack
            routes: [
              {
                name: 'FirstScreen',
                params: { shouldSync: true },
              },
            ], // Navigate to HomeScreen
          });
        } else {
          setLoginError(data.message || 'Invalid credentials');
        }
      } catch (error) {
        console.error('Error:', error.message);
        setLoginError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
      }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', backgroundColor: 'white', paddingTop: 120, paddingBottom: keyboardVisible ? 340 : 85, }}
        keyboardShouldPersistTaps='handled' >
        <View style={{ height: 200 }}>
          <Image
            source={logo}
            style={{
              height: 160,
              width: 160,
              resizeMode: 'contain',
            }}
          />
        </View>
        <View style={{ width: '100%', paddingHorizontal: 20, }}>
          {/* Email input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: EmailError ? 'red' : '#d1d5db',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              marginBottom: 7,

            }}>
            <Ionicons name="phone-portrait-outline" size={20} color="gray" />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: '#333',
                fontFamily: 'Inter-Regular',
              }}
              placeholder="Enter Mobile No"
              placeholderTextColor="grey"
              keyboardType="phone-pad"
              maxLength={10}
              value={Email}
              onChangeText={setEmail}
            />
          </View>
          {EmailError ? (
            <Text
              style={{
                color: 'red',
                fontSize: 14,
                marginBottom: 5,
                marginLeft: 15,
                fontFamily: 'Inter-Regular',
              }}>
              {EmailError}
            </Text>
          ) : null}

          {/* Password Input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: passwordError ? 'red' : '#d1d5db',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              marginBottom: 7,
              marginTop: 5,
            }}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: '#333',
                fontFamily: 'Inter-Regular',
              }}
              placeholder="Enter Password"
              placeholderTextColor="grey"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>




          {passwordError ? (
            <Text
              style={{
                color: 'red',
                fontSize: 14,
                marginBottom: 5,
                marginLeft: 15,
                fontFamily: 'Inter-Regular',
              }}>
              {passwordError}
            </Text>
          ) : null}


          {Loading ? (
            <View>
              <ActivityIndicator size="small" color={'#3b82f6'} />
            </View>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: colors.Brown,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 10,
              }}
              onPress={handleLogin}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 16,
                  fontFamily: 'Inter-Regular',
                }}>
                Login
              </Text>
            </TouchableOpacity>
          )}
          {loginError ? (
            <Text
              style={{
                color: 'red',
                fontSize: 14,
                marginBottom: 10,
                marginLeft: 15,
                fontFamily: 'Inter-Regular',
              }}>
              {loginError}
            </Text>
          ) : null}


          <TouchableOpacity
            style={{
              backgroundColor: 'white', // green color
              paddingVertical: 12,
              borderWidth: 1, borderColor: '#3d3c3cff',
              borderRadius: 8,

              alignItems: 'center',
              marginTop: 20,
            }}
            onPress={() => navigation.navigate('StaffJoin')} // yahan AddStaffScreen aapka target screen ka naam
          >
            <Text
              style={{
                color: colors.Brown,

                fontSize: 16,
                fontFamily: 'Inter-Regular',
              }}>
              New Staff Join Here?
            </Text>
          </TouchableOpacity>

        </View>

        {/* Divider */}
        {(agencyAddress || agencyName || agencyMobile) && (
          <View
            style={{
              height: 2,
              backgroundColor: '#d1d5db',
              marginVertical: 25,
              width: '100%',
              alignSelf: 'center',
            }}
          />
        )}
        {showAgencyDetails && (
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            {(agencyAddress || agencyName || agencyMobile) && (
              <Text
                style={{
                  color: '#0a0a0aff',
                  fontFamily: 'Inter-Bold',

                  fontSize: 14,
                  textAlign: 'center',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                AGENCY DETAILS
              </Text>
            )}
            {agencyName && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 6,
                  gap: 8
                }}>

                <Text
                  style={{
                    fontFamily: 'Inter-Medium',
                    fontSize: 16,
                    textAlign: 'center',
                  }}>
                  <Text style={{ color: 'black' }}>{agencyName}</Text>

                </Text>


              </View>
            )}


            {agencyAddress && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  marginTop: 8,
                  paddingHorizontal: 20,
                }}>

                <Image source={require('../assets/images/google-maps.png')} style={{ width: 20, height: 20 }} />
                <Text
                  style={{
                    color: '#0a0a0aff',
                    fontFamily: 'Inter-Regular',
                    fontSize: 14,
                    marginLeft: 6,
                    textAlign: 'center',
                    flex: 1,
                  }}>
                  {agencyAddress}
                </Text>
              </View>
            )}

            {agencyMobile && (
              <TouchableOpacity
                onPress={() => {
                  const phoneNumber = `tel:${agencyMobile}`;
                  Linking.openURL(phoneNumber).catch(err =>
                    console.log('Error opening dialer', err)
                  );
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 6,
                  gap: 5

                }}>
                <Image source={require('../assets/images/Call.png')} style={{ width: 20, height: 20 }} />
                <Text
                  style={{
                    color: 'blue',
                    fontSize: 15,
                    marginLeft: 6,
                    textDecorationLine: 'underline',
                  }}>
                  {agencyMobile}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      </ScrollView>

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
