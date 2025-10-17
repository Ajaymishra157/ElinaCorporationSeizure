import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  ToastAndroid,
  Modal,
  FlatList,
  TextInput,
  Image
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import colors from '../CommonFiles/Colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ENDPOINTS } from '../CommonFiles/Constant';
import Entypo from 'react-native-vector-icons/Entypo';

import EvilIcons from 'react-native-vector-icons/EvilIcons'

const StaffSchedule = () => {
  const Schedule = require('../assets/images/schedule.png');
  const navigation = useNavigation();
  const [staffSchedule, setstaffSchedule] = useState([]);
  const [staffLoading, setstaffLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [InfoModal, SetInfoModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [ConfrimationModal, setConfrimationModal] = useState(false);

  const [data, setData] = useState(staffSchedule.slice(0, 20));  // Load first 20 items initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Keep track of current page for loading data
  const [text, setText] = useState(null);
  const [originalSchedule, setoriginalSchedule] = useState([]);

  useEffect(() => {
    setData(staffSchedule.slice(0, 20)); // Set the initial data (first 20 items)
  }, [staffSchedule]);

  const loadMoreItems = () => {
    if (isLoadingMore) return; // Prevent multiple loads at the same time
    setIsLoadingMore(true);

    // Load next 20 items
    const nextPage = currentPage + 1;
    const nextData = staffSchedule.slice(nextPage * 20, (nextPage + 1) * 20); // Get the next set of 20 items

    // Update the data state
    setData(prevData => [...prevData, ...nextData]);
    setCurrentPage(nextPage); // Increment page number
    setIsLoadingMore(false); // Reset loading state
  };

  const renderItem = ({ item, index }) => (
    <View
      key={item.staff_schedule_id}
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
      {/* Index Column */}
      <View style={{ width: '8%', justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: 'black',
            fontFamily: 'Inter-Regular',
          }}
        >
          {index + 1 || '----'}
        </Text>
      </View>

      {/* Name Column */}
      <View style={{ width: '32%', justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: 'black',
            fontFamily: 'Inter-Regular',
            flexWrap: 'wrap',
            textTransform: 'uppercase'
          }}
        >
          {item.schedule_staff_name || '----'}
        </Text>
        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: 'black',
            fontFamily: 'Inter-Regular',
            flexWrap: 'wrap',
          }}
        >
          {item.schedule_staff_mobile || '----'}
        </Text>
      </View>

      {/* Date Column */}
      <View style={{ width: '35%', justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: 'black',
            fontFamily: 'Inter-Regular',
          }}
        >
          {formatDate(item.schedule_staff_start_date) || '----'}
        </Text>
        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: 'black',
            fontFamily: 'Inter-Regular',
          }}
        >
          {formatDate(item.schedule_staff_end_date) || '----'}
        </Text>
      </View>

      {/* Total Days Column */}
      <View style={{ width: '12.5%', justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: 'black',
            fontFamily: 'Inter-Regular',
          }}
        >
          {item.schedule_staff_total_day || '----'}
        </Text>
      </View>

      {/* Actions Column */}
      <View style={{ width: '12.5%', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => OpenModal(item)}
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Entypo name="dots-three-vertical" size={18} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

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

  const handleDelete = () => {
    setConfrimationModal(true);
    handleCloseModal();
    // Call Delete API with the selected staff ID
  };

  const closeconfirmodal = () => {
    setConfrimationModal(false); // Hide the modal
  };

  const handleEdit = () => {
    navigation.navigate('AddScheduleScreen', {
      staff_id: selectedStaff.staff_id,
      Schedule_id: selectedStaff.staff_schedule_id,
      staff_name: selectedStaff.schedule_staff_name,
      start_date: selectedStaff.schedule_staff_start_date,
      end_date: selectedStaff.schedule_staff_end_date,
    });
    handleCloseModal(); // Close the modal after action
  };

  const StaffScheduleApi = async () => {
    setstaffLoading(true);
    try {
      const response = await fetch(ENDPOINTS.Staff_Schedule_List, {
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
          setstaffSchedule(result.payload); // Successfully received data
          setoriginalSchedule(result.payload);
        } else {
          console.log('Error:', 'Failed to load staff data');
        }
      } else {
        console.log('HTTP Error:', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    } finally {
      setstaffLoading(false);
    }
  };

  const DeleteStaffApi = async scheduleId => {
    console.log(' DeleteStaffApi scheduleId', scheduleId);
    try {
      const response = await fetch(ENDPOINTS.Delete_Schedule, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_schedule_id: scheduleId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.code === 200) {
          ToastAndroid.show(
            'Schedule Deleted Successfully',
            ToastAndroid.SHORT,
          );
          StaffScheduleApi();
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

  // useEffect(() => {
  //   StaffScheduleApi();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      StaffScheduleApi();
    }, []), // Empty array ensures this is called only when the screen is focused
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await StaffScheduleApi();
    setRefreshing(false);
  };

  const formatDate = date => {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleTextChange = (inputText) => {
    setText(inputText);

    // If inputText is empty, show the original data
    if (inputText === '') {
      setstaffSchedule(originalSchedule);  // Reset to original data
    } else {
      // Filter data based on Name, Reg No, or Agg No
      const filtered = originalSchedule.filter(item => {
        const lowerCaseInput = inputText.toLowerCase();
        return (
          item.schedule_staff_name.toLowerCase().includes(lowerCaseInput) ||
          item.schedule_staff_mobile.toLowerCase().includes(lowerCaseInput)

        );
      });

      setstaffSchedule(filtered); // Update filtered data state
    }
  };

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
          Staff Schedule
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

            placeholder="Search Schedule/Mobile no"
            placeholderTextColor="grey"
            value={text}
            onChangeText={handleTextChange}
          />
          {text ? (
            <TouchableOpacity
              onPress={() => {

                setText(''); // Clear the search text
                setstaffSchedule(originalSchedule);

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
      {/* Table Header */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#ddd',
          padding: 7,
          borderRadius: 5,
        }}
      >
        {/* Sr No */}
        <View style={{ width: '8%', justifyContent: 'center', alignItems: 'center' }}>
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

        {/* Name */}
        <View style={{ width: '32%', justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
              textAlign: 'center',
              fontSize: 14,
              color: 'black',
            }}
          >
            Name
          </Text>
        </View>

        {/* Schedule Date */}
        <View style={{ width: '35%', justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
              textAlign: 'center',
              fontSize: 14,
              color: 'black',
            }}
          >
            Schedule Date
          </Text>
        </View>

        {/* Days */}
        <View style={{ width: '12.5%', justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
              textAlign: 'center',
              fontSize: 14,
              color: 'black',
            }}
          >
            Days
          </Text>
        </View>

        {/* Empty Placeholder */}
        <View style={{ width: '12.5%', justifyContent: 'center', alignItems: 'center' }} />
      </View>



      <FlatList
        keyboardShouldPersistTaps='handled'
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.staff_schedule_id.toString()}
        onEndReached={loadMoreItems} // Trigger loading more items when scrolled to bottom
        onEndReachedThreshold={0.5} // This determines how far from the bottom before triggering loadMoreItems
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ padding: 10, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#0000ff" /> {/* Loader while fetching more items */}
            </View>
          ) : null
        }
        ListEmptyComponent={
          staffLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
              <ActivityIndicator size="large" color={colors.Brown} />
            </View>
          ) : (
            <View style={{ height: 600, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' }}>
              <Image source={Schedule} style={{ width: 70, height: 70 }} />
              <Text style={{ fontFamily: 'Inter-Regular', color: 'red', marginTop: 10 }}>
                No Schedule Found
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoadingMore}  // Show loader during pull-to-refresh
            onRefresh={loadMoreItems} // Pull to refresh to load more data
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
            navigation.navigate('AddScheduleScreen');
          }}>
          <AntDesign name="plus" color="white" size={18} />
        </TouchableOpacity>
      </View>

      {/* <Modal
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
                    backgroundColor: 'white',
                    padding: 10,
                    borderRadius: 15,
                    width: '80%',
                    alignItems: 'center',
                    elevation: 5, // Adds shadow for Android
                    shadowColor: '#000', // Shadow for iOS
                    shadowOffset: {width: 0, height: 2},
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
                    <TouchableOpacity
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
                    </TouchableOpacity>
                  </View>
                  <View style={{gap: 15, width: '100%'}}>
                    <TouchableOpacity
                      style={{
                        borderColor: 'red',
                        borderWidth: 1,
                        borderRadius: 10,
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 12,
                        flexDirection: 'row',
                        gap: 15,
                      }}
                      onPress={handleDelete}
                      >
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
                      onPress={handleEdit}
                      >
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
                      <AntDesign name="infocirlceo" size={20} color="black" />
      
                      <Text
                        style={{
                          color: 'black',
                          fontFamily: 'Inter-Regular',
                          fontSize: 16,
                        }}>
                        Information Staff
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal> */}

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
                <AntDesign name="infocirlceo" size={20} color="black" />

                <Text
                  style={{
                    color: 'black',
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                  }}>
                  Information Schedule
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
                  Update Schedule
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
                  paddingVertical: 12,
                  flexDirection: 'row',
                  gap: 15,
                  marginTop: 10,
                }}
                onPress={handleDelete}>
                <AntDesign name="delete" size={24} color="red" />
                <Text
                  style={{
                    color: 'red',
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                  }}>
                  Delete Schedule
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
                    Staff Schedule information
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
                    {selectedStaff.schedule_staff_name || '-----'}
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
                    {selectedStaff.schedule_staff_mobile || '-----'}
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
                      From Date:{' '}
                    </Text>
                    {formatDate(selectedStaff.schedule_staff_start_date) ||
                      '-----'}
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
                      End Date:{' '}
                    </Text>
                    {formatDate(selectedStaff.schedule_staff_end_date) ||
                      '-----'}
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
                    {selectedStaff.schedule_staff_entry_date || '-----'}
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
                      Total Days:{' '}
                    </Text>
                    {selectedStaff.schedule_staff_total_day || '-----'}
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
                        color: selectedStaff.schedule_staff_status
                          ? 'green'
                          : 'red',
                        fontFamily: 'Inter-Regular',
                      }}>
                      {selectedStaff.schedule_staff_status || '-----'}
                    </Text>
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
                      Payment Status:{' '}
                    </Text>
                    <Text
                      style={{
                        color:
                          selectedStaff.schedule_staff_payment_status ==
                            'Unpaid'
                            ? 'red'
                            : 'green',
                        fontFamily: 'Inter-Regular',
                      }}>
                      {selectedStaff.schedule_staff_payment_status || '-----'}
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
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'black', fontFamily: 'Inter-Medium' }}>
              Confirm Delete
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
              Are you sure you want to delete the Schedule ?
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
                  DeleteStaffApi(selectedStaff.staff_schedule_id);
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
    </View>
  );
};

export default StaffSchedule;
