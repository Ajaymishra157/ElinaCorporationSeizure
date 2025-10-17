import { StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../CommonFiles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ENDPOINTS } from '../CommonFiles/Constant';

const AddArea = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { manage_email_id, manage_area_name, manage_address, manage_id } = route.params || {};
    console.log("all fileds", manage_email_id, manage_area_name)

    // State variables to store input values
    const [area, setArea] = useState(manage_area_name || '');
    const [areaAddress, setAreaAddress] = useState(manage_address || '');
    const [email, setEmail] = useState(manage_id || '');

    // Error states
    const [areaError, setAreaError] = useState('');
    const [areaAddressError, setAreaAddressError] = useState('');
    const [emailError, setEmailError] = useState('');

    // Email validation function
    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    // const handleAddArea = async () => {
    //     let isValid = true;

    //     // Reset error states
    //     setAreaError('');
    //     setAreaAddressError('');
    //     setEmailError('');

    //     // Validation checks
    //     if (!area) {
    //         setAreaError('Area is required');
    //         isValid = false;
    //     }
    //     if (!areaAddress) {
    //         setAreaAddressError('Area address is required');
    //         isValid = false;
    //     }
    //     if (!email) {
    //         setEmailError('Email is required');
    //         isValid = false;
    //     } else if (!validateEmail(email)) {
    //         setEmailError('Please enter a valid email');
    //         isValid = false;
    //     }

    //     // If form is invalid, return early
    //     if (!isValid) return;

    //     try {
    //         const response = await fetch(ENDPOINTS.Add_Area, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 area_name: area,
    //                 address: areaAddress,
    //                 email_id: email,
    //             }),
    //         });

    //         const result = await response.json();

    //         if (result.code === 200) {
    //             // Successfully added area
    //             navigation.goBack(); // Navigate back to the previous screen
    //         } else {
    //             // Error occurred
    //             alert(result.message || 'Failed to add area');
    //         }
    //     } catch (error) {
    //         console.error('Error adding area:', error);
    //     }
    // };

    const handleAddArea = async () => {
        let isValid = true;

        // Reset error states
        setAreaError('');
        setAreaAddressError('');
        setEmailError('');

        // Validation checks
        if (!area) {
            setAreaError('Area is required');
            isValid = false;
        }
        if (!areaAddress) {
            setAreaAddressError('Area address is required');
            isValid = false;
        }
        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            isValid = false;
        }

        // If form is invalid, return early
        if (!isValid) return;

        // If manage_email_id exists, it's an update
        if (manage_email_id) {
            // Update API call
            try {
                const response = await fetch(ENDPOINTS.Update_Area, {
                    method: 'PUT', // PUT method for updating
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        manage_email_id: manage_email_id, // Include manage_email_id for update
                        area_name: area,
                        address: areaAddress,
                        emailid: email,

                    }),
                });

                const result = await response.json();

                if (result.code === 200) {
                    // Successfully updated area
                    navigation.goBack(); // Navigate back to the previous screen
                    ToastAndroid.show("Area Update Successfully", ToastAndroid.SHORT);
                } else {
                    // Error occurred
                    alert(result.message || 'Failed to update area');
                }
            } catch (error) {
                console.error('Error updating area:', error);
            }
        } else {
            // Add API call (if manage_email_id is not provided)
            try {
                const response = await fetch(ENDPOINTS.Add_Area, {
                    method: 'POST', // POST method for adding
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        area_name: area,
                        address: areaAddress,
                        email_id: email,
                    }),
                });

                const result = await response.json();

                if (result.code === 200) {
                    // Successfully added area
                    ToastAndroid.show("Area Added Successfully", ToastAndroid.SHORT);

                    navigation.goBack(); // Navigate back to the previous screen
                } else {
                    // Error occurred
                    alert(result.message || 'Failed to add area');
                }
            } catch (error) {
                console.error('Error adding area:', error);
            }
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                style={{
                    backgroundColor: colors.Brown,
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 15,
                        left: 15,
                        width: '13%',
                    }}
                    onPress={() => {
                        navigation.goBack();
                    }}
                >
                    <Ionicons name="arrow-back" color="white" size={26} />
                </TouchableOpacity>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}
                >
                    {manage_email_id ? 'Update Area' : 'Add Area'}
                </Text>
            </View>

            <View style={{ padding: 20 }}>
                {/* Area Field */}
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 5,
                        fontFamily: 'Inter-Medium',
                        color: 'black',
                    }}
                >
                    Area
                </Text>
                <TextInput
                    style={{
                        backgroundColor: 'white',
                        padding: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.Brown,
                        marginBottom: 5,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                    }}
                    placeholder="Enter Area"
                    placeholderTextColor="#ccc"
                    value={area}
                    onChangeText={setArea}
                />
                {areaError ? (
                    <Text
                        style={{
                            color: 'red',
                            fontSize: 12,
                            fontFamily: 'Inter-Regular',
                        }}
                    >
                        {areaError}
                    </Text>
                ) : null}

                {/* Area Address Field */}
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 5,
                        fontFamily: 'Inter-Medium',
                        color: 'black',
                    }}
                >
                    Area Address
                </Text>
                <TextInput
                    style={{
                        backgroundColor: 'white',
                        padding: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.Brown,
                        marginBottom: 5,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                    }}
                    placeholder="Enter Area Address"
                    placeholderTextColor="#ccc"
                    value={areaAddress}
                    onChangeText={setAreaAddress}
                />
                {areaAddressError ? (
                    <Text
                        style={{
                            color: 'red',
                            fontSize: 12,
                            fontFamily: 'Inter-Regular',
                        }}
                    >
                        {areaAddressError}
                    </Text>
                ) : null}

                {/* Email Field */}
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 5,
                        fontFamily: 'Inter-Medium',
                        color: 'black',
                    }}
                >
                    Email
                </Text>
                <TextInput
                    style={{
                        backgroundColor: 'white',
                        padding: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.Brown,
                        marginBottom: 5,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                    }}
                    placeholder="Enter Email"
                    placeholderTextColor="#ccc"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address" // Set keyboard to email type for better UX
                />
                {emailError ? (
                    <Text
                        style={{
                            color: 'red',
                            fontSize: 12,
                            fontFamily: 'Inter-Regular',
                        }}
                    >
                        {emailError}
                    </Text>
                ) : null}

                {/* Submit Button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: colors.Brown,
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 5
                    }}
                    onPress={handleAddArea}
                >
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 'bold',
                            fontFamily: 'Inter-Bold',
                        }}
                    >
                        {manage_email_id ? 'Update Area' : 'Add Area'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AddArea;

const styles = StyleSheet.create({});
