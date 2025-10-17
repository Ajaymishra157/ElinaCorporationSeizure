import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ENDPOINTS } from '../CommonFiles/Constant';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import colors from '../CommonFiles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchHistoryShimmer from '../Component/SearchHistoryShimmer';
import Geocoder from 'react-native-geocoding';
import MapView, { Marker } from 'react-native-maps';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';


Geocoder.init('AIzaSyA_ksjOCGFxVCnhjJ1Zj4BBhJIaD4nlpfM');

const SearchHistory = () => {
  const History = require('../assets/images/history.png');
  const navigation = useNavigation();

  const [SearchHistory, setSearchHistory] = useState([]);
  const [SearchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);

  // Offset-based pagination states
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [ModalFilter, setModalFilter] = useState(false);

  const [selectedHistory, setSelectedHistory] = useState(null);
  const [text, setText] = useState(null);
  const [MapLoading, setMapLoading] = useState(true);

  const [search, setSearch] = useState(true);

  const [isSearchActive, setIsSearchActive] = useState(false);


  const [loading, setLoading] = useState(false);




  const [selectedFilter, setSelectedFilter] = useState('Today'); // Selected filter state
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [Customodal, setCustomodal] = useState(false);
  const [isValidFromDate, setIsValidFromDate] = useState(true);
  const [isValidTillDate, setIsValidTillDate] = useState(true);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showTillDatePicker, setShowTillDatePicker] = useState(false);

  const filters = ['Today', 'Yesterday', 'Month', 'custom'];

  // ✅ Naya state - control karega ki API call kab karna hai
  const [allowAPICall, setAllowAPICall] = useState(true);

  const loadMoreData = () => {
    console.log('📞 LoadMore - Page:', page, 'Loading:', loadingMore, 'AllLoaded:', allLoaded);

    if (loadingMore || allLoaded) {
      console.log('⏸️ Load more blocked');
      return;
    }

    const nextPage = page + 1;
    console.log('🔄 Loading page:', nextPage);

    if (isSearchActive) {
      handleSearch(currentSearch, nextPage);
    } else {
      SearchHistoryApi(fromDate, tillDate, nextPage);
    }
  };

  const getFormattedCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-indexed
    const year = today.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day
      }`;
  };

  // Get the first date of the current month
  const getFirstDateOfCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return `${year}-${month < 10 ? `0${month}` : month}-01`;
  };

  // Get the first date of 3 months ago
  const getFirstDateThreeMonthsAgo = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() - 2; // subtract 2 because JS months start at 0
    let adjustedYear = year;

    if (month < 0) {
      month += 12;      // wrap around
      adjustedYear -= 1; // adjust year
    }

    return `${adjustedYear}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-01`;
  };

  const fixedStartDate = '2025-01-01';

  const [fromDate, setFromDate] = useState(fixedStartDate);
  const [tillDate, setTillDate] = useState(getFormattedCurrentDate());

  // Get formatted yesterday's date
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Subtract one day
    const day = yesterday.getDate();
    const month = yesterday.getMonth() + 1;
    const year = yesterday.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day
      }`;
  };



  const openModal2 = () => {
    setModalFilter(true);
  };

  const closeModal2 = () => {
    setModalFilter(false);
  };


  useEffect(() => {
    if (selectedHistory && selectedHistory.vehicle_location) {
      setMapLoading(true);
      setLocation(null);

      Geocoder.from(selectedHistory.vehicle_location)
        .then(json => {
          if (json.results.length > 0) {
            const location = json.results[0].geometry.location;
            setLocation(location);
          } else {
            setLocation(null);
          }
        })
        .catch(error => {
          console.warn('Geocoding Error:', error);
          setLocation(null);
        })
        .finally(() => {
          setMapLoading(false);
        });
    } else {
      setMapLoading(false);
      setLocation(null);
    }
  }, [selectedHistory]);


  const handleFilterPress = filter => {
    setSelectedFilter(filter); // Update selected filter
    setIsFilterActive(filter !== '');

    let updatedFromDate = '';
    let updatedTillDate = '';

    // Handle date range based on selected filter
    if (filter === 'Today') {
      updatedFromDate = getFormattedCurrentDate();
      updatedTillDate = getFormattedCurrentDate();
      setAllowAPICall(true);
    } else if (filter === 'Yesterday') {
      updatedFromDate = getYesterdayDate();
      updatedTillDate = getYesterdayDate();
      setAllowAPICall(true);
    } else if (filter === 'Month') {
      updatedFromDate = getFirstDateOfCurrentMonth();
      updatedTillDate = getFormattedCurrentDate();
      setAllowAPICall(true);
    } else if (filter === 'custom') {
      setCustomodal(true);
      setIsValidFromDate(true);
      setIsValidTillDate(true);
      setFromDate('');
      setTillDate('');
      setAllowAPICall(false);
    }



    if (filter !== 'custom') {
      setFromDate(updatedFromDate);
      setTillDate(updatedTillDate);
      // SearchHistoryApi(updatedFromDate, updatedTillDate);
    }

    closeModal2();
  };

  useFocusEffect(
    useCallback(() => {
      // if (fromDate && tillDate) {
      if (search == true) {
        setSearchLoading(true);
        SearchHistoryApi(fromDate, tillDate, 1);
      }
      // }
    }, [fromDate, tillDate, search])
  );

  const handleSubmit = () => {
    const isFromDateValid = fromDate !== '';
    const isTillDateValid = tillDate !== '';

    // Set validation states
    setIsValidFromDate(isFromDateValid);
    setIsValidTillDate(isTillDateValid);

    // Check if both dates are valid
    if (!isFromDateValid || !isTillDateValid) {
      return;
    }


    // If both dates are valid, proceed with the API call
    setCustomodal(false); // Close modal after submitting
    setAllowAPICall(true);

  };

  const openModal = item => {
    setSelectedHistory(item); // Set selected item data to show in the modal
    setModalVisible(true); // Show the modal
  };

  const closeModal = () => {
    setModalVisible(false); // Hide the modal
    setSelectedHistory(null); // Clear the selected item data
  };

  const formattedDate = dateString => {
    const date = new Date(dateString); // Convert the string to a Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get the day and ensure it's 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so add 1) and ensure it's 2 digits
    const year = date.getFullYear(); // Get the year

    return `${day}-${month}-${year}`; // Return the formatted date as "DD-MM-YYYY"
  };

  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding leading zero
    const day = String(date.getDate()).padStart(2, '0'); // Adding leading zero
    return `${year}-${month}-${day}`; // New format: "YYYY-MM-DD"
  };

  const handleDateChange = (event, selectedDate, type) => {
    if (event.type === 'dismissed') {
      if (type === 'from') {
        setShowFromDatePicker(false); // Close From Date picker if cancelled
      } else {
        setShowTillDatePicker(false); // Close Till Date picker if cancelled
      }
      return;
    }
    // If selectedDate is null (meaning the user cancelled), don't update the date
    if (!selectedDate) {
      return;
    }

    const currentDate = selectedDate || new Date(); // Default to the selected date or current date
    // ✅ Date change karne par temporarily API call block karein
    setAllowAPICall(false);
    if (type === 'from') {
      setFromDate(formatDate(currentDate)); // Set formatted 'from' date
    } else {
      setTillDate(formatDate(currentDate)); // Set formatted 'till' date
    }

    // Close the date picker after selecting the date
    if (type === 'from') {
      setShowFromDatePicker(false);
    } else {
      setShowTillDatePicker(false);
    }
  };

  const allLoadedRef = useRef(allLoaded);
  // useEffect(() => {
  //   allLoadedRef.current = allLoaded;
  // }, [allLoaded]);

  const SearchHistoryApi = async (fromdate, tilldate, pageNumber = 1) => {
    console.log('Fetching page:', pageNumber, 'from', fromdate, 'to', tilldate, pageNumber);

    const staffId = await AsyncStorage.getItem('staff_id');
    console.log('from date and till date', fromdate, tilldate, staffId);

    if (pageNumber === 1) {
      setSearchLoading(true);
      console.log('⏳ Loading started for first page');
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(ENDPOINTS.search_history_paginate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          from_date: fromdate,
          till_date: tilldate,
          page: pageNumber.toString(),
        }),
      });

      console.log('📨 Response status:', response.status);
      const result = await response.json();
      console.log("✅ API Response - Code:", result.code, "Data length:", result.payload?.length);

      if (result.code === 200) {
        if (pageNumber === 1) {
          setSearchHistory(result.payload || []);
          console.log('🔄 SearchHistory updated with:', result.payload?.length, 'items');
        } else {
          setSearchHistory((prev) => [...prev, ...(result.payload || [])]);
        }

        if (!result.payload || result.payload.length === 0) {
          console.log('📭 No more data, setting allLoaded to true');
          setAllLoaded(true);
        } else {
          setAllLoaded(false);
        }

        setPage(pageNumber);

        if (pageNumber === 1) {
          setHasSearched(true);
        }
      } else {
        console.log('❌ API Error - Code:', result.code, 'Message:', result.message);

        // ✅ ✅ ✅ YEH LINE ADD KARO - 404 aaye toh allLoaded true karo
        if (result.code === 404) {
          console.log('🚫 404 Received - No more pages available');
          setAllLoaded(true);
        }

        if (pageNumber === 1) {
          setSearchHistory([]);
          setHasSearched(true);
        }
      }
    } catch (error) {
      console.log('❌ Fetch Error:', error.message);
      if (pageNumber === 1) {
        setHasSearched(true);
      }
      setSearchHistory([]);
    } finally {
      setLoadingMore(false);
      setSearchLoading(false);
      setRefreshing(false);
      console.log('🏁 API Finished - SearchLoading set to false');
    }
  };

  // ✅ Initial load ke liye allow API call
  // useEffect(() => {
  //   setAllowAPICall(true);
  // }, []);



  const onRefresh = async () => {
    setRefreshing(true);
    setIsFilterActive(false);
    setSelectedFilter('Today');
    const today = getFormattedCurrentDate();
    const three = getFirstDateOfCurrentMonth();

    // Set both from and till date to today
    setFromDate(three);
    setTillDate(today);

    await SearchHistoryApi(three, today, 1);
    await fetchPermissions();

    setRefreshing(false);
  };



  const handleSearch = async (inputText, pageNumber = 1) => {
    if (!inputText || inputText.trim() === '') {
      setIsSearchActive(false);
      setCurrentSearch('');
      setPage(1);
      setAllLoaded(false);
      setSearchLoading(true);
      setHasSearched(false);
      SearchHistoryApi(fromDate, tillDate, 1);
      return;
    }


    const staffId = await AsyncStorage.getItem('staff_id');


    setCurrentSearch(inputText);
    setIsSearchActive(true);
    setHasSearched(true);

    // ✅ Loading state sirf first page ke liye
    if (pageNumber === 1) {
      setSearchLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(ENDPOINTS.search_history_search, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search: inputText,
          staff_id: staffId,
          page: pageNumber.toString(),
        }),
      });

      const result = await response.json();

      if (result.code == 200) {
        if (pageNumber === 1) {
          setSearchHistory(result.payload);
        } else {
          setSearchHistory((prev) => [...prev, ...result.payload]);
        }

        if (result.payload.length === 0) {
          setAllLoaded(true);
        } else {
          setAllLoaded(false);
        }

        setPage(pageNumber);
      } else {
        // ✅ 404 handle karo
        if (result.code === 404) {
          setAllLoaded(true);
        }

        if (pageNumber === 1) setSearchHistory([]);
      }
    } catch (error) {
      console.log('Search API error:', error);
      if (pageNumber === 1) setSearchHistory([]);
    } finally {
      setLoadingMore(false);
      setSearchLoading(false);
    }
  };


  // Update the cross button handler
  const handleClearSearch = async () => {
    console.log('called');
    setText('');
    setIsSearchActive(false);
    setCurrentSearch('');
    setPage(1);
    setAllLoaded(false);
    setHasSearched(false);
    setSearchHistory([]);


    try {

      console.log('🔄 Calling main API with dates:', fromDate, tillDate);
      await SearchHistoryApi(fromDate, tillDate, 1);
      console.log('API finished');
    } catch (e) {
      console.log('API error', e);
      setSearchHistory([]); // Only clear if there's an error
    }
  };

  // Update the search button handler
  const handleSearchPress = () => {
    console.log('🔍 Search Pressed - Text:', text, 'Length:', text?.length);
    if ((text || '').trim() === '') {
      // If search is empty, show all data
      handleClearSearch();
    } else {
      // If search has text, perform search

      // ✅ Data clear karo taaki shimmer dikhe
      handleSearch(text);

    }
  };

  // Update the text change handler
  const handleTextChange = (inputText) => {


    setText(inputText);

    // Agar text empty hai toh immediately data clear karo taaki shimmer dikhe
    if (inputText === '') {
      handleClearSearch();
    }
  };

  const renderItem = ({ item, index }) => (
    <View
      key={item.history_id}
      style={{
        marginTop: 10,
        backgroundColor: '#fff',
        padding: 5,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.Brown,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 2,

        }}
      >
        <View style={{ width: '10%', }}>



          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333',
              fontFamily: 'Inter-Regular',
            }}
          >
            #{index + 1}
          </Text>
        </View>
        <View style={{ width: '80%', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333',
              fontFamily: 'Inter-Regular',
            }}
          >
            {item.history_staff_name || '----'}
          </Text>
        </View>
        <View style={{ width: '10%', }}>
          <TouchableOpacity
            onPress={() => openModal(item)}
            style={{
              padding: 5,
              borderRadius: 50,
              backgroundColor: '#f0f0f0',
              justifyContent: 'center',
              alignItems: 'center',

            }}
          >
            <AntDesign name="infocirlceo" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Use flexWrap: 'wrap' to ensure content wraps to the next line if it overflows */}
      <View style={{ flexDirection: 'row', marginBottom: 5 }}>
        <View style={{ width: '50%', flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, color: '#888', fontFamily: 'Inter-Regular' }}>RegNo</Text>
          <Text style={{ fontSize: 12, color: '#333', fontFamily: 'Inter-Regular' }}> : </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#333',
              fontFamily: 'Inter-Regular',
              flexWrap: 'wrap', // Allow wrapping of long text
            }}
          >
            {item.vehicle_registration_no || '----'}
          </Text>
        </View>

        <View style={{ width: '50%', flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, color: '#888', fontFamily: 'Inter-Regular' }}>Date</Text>
          <Text style={{ fontSize: 12, color: '#333', fontFamily: 'Inter-Regular' }}> : </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#333',
              fontFamily: 'Inter-Regular',
              flexWrap: 'wrap', // Allow wrapping of long text
            }}
          >
            {item.entry_date || '----'}
          </Text>
        </View>
      </View>



      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, color: '#888', fontFamily: 'Inter-Regular' }}>Agg No</Text>
          <Text style={{ fontSize: 12, color: '#333', fontFamily: 'Inter-Regular' }}> : </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#333',
              fontFamily: 'Inter-Regular',
              flexWrap: 'wrap', // Allow wrapping of long text
            }}
          >
            {item.vehicle_agreement_no || '----'}
          </Text>
        </View>


      </View>


      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        <View style={{ width: '80%', flexDirection: 'row' }}>
          <Text style={{ fontSize: 12, color: '#888', fontFamily: 'Inter-Regular' }}>Location</Text>
          <Text style={{ fontSize: 12, color: '#333', fontFamily: 'Inter-Regular' }}> : </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#333',
              fontFamily: 'Inter-Regular',
              flexWrap: 'wrap', // Allow wrapping of long text
            }}
          >
            {item.vehicle_location || '----'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
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
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 15,
            left: 15,
            width: '13%',
            height: 40,
          }}
          onPress={() => {
            navigation.goBack();
          }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Search History
        </Text>
        <View
          style={{
            position: 'absolute',
            top: 15,
            right: 15,


          }}>
          {isFilterActive && (
            <View
              style={{
                position: 'absolute',
                right: -7,
                top: -5,
                width: 8,
                height: 8,
                borderRadius: 5,
                backgroundColor: 'white',
              }}
            />
          )}
          {/* <TouchableOpacity onPress={openModal2}>
            <Image
              source={require('../assets/images/filter.png')} // 👈 apne image ka correct path lagao
              style={{ width: 26, height: 26, tintColor: '#fff' }}
              resizeMode="contain"
            />
          </TouchableOpacity> */}
        </View>

      </View>

      <View style={{ width: '100%', flexDirection: 'row', paddingHorizontal: 10, marginTop: 5 }}>
        {/* Search Box */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            borderWidth: 1,
            borderColor: colors.Brown,
            borderRadius: 8,
            backgroundColor: 'white',
            height: 50,
            paddingHorizontal: 8,
          }}
        >
          <View style={{
            width: 30,  // निश्चित width दी है
            height: 50, // पूरी height ली है
            justifyContent: 'center',
            alignItems: 'center',

          }}>
            <FontAwesome5 name="search" size={15} color="#000" />
          </View>

          <TextInput
            autoCapitalize="words"
            style={{
              flex: 1,
              fontSize: 16,
              fontFamily: 'Inter-Regular',
              color: 'black',
            }}
            placeholder="Search Name/Veh No/Agg No"
            placeholderTextColor="grey"
            value={text}
            // onChangeText={setText} // ✅ typing par sirf text set hoga
            onChangeText={handleTextChange}
          />

          {text ? (
            <TouchableOpacity
              // onPress={() => {
              //   setText('');
              //   setCurrentSearch('');

              //   setPage(1);
              //   setAllLoaded(false);

              //   setSearchLoading(true);   // loader sabse pehle
              //   setSearchHistory([]);     // list clear karo
              //   handleSearch('');
              // }}
              onPress={handleClearSearch}
              style={{
                padding: 6,
                borderRadius: 20,
                backgroundColor: '#f2f2f2',
                marginLeft: 5,
              }}
            >
              <Entypo name="cross" size={15} color="black" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Search Button */}
        <TouchableOpacity
          // onPress={() => {
          //   handleSearch(text);

          //   setSearchLoading(true);
          // }
          // }// ✅ ab yaha click se chalega
          onPress={handleSearchPress}
          style={{
            marginLeft: 8,
            width: 50,
            height: 50,
            borderRadius: 8,
            backgroundColor: colors.Brown,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontAwesome5 name="search" size={15} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B4513', '#8B4513']}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 10 }}>
        {/* Loading Indicator */}
        {SearchLoading ? (
          <SearchHistoryShimmer />
        ) : SearchHistory.length === 0 ? (
          hasSearched ? ( // ✅ Agar search kiya hai aur data nahi mila
            <View style={{ height: 600, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={History} style={{ width: 70, height: 70 }} />
              <Text style={{ fontFamily: 'Inter-Regular', color: 'red', marginTop: 10 }}>
                No Search History Found
              </Text>
            </View>
          ) : ( // ✅ Agar abhi tak search nahi kiya (initial load)
            <SearchHistoryShimmer />
          )
        ) : (
          <FlatList
            data={SearchHistory}
            keyExtractor={(item) => item.history_id.toString()}
            renderItem={renderItem}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color={colors.Brown} style={{ marginVertical: 10 }} />
              ) : allLoaded && SearchHistory.length > 0 ? ( // Only show when there are items
                <Text style={{ textAlign: 'center', padding: 10, color: 'grey', fontFamily: 'Inter-Regular' }}>

                </Text>
              ) : null
            }
          />
        )}

      </ScrollView>
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
              flexDirection: 'row',
              justifyContent: 'flex-end',
              width: '85%',
              paddingVertical: 5,
            }}>
            <TouchableOpacity
              onPress={closeModal}
              style={{
                padding: 7,
                backgroundColor: 'white',
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Entypo name="cross" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 15,
              width: '85%',
              // Ensure modal does not overflow
            }}
            onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
            onTouchEnd={e => e.stopPropagation()}>
            {selectedHistory && (
              <>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    marginBottom: 15,
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: 'Inter-Medium',
                      color: 'black',
                      textAlign: 'center',
                    }}>
                    Search History Details
                  </Text>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 400 }}
                  keyboardShouldPersistTaps="handled">
                  <View style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginBottom: 15
                  }}>
                    {[
                      { label: 'Staff Name', value: selectedHistory.history_staff_name || '-----' },
                      { label: 'Staff Mobile', value: selectedHistory.history_staff_mobile || '-----' },
                      { label: 'Vehicle Agreement No', value: selectedHistory.vehicle_agreement_no || '-----' },
                      { label: 'Vehicle Registration No', value: selectedHistory.vehicle_registration_no || '-----' },
                      { label: 'Entry Date', value: selectedHistory.entry_date || '-----' },
                      { label: 'Vehicle Location', value: selectedHistory.vehicle_location || '-----' },
                    ].map((item, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: 'row',
                          borderBottomWidth: index === 5 ? 0 : 1,
                          borderBottomColor: '#eee',
                          backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                        }}
                      >
                        {/* Label */}
                        <View style={{
                          width: '40%',
                          padding: 12,
                          borderRightWidth: 1,
                          borderRightColor: '#eee',
                        }}>
                          <Text style={{
                            fontSize: 12,
                            fontFamily: 'Inter-SemiBold',
                            color: '#333',
                            textAlign: 'left'
                          }}>
                            {item.label}
                          </Text>
                        </View>

                        {/* Value */}
                        <View style={{
                          width: '60%',
                          padding: 12,
                        }}>
                          <Text style={{
                            fontSize: 12,
                            color: '#666',
                            fontFamily: 'Inter-Regular',
                            textAlign: 'left',
                            flexWrap: 'wrap'
                          }}>
                            {item.value}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>


              </>
            )}
            {/* Map Section */}
            <View style={{ marginTop: 15 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Inter-Medium',
                color: 'black',
                marginBottom: 8
              }}>
                Location Map:
              </Text>

              {MapLoading ? (
                <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.Brown} />
                </View>
              ) : location ? (
                <MapView
                  style={{ width: '100%', height: 200, borderRadius: 8 }}
                  region={{
                    latitude: location.lat,
                    longitude: location.lng,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  onPress={(e) => {
                    // Prevent modal close when map is pressed
                    e.stopPropagation();
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: location.lat,
                      longitude: location.lng,
                    }}
                    title={selectedHistory?.vehicle_location || 'Location'}
                  />
                </MapView>
              ) : (
                <View style={{
                  height: 200,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: '#666',
                    textAlign: 'center',
                    fontFamily: 'Inter-Regular'
                  }}>
                    No Location Found
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* filter modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={ModalFilter}
        onRequestClose={closeModal2}>
        <TouchableWithoutFeedback onPress={closeModal2}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '100%',
                paddingVertical: 5,
              }}>
              <TouchableOpacity
                onPress={closeModal2}
                style={{
                  padding: 7,
                  backgroundColor: 'white',
                  borderRadius: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Entypo name="cross" size={15} color="black" />
              </TouchableOpacity>
            </View>
            <View
              onStartShouldSetResponder={e => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                width: '100%',
                paddingBottom: 40,
              }}>
              <Text
                style={{
                  color: 'black',
                  fontFamily: 'Inter-Medium',
                  fontSize: 18,
                  marginBottom: 10,
                  textAlign: 'left',
                }}>
                Change Date
              </Text>
              {filters.map((filter, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor:
                      selectedFilter === filter ? colors.LightGrey : 'white',
                    padding: 10,
                    width: '100%',
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                    borderRadius: 5,
                  }}
                  onPress={() => handleFilterPress(filter)}>
                  <Text
                    style={{
                      color: selectedFilter === filter ? 'black' : 'black',
                      fontFamily: 'Inter-Regular',
                      fontSize: 16,
                    }}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* custom modal */}

      <Modal visible={Customodal} animationType="slide" transparent={true}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onPress={() => {
            setCustomodal(false);
          }}
          activeOpacity={1}>
          <View
            style={{
              width: '80%',
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
              alignItems: 'center',
            }}
            onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
            onTouchEnd={e => e.stopPropagation()}>
            <View
              style={{
                justifyContent: 'flex-end',
                flexDirection: 'row',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setCustomodal(false);
                }}>
                <Entypo name="cross" size={15} color="black" />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 20,
                fontFamily: 'Inter-Medium',
              }}>
              Custom History
            </Text>

            {/* From and Till Date in a row */}
            <View
              style={{
                marginTop: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 15,
              }}>
              {/* From Date */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    marginBottom: 5,
                    color: 'black',
                    fontFamily: 'Inter-Medium',
                  }}>
                  From Date
                </Text>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: !isValidFromDate ? 'red' : '#cccccc',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => setShowFromDatePicker(true)}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Inter-Regular',
                    }}>
                    {fromDate ? formattedDate(fromDate) : 'Select From Date'}
                  </Text>

                  <Ionicons
                    name="calendar"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
                {!isValidFromDate && (
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 12,
                      fontFamily: 'Inter-Regular',
                    }}>
                    From Date is required
                  </Text>
                )}
              </View>

              {/* Till Date */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    marginBottom: 5,
                    color: 'black',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Till Date
                </Text>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: !isValidTillDate ? 'red' : '#cccccc',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => setShowTillDatePicker(true)}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Inter-Regular',
                    }}>
                    {tillDate ? formattedDate(tillDate) : 'Select Till Date'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowTillDatePicker(true)}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color="black"
                      style={{ marginRight: 10 }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                {!isValidTillDate && (
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 12,
                      fontFamily: 'Inter-Regular',
                    }}>
                    Till Date is required
                  </Text>
                )}
              </View>
            </View>

            {/* Show Date Pickers */}
            {showFromDatePicker && (
              <DateTimePicker
                value={
                  fromDate
                    ? new Date(fromDate.split('/').reverse().join('-'))
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) =>
                  handleDateChange(event, selectedDate, 'from')
                }
                minimumDate={new Date('1900-01-01')} // Allow dates from 1900 or earlier, adjust as per requirement
                maximumDate={new Date()} // Restrict future dates
              />
            )}

            {showTillDatePicker && (
              <DateTimePicker
                value={
                  tillDate
                    ? new Date(tillDate.split('/').reverse().join('-'))
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) =>
                  handleDateChange(event, selectedDate, 'till')
                }
                minimumDate={
                  fromDate
                    ? new Date(fromDate.split('/').reverse().join('-'))
                    : new Date()
                } // Set minimumDate to From Date
                maximumDate={new Date()}
              />
            )}

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
              }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: colors.Brown,
                  borderRadius: 5,
                }}
                onPress={handleSubmit}>
                <Text
                  style={{
                    fontSize: 16,
                    color: 'white',
                    fontFamily: 'Inter-Regular',
                  }}>
                  View
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SearchHistory;

const styles = StyleSheet.create({});
