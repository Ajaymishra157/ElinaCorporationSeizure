import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  ToastAndroid,
  Modal,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Header from '../Component/Header';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ENDPOINTS } from '../CommonFiles/Constant';
import colors from '../CommonFiles/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import EvilIcons from 'react-native-vector-icons/EvilIcons'

const HomeScreen = () => {
  const phone = require('../assets/images/phone.png');
  const account = require('../assets/images/user.png');
  const Staff = require('../assets/images/team.png');
  const navigation = useNavigation();
  const [StaffList, setStaffList] = useState([]);
  const [StaffLoading, setStaffLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [InfoModal, SetInfoModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [ConfrimationModal, setConfrimationModal] = useState(false);
  const [ResetModal, setResetModal] = useState(false);

  const [data, setData] = useState(StaffList.slice(0, 20));  // Load first 20 items initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  console.log("loading hai kya", isLoadingMore);
  const [currentPage, setCurrentPage] = useState(1); // Keep track of current page for loading data

  const [AdminCount, setAdminCount] = useState('');
  const [text, setText] = useState(null);
  const [originalStaffData, setoriginalStaffData] = useState([]);

  const [FieldCount, setFieldCount] = useState('');

  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedStaffName, setselectedStaffName] = useState(null);
  const [DeviceId, setDeviceId] = useState('');


  const [selectedImage, setSelectedImage] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);



  handleImagePress = () => {
    setModalVisible(true); // Open the modal

  };





  useEffect(() => {
    setData(StaffList.slice(0, 20)); // Set the initial data (first 20 items)
  }, [StaffList]);

  const loadMoreItems = () => {
    if (isLoadingMore || data.length >= StaffList.length) return;

    console.log("Start Loading:", isLoadingMore);
    setIsLoadingMore(true);

    setTimeout(() => {
      const nextPage = currentPage + 1;
      const nextData = StaffList.slice(currentPage * 20, nextPage * 20);

      if (nextData.length === 0) {
        // 🛑 No more data to load
        setIsLoadingMore(false);
        return;
      }

      setData(prevData => [...prevData, ...nextData]);
      setCurrentPage(nextPage);
      setIsLoadingMore(false);

      console.log("Done Loading:", isLoadingMore);
    }, 100); // Delay added for visible spinner + batching fix
  };

  // Initial Data Load
  useEffect(() => {
    loadMoreItems();
  }, []);

  const OpenModal = staff => {
    setSelectedStaff(staff);
    setIsModalVisible(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // Close the modal
  };

  const closeModal = () => {
    SetInfoModal(false); // Hide the modal
  };

  const closeconfirmodal = () => {
    setConfrimationModal(false); // Hide the modal
  };
  const closeResetModal = () => {
    setResetModal(false); // Hide the modal
  };

  const OpenResetModal = (item) => {
    setSelectedStaffId(item.staff_id);
    setselectedStaffName(item.staff_name);
    setDeviceId(item.device_id);
    setResetModal(true); // Hide the modal
  };




  const handleEdit = () => {
    navigation.navigate('AddStaffScreen', {
      staff_id: selectedStaff.staff_id,
      staff_name: selectedStaff.staff_name,
      staff_email: selectedStaff.staff_email,
      staff_mobile: selectedStaff.staff_mobile,
      staff_address: selectedStaff.staff_address,
      staff_password: selectedStaff.staff_password,
      staff_type: selectedStaff.staff_type,
    });
    handleCloseModal(); // Close the modal after action
  };

  // const handleDelete = () => {
  //   DeleteStaffApi(selectedStaff.staff_id); // Call Delete API with the selected staff ID
  //   handleCloseModal(); // Close the modal after action
  // };

  const handleDelete = () => {
    setConfrimationModal(true);
    handleCloseModal();
    // Call Delete API with the selected staff ID
  };

  const DeleteStaffApi = async staffId => {
    console.log('staffId', staffId);
    try {
      const response = await fetch(ENDPOINTS.Delete_Staff, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: staffId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.code === 200) {
          ToastAndroid.show('Staff Deleted Successfully', ToastAndroid.SHORT);
          fetchData();
        } else {
          console.log('Error:', 'Failed to load staff data');
        }
      } else {
        console.log('HTTP Error:', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    } finally {
    }
  };

  const fetchData = async () => {
    setStaffLoading(true);
    try {
      const response = await fetch(ENDPOINTS.List_Staff, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // trainer_id: trainerId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.code === 200) {
          setStaffList(result.payload); // Successfully received data
          setAdminCount(result.count_admin);
          setFieldCount(result.count_filed);
          setoriginalStaffData(result.payload);
        } else {
          console.log('Error:', 'Failed to load staff data');
        }
      } else {
        console.log('HTTP Error:', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    } finally {
      setStaffLoading(false);
    }
  };


  const DeviceIdReset = async (Id) => {

    try {
      const response = await fetch(ENDPOINTS.reset_Device_Id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: Id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.code === 200) {
          ToastAndroid.show("Reset Device Id successfully", ToastAndroid.SHORT);
          setResetModal(false);
        } else {
          console.log('Error:', 'Failed to load staff data');
        }
      } else {
        console.log('HTTP Error:', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    } finally {

    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []), // Empty array ensures this is called only when the screen is focused
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleTextChange = (inputText) => {
    setText(inputText);

    // If inputText is empty, show the original data
    if (inputText === '') {
      setStaffList(originalStaffData);  // Reset to original data
    } else {
      // Filter data based on Name, Reg No, or Agg No
      const filtered = originalStaffData.filter(item => {
        const lowerCaseInput = inputText.toLowerCase();
        return (
          item.staff_name.toLowerCase().includes(lowerCaseInput) ||
          item.staff_mobile.toLowerCase().includes(lowerCaseInput)

        );
      });

      setStaffList(filtered); // Update filtered data state
    }
  };




  // const renderItem = ({ item, index }) => (
  //   <View
  //     key={item.staff_id}
  //     style={{
  //       flexDirection: 'row',
  //       backgroundColor: '#fff',
  //       padding: 10,
  //       marginBottom: 7,
  //       borderRadius: 5,
  //       borderWidth: 1,
  //       borderColor: '#ddd',
  //       alignItems: 'center',
  //     }}
  //   >
  //     {/* Index Column */}
  //     <View style={{ width: '8%', justifyContent: 'center', alignItems: 'center' }}>
  //       <Text
  //         style={{
  //           fontSize: 12,
  //           textAlign: 'center',
  //           color: 'black',
  //           fontFamily: 'Inter-Regular',
  //         }}
  //       >
  //         {index + 1 || '----'}
  //       </Text>
  //     </View>

  //     {/* Name Column */}
  //     <View style={{ width: '30%', justifyContent: 'center', alignItems: 'center' }}>
  //       <Text
  //         style={{
  //           fontSize: 12,
  //           textAlign: 'center',
  //           color: 'black',
  //           fontFamily: 'Inter-Regular',
  //           textTransform: 'uppercase'
  //         }}
  //       >
  //         {item.staff_name || '----'}
  //       </Text>
  //       <Text
  //         style={{
  //           fontSize: 12,
  //           textAlign: 'center',
  //           color: 'black',
  //           fontFamily: 'Inter-Regular',
  //         }}
  //       >
  //         {item.staff_mobile || '----'}
  //       </Text>
  //       <Text
  //         style={{
  //           fontSize: 12,
  //           textAlign: 'center',
  //           color: 'black',
  //           fontFamily: 'Inter-Regular',
  //         }}
  //       >
  //         {item.staff_type == 'normal' ? 'User' : item.staff_type || '----'}
  //       </Text>
  //     </View>



  //     {/* Staff Date Column */}
  //     <View style={{ width: '27%', justifyContent: 'center', alignItems: 'center' }}>
  //       <Text
  //         style={{
  //           fontSize: 12,
  //           textAlign: 'center',
  //           color: 'black',
  //           fontFamily: 'Inter-Regular',
  //           textTransform: 'uppercase',
  //         }}
  //       >
  //         {item.staff_entry_date || '----'}
  //       </Text>
  //     </View>
  //     <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center' }}>
  //       {/* Reset Button */}
  //       <TouchableOpacity
  //         style={{
  //           backgroundColor: 'white', // Tomato color
  //           paddingVertical: 5,
  //           paddingHorizontal: 10,
  //           borderRadius: 5,
  //           borderWidth: 1,
  //           borderColor: colors.Brown,
  //           flexDirection: 'row',
  //           justifyContent: 'center',
  //           alignItems: 'center',
  //           gap: 5
  //         }}
  //         onPress={() => OpenResetModal(item)}
  //       >
  //         <Text style={{ color: colors.Brown, fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter-Medium' }}>
  //           Reset
  //         </Text>
  //         <Image source={phone} style={{ width: 21, height: 21, tintColor: colors.Brown }} />
  //       </TouchableOpacity>

  //     </View>


  //     {/* Actions Column */}
  //     <View style={{ width: '10%', justifyContent: 'center', alignItems: 'flex-end' }}>
  //       <TouchableOpacity
  //         onPress={() => OpenModal(item)}
  //         style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
  //       >
  //         <Entypo name="dots-three-vertical" size={18} color="black" />
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );


  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      key={item.staff_id}
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 7,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}


      activeOpacity={1}
    >
      <View style={{ flexDirection: 'row', width: '50%' }}>
        <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start' }}>
          <TouchableOpacity
            onPress={() => {
              const imgSrc = item.staff_image
                ? { uri: `https://easyreppo.in/${encodeURI(item.staff_image)}` }
                : account;

              setSelectedImage(imgSrc);  // set image
              setModalVisible(true);     // open modal
            }}
            activeOpacity={0.8}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#ccc',
            }}
          >
            <Image
              source={
                item.staff_image
                  ? { uri: `https://easyreppo.in/${encodeURI(item.staff_image)}` }
                  : account
              }
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={{ width: '70%', justifyContent: 'center', alignItems: 'flex-start' }}>

          {/* Name */}
          <Text
            style={{
              fontSize: 12,
              textAlign: 'left',
              color: 'black',
              fontFamily: 'Inter-Regular',
              textTransform: 'uppercase',
            }}
          >
            {item.staff_name || '----'}
          </Text>

          {/* Mobile */}
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: 'black',
              fontFamily: 'Inter-Regular',
            }}
          >
            {item.staff_mobile || '----'}
          </Text>

          {/* User Type */}
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: 'black',
              fontFamily: 'Inter-Regular',
            }}
          >
            {item.staff_type === 'normal' ? 'User' : item.staff_type || '----'}
          </Text>

        </View>

      </View>



      {/* Staff Date Column */}
      {/* <View style={{ width: '22%', justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: 'black',
            fontFamily: 'Inter-Regular',
            textTransform: 'uppercase',
          }}
        >
          {(item.staff_entry_date && item.staff_entry_date.split(' ')[0]) || '----'}

        </Text>
      </View> */}
      <View style={{ width: '72%', flexDirection: 'row', justifyContent: 'flex-start' }}>
        <View style={{ width: '60%', justifyContent: 'center', alignItems: 'flex-end', }}>
          <View style={{ width: '80%', justifyContent: 'center', alignItems: 'center', }}>

            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: colors.Brown,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5
              }}
              onPress={() => OpenResetModal(item)}
            >
              <Text style={{ color: colors.Brown, fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter-Medium' }}>
                Reset
              </Text>
              <Image source={phone} style={{ width: 21, height: 21, tintColor: colors.Brown }} />
            </TouchableOpacity>



          </View>





        </View>


        {/* Actions Column */}
        <TouchableOpacity onPress={() => OpenModal(item)} style={{ width: '20%', justifyContent: 'center', alignItems: 'flex-start' }}>
          <TouchableOpacity
            onPress={() => OpenModal(item)}
            style={{ width: '100%', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 5 }}
          >
            <Entypo name="dots-three-vertical" size={18} color="black" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* <Header
        title="Rajputana Agency"
        // onMenuPress={() => navigation.openDrawer()}
      /> */}
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
          }}
          onPress={() => {
            navigation.goBack();
          }}>
          <Ionicons name="arrow-back" color="white" size={26} />
        </TouchableOpacity>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Staff List
        </Text>
      </View>

      <View style={{ width: '100%', paddingHorizontal: 10 }}>
        <View
          style={{
            width: '100%',

            borderWidth: 1,
            borderColor: colors.Brown,
            marginTop: 5,
            marginBottom: 5,
            borderRadius: 8,
            height: 50,
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: colors.Brown,

          }}>
          <EvilIcons name='search' size={28} color='black' />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              fontFamily: 'Inter-Regular',

              color: 'black',
              height: 50,
            }}

            placeholder="Search Staff Name/Mobile No"
            placeholderTextColor="grey"
            value={text}
            onChangeText={handleTextChange}
          />
          {text ? (
            <TouchableOpacity
              onPress={() => {

                setText(''); // Clear the search text
                setStaffList(originalStaffData);

              }}
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
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#f8f8f8', // Lighter background for better contrast
          paddingVertical: 10, // Adjusted padding for better spacing
          paddingHorizontal: 15,
          borderRadius: 8,
          marginBottom: 8, // Increased bottom margin for better separation
          shadowColor: '#000', // Added shadow for better separation from background
          shadowOpacity: 0.1, // Light shadow effect
          shadowRadius: 5,
          elevation: 2, // For Android shadow
        }}
      >
        <Text style={{ color: 'black', fontFamily: 'Inter-Bold', marginRight: 20 }}>
          Admin: <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>{AdminCount}</Text>
        </Text>
        <Text style={{ color: 'black', fontFamily: 'Inter-Bold' }}>
          Field: <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>{FieldCount}</Text>
        </Text>
      </View>

      {/* <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#ddd',
          padding: 7,
          borderRadius: 5,
        }}
      >
  
        <View style={{ width: '8%', justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontFamily: 'Inter-Medium',
              textAlign: 'center',
              fontSize: 12,
              color: 'black',
            }}
          >
            #
          </Text>
        </View>


        <View style={{ width: '30%', justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontFamily: 'Inter-Medium',
              textAlign: 'center',
              fontSize: 12,
              color: 'black',
            }}
          >
            NAME
          </Text>
        </View>




   
        <View style={{ width: '27%', justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontFamily: 'Inter-Medium',
              textAlign: 'center', // Center alignment for consistency
              fontSize: 12,
              color: 'black',
            }}
          >
            DATE
          </Text>
        </View>
        <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontFamily: 'Inter-Medium',
              textAlign: 'center', // Center alignment for consistency
              fontSize: 12,
              color: 'black',
            }}
          >

          </Text>
        </View>


        <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }} />
      </View> */}





      <FlatList
        keyboardShouldPersistTaps='handled'
        data={StaffList.slice(0, currentPage * 20)}
        renderItem={renderItem}
        onEndReached={loadMoreItems} // Trigger when scrolled to the bottom
        onEndReachedThreshold={0.5} // This determines when to trigger loadMoreItems (0.5 means half the list height)
        keyExtractor={(item) => item.staff_id.toString()}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ padding: 10, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.Brown} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          StaffLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.Brown} />
            </View>
          ) : (
            <View style={{ height: 600, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={Staff} style={{ width: 70, height: 70 }} />
              <Text style={{ fontFamily: 'Inter-Regular', color: 'red', marginTop: 10 }}>
                No Staff Found
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9Bd35A', '#689F38']}
          />
        }
        contentContainerStyle={{
          paddingBottom: 45,
          backgroundColor: 'white',
        }}
      />



      {/* Sticky Add New Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 30,
          width: 60, // Set the width and height equal for a perfect circle
          height: 60, // Set height equal to the width
          zIndex: 1,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.Brown,
            borderRadius: 30, // Set borderRadius to half of width/height for a circle
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 7,
          }}
          onPress={() => {
            navigation.navigate('AddStaffScreen');
          }}>
          <AntDesign name="plus" color="white" size={18} />
        </TouchableOpacity>
      </View>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          activeOpacity={1}
          onPress={handleCloseModal}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              width: '80%',
              paddingVertical: 5,
            }}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={{
                marginRight: 5,
                backgroundColor: 'white',
                borderRadius: 50,
              }}>
              <Entypo name="cross" size={25} color="black" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: 'white',
              padding: 10,
              borderRadius: 15,
              width: '80%',
              alignItems: 'center',
              elevation: 5, // Adds shadow for Android
              shadowColor: '#000', // Shadow for iOS
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            }}
            onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
            onTouchEnd={e => e.stopPropagation()}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 20,
                  color: 'black',
                  fontFamily: 'Inter-Regular',
                }}>
                Select Action
              </Text>
              {/* <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 0,
                  top: -8,
                  width: '15%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                onPress={handleCloseModal}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: 'black',
                    fontFamily: 'Inter-Regular',
                  }}>
                  ×
                </Text>
              </TouchableOpacity> */}
            </View>
            <View style={{ gap: 3, width: '80%' }}>
              {/* Info Staff Button */}
              <TouchableOpacity
                style={{
                  borderColor: colors.Brown,
                  borderWidth: 1,
                  borderRadius: 10,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 12,
                  marginTop: 10,
                  flexDirection: 'row',
                  gap: 15,
                }}
                onPress={() => {
                  SetInfoModal(true);
                  setIsModalVisible(false);
                }}>
                <AntDesign name="infocirlceo" size={20} color={colors.Brown} />

                <Text
                  style={{
                    color: 'black',
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                  }}>
                  Information Staff
                </Text>
              </TouchableOpacity>

              {/* Update Leave Button */}
              <TouchableOpacity
                style={{
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 10,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 12,
                  marginTop: 10,
                  flexDirection: 'row',
                  gap: 15,
                }}
                onPress={handleEdit}>
                <AntDesign name="edit" size={24} color="Black" />
                <Text
                  style={{
                    color: 'black',
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                  }}>
                  Update Staff
                </Text>
              </TouchableOpacity>
              {/* Delete Leave Button */}
              <TouchableOpacity
                style={{
                  borderColor: 'red',
                  borderWidth: 1,
                  borderRadius: 10,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  gap: 15,
                }}
                onPress={handleDelete}>
                <AntDesign name="delete" size={24} color="red" />
                <Text
                  style={{
                    color: 'red',
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                  }}>
                  Delete Staff
                </Text>
              </TouchableOpacity>


            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={InfoModal} transparent={true} animationType="slide">
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
                marginRight: 5,
                backgroundColor: 'white',
                borderRadius: 50,
              }}>
              <Entypo name="cross" size={25} color="black" />
            </TouchableOpacity>
          </View>
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
            {selectedStaff && (
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
                    Staff information
                  </Text>

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
                    {selectedStaff.staff_name || '-----'}
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
                      Mobile No:{' '}
                    </Text>
                    {selectedStaff.staff_mobile || '-----'}
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
                      Email:{' '}
                    </Text>
                    {selectedStaff.staff_email || '-----'}
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
                    {selectedStaff.staff_entry_date || '-----'}
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
                      Staff Type:{' '}
                    </Text>
                    {selectedStaff.staff_type || '-----'}
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
                      Staff Status:{' '}
                    </Text>
                    <Text
                      style={{
                        color: selectedStaff.staff_status ? 'green' : 'red',
                        fontFamily: 'Inter-Regular',
                      }}>
                      {selectedStaff.staff_status || '-----'}
                    </Text>
                  </Text>
                </ScrollView>

                {/* <TouchableOpacity
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
                </TouchableOpacity> */}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

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
              Confirm Delete
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
              Are you sure you want to delete the staff ?
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
                onPress={() => {
                  DeleteStaffApi(selectedStaff.staff_id);
                  closeconfirmodal();
                }}>
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
        visible={ResetModal}
        onRequestClose={closeResetModal}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onPress={closeResetModal}
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
              Reset Device
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
              Are you sure To Delete This Staff Device Id ?
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
              {selectedStaffName || '------'}
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
              {DeviceId || '------'}
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
                onPress={closeResetModal}>
                <Text
                  style={{
                    color: 'black',
                    fontWeight: 'bold',
                    fontFamily: 'Inter-Regular',
                  }}>
                  Cancle
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
                onPress={() => {

                  if (selectedStaffId) {
                    DeviceIdReset(selectedStaffId); // Pass staff ID here
                  }
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontFamily: 'Inter-Regular',
                  }}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>


      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          activeOpacity={1}
          onPress={handleCloseModal}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              width: '80%',
              paddingVertical: 5,
            }}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={{
                marginRight: 5,
                backgroundColor: 'white',
                borderRadius: 50,
              }}>
              <Entypo name="cross" size={25} color="black" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: 'white',
              padding: 10,
              borderRadius: 15,
              width: '80%',
              alignItems: 'center',
              elevation: 5, // Adds shadow for Android
              shadowColor: '#000', // Shadow for iOS
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            }}
            onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
            onTouchEnd={e => e.stopPropagation()}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 20,
                  color: 'black',
                  fontFamily: 'Inter-Regular',
                }}>
                Select Action
              </Text>
              {/* <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 0,
                  top: -8,
                  width: '15%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                onPress={handleCloseModal}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: 'black',
                    fontFamily: 'Inter-Regular',
                  }}>
                  ×
                </Text>
              </TouchableOpacity> */}
            </View>
            <View style={{ gap: 3, width: '80%' }}>
              {/* Info Staff Button */}
              <TouchableOpacity
                style={{
                  borderColor: colors.Brown,
                  borderWidth: 1,
                  borderRadius: 10,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 12,
                  marginTop: 10,
                  flexDirection: 'row',
                  gap: 15,
                }}
                onPress={() => {
                  SetInfoModal(true);
                  setIsModalVisible(false);
                }}>
                <AntDesign name="infocirlceo" size={20} color={colors.Brown} />

                <Text
                  style={{
                    color: 'black',
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                  }}>
                  Information Staff
                </Text>
              </TouchableOpacity>

              {/* Update Leave Button */}
              <TouchableOpacity
                style={{
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 10,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 12,
                  marginTop: 10,
                  flexDirection: 'row',
                  gap: 15,
                }}
                onPress={handleEdit}>
                <AntDesign name="edit" size={24} color="Black" />
                <Text
                  style={{
                    color: 'black',
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                  }}>
                  Update Staff
                </Text>
              </TouchableOpacity>
              {/* Delete Leave Button */}
              <TouchableOpacity
                style={{
                  borderColor: 'red',
                  borderWidth: 1,
                  borderRadius: 10,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  gap: 15,
                }}
                onPress={handleDelete}>
                <AntDesign name="delete" size={24} color="red" />
                <Text
                  style={{
                    color: 'red',
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                  }}>
                  Delete Staff
                </Text>
              </TouchableOpacity>


            </View>

          </View>



        </TouchableOpacity>
      </Modal>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View
            style={{
              width: '80%',
              height: '40%',
              backgroundColor: 'white',
              borderRadius: 150,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            {selectedImage && (
              <Image
                source={selectedImage}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 150,
                  resizeMode: 'stretch',
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View >
  );
};

export default HomeScreen;
