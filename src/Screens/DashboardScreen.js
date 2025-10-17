import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View, Image, Alert, Modal, BackHandler } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Use FontAwesome for the icons
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import colors from '../CommonFiles/Colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bottomtab from '../Component/Bottomtab';

const DashboardScreen = () => {
  const [ConfrimationModal, setConfrimationModal] = useState(false);
  const navigation = useNavigation();
  const logout = require('../assets/images/logout.png');
  const sports = require('../assets/images/sportbike.png');

  const [userType, setUsertype] = useState(null);
  console.log('Dashboard par userType', userType);

  const [CloseAppModal, setCloseAppModal] = useState(false)
  const handleLogout = async () => {
    setConfrimationModal(true);

  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem('id'); // User data clear karega
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }], // LoginScreen par redirect karega
    });
    setConfrimationModal(false); // Modal ko close karega
  };


  const closeconfirmodal = () => {
    setConfrimationModal(false); // Hide the modal
  };


  const closeExitModal = () => {
    setCloseAppModal(false);

  }
  const confirmExit = () => {
    BackHandler.exitApp();
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        console.log("called");
        setCloseAppModal(true); // Show modal on back press
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener("hardwareBackPress", backAction);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", backAction);
    }, [])
  );





  useFocusEffect(
    React.useCallback(() => {
      let usertype = null;

      const fetchUsertype = async () => {
        usertype = await AsyncStorage.getItem('user_type');
        setUsertype(usertype);
      };

      fetchUsertype();
    }, []),
  );


  // useFocusEffect(
  //   React.useCallback(() => {
  //     const backAction = () => {
  //       Alert.alert(
  //         "Confirmation",
  //         "Are You Sure You Want To close The App?",
  //         [
  //           {
  //             text: "No",
  //             onPress: () => null,
  //             style: "cancel"
  //           },
  //           { text: "Yes", onPress: () => BackHandler.exitApp() }
  //         ]
  //       );
  //       return true; // Prevent default behavior
  //     };

  //     BackHandler.addEventListener("hardwareBackPress", backAction);

  //     return () =>
  //       BackHandler.removeEventListener("hardwareBackPress", backAction);
  //   }, [])
  // );
  return (
    <>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View
          style={{
            backgroundColor: colors.Brown,
            paddingVertical: 15,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'Inter-Bold',
            }}>
            Elina Corporation
          </Text>
          {/* <TouchableOpacity
            style={{ position: 'absolute', right: 10, top: 18 }}
            onPress={handleLogout}>
            <Image
              source={logout}
              style={{ width: 25, height: 25, tintColor: 'white' }}
            />
          </TouchableOpacity> */}
        </View>
        {/* Row container */}
        {userType === 'SuperAdmin' && (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: 30,
                paddingHorizontal: 15,
              }}>
              {/* First Box (Staff) */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  width: 100,
                  height: 120,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 8, // For Android
                }}
                onPress={() => {
                  navigation.navigate('HomeScreen');
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <FontAwesome name="user" size={25} color="#007BFF" />
                </View>
                <Text
                  style={{
                    color: '#343A40',
                    fontSize: 14,
                    textAlign: 'center',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Staff
                </Text>
              </TouchableOpacity>

              {/* Second Box (Schedule) */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  width: 100,
                  height: 120,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 8, // For Android
                }}
                onPress={() => {
                  navigation.navigate('StaffSchedule');
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <FontAwesome name="calendar" size={25} color="#007BFF" />
                </View>
                <Text
                  style={{
                    color: '#343A40',
                    fontSize: 14,
                    textAlign: 'center',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Schedule
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  width: 100,
                  height: 120,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 8, // For Android
                }}
                onPress={() => {
                  navigation.navigate('SearchHistory');
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <FontAwesome name="search" size={25} color="#07aecf" />
                </View>
                <Text
                  style={{
                    color: '#343A40',
                    fontSize: 14,
                    textAlign: 'center',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Search History
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                marginTop: 30,
                paddingHorizontal: 15,
                justifyContent: 'space-between',
              }}>
              {/* First Box */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  width: 100,
                  height: 120,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 8, // For Android
                }}
                onPress={() => {
                  navigation.navigate('SearchVehicle', { from: 'home' });
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <Image
                    source={sports}
                    style={{ width: 25, height: 25, tintColor: '#FFC107' }}
                  />
                </View>
                <Text
                  style={{
                    color: '#343A40', // Change text color to make it more visible on white
                    fontSize: 14,
                    textAlign: 'center',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Intimation
                </Text>
              </TouchableOpacity>

              {/* Second Box */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  width: 100,
                  height: 120,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 8, // For Android

                }}
                onPress={() => {
                  navigation.navigate('ListingScreen');
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <FontAwesome name="list" size={25} color="#28A745" />
                </View>
                <Text
                  style={{
                    color: '#343A40',
                    fontSize: 11,
                    textAlign: 'center',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Pso Confirm/Cancel List
                </Text>
              </TouchableOpacity>

              {/* third Box */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  width: 100,
                  height: 120,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 8, // For Android

                }}
                onPress={() => {
                  navigation.navigate('AreaList');
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <MaterialIcons name="location-on" size={25} color="#8A2BE2" />
                </View>
                <Text
                  style={{
                    color: '#343A40',
                    fontSize: 14,
                    textAlign: 'center',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Area
                </Text>
              </TouchableOpacity>
            </View>
          </>




        )}


        {/* Row container for two boxes */}
        {userType === 'main' && (
          <>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                marginTop: 30,
                paddingHorizontal: 15,
                justifyContent: 'space-between',
              }}>


              {/* First Box */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  width: 100,
                  height: 120,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 8, // For Android
                }}
                onPress={() => {
                  navigation.navigate('SearchVehicle', { from: 'home' });
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <Image
                    source={sports}
                    style={{ width: 25, height: 25, tintColor: '#FFC107' }}
                  />
                </View>
                <Text
                  style={{
                    color: '#343A40', // Change text color to make it more visible on white
                    fontSize: 14,
                    textAlign: 'center',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Intimation
                </Text>
              </TouchableOpacity>

              {/* Second Box */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  width: 100,
                  height: 120,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 8, // For Android

                }}
                onPress={() => {
                  navigation.navigate('ListingScreen');
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <FontAwesome name="list" size={25} color="#28A745" />
                </View>
                <Text
                  style={{
                    color: '#343A40',
                    fontSize: 11,
                    textAlign: 'center',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Pso Confirm/Cancel List
                </Text>
              </TouchableOpacity>

              {/* third Box */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  width: 100,
                  height: 120,
                  padding: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 8, // For Android

                }}
                onPress={() => {
                  navigation.navigate('AreaList');
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <MaterialIcons name="location-on" size={25} color="#8A2BE2" />
                </View>
                <Text
                  style={{
                    color: '#343A40',
                    fontSize: 14,
                    textAlign: 'center',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Area
                </Text>
              </TouchableOpacity>


            </View>




          </>

        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={ConfrimationModal}
          onRequestClose={closeconfirmodal}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            onPress={closeconfirmodal}
            activeOpacity={1}>
            <View
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 8,
                width: '80%',
                alignItems: 'center',
              }}
              onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
              onTouchEnd={e => e.stopPropagation()}>
              <Text style={{
                fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'black', fontFamily: 'Inter-Medium'
              }}>
                Logout
              </Text>
              <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
                Are you sure you want to Logout ?
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#ddd',
                    padding: 10,
                    borderRadius: 5,
                    width: '45%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={closeconfirmodal}>
                  <Text
                    style={{
                      color: 'black',
                      fontWeight: 'bold',
                      fontFamily: 'Inter-Regular',
                    }}>
                    No
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.Brown,
                    padding: 10,
                    borderRadius: 5,
                    width: '45%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={confirmLogout}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontFamily: 'Inter-Regular',
                    }}>
                    Yes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={CloseAppModal}
          onRequestClose={closeExitModal}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            onPress={closeExitModal}
            activeOpacity={1}>
            <View
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 8,
                width: '80%',
                alignItems: 'center',
              }}
              onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
              onTouchEnd={e => e.stopPropagation()}>
              <Text style={{
                fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'black', fontFamily: 'Inter-Medium'
              }}>
                Confirmation
              </Text>
              <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
                Are you sure you want to Really Exit ?
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#ddd',
                    padding: 10,
                    borderRadius: 5,
                    width: '45%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={closeExitModal}>
                  <Text
                    style={{
                      color: 'black',
                      fontWeight: 'bold',
                      fontFamily: 'Inter-Regular',
                    }}>
                    No
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.Brown,
                    padding: 10,
                    borderRadius: 5,
                    width: '45%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={confirmExit}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontFamily: 'Inter-Regular',
                    }}>
                    Yes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>




      </View>

      <View style={{ justifyContent: 'flex-end' }}>
        <Bottomtab />
      </View>
    </>
  );
};

export default DashboardScreen;
