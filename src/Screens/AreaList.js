import { FlatList, StyleSheet, Text, TouchableOpacity, View, Modal, ToastAndroid, RefreshControl, ActivityIndicator, TextInput, Image } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import colors from '../CommonFiles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ENDPOINTS } from '../CommonFiles/Constant';
import Entypo from 'react-native-vector-icons/Entypo';
import LottieView from 'lottie-react-native';
import LoadingAnimation from '../assets/animations/Loading.json';
import EvilIcons from 'react-native-vector-icons/EvilIcons'
const AreaList = () => {
    const navigation = useNavigation();

    const Map = require('../assets/images/map.png');
    const [AreaList, setAreaList] = useState([]);
    const [originalAreaData, setoriginalAreaData] = useState([]);
    const [text, setText] = useState(null);

    const [AreaListLoading, setAreaListLoading] = useState(false);
    const [ConfrimationModal, setConfrimationModal] = useState(false);
    const [SelectedArea, setSelectedArea] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);


    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAreaList();
        setRefreshing(false);
    };

    const handleDelete = () => {
        setConfrimationModal(true);
        setIsModalVisible(false);

        // Call Delete API with the selected staff ID
    };
    const closeconfirmodal = () => {
        setConfrimationModal(false); // Hide the modal
    };

    const OpenModal = Area => {
        setSelectedArea(Area);
        setIsModalVisible(true); // Open the modal
    };

    const handleCloseModal = () => {
        setIsModalVisible(false); // Close the modal
    };

    const handleEdit = () => {
        navigation.navigate('AddArea', {
            manage_email_id: SelectedArea.manage_email_id,
            manage_area_name: SelectedArea.manage_area_name,
            manage_address: SelectedArea.manage_address,
            manage_id: SelectedArea.manage_emailid, // You can pass more data if needed
        });
        handleCloseModal(); // Close the modal after action (optional, if applicable)
    };


    const DeleteAreaApi = async EmailId => {
        console.log("emaildid", EmailId);

        try {
            const response = await fetch(ENDPOINTS.Delete_Area, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    manage_email_id: EmailId,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                if (result.code === 200) {
                    ToastAndroid.show(
                        'Area Deleted Successfully',
                        ToastAndroid.SHORT,
                    );
                    fetchAreaList();
                } else {
                    ToastAndroid.show(
                        'Area not Deleted Successfully',
                        ToastAndroid.SHORT,
                    );
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


    const fetchAreaList = async () => {
        setAreaListLoading(true);
        try {
            const response = await fetch(ENDPOINTS.Area_list);
            const result = await response.json();
            if (result.code === 200) {
                setAreaList(result.payload);  // Save the full list
                setoriginalAreaData(result.payload);
            } else {
                console.log('Error:', result.message);
            }
        } catch (error) {
            console.log('Error fetching data:', error.message);
        } finally {
            setAreaListLoading(false)
        }
    };




    useEffect(() => {
        fetchAreaList();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAreaList();
        }, []), // Empty array ensures this is called only when the screen is focused
    );

    const handleTextChange = (inputText) => {
        setText(inputText);

        // If inputText is empty, show the original data
        if (inputText === '') {
            setAreaList(originalAreaData);  // Reset to original data
        } else {
            // Filter data based on Name, Reg No, or Agg No
            const filtered = originalAreaData.filter(item => {
                const lowerCaseInput = inputText.toLowerCase();
                return (
                    item.manage_area_name.toLowerCase().includes(lowerCaseInput)


                );
            });

            setAreaList(filtered); // Update filtered data state
        }
    };


    // Render each item in the table
    const renderItem = ({ item, index }) => (
        <View style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
            <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: 'black', fontFamily: 'Inter-Regular' }}>{index + 1 || '----'}</Text>
            </View>
            <View style={{ width: '30%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: 'black', fontFamily: 'Inter-Regular', }}>{item.manage_area_name || '----'}</Text>
            </View>
            <View style={{
                width: '30%', justifyContent: 'center', alignItems: 'flex-start'
            }}>
                <Text style={{ fontSize: 14, color: 'black', fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>{item.manage_address || '----'}</Text>
            </View>
            <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: item.manage_status == 'Active' ? 'green' : 'red', fontFamily: 'Inter-Regular' }}>{item.manage_status || '----'}</Text>
            </View>
            <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
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
                }}>
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
                <Text
                    style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}>
                    Area List
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

                        placeholder="Search Area Name"
                        placeholderTextColor="grey"
                        value={text}
                        onChangeText={handleTextChange}
                    />
                    {text ? (
                        <TouchableOpacity
                            onPress={() => {

                                setText(''); // Clear the search text
                                setAreaList(originalAreaData);

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
            <View style={{ backgroundColor: 'white' }}>
                <View
                    style={{
                        flexDirection: 'row',
                        backgroundColor: '#ddd',
                        padding: 7,
                        borderRadius: 5,
                    }}>
                    <View
                        style={{
                            width: '10%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontFamily: 'Inter-Regular',
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'black',
                            }}>
                            #
                        </Text>
                    </View>
                    <View
                        style={{
                            width: '30%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontFamily: 'Inter-Regular',
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'black',
                            }}>
                            AREA
                        </Text>
                    </View>
                    <View
                        style={{
                            width: '30%',
                            justifyContent: 'center',
                            alignItems: 'flex-start'
                        }}>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontFamily: 'Inter-Regular',
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'black',
                            }}>
                            LOCATION
                        </Text>
                    </View>

                    <View
                        style={{
                            width: '20%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontFamily: 'Inter-Regular',
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'black',
                            }}>
                            STATUS
                        </Text>
                    </View>
                    <View
                        style={{
                            width: '10%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontFamily: 'Inter-Regular',
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'black',
                            }}>

                        </Text>
                    </View>

                </View>


            </View>

            {/* Area List */}
            <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                {AreaListLoading ? (
                    <LottieView
                        source={LoadingAnimation}  // Path to your Lottie animation file
                        autoPlay
                        loop
                        style={{ width: 200, height: 200, }}  // Customize the size as needed
                    />

                ) : AreaList.length === 0 ? (
                    <View style={{ height: 600, justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={Map} style={{ width: 70, height: 70 }} />
                        <Text style={{ fontFamily: 'Inter-Regular', color: 'red', marginTop: 10 }}>
                            No Area Found
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        keyboardShouldPersistTaps='handled'
                        data={AreaList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.manage_email_id.toString()}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#9Bd35A', '#689F38']}
                            />
                        }
                    />
                )}

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
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'black', fontFamily: 'Inter-Medium' }}>
                            Confirm Delete
                        </Text>
                        <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
                            Are you sure you want to delete the Area ?
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
                                    if (SelectedArea) {
                                        DeleteAreaApi(SelectedArea.manage_email_id);  // Pass the selected area's manage_email_id to the delete API
                                    }
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
                                    Update Area
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
                                    Delete Area
                                </Text>
                            </TouchableOpacity>

                            {/* Info Staff Button */}
                            {/* <TouchableOpacity
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
                                    Information Area
                                </Text>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Sticky Add New Button */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 30,
                    width: '12%',
                    zIndex: 1,

                }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: colors.Brown,
                        borderRadius: 100,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 7,
                    }}
                    onPress={() => {
                        navigation.navigate('AddArea');
                    }}>
                    <AntDesign name="plus" color="white" size={18} />

                </TouchableOpacity>
            </View>
        </View>
    )
}

export default AreaList

const styles = StyleSheet.create({})