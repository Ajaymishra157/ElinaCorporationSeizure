import { View, Text, Image, TouchableOpacity, Modal, ScrollView, ActivityIndicator, FlatList, TextInput, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from './Constant';
import colors from './Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from "react-native-vector-icons/Feather";
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { db } from '../utils/db';
import LocationAndNetworkChecker from './LocationAndNetworkChecker';

const Menus = ({ navigation }) => {
  const [ProfileData, setProfileData] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [selectedWheelType, setSelectedWheelType] = useState('both');

  const [isStateVisible, setIsStateVisible] = useState(false);
  const [tempSelectedState, setTempSelectedState] = useState(null);
  const [SelectedState, setSelectedState] = useState('All');
  const [selectedStateOption, setSelectedStateOption] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');


  const [designModalVisible, setDesignModalVisible] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState('List');
  const [selectedOption, setSelectedOption] = useState('List');
  const [listType, setListType] = useState('List');

  const [imageModalVisible, setImageModalVisible] = useState(false);

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


        const name = result.payload.name;

        setTotalDays(totaldays);


        // if (totaldays <= 2) {
        //   setPlanExpiryModal(true);
        // }

      } else {
        console.log('❌ Error: Failed to load data');
      }
    } catch (error) {
      console.log('❌ Error fetching data asc:', error.message);
    }
  };


  useFocusEffect(
    useCallback(() => {
      UserWiseExpiryApi();

    }, [])
  );

  // Add this function to handle design selection
  const handleDesignSelect = async (design) => {
    try {
      setSelectedDesign(design);
      setSelectedOption(design);
      setListType(design);

      // Save to AsyncStorage
      await AsyncStorage.setItem('selected_view_type', design);
      await AsyncStorage.setItem('selected_wheel_type', selectedWheelType);

      setDesignModalVisible(false);
      ToastAndroid.show("Layout applied successfully", ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error saving design:', error);
    }
  };

  const closeDesignModal = () => {
    setDesignModalVisible(false);
  };

  // Update the useFocusEffect to properly load saved design
  useFocusEffect(
    React.useCallback(() => {
      const fetchDesign = async () => {
        try {
          const viewType = await AsyncStorage.getItem('selected_view_type');
          const savedState = await AsyncStorage.getItem('selected_state');
          const savedWheelType = await AsyncStorage.getItem('selected_wheel_type');
          console.log("ViewType from Menus:", viewType, savedState);

          if (viewType !== null) {
            setSelectedOption(viewType);
            setListType(viewType);
            setSelectedDesign(viewType);
          }
          if (savedState !== null) {
            setSelectedState(savedState);
            const label = StateData.find((item) => item.value === savedState)?.label;
            if (label) setSelectedStateOption(label);
          }
          if (savedWheelType !== null) {
            setSelectedWheelType(savedWheelType);
          } else {
            setSelectedWheelType('both'); // Default if not saved
          }
        } catch (error) {
          console.error('Error fetching view type:', error);
        }
      };

      fetchDesign();
    }, [])
  );

  const getAppVersion = () => {
    try {

      // Option 2: Using react-native-device-info
      return `${getVersion()}.${getBuildNumber()}`;
      // return `${getBuildNumber()}`;

    } catch (error) {
      return '1.0.0';
    }
  };

  const [StateData] = useState([
    { label: 'All', value: 'All' },
    { label: 'Andhra Pradesh', value: 'AP' },
    { label: 'Arunachal Pradesh', value: 'AR' },
    { label: 'Assam', value: 'AS' },
    { label: 'Bihar', value: 'BR' },
    { label: 'Chhattisgarh', value: 'CG' },
    { label: 'Goa', value: 'GA' },
    { label: 'Gujarat', value: 'GJ' },
    { label: 'Haryana', value: 'HR' },
    { label: 'Himachal Pradesh', value: 'HP' },
    { label: 'Jharkhand', value: 'JH' },
    { label: 'Karnataka', value: 'KA' },
    { label: 'Kerala', value: 'KL' },
    { label: 'Madhya Pradesh', value: 'MP' },
    { label: 'Maharashtra', value: 'MH' },
    { label: 'Manipur', value: 'MN' },
    { label: 'Meghalaya', value: 'ML' },
    { label: 'Mizoram', value: 'MZ' },
    { label: 'Nagaland', value: 'NL' },
    { label: 'Odisha', value: 'OD' },
    { label: 'Punjab', value: 'PB' },
    { label: 'Rajasthan', value: 'RJ' },
    { label: 'Sikkim', value: 'SK' },
    { label: 'Tamil Nadu', value: 'TN' },
    { label: 'Telangana', value: 'TS' },
    { label: 'Tripura', value: 'TR' },
    { label: 'Uttar Pradesh', value: 'UP' },
    { label: 'Uttarakhand', value: 'UK' },
    { label: 'West Bengal', value: 'WB' },
  ]);


  const filteredStates = StateData.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const ProfileDataApi = async () => {
    try {
      const StaffId = await AsyncStorage.getItem('staff_id');

      if (!StaffId) {
        return;
      }
      const response = await fetch(ENDPOINTS.List_Staff_Profile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: StaffId
        }),
      });

      const result = await response.json();
      if (result.code == 200) {
        const data = result.payload[0];
        setProfileData(data);
      } else {
        setProfileData([])
        console.log('Error:', result.message || 'Failed to load staff data');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    ProfileDataApi();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };
  const handleDeleteVehicleData = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setShowDeleteModal(false);
      setDeleteLoading(true);

      await deleteAllVehicles();

      // Simulate processing time
      setTimeout(() => {
        setDeleteLoading(false);
        setDeleteSuccess(true);
      }, 1500);

    } catch (error) {
      setDeleteLoading(false);
      console.log("❌ Error deleting vehicle data:", error.message);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleSuccessOK = () => {
    setDeleteSuccess(false);
  };

  const confirmLogout = async () => {
    try {
      // First delete data from SQLite
      setShowLogoutModal(false);
      setLogoutLoading(true);
      await AsyncStorage.clear();
      await deleteAllVehicles();

      setLogoutLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });

      console.log("✅ Logout successful, SQLite data cleared.");

    } catch (error) {
      setLogoutLoading(false);
      console.log("❌ Error during logout process:", error.message);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };





  const deleteAllVehicles = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM vehicles`,
          [],
          async (tx, results) => {
            console.log("✅ All old vehicle data deleted.");

            try {
              // 🔹 Reset counters
              await AsyncStorage.removeItem("totalItemsCount");

              console.log("🔄 Total items reset after deletion.");
            } catch (e) {
              console.log("⚠️ Failed to reset totalItemsCount:", e.message);
            }

            resolve();
          },
          (error) => {
            console.log("❌ Error deleting vehicles: ", error);
            reject(error);
          }
        );
      });
    });
  };

  const renderStateItem = ({ item }) => (
    <TouchableOpacity
      style={{
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: 'white',
        flexDirection: 'row', justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ccc'
      }}
      onPress={async () => {
        setTempSelectedState(item.value);
        setSelectedStateOption(item.label);
        setIsStateVisible(false);

        try {
          // Save the selected state to AsyncStorage
          await AsyncStorage.setItem('selected_state', item.value);

          // Also save the view type if it exists
          const selectedOption = await AsyncStorage.getItem('selected_view_type');
          if (selectedOption) {
            await AsyncStorage.setItem('selected_view_type', selectedOption);
          }

          // Update UI states
          setSelectedState(item.value); // Value

          ToastAndroid.show("Setting Updated Successfully", ToastAndroid.SHORT);
        } catch (error) {
          console.error('Error saving state selection:', error);
        }
      }}
    >
      <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Inter-Regular' }}>{item.label}</Text>

      {selectedStateOption === item.label && (
        <Entypo name="check" size={20} color="green" />
      )}
    </TouchableOpacity>
  );


  if (ProfileData) {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: colors.Brown,
            height: 55,
            paddingHorizontal: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()} >
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
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'Inter-Bold',
            }}>

          </Text>
          {/* <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Entypo name="dots-three-vertical" size={18} color="white" />
        </TouchableOpacity> */}
        </View>

        <LocationAndNetworkChecker>
          <View style={{
            paddingVertical: 20,
            paddingHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
            backgroundColor: '#e4e4e4'
          }}>
            <TouchableOpacity onPress={() => setImageModalVisible(true)}>
              <Image
                source={{
                  uri: ProfileData.staff_image && ProfileData.staff_image !== ''
                    ? ProfileData.staff_image
                    : 'https://via.placeholder.com/70x70/cccccc/969696?text=No+Image'
                }}
                style={{
                  height: 70,
                  width: 70,
                  borderRadius: 35,
                  borderWidth: 2,
                  borderColor: colors.Brown
                }}
              />
            </TouchableOpacity>

            <View>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Inter-Medium',
                color: 'black',
                textTransform: 'uppercase'
              }}>
                Hi, {ProfileData.staff_name || ''}
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Inter-Medium',
                color: 'black',
                textTransform: 'uppercase'
              }}>
                [Elina Corporation]
              </Text>
            </View>
          </View>

          {/* Drawer Menu */}
          <View style={{ flex: 1, marginTop: 0, marginHorizontal: 0, justifyContent: 'space-between' }}>
            <ScrollView>

              <TouchableOpacity onPress={() => navigation.navigate('FirstScreen')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
                <MaterialIcons name="dashboard" size={24} color={colors.light_brown} style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Dashboard</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />


              <TouchableOpacity onPress={() => navigation.navigate('Downloaddata')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
                <FontAwesome5 name="cloud-download-alt" size={20} color={colors.light_brown} style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Download</Text>
              </TouchableOpacity>


              <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />

              <TouchableOpacity onPress={handleDeleteVehicleData} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
                <MaterialIcons name="delete-sweep" size={24} color={colors.light_brown} style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Delete Vehicle Data</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />

              <TouchableOpacity onPress={() => navigation.navigate('FirstScreen', { modalopen: 'open' })} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
                <Ionicons name="settings" size={24} color={colors.light_brown} style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Vehicle Number Setting</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />

              <TouchableOpacity onPress={() => navigation.navigate('SearchHistory')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
                <Image source={require('../assets/images/electric-car.png')} style={{ height: 24, width: 24, marginRight: 6, tintColor: 'rgba(59, 59, 58, 1)ff' }} />
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Search History</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />

              <TouchableOpacity onPress={() => setDesignModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
                <AntDesign name="appstore1" size={22} color={colors.light_brown} style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Layout</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />

              <TouchableOpacity onPress={() => {
                setIsStateVisible(!isStateVisible);
                setSearchQuery('');
              }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
                <AntDesign name="flag" size={22} color={colors.light_brown} style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>State List</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />
              {/* 
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
              <MaterialIcons name="business" size={24} color="black" style={{ marginRight: 6 }} />
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Agency Info</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} /> */}

              {/*   <TouchableOpacity onPress={() => navigation.navigate('Aboutus')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
              <Ionicons name="information-circle" size={24} color="black" style={{ marginRight: 6 }} />
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>About Us</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />

            <TouchableOpacity onPress={() => navigation.navigate('Contactus')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
              <Ionicons name="chatbubbles" size={24} color="black" style={{ marginRight: 6 }} />
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Contact Us</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
              <MaterialIcons name="privacy-tip" size={24} color="black" style={{ marginRight: 6 }} />
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Privacy Policy</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />

            <TouchableOpacity onPress={() => navigation.navigate('RefundPolicy')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
              <FontAwesome5 name="money-bill-wave" size={20} color="black" style={{ marginRight: 6 }} />
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Refund Policy</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} />

            <TouchableOpacity onPress={() => navigation.navigate('Termsandconditions')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 7, }}>
              <Ionicons name="document-text" size={24} color="black" style={{ marginRight: 6 }} />
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000' }}>Terms & Conditions</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 0 }} /> */}

            </ScrollView>

            {/* Logout / Switch */}
            <View>
              {/* <TouchableOpacity onPress={() => { navigation.navigate('FinancialYear'); }} style={{ alignItems: 'center', flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0', }} >
              <Entypo name="swap" size={20} color="black" />
              <Text style={{ marginLeft: 8, fontSize: 16, fontFamily: 'Inter-Regular', color: 'black' }}>Switch Year</Text>
            </TouchableOpacity> */}

              {/* <TouchableOpacity onPress={handleLogout} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#f8f8f8', }} >
              <Entypo name="log-out" size={20} color="red" />
              <Text style={{ marginLeft: 8, fontSize: 16, fontFamily: 'Inter-Bold', color: 'red' }}>Logout</Text>
            </TouchableOpacity> */}

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#f8f8f8', }}>
                <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
                  <Image source={require('../assets/images/git.png')} style={{ width: 20, height: 20, tintColor: 'rgba(59, 59, 58, 1)ff' }} />
                </View>
                <View style={{ width: '75%', }}>
                  <Text style={{ marginLeft: 0, fontSize: 14, fontFamily: 'Inter-Medium', color: colors.Brown }}>Version</Text>

                </View>
                <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: colors.Brown }}>{getAppVersion()}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Logout Modal */}
          <Modal transparent visible={showLogoutModal} animationType="fade">
            <TouchableOpacity activeOpacity={1} onPress={cancelLogout} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', }} >
              <View style={{ width: '80%', backgroundColor: '#fff', borderRadius: 14, padding: 20, }} >
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'black', fontFamily: 'Inter-Regular' }}>Confirm Logout</Text>
                <Text style={{ fontSize: 15, marginBottom: 20, color: 'black', fontFamily: 'Inter-Regular' }}>Are you sure you want to logout?</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={cancelLogout} style={{ backgroundColor: '#E0E0E0', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, marginRight: 10, }} >
                    <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Inter-Regular' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmLogout} style={{ backgroundColor: 'red', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, }} >
                    <Text style={{ fontSize: 16, color: 'white', fontFamily: 'Inter-Regular' }}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>




          <Modal
            transparent={true}
            visible={logoutLoading}
            animationType="fade"
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
              <View style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 10,
                alignItems: 'center'
              }}>
                <ActivityIndicator size="large" color={colors.Brown} />
                <Text style={{ marginTop: 15, fontSize: 16, color: 'black', fontFamily: 'Inter-Medium' }}>
                  Logging out...
                </Text>
              </View>
            </View>
          </Modal>


          {/* Delete Confirmation Modal with Icon */}
          <Modal transparent visible={showDeleteModal} animationType="fade">
            <TouchableOpacity activeOpacity={1} onPress={cancelDelete} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', }} >
              <View style={{ width: '80%', backgroundColor: '#fff', borderRadius: 14, padding: 20, alignItems: 'center' }} >
                <MaterialIcons name="warning" size={50} color="#FFA000" style={{ marginBottom: 10 }} />
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', marginBottom: 10, color: '#000', textAlign: 'center' }}>Are you sure to delete all vehicle data?</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, width: '100%' }}>
                  <TouchableOpacity
                    onPress={cancelDelete}
                    style={{
                      flex: 1,
                      backgroundColor: '#E0E0E0',
                      paddingVertical: 8,
                      borderRadius: 8, flexDirection: 'row', gap: 5,
                      alignItems: 'center', justifyContent: 'center',
                      marginRight: 10,
                      alignItems: 'center'
                    }} >
                    <Entypo name="cross" size={20} color="#000" />
                    <Text style={{ fontSize: 14, color: 'black', fontFamily: 'Inter-Medium', }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmDelete}
                    style={{
                      flex: 1,
                      backgroundColor: '#E0E0E0',
                      paddingVertical: 8,
                      borderRadius: 8, flexDirection: 'row', gap: 5,
                      alignItems: 'center', justifyContent: 'center'
                    }} >
                    <MaterialIcons name="delete" size={20} color="red" />
                    <Text style={{ fontSize: 14, color: 'red', fontFamily: 'Inter-Medium', }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
          {/* Delete Loading Modal */}
          <Modal
            transparent={true}
            visible={deleteLoading}
            animationType="fade"
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
              <View style={{
                backgroundColor: 'white',
                padding: 25,
                borderRadius: 10,
                alignItems: 'center',
                width: '80%'
              }}>
                {/* You can use a loading icon instead of ActivityIndicator */}
                <ActivityIndicator size="large" color={colors.Brown} />
                <Text style={{ marginTop: 15, fontSize: 16, color: 'black', fontFamily: 'Inter-Medium', textAlign: 'center' }}>
                  Deleting Data...
                </Text>
                <Text style={{ marginTop: 10, fontSize: 14, color: '#666', fontFamily: 'Inter-Regular', textAlign: 'center' }}>
                  Please wait while we clean up your database.
                </Text>
              </View>
            </View>
          </Modal>

          {/* Delete Success Modal */}
          <Modal transparent visible={deleteSuccess} animationType="fade">
            <TouchableOpacity activeOpacity={1} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', }} >
              <View style={{ width: '80%', backgroundColor: '#fff', borderRadius: 14, padding: 0, overflow: 'hidden' }} >

                {/* Content with icon */}
                <View style={{ padding: 25, alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={50} color="#4CAF50" style={{ marginBottom: 15 }} />
                  <View style={{ paddingBottom: 15, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#000' }}>Success</Text>
                  </View>
                  <Text style={{ fontSize: 16, marginBottom: 25, fontFamily: 'Inter-Medium', color: '#000', textAlign: 'center' }}>
                    ✅ Data deleted successfully.
                  </Text>

                  <TouchableOpacity
                    onPress={handleSuccessOK}
                    style={{
                      backgroundColor: colors.Brown,
                      paddingVertical: 10,
                      paddingHorizontal: 30,
                      borderRadius: 8,
                    }} >
                    <Text style={{ fontSize: 16, color: 'white', fontFamily: 'Inter-Regular', }}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* state list modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={isStateVisible}
            onRequestClose={() => setIsStateVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  width: '80%',


                  backgroundColor: 'white'
                }}>
                <View style={{
                  width: '80%', borderBottomWidth: 1, borderColor: '#ccc', flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, alignItems: 'center',


                }}>
                  <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/images/state.png')} style={{ width: 24, height: 24 }} />
                  </View>
                  <View style={{ width: '80%', justifyContent: 'center', alignItems: 'flex-start', }}>
                    <Text style={{ color: 'black', fontFamily: 'Inter-regular', fontSize: 16 }}>Select State(राज्य चुनें)</Text>
                  </View>
                </View>
                <View style={{ width: '20%', borderBottomWidth: 1, borderColor: '#ccc', flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, alignItems: 'center', borderTopRightRadius: 10, }}>
                  <TouchableOpacity
                    onPress={() => setIsStateVisible(false)}
                    style={{
                      marginRight: 5,
                      backgroundColor: 'white',
                      borderRadius: 50,
                    }}>
                    <Entypo name="cross" size={30} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Input */}
              <View style={{ backgroundColor: 'white', width: '80%', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 10, }} >
                <Feather name="search" size={20} color="#999" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ flex: 1, paddingVertical: 10, fontSize: 16, fontFamily: 'Inter-Regular', color: 'black', }}
                />
              </View>
              <View style={{ backgroundColor: 'white', width: '80%', maxHeight: '70%', }} >
                <FlatList
                  data={filteredStates}
                  showsVerticalScrollIndicator={false}
                  renderItem={renderStateItem}
                  keyExtractor={(item) => item.value}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </View>
          </Modal>



          {/* layout selection modal */}

          <Modal
            visible={designModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={closeDesignModal}
          >
            <TouchableOpacity
              activeOpacity={1} style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}

              onPress={closeDesignModal}>
              <View

                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  width: '95%',
                  paddingVertical: 5,

                }}>
                <TouchableOpacity
                  onPress={
                    closeDesignModal
                  }
                  style={{
                    marginRight: 10,
                    backgroundColor: 'white',
                    borderRadius: 50,
                  }}>
                  <Entypo name="cross" size={25} color="black" />
                </TouchableOpacity>
              </View>
              <View style={{
                width: '90%',
                backgroundColor: 'white',
                borderRadius: 15,
                padding: 20,
                alignItems: 'center',
              }}
                onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
                onTouchStart={e => e.stopPropagation()}
              >

                {/* Header */}
                <View style={{
                  flexDirection: 'row',

                  alignItems: 'center',
                  width: '100%',
                  marginBottom: 20,
                }}
                >
                  <Text style={{
                    fontSize: 18,
                    fontFamily: 'Inter-Bold',
                    color: 'black',
                  }}>
                    Select Design
                  </Text>

                </View>


                {/* Design Options */}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: 30,
                  }}
                >
                  {/* List Design Card */}
                  <TouchableOpacity

                    style={{
                      flex: 1,
                      alignItems: 'center',
                      borderWidth: selectedDesign === 'List' ? 2 : 1,
                      borderColor: selectedDesign === 'List' ? colors.Brown : '#ddd',
                      borderRadius: 15,
                      padding: 15,
                      backgroundColor: selectedDesign === 'List' ? '#f8f3f0' : 'white',
                      marginRight: 10,
                    }}
                    onPress={() => setSelectedDesign('List')}
                  >
                    <Image
                      source={require('../assets/images/List.png')}
                      style={{
                        width: 350,
                        height: 270,
                        resizeMode: 'contain',
                        marginBottom: 10,
                      }}
                    />
                    {/* Label */}
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        color: selectedDesign === 'List' ? colors.Brown : 'black',
                        fontSize: 16,
                        marginBottom: 8,
                      }}
                    >
                      List Design
                    </Text>

                    {/* Radio Button */}
                    <View

                      style={{
                        height: 22,
                        width: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: colors.Brown,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {selectedDesign === 'List' && (
                        <View
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: colors.Brown,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Grid Design Card */}
                  <TouchableOpacity

                    style={{
                      flex: 1,
                      alignItems: 'center',
                      borderWidth: selectedDesign === 'Grid' ? 2 : 1,
                      borderColor: selectedDesign === 'Grid' ? colors.Brown : '#ddd',
                      borderRadius: 15,
                      padding: 15,
                      backgroundColor: selectedDesign === 'Grid' ? '#f8f3f0' : 'white',
                      marginLeft: 10,
                    }}
                    onPress={() => setSelectedDesign('Grid')}
                  >
                    <Image
                      source={require('../assets/images/Grid.png')}
                      style={{
                        width: 350,
                        height: 270,
                        resizeMode: 'contain',
                        marginBottom: 10,
                      }}
                    />
                    {/* Label */}
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        color: selectedDesign === 'Grid' ? colors.Brown : 'black',
                        fontSize: 16,
                        marginBottom: 8,
                      }}
                    >
                      Grid Design
                    </Text>

                    {/* Radio Button */}
                    <View

                      style={{
                        height: 22,
                        width: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: colors.Brown,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {selectedDesign === 'Grid' && (
                        <View
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: colors.Brown,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>


                {/* Wheel Type Selection - NEW SECTION */}
                {/* <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', marginBottom: 15, color: 'black' }}>
                    Vehicle Type
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '95%' }}>
                    {[
                      { label: 'Both', value: 'both' },
                      { label: '2', value: '2' },
                      { label: '4', value: '4' }
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginVertical: 8,
                          paddingHorizontal: 15,
                          paddingVertical: 10,
                          borderRadius: 8,
                          backgroundColor: selectedWheelType === item.value ? '#7c7775ff' : 'transparent',
                        }}
                        onPress={() => setSelectedWheelType(item.value)}
                      >
                        <View
                          style={{
                            height: 20,
                            width: 20,
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: colors.Brown,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                            flexDirection: 'row',
                            borderWidth: 1
                          }}
                        >
                          {selectedWheelType === item.value && (
                            <View
                              style={{
                                height: 10,
                                width: 10,
                                borderRadius: 5,
                                backgroundColor: colors.Brown,
                              }}
                            />
                          )}
                        </View>
                        <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: 'black' }}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View> */}


                {/* Save Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.Brown,
                    paddingVertical: 12,
                    paddingHorizontal: 40,
                    borderRadius: 8,
                    width: '100%',
                    alignItems: 'center',
                  }}
                  onPress={() => handleDesignSelect(selectedDesign)}
                >
                  <Text style={{
                    color: 'white',
                    fontFamily: 'Inter-Bold',
                    fontSize: 16,
                  }}>
                    Apply Design
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>


          <Modal
            visible={imageModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setImageModalVisible(false)}
          >
            <TouchableOpacity style={styles.modalContainer} onPress={() => setImageModalVisible(false)}>



              {/* Image Container */}
              <View style={styles.imageContainer} onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
                onTouchEnd={e => e.stopPropagation()}>
                <Image
                  source={{
                    uri: ProfileData.staff_image && ProfileData.staff_image !== ''
                      ? ProfileData.staff_image
                      : 'https://via.placeholder.com/200x200/cccccc/969696?text=No+Image'
                  }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>

              {/* Staff Name */}
              <Text style={styles.staffName}>
                {ProfileData.staff_name || 'Staff Name'}
              </Text>
            </TouchableOpacity>
          </Modal>

        </LocationAndNetworkChecker>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  closeIcon: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
  },
  imageContainer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalImage: {
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  staffName: {
    marginTop: 20,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
});

export default Menus