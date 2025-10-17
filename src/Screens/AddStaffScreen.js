import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import colors from '../CommonFiles/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ENDPOINTS } from '../CommonFiles/Constant';
import DeviceInfo from 'react-native-device-info';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';

const AddStaffScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    staff_id,
    staff_name,
    staff_email,
    staff_mobile,
    staff_address,
    staff_password,
    staff_type,
  } = route.params || {};

  // State variables for inputs
  const [staffName, setStaffName] = useState(staff_name || '');
  const [staffEmail, setStaffEmail] = useState(staff_email || '');
  const [staffMobile, setStaffMobile] = useState(staff_mobile || '');
  const [staffAddress, setStaffAddress] = useState(staff_address || '');
  const [staffPassword, setStaffPassword] = useState(staff_password || '');

  const [staffId, setstaffId] = useState(staff_id || '');

  const [scheduleType, setScheduleType] = useState('1 day');

  const [showPassword, setShowPassword] = useState(false);

  const [StaffLoading, setStaffLoading] = useState(false);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Track dropdown visibility
  const [selectedType, setSelectedType] = useState(staff_type || 'normal'); // Store selected type
  console.log("type ye hai", selectedType)
  const [SelectedId, setSelectedId] = useState(
    selectedType === 'Admin' ? 'main' : 'normal',
  );

  console.log('selectedid', SelectedId);
  console.log('selected type', selectedType, staff_type);
  const [dropdownData] = useState([
    { label: 'Field Staff', value: 'normal' },
    { label: 'Admin Staff', value: 'main' },
  ]); // Static data for dropdown

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelect = staff => {
    const { staff_id, staff_name } = staff;
    setSelectedType(staff_name);
    setSelectedId(staff_id);
    setIsDropdownVisible(false); // Close the dropdown after selection
  };

  const [myDeviceId, setMyDeviceId] = useState(null);
  console.log('myDeviceId', myDeviceId);

  // Error states for each field
  const [staffNameError, setStaffNameError] = useState('');
  const [staffMobileError, setStaffMobileError] = useState('');
  const [SubmitError, setSubmitError] = useState('');
  const [EmailError, setEmailError] = useState('');
  const [staffPasswordError, setStaffPasswordError] = useState('');

  useEffect(() => {
    // Fetch the unique device ID
    DeviceInfo.getUniqueId()
      .then(uniqueId => {
        setMyDeviceId(uniqueId);
        console.log('Device ID:', uniqueId);
      })
      .catch(error => {
        console.error('Error fetching device ID:', error);
      });
  }, []);

  // const onSelectImage = async () => {
  //   Alert.alert('Choose Medium', 'Choose option', [
  //     {
  //       text: 'Camera',
  //       onPress: () => onCamera(),
  //     },
  //     {
  //       text: 'Gallery',
  //       onPress: () => onGallery(),
  //     },
  //     {
  //       text: 'Cancel',
  //       onPress: () => {},
  //     },
  //   ]);
  // };

  // Camera se image lene ka function
  // const onCamera = async () => {
  //   try {
  //     const image = await ImagePicker.openCamera({
  //       cropping: true, // Agar aap image crop karna chahte hain
  //       width: 300, // Custom width
  //       height: 300, // Custom height
  //       compressImageMaxWidth: 500, // Max width for the image
  //       compressImageMaxHeight: 500, // Max height for the image
  //       compressImageQuality: 0.7, // Quality setting for the image
  //     });

  //     if (image && image.path) {
  //       // Read the image file as base64 using RNFS
  //       const base64Data = await RNFS.readFile(image.path, 'base64');
  //       const mimeType = image.mime; // image mime type (e.g., image/jpeg)
  //       const base64Image = `data:${mimeType};base64,${base64Data}`;

  //       setStaffImage(base64Image); // Set the base64 image in state
  //     } else {
  //       console.log('Image not selected or invalid');
  //     }
  //   } catch (error) {
  //     console.log('Error picking image from camera:', error);
  //   }
  // };

  // Gallery se image lene ka function
  // const onGallery = async () => {
  //   try {
  //     const image = await ImagePicker.openPicker({
  //       cropping: true, // Agar aap image crop karna chahte hain
  //       width: 300, // Custom width
  //       height: 300, // Custom height
  //       compressImageMaxWidth: 500, // Max width for the image
  //       compressImageMaxHeight: 500, // Max height for the image
  //       compressImageQuality: 0.7, // Quality setting for the image
  //     });

  //     if (image && image.path) {
  //       // Read the image file as base64 using RNFS
  //       const base64Data = await RNFS.readFile(image.path, 'base64');
  //       const mimeType = image.mime; // image mime type (e.g., image/jpeg)
  //       const base64Image = `data:${mimeType};base64,${base64Data}`;

  //       setStaffImage(base64Image); // Set the base64 image in state
  //     } else {
  //       console.log('Image not selected or invalid');
  //     }
  //   } catch (error) {
  //     console.log('Error picking image from gallery:', error);
  //   }
  // };

  const UpdateStaffApi = async () => {
    try {
      const response = await fetch(ENDPOINTS.List_Staff, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_name: staffName,
          staff_email: staffEmail,
          staff_mobile: staffMobile,
          staff_password: staffPassword,
          staff_address: staffAddress,
          device_id: myDeviceId,
          staff_type: SelectedId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.code === 200) {
          ToastAndroid.show('Staff Update Successfully', ToastAndroid.SHORT);
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

  const handleSubmit = async () => {

    console.log('selected id hai xxx', SelectedId)
    // Reset all error states before validation
    setStaffNameError('');
    setStaffMobileError('');
    setStaffPasswordError('');

    // Validation for required fields
    let valid = true;

    if (!staffName) {
      setStaffNameError('Staff Name Is Required');
      valid = false;
    }

    if (!staffMobile) {
      setStaffMobileError('Staff Mobile Number Is Required');
      valid = false;
    }

    if (!staffPassword) {
      setStaffPasswordError('Staff Password Is Required');
      valid = false;
    }

    if (valid) {
      try {
        setStaffLoading(true);
        const staffData = {
          staff_name: staffName,
          staff_email: staffEmail,
          staff_mobile: staffMobile,
          staff_password: staffPassword,
          staff_address: staffAddress,
          device_id: myDeviceId,
          staff_type: SelectedId,
          schedule_type: scheduleType,
        };

        // Check if it's an update (i.e., staff_id exists)
        if (staff_id) {
          // If it's an update, include the staff_id in the data
          staffData.staff_id = staff_id;

          const response = await fetch(ENDPOINTS.Update_Staff, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(staffData),
          });

          if (!response.ok) {
            throw new Error('Failed to connect to the server');
          }

          const data = await response.json();
          console.log('Response:', data);

          if (data.code === 200) {
            ToastAndroid.show('Staff Updated Successfully', ToastAndroid.SHORT);
            navigation.goBack();
          } else {
            console.log('Update failed:', data.message);
          }
        } else {
          // If it's an add operation (no staff_id), use the Add API
          const response = await fetch(ENDPOINTS.Add_Staff, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(staffData),
          });

          if (!response.ok) {
            throw new Error('Failed to connect to the server');
          }

          const data = await response.json();
          console.log('Response:', data);

          if (data.code === 200) {
            ToastAndroid.show('Staff Added Successfully', ToastAndroid.SHORT);
            navigation.goBack();
          } else {
            console.log('Add failed:', data.message);
            // Check if the error is related to mobile number already existing
            if (data.message === 'Mobile number already exists') {
              setStaffMobileError('Mobile number already exists'); // Set the error message to state
              // setSubmitError('');
            } else if (data.message === 'Email address already exists') {
              setEmailError('Email address already exists');
            } else if (
              data.message ===
              'Mobile number already exists, Email address already exists'
            ) {
              setSubmitError(
                'Mobile number already exists, Email address already exists',
              );
            }
          }
        }
      } catch (error) {
        console.error('Error:', error.message);
      } finally {
        setStaffLoading(false);
      }
    }
  };

  // const handleSubmit = async () => {
  //   // Reset all error states before validation
  //   setStaffNameError('');
  //   setStaffMobileError('');
  //   setStaffPasswordError('');

  //   // Validation for required fields
  //   let valid = true;

  //   if (!staffName) {
  //     setStaffNameError('Staff Name is required');
  //     valid = false;
  //   }

  //   if (!staffMobile) {
  //     setStaffMobileError('Staff Mobile Number is required');
  //     valid = false;
  //   }

  //   if (!staffPassword) {
  //     setStaffPasswordError('Staff Password is required');
  //     valid = false;
  //   }

  //   if (valid) {
  //     try {
  //       const response = await fetch(ENDPOINTS.Add_Staff, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           staff_name: staffName,
  //           staff_email: staffEmail,
  //           staff_mobile: staffMobile,
  //           staff_password: staffPassword,
  //           staff_address: staffAddress,
  //           device_id: myDeviceId,
  //           staff_type: selectedType,
  //         }),
  //       });

  //       if (!response.ok) {
  //         throw new Error('Failed to connect to the server');
  //       }

  //       const data = await response.json();
  //       console.log('Response:', data);

  //       // Check response status
  //       if (data.code == 200) {
  //         ToastAndroid.show('Staff Add Successfully', ToastAndroid.SHORT);
  //         navigation.navigate('HomeScreen');
  //       } else {
  //       }
  //     } catch (error) {
  //       console.error('Error:', error.message);
  //     } finally {
  //     }
  //   }
  // };
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
          style={{ position: 'absolute', top: 15, left: 15 }}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" color="white" size={26} />
        </TouchableOpacity>

        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          {staff_id ? 'Update Staff' : 'Add Staff'}
        </Text>
      </View>

      {/* Form Section */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ padding: 20 }}>
          {/* Staff Name */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 5,
              fontFamily: 'Inter-Medium',
              color: 'black',
            }}>
            Name
          </Text>
          <TextInput
            value={staffName}
            onChangeText={setStaffName}
            placeholder="Enter Name"
            placeholderTextColor="grey"
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: staffNameError ? 'red' : '#ddd',
              fontSize: 14,
              color: 'black',
            }}
          />
          {staffNameError && (
            <Text
              style={{
                color: 'red',
                fontSize: 12,
                marginBottom: 10,
                fontFamily: 'inter-Regular',
              }}>
              {staffNameError}
            </Text>
          )}

          {/* Staff Email */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 5,
              fontFamily: 'Inter-Medium',
              color: 'black',
            }}>
            Email
          </Text>
          <TextInput
            value={staffEmail}
            onChangeText={setStaffEmail}
            placeholder="Enter Email"
            placeholderTextColor="grey"
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 12,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: EmailError ? 'red' : '#ddd',
              fontSize: 14,
              color: 'black',
            }}
          />
          {EmailError && (
            <Text
              style={{
                color: 'red',
                fontSize: 12,
                marginBottom: 10,
                fontFamily: 'Inter-Regular',
              }}>
              {EmailError}
            </Text>
          )}

          {/* Staff Mobile */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 5,
              fontFamily: 'Inter-Medium',
              color: 'black',
            }}>
            Mobile Number
          </Text>
          <TextInput
            value={staffMobile}
            onChangeText={setStaffMobile}
            placeholder="Enter  Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="grey"
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: staffMobileError ? 'red' : '#ddd',
              fontSize: 14,
              color: 'black',
            }}
          />
          {staffMobileError && (
            <Text
              style={{
                color: 'red',
                fontSize: 12,
                marginBottom: 10,
                fontFamily: 'Inter-Regular',
              }}>
              {staffMobileError}
            </Text>
          )}
          {/* Staff Password */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 5,
              fontFamily: 'Inter-Medium',
              color: 'black',
            }}>
            Password
          </Text>
          <View
            style={{
              position: 'relative',
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 3,
              borderColor: staffPasswordError ? 'red' : '#ddd',
              marginBottom: 10,
              borderWidth: 1,
            }}>
            <TextInput
              style={{
                backgroundColor: '#fff',
                fontSize: 14,
                borderRadius: 8,
                color: 'black',

                paddingRight: 30, // Adds padding to the right so the icon doesn't overlap the text
              }}
              placeholder="Enter  Password"
              placeholderTextColor="grey"
              secureTextEntry={!showPassword}
              value={staffPassword}
              onChangeText={setStaffPassword}
            />

            {/* Eye Icon for Showing/Hiding Password */}
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: [{ translateY: -10 }],
              }}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {staffPasswordError && (
            <Text
              style={{
                color: 'red',
                fontSize: 12,
                marginBottom: 10,
                fontFamily: 'Inter-Regular',
              }}>
              {staffPasswordError}
            </Text>
          )}

          {/* Staff Address */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 5,
              fontFamily: 'Inter-Medium',
              color: 'black',
            }}>
            Address
          </Text>
          <TextInput
            value={staffAddress}
            onChangeText={setStaffAddress}
            placeholder="Enter  Address"
            placeholderTextColor="grey"
            multiline={true}
            numberOfLines={4}
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 12,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: '#ddd',
              fontSize: 14,
              color: 'black',
              textAlignVertical: 'top',
            }}
          />

          {/* Staff Type */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 5,
              fontFamily: 'Inter-Medium',
              color: 'black',
            }}>
            Type
          </Text>

          {/* Type Dropdown */}
          <View style={{}}>
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  padding: 12,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderColor: '#ddd',
                  borderWidth: 1,
                }}
                onPress={toggleDropdown}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Inter-Regular',
                    color: selectedType ? 'black' : '#777',
                  }}>
                  {selectedType === 'normal' ||
                    selectedType === 'Field Staff' ||
                    selectedType === 'Field' ? (
                    <Text>Field Staff</Text>
                  ) : selectedType === 'Admin' ||
                    selectedType === 'Admin Staff' ||
                    selectedType === 'main' ? (
                    <Text>Admin Staff</Text>
                  ) : (
                    <Text>Select Type</Text>
                  )}
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
                    borderColor: '#ddd',
                    borderWidth: 1,
                    zIndex: 1,
                    marginTop: 2,
                  }}>
                  <FlatList
                    data={dropdownData}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{
                          padding: 12,
                          borderBottomColor: '#ddd',
                          borderBottomWidth: 1,
                        }}
                        onPress={() =>
                          handleSelect({
                            staff_id: item.value,
                            staff_name: item.label,
                          })
                        }>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'Inter-Regular',
                            color: 'black',
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
          </View>
          {/* Schedule Type - Radio Buttons */}
          {!staff_id && ( // If staff_id is NOT present, show the Schedule Type block
            <>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  marginBottom: 5,
                  fontFamily: 'Inter-Medium',
                  color: 'black',
                  marginTop: 5,
                }}>
                Schedule Type
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 15,
                  marginTop: 5,
                  width: '50%',
                  justifyContent: 'space-between',
                }}>
                {/* Radio Button for 1 Day */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 20,
                  }}
                  onPress={() => setScheduleType('1 day')}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 50,
                      borderWidth: 2,
                      borderColor: '#ddd',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {scheduleType === '1 day' && (
                      <View
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: 50,
                          backgroundColor: colors.Brown,
                        }}></View>
                    )}
                  </View>
                  <Text
                    style={{
                      marginLeft: 10,
                      fontSize: 15,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    1 Day
                  </Text>
                </TouchableOpacity>

                {/* Radio Button for 1 Month */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => setScheduleType('1 month')}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 50,
                      borderWidth: 2,
                      borderColor: '#ddd',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {scheduleType === '1 month' && (
                      <View
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: 50,
                          backgroundColor: colors.Brown,
                        }}></View>
                    )}
                  </View>
                  <Text
                    style={{
                      marginLeft: 10,
                      fontSize: 15,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    1 Month
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        {/* Submit Button */}
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
          {StaffLoading ? (
            <View>
              <ActivityIndicator size="small" color={'#3b82f6'} />
            </View>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: colors.Brown,
                padding: 15,
                borderRadius: 8,
                alignItems: 'center',
                marginHorizontal: 20,
              }}
              onPress={handleSubmit}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontFamily: 'Inter-Medium',
                }}>
                Submit
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {SubmitError && (
              <Text
                style={{
                  color: 'red',
                  fontSize: 13,
                  marginTop: 10,
                  fontFamily: 'Inter-Regular',
                }}>
                {SubmitError}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddStaffScreen;

const styles = StyleSheet.create({});
