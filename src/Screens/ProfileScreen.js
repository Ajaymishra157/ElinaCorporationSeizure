import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, Alert, SafeAreaView, Modal, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import colors from '../CommonFiles/Colors'
import Bottomtab from '../Component/Bottomtab'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, initDB, insertVehicle, getVehiclesPaginated, bulkInsertVehicles } from '../utils/db';
import { ENDPOINTS } from '../CommonFiles/Constant'
import SQLite from 'react-native-sqlite-storage';
import ImagePicker from 'react-native-image-crop-picker';
import LocationAndNetworkChecker from '../CommonFiles/LocationAndNetworkChecker'

const ProfileScreen = () => {
    const navigation = useNavigation();

    const account = require('../assets/images/account.png');
    const logout = require('../assets/images/logout.png');
    const Icard = require('../assets/images/Icard.png');

    const [UserName, setUserName] = useState('');
    const [MobileNumber, setMobileNumber] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [serverImage, setServerImage] = useState(null);
    console.log("ye hai image ", serverImage);

    const [Email, setEmail] = useState(null);
    const [Address, setAddress] = useState(null)
    const [modalVisible, setModalVisible] = useState(false);
    const [ProfileData, setProfileData] = useState([]);
    const [totaldays, setTotalDays] = useState(null);

    const [ConfrimationModal, setConfrimationModal] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [imageOptionModal, setImageOptionModal] = useState(false);

    const handleCameraPress = () => {
        setImageOptionModal(true); // open modal with camera/gallery
    };

    // Function to pick image from camera or gallery
    const handleImagePick = async (source) => {
        try {
            let image;
            if (source === "camera") {
                image = await ImagePicker.openCamera({
                    width: 300,
                    height: 300,
                    compressImageQuality: 0.8,
                    includeBase64: true
                });
            } else {
                image = await ImagePicker.openPicker({
                    width: 300,
                    height: 300,
                    compressImageQuality: 0.8,
                    includeBase64: true
                });
            }
            setImageUri(image);
            setImageOptionModal(false);

            // ✅ Immediately upload after selection
            updateprofilepic(image);
        } catch (error) {
            console.log('Image pick cancelled or failed', error);
        }
    };

    const updateprofilepic = async (pickedImage) => {
        const StaffId = await AsyncStorage.getItem('staff_id');

        if (!StaffId) {
            return;
        }

        const photo = pickedImage
            ? `data:${pickedImage.mime};base64,${pickedImage.data}`
            : null;


        const response = await fetch(ENDPOINTS.update_profile_img, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                staff_id: StaffId,
                image: photo,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            ProfileDataApi();
        } else {
            console.log('error while adding Staff');
        }
    };

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
            if (result.code === 200 && Array.isArray(result.payload) && result.payload.length > 0) {
                const data = result.payload[0];
                setProfileData(data);
                setUserName(data.staff_name);
                setEmail(data.staff_email);
                setMobileNumber(data.staff_mobile);
                setAddress(data.staff_address);
                setServerImage(data.staff_image); // If it's relative, you already handle full URL in <Image>
            } else {
                console.log('Error:', result.message || 'Failed to load staff data');
            }
        } catch (error) {
            console.log('Error fetching data:', error.message);
        }
    };


    useEffect(() => {
        ProfileDataApi();
        UserWiseExpiryApi();
    }, []);

    handleImagePress = () => {
        setModalVisible(true); // Open the modal
    };

    const handleCloseModal = () => {
        setModalVisible(false); // Close the modal
    };

    const handleLogout = async () => {
        setConfrimationModal(true);
    };

    const confirmLogout = async () => {
        try {
            // First delete data from SQLite
            setConfrimationModal(false);      // close confirmation
            setLogoutLoading(true);
            await AsyncStorage.clear();
            setConfrimationModal(false);
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

    const closeconfirmodal = () => {
        setConfrimationModal(false); // Hide the modal
    };

    const deleteAllVehicles = () => {
        return new Promise((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "DELETE FROM vehicles",   // ✅ removes all rows but keeps table + indexes
                        [],
                        () => {
                            console.log("✅ All vehicles deleted successfully");
                            resolve();
                        },
                        (tx, error) => {
                            console.log("❌ Error deleting vehicles:", error);
                            reject(error);
                        }
                    );
                }
            );
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>

            {/* Header Section */}
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
                    Profile
                </Text>
            </View>

            <LocationAndNetworkChecker>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    {/* Profile Image and Name Section */}
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <TouchableOpacity onPress={handleImagePress}>
                            <Image
                                source={
                                    imageUri
                                        ? { uri: imageUri.path ? imageUri.path : imageUri } // Local image first
                                        : serverImage
                                            ? { uri: serverImage } // fallback to server image
                                            : '' // optional placeholder
                                }
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 60,
                                    borderWidth: 3,
                                    borderColor: '#fff',
                                    backgroundColor: '#eee',
                                }}
                            />

                        </TouchableOpacity>

                        {/* Camera Icon Overlay */}
                        <TouchableOpacity
                            style={{
                                position: "absolute",
                                bottom: 30,
                                right: 160,
                                backgroundColor: "#fff",
                                borderRadius: 20,
                                padding: 5,
                                elevation: 5,
                            }}
                            onPress={handleCameraPress}
                        >
                            <Ionicons name="camera" size={20} color="#000" />
                        </TouchableOpacity>

                        {/* Name & Type */}
                        <Text
                            style={{
                                marginTop: 15,
                                fontSize: 18,
                                fontFamily: 'Inter-Bold',
                                color: 'black',
                            }}
                        >
                            {ProfileData.staff_name || '-----'}
                        </Text>
                        {/* <Text
                        style={{
                            fontSize: 16,
                            color: '#666',
                            fontFamily: 'Inter-Regular',
                        }}
                    >
                        {userType}
                    </Text> */}
                    </View>

                    {/* Form Section */}
                    <View style={{ flex: 1, paddingHorizontal: 20, marginTop: 20 }}>
                        <View style={{
                            backgroundColor: 'white',
                            width: '100%',
                            marginTop: 20,



                        }}>

                            <View style={{
                                borderWidth: 1,
                                borderColor: 'black',
                                borderRadius: 10,
                                overflow: 'hidden',


                            }}>



                                {/* Mobile Number */}
                                <View style={{
                                    paddingVertical: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#f2f2f2',
                                    width: '100%',


                                    borderBottomWidth: 1,
                                    borderColor: '#ccc'
                                }}>
                                    <View style={{ width: '40%', flexDirection: 'row', gap: 10, }}>
                                        <View style={{ width: '15%', alignItems: 'center', marginLeft: 5 }}>
                                            <Ionicons name="call-outline" size={20} color="#007BFF" />
                                        </View>
                                        <Text style={{
                                            color: 'black',
                                            fontFamily: 'Inter-Regular',
                                        }}>Mobile Number</Text>
                                    </View>

                                    <View style={{
                                        flex: 1,
                                        alignItems: 'flex-end',
                                        paddingRight: 5,
                                        width: '60%'
                                    }}>
                                        <Text style={{
                                            color: 'black',
                                            fontFamily: 'Inter-Regular',


                                        }}>{MobileNumber || '----'}</Text>
                                    </View>
                                </View>

                                {/* Email */}
                                <View style={{
                                    paddingVertical: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#f2f2f2',
                                    width: '100%',


                                    borderBottomWidth: 1,
                                    borderColor: '#ccc'
                                }}>
                                    <View style={{ width: '40%', flexDirection: 'row', gap: 10, }}>
                                        <View style={{ width: '15%', alignItems: 'center', marginLeft: 5 }}>
                                            <Ionicons name="mail-outline" size={20} color="#28A745" />
                                        </View>
                                        <Text style={{
                                            color: 'black',
                                            fontFamily: 'Inter-Regular',
                                        }}>Email</Text>
                                    </View>
                                    <View style={{
                                        flex: 1,
                                        alignItems: 'flex-end',
                                        paddingRight: 5,
                                        width: '60%'
                                    }}>
                                        <Text style={{
                                            color: 'black',
                                            fontFamily: 'Inter-Regular',
                                            textTransform: 'uppercase'

                                        }}>{Email || 'NA'}</Text>
                                    </View>
                                </View>

                                {/* Address */}
                                <View style={{
                                    paddingVertical: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#f2f2f2',
                                    borderBottomLeftRadius: 15,
                                    borderBottomRightRadius: 15,
                                    width: '100%'

                                }}>
                                    <View style={{ width: '40%', flexDirection: 'row', gap: 10, }}>
                                        <View style={{ width: '15%', alignItems: 'center', marginLeft: 5 }}>
                                            <Ionicons name="location-outline" size={20} color="#6C757D" />
                                        </View>
                                        <Text style={{
                                            color: 'black',
                                            fontFamily: 'Inter-Regular',
                                        }}>Address</Text>

                                    </View>
                                    <View style={{
                                        flex: 1,
                                        alignItems: 'flex-end',
                                        paddingRight: 5,
                                        width: '60%'
                                    }}>
                                        <Text style={{
                                            color: 'black',
                                            fontFamily: 'Inter-Regular',
                                            textTransform: 'uppercase'

                                        }}>{Address || 'NA'}</Text>
                                    </View>
                                </View>


                            </View>
                        </View>

                        {totaldays != 0 &&
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity style={{ width: '100%', flexDirection: 'row', marginTop: 20, backgroundColor: 'white', borderWidth: 1, borderColor: colors.Brown, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', }} onPress={() => navigation.navigate('IcardScreen', { type: 'elina' })} >
                                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                        <Image source={Icard} style={{ marginRight: 8, width: 24, height: 24, tintColor: '#8A2BE2' }} />
                                    </View>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                        <Text
                                            style={{
                                                color: 'black',
                                                fontSize: 14,
                                                fontFamily: 'Inter-Bold',
                                                textAlign: 'center'
                                            }}
                                        >
                                            Elina Corporation I-CARD
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                            </View>
                        }

                        <TouchableOpacity
                            style={{
                                marginTop: 20,
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: colors.Brown,
                                paddingVertical: 12,
                                borderRadius: 8,
                                alignItems: 'center',
                                width: '50%',
                                alignSelf: 'center',
                            }}
                            onPress={handleLogout}
                        >

                            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 }}>
                                <Image
                                    source={logout}
                                    style={{ width: 22, height: 22, tintColor: 'black' }}
                                />
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        fontFamily: 'Inter-Bold',
                                    }}
                                >
                                    Logout
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ justifyContent: 'flex-end' }}>
                    <Bottomtab />
                </View>

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
                    transparent={true}
                    visible={modalVisible}
                    animationType="fade"
                    onRequestClose={handleCloseModal}>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        }}
                        onPress={handleCloseModal}
                        activeOpacity={1}>
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
                            onTouchEnd={e => e.stopPropagation()}>
                            <Image
                                source={
                                    imageUri
                                        ? { uri: imageUri.path ? imageUri.path : imageUri } // Local image first
                                        : serverImage
                                            ? { uri: serverImage } // fallback to server image
                                            : '' // optional placeholder
                                }
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 150,
                                    resizeMode: 'stretch',
                                }}
                            />
                            {/* <TouchableOpacity
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      backgroundColor: '#007BFF',
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                    onPress={handleCloseModal}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>OK</Text>
                  </TouchableOpacity> */}
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={imageOptionModal}
                    onRequestClose={() => setImageOptionModal(false)}
                >
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            justifyContent: "flex-end",
                            backgroundColor: "rgba(0,0,0,0.5)",
                        }}
                        activeOpacity={1}
                        onPressOut={() => setImageOptionModal(false)} // ✅ close when tapping outside
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{
                                backgroundColor: "white",
                                borderTopLeftRadius: 15,
                                borderTopRightRadius: 15,
                                padding: 20,
                            }}
                            onPress={() => { }} // ✅ block touches inside
                        >
                            {/* Header Row */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 15,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontFamily: "Inter-Bold",
                                        color: "black",
                                    }}
                                >
                                    Profile photo
                                </Text>

                                {/* Close Button */}
                                <TouchableOpacity onPress={() => setImageOptionModal(false)}>
                                    <Ionicons name="close" size={24} color="black" />
                                </TouchableOpacity>
                            </View>

                            {/* Options */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 10,
                                    marginTop: 10,
                                }}
                            >
                                {/* Camera */}
                                <TouchableOpacity
                                    style={{ alignItems: "center", borderWidth: 0.5, borderRadius: 10, padding: 10 }}
                                    onPress={() => handleImagePick("camera")}
                                >
                                    <Ionicons name="camera-outline" size={30} color="#000" />
                                    <Text style={{ marginTop: 5, color: "black" }}>Camera</Text>
                                </TouchableOpacity>

                                {/* Gallery */}
                                <TouchableOpacity
                                    style={{ alignItems: "center", borderWidth: 0.5, borderRadius: 10, padding: 10 }}
                                    onPress={() => handleImagePick("gallery")}
                                >
                                    <Ionicons name="image-outline" size={30} color="#000" />
                                    <Text style={{ marginTop: 5, color: "black" }}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
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

            </LocationAndNetworkChecker>
        </View>
    )
}

export default ProfileScreen

const styles = StyleSheet.create({})