import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image, Alert, Modal, PermissionsAndroid, Platform, ToastAndroid, Keyboard, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import colors from '../CommonFiles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/native';
import { ENDPOINTS } from '../CommonFiles/Constant';

const StaffJoin = () => {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        alternateMobile: '',
        city: '',
        password: '',
        address: '',
        bankName: '',
        accountHolder: '',
        accountNo: '',
        ifscCode: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        mobile: '',
        password: '',
        profilePicture: '',
        panCard: '',
        aadharFront: '',
        aadharBack: '',
    });

    // Track which images were updated
    const [updatedImages, setUpdatedImages] = useState({
        profilePicture: false,
        panCard: false,
        aadharFront: false,
        aadharBack: false,
    });

    const [documents, setDocuments] = useState({
        profilePicture: null,
        panCard: null,
        aadharFront: null,
        aadharBack: null,
    });

    const [imageSelectModal, setImageSelectModal] = useState(false);
    const [currentImageType, setCurrentImageType] = useState(null);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [currentPreviewImage, setCurrentPreviewImage] = useState(null);
    const [currentImageTitle, setCurrentImageTitle] = useState('');

    const [keyboardVisible, setKeyboardVisible] = useState(false);


    const [staffLoading, setStaffLoading] = useState(false);


    const [isAadharFrontUpdated, setIsAadharFrontUpdated] = useState(false);
    const [isAadharBackUpdated, setIsAadharBackUpdated] = useState(false);
    const [isPanCardUpdated, setIsPanCardUpdated] = useState(false);
    const [isDraCertificateUpdated, setIsDraCertificateUpdated] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: ''
            });
        }
    };

    const validateForm = () => {
        let valid = true;
        let newErrors = {
            name: '',
            mobile: '',
            password: '',
            profilePicture: '',
            panCard: '',
            aadharFront: '',
            aadharBack: '',
        };

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            valid = false;
        }

        // Mobile validation
        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
            valid = false;
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits';
            valid = false;
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            valid = false;
        }

        // Document validation
        if (!documents.profilePicture) {
            newErrors.profilePicture = 'Profile picture is required';
            valid = false;
        }

        if (!documents.panCard) {
            newErrors.panCard = 'PAN card is required';
            valid = false;
        }

        if (!documents.aadharFront) {
            newErrors.aadharFront = 'Aadhar front is required';
            valid = false;
        }

        if (!documents.aadharBack) {
            newErrors.aadharBack = 'Aadhar back is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        // Reset all error states before validation
        setErrors({
            name: '',
            email: '',
            mobile: '',
            password: '',
            profilePicture: '',
            panCard: '',
            aadharFront: '',
            aadharBack: '',
        });

        // Validation for required fields
        if (!validateForm()) {

            return;
        }

        try {
            setStaffLoading(true);

            // Prepare images only if they were updated
            const staffData = {
                staff_name: formData.name,
                staff_email: formData.email,
                staff_mobile: formData.mobile,
                staff_alter_mobile_no: formData.alternateMobile || '',
                staff_password: formData.password,
                staff_address: formData.address,
                staff_position: formData.city || '',

                bank_name: formData.bankName || '',
                account_holder_name: formData.accountHolder || '',
                bank_account_no: formData.accountNo || '',
                IFSC_code: formData.ifscCode || '',

                staff_image: updatedImages.profilePicture ? documents.profilePicture : null,
                staff_aadhar_card_front: updatedImages.aadharFront ? documents.aadharFront : null,
                staff_aadhar_card_back: updatedImages.aadharBack ? documents.aadharBack : null,
                staff_pan_card: updatedImages.panCard ? documents.panCard : null,
            };

            // Call API
            const response = await fetch(ENDPOINTS.staff, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffData),
            });

            if (!response.ok) throw new Error('Failed to connect to the server');

            const data = await response.json();

            if (data.code === 200) {
                ToastAndroid.show('Staff Registered Successfully', ToastAndroid.SHORT);
                navigation.navigate('OtpScreen', { mobile: formData.mobile });

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    mobile: '',
                    alternateMobile: '',
                    city: '',
                    password: '',
                    address: '',
                    bankName: '',
                    accountHolder: '',
                    accountNo: '',
                    ifscCode: '',
                });

                setDocuments({
                    profilePicture: null,
                    panCard: null,
                    aadharFront: null,
                    aadharBack: null,
                });

                setUpdatedImages({
                    profilePicture: false,
                    panCard: false,
                    aadharFront: false,
                    aadharBack: false,
                });


            } else {
                // Handle specific errors
                if (data.message.includes('Mobile number already exists')) {
                    setErrors(prev => ({ ...prev, mobile: 'Mobile number already exists' }));
                }
                if (data.message.includes('Email address already exists')) {
                    setErrors(prev => ({ ...prev, email: 'Email address already exists' }));
                }
                if (!data.message.includes('Mobile') && !data.message.includes('Email')) {
                    Alert.alert('Error', data.message || 'Registration failed');
                }
            }
        } catch (error) {
            console.error('Error:', error.message);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setStaffLoading(false);
        }
    };



    // Open image selection modal
    const openImageSelectModal = (imageType) => {
        setCurrentImageType(imageType);
        setImageSelectModal(true);
    };

    const closeImageSelectModal = () => {
        setImageSelectModal(false);
        setCurrentImageType(null);
    };

    // Remove image function
    const removeImage = (imageType) => {
        setDocuments(prev => ({
            ...prev,
            [imageType]: null
        }));

        setUpdatedImages(prev => ({
            ...prev,
            [imageType]: false
        }));

        // Set error if the field is required
        if (errors[imageType]) {
            setErrors(prev => ({
                ...prev,
                [imageType]: `${getImageTitle(imageType)} is required`
            }));
        }
    };

    // Helper function to get image title
    const getImageTitle = (imageType) => {
        const titles = {
            profilePicture: 'Profile Picture',
            panCard: 'PAN Card',
            aadharFront: 'Aadhar Front',
            aadharBack: 'Aadhar Back'
        };
        return titles[imageType] || 'Document';
    };


    // Camera permission function
    const requestCameraPermission = async () => {
        if (Platform.OS !== 'android') return true;

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'This app needs access to your camera to take photos',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn('Camera permission error:', err);
            return false;
        }
    };

    // // Open gallery function
    // const openGallery = async () => {
    //     try {
    //         const image = await ImagePicker.openPicker({
    //             cropping: true,
    //             width: 300,
    //             height: 300,
    //             compressImageMaxWidth: 500,
    //             compressImageMaxHeight: 500,
    //             compressImageQuality: 0.7,
    //         });

    //         if (image && image.path) {
    //             // Read the image file as base64 using RNFS
    //             const base64Data = await RNFS.readFile(image.path, 'base64');
    //             const mimeType = image.mime; // image mime type (e.g., image/jpeg)
    //             const base64Image = `data:${mimeType};base64,${base64Data}`;

    //             // Set the image based on the current image type
    //             switch (currentImageType) {
    //                 case 'profilePicture':
    //                     setDocuments({ ...documents, profilePicture: base64Image });
    //                     break;
    //                 case 'panCard':
    //                     setDocuments({ ...documents, panCard: base64Image });
    //                     break;
    //                 case 'aadharFront':
    //                     setDocuments({ ...documents, aadharFront: base64Image });
    //                     break;
    //                 case 'aadharBack':
    //                     setDocuments({ ...documents, aadharBack: base64Image });
    //                     break;
    //                 default:
    //                     break;
    //             }

    //             // Clear error when user uploads a document
    //             if (errors[currentImageType]) {
    //                 setErrors({
    //                     ...errors,
    //                     [currentImageType]: ''
    //                 });
    //             }
    //         } else {
    //             console.log('Image not selected or invalid');
    //         }
    //     } catch (error) {
    //         console.log('Error picking image from gallery:', error);
    //     }
    //     closeImageSelectModal();
    // };

    // // Open camera function
    // const openCamera = async () => {
    //     const hasPermission = await requestCameraPermission();
    //     if (!hasPermission) {
    //         Alert.alert('Permission denied', 'Camera permission is required to take photos');
    //         return;
    //     }

    //     try {
    //         const image = await ImagePicker.openCamera({
    //             cropping: true,
    //             width: 300,
    //             height: 300,
    //             compressImageMaxWidth: 500,
    //             compressImageMaxHeight: 500,
    //             compressImageQuality: 0.7,
    //         });

    //         if (image && image.path) {
    //             // Read the image file as base64 using RNFS
    //             const base64Data = await RNFS.readFile(image.path, 'base64');
    //             const mimeType = image.mime;
    //             const base64Image = `data:${mimeType};base64,${base64Data}`;

    //             // Set the image based on the current image type
    //             switch (currentImageType) {
    //                 case 'profilePicture':
    //                     setDocuments({ ...documents, profilePicture: base64Image });
    //                     break;
    //                 case 'panCard':
    //                     setDocuments({ ...documents, panCard: base64Image });
    //                     break;
    //                 case 'aadharFront':
    //                     setDocuments({ ...documents, aadharFront: base64Image });
    //                     break;
    //                 case 'aadharBack':
    //                     setDocuments({ ...documents, aadharBack: base64Image });
    //                     break;
    //                 default:
    //                     break;
    //             }

    //             // Clear error when user uploads a document
    //             if (errors[currentImageType]) {
    //                 setErrors({
    //                     ...errors,
    //                     [currentImageType]: ''
    //                 });
    //             }
    //         } else {
    //             console.log('Image not selected or invalid');
    //         }
    //     } catch (error) {
    //         console.log('Error taking photo:', error);
    //         Alert.alert('Error', 'Error taking photo');
    //     }
    //     closeImageSelectModal();
    // };


    const handleImagePick = async (image) => {
        if (!image?.path) return;

        const base64Data = await RNFS.readFile(image.path, 'base64');
        const base64Image = `data:${image.mime};base64,${base64Data}`;

        setDocuments(prev => ({ ...prev, [currentImageType]: base64Image }));
        setUpdatedImages(prev => ({ ...prev, [currentImageType]: true }));

        if (errors[currentImageType]) {
            setErrors(prev => ({ ...prev, [currentImageType]: '' }));
        }
    };

    const openGallery = async () => {
        try {
            const image = await ImagePicker.openPicker({
                cropping: true,
                width: 300,
                height: 300,
                compressImageMaxWidth: 500,
                compressImageMaxHeight: 500,
                compressImageQuality: 0.7,
            });
            await handleImagePick(image);
        } catch (error) {
            console.log('Error picking image from gallery:', error);
        }
        closeImageSelectModal();
    };

    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission denied', 'Camera permission is required to take photos');
            return;
        }

        try {
            const image = await ImagePicker.openCamera({
                cropping: true,
                width: 300,
                height: 300,
                compressImageMaxWidth: 500,
                compressImageMaxHeight: 500,
                compressImageQuality: 0.7,
            });
            await handleImagePick(image);
        } catch (error) {
            console.log('Error taking photo:', error);
            Alert.alert('Error', 'Error taking photo');
        }
        closeImageSelectModal();
    };


    // Helper function to get image source for preview
    const getImageSource = (image, defaultImage) => {
        if (image && image.startsWith('data:image')) {
            return { uri: image };
        }
        return defaultImage;
    };

    // Mock function for document upload
    const handleDocumentUpload = (docType) => {
        // In a real app, this would open a file picker
        // For now, we'll just simulate a successful upload
        setDocuments({
            ...documents,
            [docType]: `uploaded_${docType}.jpg`
        });

        // Clear error when user uploads a document
        if (errors[docType]) {
            setErrors({
                ...errors,
                [docType]: ''
            });
        }

        Alert.alert('Success', `${docType.replace(/([A-Z])/g, ' $1')} uploaded successfully`);
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 16 }} contentContainerStyle={{ paddingBottom: keyboardVisible ? 400 : 16 }} keyboardShouldPersistTaps='handled'>
            <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: colors.light_brown, fontFamily: 'Inter-Medium' }}>
                Enter Your Details
            </Text>

            <View style={{ marginBottom: 30 }}>
                {/* Personal Details */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, color: '#555', fontFamily: 'Inter-Regular' }}>Name <Text style={{ color: 'red', fontFamily: 'Inter-Bold', }}>*</Text></Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: errors.name ? 'red' : '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Enter your name"
                            placeholderTextColor='#555'
                            value={formData.name}
                            onChangeText={(text) => handleInputChange('name', text)}
                        />
                        {errors.name ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4, fontFamily: 'Inter-Regular' }}>{errors.name}</Text> : null}
                    </View>

                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, color: '#555', fontFamily: 'Inter-Regular' }}>Email</Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Enter your email"
                            placeholderTextColor='#555'
                            keyboardType="email-address"
                            value={formData.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                        />
                    </View>

                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Regular', color: '#555' }}>Mobile Number <Text style={{ color: 'red', fontFamily: 'Inter-Bold', }}>*</Text></Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: errors.mobile ? 'red' : '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Enter mobile number"
                            placeholderTextColor='#555'
                            keyboardType="phone-pad"
                            value={formData.mobile}
                            maxLength={10}

                            onChangeText={(text) => handleInputChange('mobile', text)}
                        />
                        {errors.mobile ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.mobile}</Text> : null}
                    </View>

                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Regular', color: '#555' }}>Alternate Mobile No.</Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Enter alternate mobile"
                            keyboardType="phone-pad"
                            placeholderTextColor='#555'
                            value={formData.alternateMobile}
                            maxLength={10}
                            onChangeText={(text) => handleInputChange('alternateMobile', text)}
                        />
                    </View>

                </View>


                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Regular', color: '#555' }}>City</Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Enter your city"
                            placeholderTextColor='#555'
                            value={formData.city}
                            onChangeText={(text) => handleInputChange('city', text)}
                        />
                    </View>

                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Regular', color: '#555' }}>Password <Text style={{ color: 'red', fontFamily: 'Inter-Bold', }}>*</Text></Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: errors.password ? 'red' : '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Enter password"
                            placeholderTextColor='#555'
                            secureTextEntry={true}
                            value={formData.password}
                            onChangeText={(text) => handleInputChange('password', text)}
                        />

                        {errors.password ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.password}</Text> : null}
                    </View>

                </View>


                {/* Address */}
                <View style={{ width: '100%', marginBottom: 15 }}>
                    <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Regular', color: '#555' }}>Address</Text>
                    <TextInput
                        style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, fontSize: 16, height: 80, textAlignVertical: 'top', fontFamily: 'Inter-Regular', color: '#555' }}
                        placeholder="Enter your full address"
                        placeholderTextColor='#555'
                        multiline={true}
                        numberOfLines={3}
                        value={formData.address}
                        onChangeText={(text) => handleInputChange('address', text)}
                    />
                </View>

                {/* Bank Details */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 15, color: '#333', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5, fontFamily: 'Inter-Regular' }}>
                    Bank Details
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Regular', color: '#555' }}>Bank Name</Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Enter bank name"
                            placeholderTextColor='#555'
                            value={formData.bankName}
                            onChangeText={(text) => handleInputChange('bankName', text)}
                        />
                    </View>

                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Regular', color: '#555' }}>Account Holder</Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Account holder name"
                            placeholderTextColor='#555'
                            value={formData.accountHolder}
                            onChangeText={(text) => handleInputChange('accountHolder', text)}
                        />
                    </View>

                </View>


                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Regular', color: '#555' }}>Bank Account No.</Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Enter account number"
                            placeholderTextColor='#555'
                            keyboardType="numeric"
                            value={formData.accountNo}
                            onChangeText={(text) => handleInputChange('accountNo', text)}
                        />
                    </View>

                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Regular', color: '#555' }}>IFSC Code</Text>
                        <TextInput
                            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#555' }}
                            placeholder="Enter IFSC code"
                            placeholderTextColor='#555'
                            value={formData.ifscCode}
                            onChangeText={(text) => handleInputChange('ifscCode', text)}
                        />
                    </View>

                </View>


                {/* Document Upload Section */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 15, color: '#333', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5, fontFamily: 'Inter-Medium' }}>
                    Document Upload
                </Text>

                <View style={{ marginBottom: 20 }}>
                    {/* Profile Picture */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                        <View style={{ width: '100%' }}>
                            <Text style={{ fontSize: 14, marginBottom: 8, color: '#555', fontFamily: 'Inter-Medium', }}>Profile Picture <Text style={{ color: 'red', fontFamily: 'Inter-Bold', }}>*</Text></Text>
                            <View style={{ flexDirection: 'row', width: '100%' }}>
                                <TouchableOpacity style={{
                                    backgroundColor: documents.profilePicture ? '#e0f7fa' : '#e9e9e9',
                                    padding: 12,
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: errors.profilePicture ? 'red' : (documents.profilePicture ? '#4db6ac' : '#ccc'),
                                    borderStyle: documents.profilePicture ? 'solid' : 'dashed',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: documents.profilePicture ? '70%' : '100%',
                                }}
                                    onPress={() => openImageSelectModal('profilePicture')}>
                                    <Text style={{ color: documents.profilePicture ? '#00796b' : '#666', fontFamily: 'Inter-Regular', }}>
                                        {documents.profilePicture ? 'File Selected' : 'No file chosen'}
                                    </Text>
                                    <Ionicons name="document-attach-outline" size={20} color="black" />
                                </TouchableOpacity>

                                {documents.profilePicture && (
                                    <View style={{ width: '30%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            style={{ padding: 10, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => {
                                                setCurrentPreviewImage(documents.profilePicture);
                                                setCurrentImageTitle('Profile Picture');
                                                setPreviewModalVisible(true);
                                            }}>
                                            <Ionicons name="eye-outline" size={24} color={colors.Brown} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ padding: 10, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => removeImage('profilePicture')}>
                                            <Ionicons name="close-circle-outline" size={24} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            {errors.profilePicture ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4, fontFamily: 'Inter-Regular', }}>{errors.profilePicture}</Text> : null}
                        </View>
                    </View>

                    {/* Pan Card */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                        <View style={{ width: '100%' }}>
                            <Text style={{ fontSize: 14, marginBottom: 8, color: '#555', fontFamily: 'Inter-Medium' }}>Pan Card <Text style={{ color: 'red', fontFamily: 'Inter-Bold', }}>*</Text></Text>
                            <View style={{ flexDirection: 'row', width: '100%' }}>
                                <TouchableOpacity style={{
                                    backgroundColor: documents.panCard ? '#e0f7fa' : '#e9e9e9',
                                    padding: 12,
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: errors.panCard ? 'red' : (documents.panCard ? '#4db6ac' : '#ccc'),
                                    borderStyle: documents.panCard ? 'solid' : 'dashed',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: documents.panCard ? '70%' : '100%',
                                }}
                                    onPress={() => openImageSelectModal('panCard')}>
                                    <Text style={{ color: documents.panCard ? '#00796b' : '#666', fontFamily: 'Inter-Regular', }}>
                                        {documents.panCard ? 'File Selected' : 'No file chosen'}
                                    </Text>
                                    <Ionicons name="document-attach-outline" size={20} color="black" />
                                </TouchableOpacity>

                                {documents.panCard && (
                                    <View style={{ width: '30%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            style={{ padding: 10, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => {
                                                setCurrentPreviewImage(documents.panCard);
                                                setCurrentImageTitle('Pan Card');
                                                setPreviewModalVisible(true);
                                            }}>
                                            <Ionicons name="eye-outline" size={24} color={colors.Brown} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ padding: 10, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => removeImage('panCard')}>
                                            <Ionicons name="close-circle-outline" size={24} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            {errors.panCard ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4, fontFamily: 'Inter-Regular', }}>{errors.panCard}</Text> : null}
                        </View>
                    </View>


                    {/* Aadhar Card Front */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                        <View style={{ width: '100%' }}>
                            <Text style={{ fontSize: 14, marginBottom: 8, color: '#555', fontFamily: 'Inter-Medium' }}>Aadhar Card Front <Text style={{ color: 'red', fontFamily: 'Inter-Bold', }}>*</Text></Text>
                            <View style={{ flexDirection: 'row', width: '100%' }}>
                                <TouchableOpacity style={{
                                    backgroundColor: documents.aadharFront ? '#e0f7fa' : '#e9e9e9',
                                    padding: 12,
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: errors.aadharFront ? 'red' : (documents.aadharFront ? '#4db6ac' : '#ccc'),
                                    borderStyle: documents.aadharFront ? 'solid' : 'dashed',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: documents.aadharFront ? '70%' : '100%',
                                }}
                                    onPress={() => openImageSelectModal('aadharFront')}>
                                    <Text style={{ color: documents.aadharFront ? '#00796b' : '#666', fontFamily: 'Inter-Regular', }}>
                                        {documents.aadharFront ? 'File Selected' : 'No file chosen'}
                                    </Text>
                                    <Ionicons name="document-attach-outline" size={20} color="black" />
                                </TouchableOpacity>

                                {documents.aadharFront && (
                                    <View style={{ width: '30%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            style={{ padding: 10, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => {
                                                setCurrentPreviewImage(documents.aadharFront);
                                                setCurrentImageTitle('Aadhar Front');
                                                setPreviewModalVisible(true);
                                            }}>
                                            <Ionicons name="eye-outline" size={24} color={colors.Brown} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ padding: 10, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => removeImage('aadharFront')}>
                                            <Ionicons name="close-circle-outline" size={24} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            {errors.aadharFront ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4, fontFamily: 'Inter-Regular', }}>{errors.aadharFront}</Text> : null}
                        </View>
                    </View>
                    {/* Aadhar Card Back */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                        <View style={{ width: '100%' }}>
                            <Text style={{ fontSize: 14, marginBottom: 8, color: '#555', fontFamily: 'Inter-Medium' }}>Aadhar Card Back <Text style={{ color: 'red', fontFamily: 'Inter-Bold', }}>*</Text></Text>
                            <View style={{ flexDirection: 'row', width: '100%' }}>
                                <TouchableOpacity style={{
                                    backgroundColor: documents.aadharBack ? '#e0f7fa' : '#e9e9e9',
                                    padding: 12,
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: errors.aadharBack ? 'red' : (documents.aadharBack ? '#4db6ac' : '#ccc'),
                                    borderStyle: documents.aadharBack ? 'solid' : 'dashed',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: documents.aadharBack ? '70%' : '100%',
                                }}
                                    onPress={() => openImageSelectModal('aadharBack')}>
                                    <Text style={{ color: documents.aadharBack ? '#00796b' : '#666', fontFamily: 'Inter-Regular', }}>
                                        {documents.aadharBack ? 'File Selected' : 'No file chosen'}
                                    </Text>
                                    <Ionicons name="document-attach-outline" size={20} color="black" />
                                </TouchableOpacity>

                                {documents.aadharBack && (
                                    <View style={{ width: '30%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            style={{ padding: 10, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => {
                                                setCurrentPreviewImage(documents.aadharBack);
                                                setCurrentImageTitle('Aadhar Back');
                                                setPreviewModalVisible(true);
                                            }}>
                                            <Ionicons name="eye-outline" size={24} color={colors.Brown} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ padding: 10, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => removeImage('aadharBack')}>
                                            <Ionicons name="close-circle-outline" size={24} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            {errors.aadharBack ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4, fontFamily: 'Inter-Regular', }}>{errors.aadharBack}</Text> : null}
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: staffLoading ? colors.Brown : colors.Brown, // dim color when loading
                        padding: 16,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 10,
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}
                    onPress={handleSubmit}
                    disabled={staffLoading} // disable button when loading
                >
                    {staffLoading ? (
                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                    ) : null}
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', fontFamily: 'Inter-Bold' }}>
                        JOIN NOW
                    </Text>
                </TouchableOpacity>

            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={imageSelectModal}
                onRequestClose={closeImageSelectModal}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    activeOpacity={1}
                    onPress={closeImageSelectModal}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            width: '80%',
                            paddingVertical: 5,
                        }}>
                        <TouchableOpacity
                            onPress={closeImageSelectModal}
                            style={{
                                marginRight: 1,
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
                            borderRadius: 10,
                            width: '80%',
                            alignItems: 'center',
                        }}
                        onStartShouldSetResponder={() => true}
                        onTouchEnd={e => e.stopPropagation()}>

                        <Text
                            style={{
                                fontSize: 14,
                                marginBottom: 20,
                                textAlign: 'center',
                                color: 'black',
                                fontFamily: 'Inter-Medium',
                            }}>
                            How would you like to upload your photo?
                        </Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'white',
                                    borderWidth: 1, borderColor: colors.Brown,
                                    padding: 10,
                                    borderRadius: 5,
                                    width: '45%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row', gap: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,
                                    elevation: 4,
                                }}
                                onPress={openCamera}>
                                <MaterialIcons name="photo-camera" size={20} color="black" />
                                <Text
                                    style={{
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    Camera
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'white',
                                    borderWidth: 1, borderColor: colors.Brown,
                                    padding: 10,
                                    borderRadius: 5,
                                    width: '45%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row', gap: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,
                                    elevation: 4,
                                }}
                                onPress={openGallery}>
                                <MaterialIcons name="photo-library" size={20} color="black" />
                                <Text
                                    style={{
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    Gallery
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Image Preview Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={previewModalVisible}
                onRequestClose={() => setPreviewModalVisible(false)}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        padding: 20,
                        borderRadius: 10,
                        width: '90%',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginBottom: 15,
                            color: 'black'
                        }}>
                            {currentImageTitle}
                        </Text>

                        <Image
                            source={{ uri: currentPreviewImage }}
                            style={{
                                width: '100%',
                                height: 300,
                                resizeMode: 'contain',
                                marginBottom: 15
                            }}
                        />

                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.Brown,
                                padding: 10,
                                borderRadius: 5,
                                width: '100%',
                                alignItems: 'center'
                            }}
                            onPress={() => setPreviewModalVisible(false)}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default StaffJoin;