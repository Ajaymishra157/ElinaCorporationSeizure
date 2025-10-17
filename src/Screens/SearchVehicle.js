import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../CommonFiles/Colors';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ENDPOINTS } from '../CommonFiles/Constant';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Use FontAwesome for the icons
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Bottomtab from '../Component/Bottomtab';
import LottieView from 'lottie-react-native';
import LoadingAnimation from '../assets/animations/Loading.json'

const SearchVehicle = () => {
  const vehicle = require('../assets/images/vehicle.png');
  const navigation = useNavigation();
  const [SearchVehicle, setSearchVehicle] = useState([]);
  const [SearchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // Loading state for pagination
  const [page, setPage] = useState(1); // Page number for pagination
  const itemsPerPage = 20; // Number of items to load per page

  const [totalItems, setTotalItems] = useState(0);

  const textInputRef = useRef(null);

  const [text, setText] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Track dropdown visibility
  const [selectedType, setSelectedType] = useState('All'); // Store selected type

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const [typeError, settypeError] = useState('');
  const [SearchError, setSearchError] = useState('');

  const route = useRoute();
  const [showBack, setShowBack] = useState(false);
  const [showBottomTab, setShowBottomTab] = useState(false);

  // Check route params and set showBack state
  useEffect(() => {
    const { from } = route.params || {};
    if (from === 'home') {
      setShowBack(true);

    } else {
      setShowBack(false);

    }
  }, [route.params]);

  useEffect(() => {
    const { from } = route.params || {};
    if (from === 'home') {
      setShowBottomTab(false); // Show Bottomtab if from is 'home'
    } else {
      setShowBottomTab(true); // Hide Bottomtab otherwise
    }
  }, [route.params]);

  // Focus the TextInput when the route params indicate 'home'
  useEffect(() => {
    if (showBack && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current.focus(); // Focus on TextInput
      }, 100); // Add a small delay to ensure screen has loaded
    }
  }, [showBack]);

  // Create a function that handles text change
  const handleTextChange = newText => {
    setText(newText);
    // You can also add any additional logic here if needed, like validation or fetching data
  };

  // Focus TextInput when the screen loads
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (textInputRef.current) {
  //       textInputRef.current.focus(); // Focus on TextInput
  //     }
  //   }, 100); // Add a small delay to ensure the screen has fully loaded

  //   // Clear the timer if the component unmounts
  //   return () => clearTimeout(timer);
  // }, []);

  const [dropdownData] = useState([
    { label: 'All', value: 'All' },
    { label: 'Eng No', value: 'Eng No' },
    { label: 'Reg No', value: 'Reg No' },
    { label: 'Agg No', value: 'Agg No' },
    { label: 'Chassis No', value: 'Chassis No' },
  ]);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelect = type => {
    setSelectedType(type);
    setIsDropdownVisible(false); // Close the dropdown after selection
  };

  const openModal = item => {
    setSelectedHistory(item); // Set selected item data to show in the modal
    setModalVisible(true); // Show the modal
  };

  const closeModal = () => {
    setModalVisible(false); // Hide the modal
    setSelectedHistory(null); // Clear the selected item data
  };

  useFocusEffect(
    useCallback(() => {
      setIsDropdownVisible(false);
    }, []), // Empty array ensures this is called only when the screen is focused
  );

  const loadMoreData = () => {
    if (loadingMore || SearchVehicle.length >= totalItems) return;
    setLoadingMore(true);

    // Simulate API call or fetching more data
    setTimeout(() => {
      const nextData = SearchVehicle.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
      setData((prevData) => [...prevData, ...nextData]);
      setPage(page + 1); // Increment the page number for next batch
      setLoadingMore(false);
    }, 1000); // Simulate network delay
  };

  // Load the first batch of data
  useEffect(() => {
    loadMoreData();
  }, []);

  const SearchVehicleApi = async () => {
    let isValid = true;

    // Check if both fields are empty
    if (!text) {
      setSearchError('Search No Is Required');
      isValid = false; // Invalid because Search No is empty
    } else {
      setSearchError(''); // Clear error if Search No is provided
    }

    if (!selectedType) {
      settypeError('Type Is Required');
      isValid = false; // Invalid because Type is empty
    } else {
      settypeError(''); // Clear error if Type is provided
    }

    if (!isValid) return;
    console.log('vehicle and number', selectedType, text);
    setSearchLoading(true);
    try {
      const response = await fetch(ENDPOINTS.Intimation_Vehicle, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          number: text,
        }),
      });

      // Check the status code first
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("result", result);
      if (result.code == 200) {
        setSearchVehicle(result.payload);
        // setText('');

      } else {
        setSearchVehicle([]);
        console.log('Error: Failed to load data');

      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // useEffect(() => {
  //   SearchVehicleApi();
  // }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setSearchError('');
    settypeError('');
    // await SearchVehicleApi();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }) => (
    <View
      key={item.full_vehicle_id}
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 7,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
      }}
    >
      <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, textAlign: 'center', color: 'black', fontFamily: 'Inter-Regular' }}>
          {index + 1}
        </Text>
      </View>
      <View style={{ width: '35%', justifyContent: 'center', alignItems: 'flex-start' }}>
        <Text style={{ fontSize: 12, textAlign: 'left', color: 'black', fontFamily: 'Inter-Regular' }}>
          {item.vehicle_customer_name}
        </Text>
      </View>
      <View style={{ width: '40%', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, textAlign: 'center', color: 'black', fontFamily: 'Inter-Regular' }}>
          {item.vehicle_registration_no}
        </Text>
        <Text style={{ fontSize: 12, textAlign: 'center', color: 'black', fontFamily: 'Inter-Regular' }}>
          {item.vehicle_chassis_no}
        </Text>
      </View>
      <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('IntimationScreen', {
              vehicleDetails: item,
            });
          }}
          style={{ width: '100%', justifyContent: 'center', flexDirection: 'row' }}
        >
          <AntDesign name="infocirlceo" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.Brown,
          paddingVertical: 15,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {showBack && (
          <TouchableOpacity
            style={{
              width: '15%',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              position: 'absolute', top: 5, left: 5,

              height: 50,


            }}
            onPress={() => {
              navigation.goBack();
            }}>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Ionicons name="arrow-back" color="white" size={26} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Search Vehicle
        </Text>
        <View
          style={{
            width: '15%',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            right: 6,
            top: 5,

            height: 50

          }}>

          <TouchableOpacity onPress={() => {
            navigation.navigate('CreateIntimation');
          }}>
            <AntDesign name='plus' color='white' size={25} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Type Dropdown */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 5,

        }}>
        {/* Dropdown button */}
        <View style={{ position: 'relative', width: '27%' }}>
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              paddingVertical: 13,
              paddingHorizontal: 5,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderColor: typeError ? 'red' : colors.Brown,

              borderWidth: 1,
              width: '100%',
            }}
            onPress={toggleDropdown}>
            <Text
              style={{
                paddingLeft: 8,
                fontSize: 12,
                fontFamily: 'Inter-Regular',
                color: selectedType ? 'black' : '#777',
              }}>
              {selectedType ? selectedType : 'Type'}
            </Text>

            <Ionicons
              name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="black"
            />
          </TouchableOpacity>

          {/* Dropdown list visibility */}
          {isDropdownVisible && (
            <View
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 8,
                borderColor: colors.Brown,
                borderWidth: 1,
                zIndex: 1,
                marginTop: 1,
                width: '100%',
              }}>
              <FlatList
                data={dropdownData}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={{
                      padding: 12,
                      borderBottomColor: colors.Brown,
                      borderBottomWidth: index === dropdownData.length - 1 ? 0 : 1,
                    }}
                    onPress={() => handleSelect(item.value)}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Inter-Regular',
                        color: 'grey',
                      }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.value}
              />
            </View>
          )}
        </View>

        {/* Search Text button */}
        <View
          style={{
            width: '58%',

            borderRadius: 8,
            borderWidth: 1,
            height: 50,
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: SearchError ? 'red' : colors.Brown,
          }}>
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              fontFamily: 'Inter-Regular',
              color: 'black',
              height: 50,
            }}
            ref={textInputRef}
            placeholder="Search No"
            placeholderTextColor="grey"
            value={text}
            onChangeText={handleTextChange}
          />
          {text ? (
            <TouchableOpacity
              onPress={() => setText('')}
              style={{
                marginRight: 7,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Entypo name="cross" size={20} color="black" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: colors.Brown,
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            width: '12.5%',
          }}
          onPress={SearchVehicleApi}>
          <FontAwesome name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      <View style={{ width: '100%', flexDirection: 'row' }}>
        <View
          style={{
            width: '30%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {typeError ? (
            <Text
              style={{
                color: 'red',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
                fontSize: 14,
              }}>
              {typeError}
            </Text>
          ) : null}
        </View>
        <View
          style={{
            width: '70%',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}>
          {SearchError ? (
            <Text
              style={{
                color: 'red',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
                fontSize: 14,
                marginLeft: 10,
              }}>
              {SearchError}
            </Text>
          ) : null}
        </View>
      </View>
      {SearchVehicle.length !== 0 && (
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#ddd',
            padding: 7,
            borderRadius: 5,
            marginTop: 5

          }}
        >
          {/* Sr No */}
          <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
                fontSize: 14,
                color: 'black',
              }}
            >
              #
            </Text>
          </View>

          {/* Customer Name */}
          <View style={{ width: '35%', justifyContent: 'center', alignItems: 'flex-start' }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontFamily: 'Inter-Regular',
                textAlign: 'left',
                fontSize: 14,
                color: 'black',
              }}
            >
              Customer Name
            </Text>
          </View>

          {/* RCNO */}
          <View style={{ width: '40%', justifyContent: 'center', alignItems: 'center' }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
                fontSize: 14,
                color: 'black',
              }}
            >
              RCNO
            </Text>
          </View>

          {/* Empty Placeholder */}
          <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }} />
        </View>

      )}


      <ScrollView
        style={{ flex: 1, marginTop: 5 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9Bd35A', '#689F38']}
          />
        }>

        {/* Loading Indicator */}
        {SearchLoading ? (
          <View
            style={{
              height: 600,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 30,

            }}>
            <LottieView
              source={LoadingAnimation}  // Path to your Lottie animation file
              autoPlay
              loop
              style={{ width: 200, height: 200 }}  // Customize the size as needed
            />
          </View>
        ) : SearchVehicle.length == 0 ? (
          <View
            style={{ height: 600, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={vehicle} style={{ width: 70, height: 70, marginTop: 30, }} />
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                color: 'red',
                marginTop: 20

              }}>
              No Vehicles Found
            </Text>
          </View>
        ) : (
          <FlatList
            data={SearchVehicle} // Data to render
            keyExtractor={(item) => item.full_vehicle_id.toString()}
            renderItem={renderItem} // Function to render each row
            onEndReached={loadMoreData} // Trigger loading more data when scrolled to the bottom
            onEndReachedThreshold={0.5} // Trigger when the user reaches 50% from the end
            keyboardShouldPersistTaps="handled"

          />
        )}
      </ScrollView>
      {showBottomTab && (
        <View style={{ justifyContent: 'flex-end' }}>
          <Bottomtab />
        </View>
      )}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
          }}
          activeOpacity={1}
          onPress={closeModal}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 15,
              width: '85%',
              maxHeight: '80%', // Ensure modal does not overflow
            }}
            onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
            onTouchEnd={e => e.stopPropagation()}>
            {selectedHistory && (
              <>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: 'Inter-Medium',
                      marginBottom: 20,
                      color: 'black',
                      textAlign: 'center',
                    }}>
                    Search Vehicle Details
                  </Text>
                  {/* <TouchableOpacity
                    style={{
                      position: 'absolute',
                      right: 5,
                      top: 12,
                      width: '20%',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      borderWidth: 1,
                      backgroundColor: 'red',
                    }}
                    onPress={closeModal}>
                    <Entypo name="cross" size={30} color="black" />
                  </TouchableOpacity> */}
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled">
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 10,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#333',
                        fontFamily: 'Inter-Medium',
                      }}>
                      Staff Name:{' '}
                    </Text>
                    {selectedHistory.vehicle_customer_name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 10,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#333',
                        fontFamily: 'Inter-Medium',
                      }}>
                      Rc No:{' '}
                    </Text>
                    {selectedHistory.vehicle_registration_no}
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 10,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#333',
                        fontFamily: 'Inter-Medium',
                      }}>
                      Engine No:{' '}
                    </Text>
                    {selectedHistory.vehicle_engine_no}
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 10,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#333',
                        fontFamily: 'Inter-Medium',
                      }}>
                      Chassis No:{' '}
                    </Text>
                    {selectedHistory.vehicle_chassis_no}
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 10,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#333',
                        fontFamily: 'Inter-Medium',
                      }}>
                      Entry Date:{' '}
                    </Text>
                    {selectedHistory.vehicle_entry_date}
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 10,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#333',

                        fontFamily: 'Inter-Medium',
                      }}>
                      Vehicle Status:{' '}
                    </Text>
                    <Text
                      style={{
                        color: selectedHistory.vehicle_status ? 'green' : 'red',
                        fontFamily: 'Inter-Regular',
                      }}>
                      {selectedHistory.vehicle_status}
                    </Text>
                  </Text>
                </ScrollView>

                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    backgroundColor: colors.Brown,
                    borderRadius: 10,
                    marginTop: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={closeModal}>
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'Inter-Regular',
                      fontSize: 16,
                    }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SearchVehicle;

const styles = StyleSheet.create({});
