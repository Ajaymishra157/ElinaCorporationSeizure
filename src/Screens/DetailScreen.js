import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Modal, PermissionsAndroid, Platform, ScrollView, Share, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import colors from '../CommonFiles/Colors';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from 'react-native/Libraries/NewAppScreen';
import CheckBox from '@react-native-community/checkbox';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../utils/db';
import Geolocation from 'react-native-geolocation-service';
import { ENDPOINTS } from '../CommonFiles/Constant';
import Geocoder from 'react-native-geocoding';

const deleteVehiclesByIds = async (ids) => {
    if (!ids || ids.length === 0) return;

    // Helper to build contiguous ranges from ID list
    function buildRanges(ids) {
        ids.sort((a, b) => a - b);
        const ranges = [];
        let start = ids[0];
        let end = ids[0];

        for (let i = 1; i < ids.length; i++) {
            if (ids[i] === end + 1) {
                end = ids[i]; // extend range
            } else {
                ranges.push([start, end]);
                start = end = ids[i];
            }
        }
        ranges.push([start, end]); // last range
        return ranges;
    }

    const ranges = buildRanges(ids);
    let totalDeleted = 0;

    // Delete each range one by one
    for (const [start, end] of ranges) {
        await new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `DELETE FROM vehicles WHERE id BETWEEN ? AND ?`,
                    [start, end],
                    () => {
                        totalDeleted += end - start + 1;
                        console.log(`🗑 Deleted vehicles ${start}–${end} (total deleted: ${totalDeleted})`);
                        resolve();
                    },
                    (_, error) => {
                        console.log("❌ Error deleting range:", error.message);
                        reject(error);
                    }
                );
            });
        });
    }

    console.log(`✅ Finished deleting ${totalDeleted} vehicles`);
};

const DetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { vehicleId } = route.params;
    const whatsapp = require('../assets/images/whatsapp.png');
    const Call = require('../assets/images/Call.png');
    const Copy = require('../assets/images/copy.png');
    const [DetailModal, setDetailModal] = useState(false);
    const [modalType, setModalType] = useState('copy');  // "copy" ya "whatsapp"
    const [userType, setUsertype] = useState(null);
    const [vehicleData, setVehicleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [CallManagerModal, setCallManagerModal] = useState(false);
    const [deletesyncstatus, setDeleteSyncstatus] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userMobile, setUserMobile] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationLoaded, setLocationLoaded] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("Please wait, we are deleting records...");

    // Get user details from AsyncStorage
    const getUserDetails = async () => {
        try {
            const id = await AsyncStorage.getItem('staff_id');
            const name = await AsyncStorage.getItem('staff_name');
            const mobile = await AsyncStorage.getItem('staff_mobile');

            setUserId(id);
            setUserName(name);
            setUserMobile(mobile);
        } catch (error) {
            console.log('❌ Error getting user details:', error.message);
        }
    };



    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "App needs access to your location",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS case
    };


    const getAddressFromCoords = async (latitude, longitude) => {
        try {
            const apiKey = 'AIzaSyA_ksjOCGFxVCnhjJ1Zj4BBhJIaD4nlpfM';
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                return data.results[0].formatted_address; // First result is usually the most accurate
            } else {
                console.log("❌ No address found");
                return "Unknown Address";
            }
        } catch (error) {
            console.log("❌ Error in reverse geocoding:", error.message);
            return "Unknown Address";
        }
    };


    const getCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            console.log("❌ Permission denied");
            return null;
        }

        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    console.log("✅ Location fetched:", latitude, longitude);
                    resolve({ latitude, longitude });
                },
                error => {
                    console.log("❌ Error getting location:", error.message);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 10000,
                    forceRequestLocation: true,
                    showLocationDialog: true
                }
            );
        });
    };

    useEffect(() => {
        const fetchAndSendLocation = async () => {
            try {
                const location = await getCurrentLocation();
                if (location) {
                    const address = await getAddressFromCoords(location.latitude, location.longitude);
                    setLocation({
                        ...location,
                        address: address,
                    });
                    setLocationLoaded(true);
                }
            } catch (e) {
                ToastAndroid.show("⚠️ Location not found", ToastAndroid.SHORT);
                setLocation({ latitude: "0", longitude: "0", address: "Unknown Address" });
                setLocationLoaded(true);
            }
        };

        fetchAndSendLocation();
    }, []);


    // Send scan data to server based on user type
    const sendScanData = async () => {
        if (!vehicleData || !userId || !location) return;

        try {
            let url, payload;

            const date = new Date();
            const entry_date = date.getFullYear() + "-" +
                String(date.getMonth() + 1).padStart(2, '0') + "-" +
                String(date.getDate()).padStart(2, '0') + " " +
                String(date.getHours()).padStart(2, '0') + ":" +
                String(date.getMinutes()).padStart(2, '0') + ":" +
                String(date.getSeconds()).padStart(2, '0');

            if (userType === 'normal') {

                url = ENDPOINTS.store_vehicle_scan_data;



                payload = {
                    user_id: parseInt(userId),
                    user_name: userName,
                    user_mobile: userMobile,
                    vehicle: [
                        {
                            id: vehicleData.id.toString(),
                            registration_number: vehicleData.registration_number || "",
                            agreement_no: vehicleData.agreement_no || "",
                            entry_date: entry_date,
                            location: location.address || "Scanned Location",
                            latitude: location.latitude,
                            longitude: location.longitude
                        }
                    ]
                };


            } else {
                console.log("usertype noram hai yar", userType);
                url = ENDPOINTS.store_full_vehicle_scan_data;
                console.log("usertype url hai yar", url);
                payload = {
                    user_id: parseInt(userId),
                    vehicle: [
                        {
                            id: vehicleData.id.toString(),
                            month: vehicleData.month || "",
                            finance_name: vehicleData.finance_name || "",
                            manager: vehicleData.manager || "",
                            branch: vehicleData.branch || "",
                            agreement_number: vehicleData.agreement_no || "",
                            app_id: vehicleData.app_id || "",
                            customer_name: vehicleData.customer_name || "",
                            bucket: vehicleData.bucket || "",
                            emi: vehicleData.emi || "",
                            principle_outstanding: vehicleData.principle_outstanding || "",
                            total_outstanding: vehicleData.total_outstanding || "",
                            product: vehicleData.product || "",
                            fild_fos: vehicleData.fild_fos || "",
                            registration_number: vehicleData.registration_number || "",
                            chassis_number: vehicleData.chassis_no || "",
                            engine_number: vehicleData.engine_no || "",
                            repo_fos: vehicleData.repo_fos || "",
                            entry_date: entry_date,
                            location: location.address || "Scanned Location",
                            latitude: location.latitude,
                            longitude: location.longitude
                        }
                    ]
                };
                console.log("usertype url hai yar", payload);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.code === 200) {
                console.log('✅ Scan data sent successfully');
                // ToastAndroid.show('Data Store Successfully', ToastAndroid.SHORT);
            } else {
                console.log('❌ Error sending scan data:', result.message);
            }
        } catch (error) {
            console.log('❌ Error sending scan data:', error.message);
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
                const deletesync = result.payload.staff_delete_sync_status;
                setDeleteSyncstatus(deletesync)
            } else {
                console.log('❌ Error: Failed to load data');
            }
        } catch (error) {
            console.log('❌ Error fetching data:', error.message);
        }
    };

    useEffect(() => {
        UserWiseExpiryApi(); // call on app start
        getUserDetails();
        getCurrentLocation();
        // searchByLastRegNo();
    }, []);

    useEffect(() => {
        if (deletesyncstatus == "Yes") {
            console.log("🚀 Delete sync enabled → syncing deleted vehicles");
            loadDeletedVehiclesPaginated();
        }
        console.log('hhhh', deletesyncstatus);
    }, [deletesyncstatus]);


    useEffect(() => {
        // Send scan data only when ALL required data is available
        console.log("🚀 All data available", vehicleData, userId, locationLoaded, userType, location);
        if (vehicleData && userId && locationLoaded && userType && location) {
            console.log("🚀 All data available, sending scan data");
            sendScanData();
        } else {

        }
    }, [vehicleData, userId, locationLoaded, userType, location]);

    const loadDeletedVehiclesPaginated = async () => {
        setDeleteModalVisible(true);
        let offset = 1;
        let keepLoading = true;
        let totalRecordsFetched = 0;
        let allDeletedIds = [];

        try {
            const userId = await AsyncStorage.getItem('staff_id');

            if (!userId) {
                console.log("❌ User ID not found");
                return;
            }

            const endpoint = ENDPOINTS.delete_vehicle_list;

            while (keepLoading) {
                const url = `${endpoint}?user_id=${userId}&offset=${offset}`;
                const response = await fetch(url);
                const result = await response.json();

                if (result.code == 200 && result.hasData !== 'nodata' && Array.isArray(result.payload)) {
                    const ids = result.payload.map(v => parseInt(v.id));
                    allDeletedIds = [...allDeletedIds, ...ids];
                    totalRecordsFetched += ids.length;
                    console.log(`🗑 Offset ${offset} → Received ${ids.length} deleted records`);
                    offset += 1;
                } else {
                    keepLoading = false;
                    console.log("✅ All deleted vehicles loaded.");
                }
                if (allDeletedIds.length > 0) {
                    await deleteVehiclesByIds(allDeletedIds);

                    // check if current record got deleted
                    if (allDeletedIds.includes(parseInt(vehicleId))) {
                        setDeleteMessage("It seems this record got deleted.");
                        setTimeout(() => {
                            setDeleteModalVisible(false);
                            navigation.goBack(); // or redirect somewhere
                        }, 2000);
                        return;
                    }
                }
            }
            setDeleteModalVisible(false);
        } catch (error) {
            console.log("❌ Error while loading deleted vehicles:", error.message);
            setDeleteModalVisible(false)
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            let usertype = null;

            const fetchUsertype = async () => {
                usertype = await AsyncStorage.getItem('user_type');
                setUsertype(usertype);
            };

            fetchUsertype();
        }, []),
    );

    // ✅ Fetch vehicle from SQLite
    useEffect(() => {
        if (!vehicleId) {
            console.log("⏩ No vehicleId provided, skipping fetch.");
            return;
        }

        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM vehicles WHERE id = ?`,
                [vehicleId],
                (tx, results) => {
                    console.log("✅ Query executed successfully. Row count:", results.rows.length);

                    if (results.rows.length > 0) {
                        const vehicle = results.rows.item(0);
                        // console.log("📦 Vehicle data fetched:", vehicle);
                        setVehicleData(vehicle);
                    } else {
                        console.log("⚠️ No vehicle found with ID:", vehicleId);
                    }

                    setLoading(false);
                },
                (error) => {
                    console.log("❌ Error fetching vehicle by id:", error.message);
                    setLoading(false);
                }
            );
        });
    }, [vehicleId]);

    const allowedFieldsForNormal = [
        { label: 'RC NUMBER', key: 'registration_number' },
        { label: 'ENGINE NUMBER', key: 'engine_number' },
        { label: 'CHASSIS NUMBER', key: 'chassis_number' },
        { label: 'FINANCE NAME', key: 'finance_name' },
        { label: 'PRODUCT', key: 'product' },
        { label: 'CUSTOMER NAME', key: 'customer_name' },
        // { label: 'FINANCE CONTACT PERSON NAME', key: 'finance_contact_person_name' },
        // { label: 'FINANCE CONTACT NUMBER', key: 'finance_contact_number' }
    ];

    const fields = userType === 'normal'
        ? allowedFieldsForNormal.map(item => ({
            label: item.label,
            value: vehicleData?.[item.key] || '---'
        }))
        : [
            { label: 'RC NUMBER', value: vehicleData?.registration_number || '---' },
            { label: 'FINANCE NAME', value: vehicleData?.finance_name || '---' },
            { label: 'AGREEMENT NUMBER', value: vehicleData?.agreement_number || '---' },
            { label: 'CUSTOMER NAME', value: vehicleData?.customer_name || '---' },
            { label: 'BUCKET', value: vehicleData?.bucket || '---' },
            { label: 'EMI', value: vehicleData?.emi || '---' },
            { label: 'PRINCIPLE OUTSTANDING', value: vehicleData?.principle_outstanding || '---' },
            { label: 'TOTAL OUTSTANDING', value: vehicleData?.total_outstanding || '---' },
            { label: 'PRODUCT', value: vehicleData?.product || '---' },
            { label: 'CHASSIS NUMBER', value: vehicleData?.chassis_number || '---' },
            { label: 'ENGINE NUMBER', value: vehicleData?.engine_number || '---' },
            { label: 'CUSTOMER ADDRESS', value: vehicleData?.customer_address || '---' },

        ];

    const [selectedFields, setSelectedFields] = useState({});
    const [isAllSelected, setIsAllSelected] = useState(false);

    const toggleSelection = (label) => {
        setSelectedFields((prev) => {
            const updatedFields = { ...prev };
            if (updatedFields[label]) {
                // Agar already selected hai to deselect kar do
                delete updatedFields[label];
            } else {
                // Naya select karte waqt add kar do
                updatedFields[label] = true;
            }
            return updatedFields;
        });
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedFields({});
        } else {
            const allSelected = fields.reduce((acc, item) => {
                acc[item.label] = true;
                return acc;
            }, {});
            setSelectedFields(allSelected);
        }
        setIsAllSelected(!isAllSelected);  // ✅ Toggling the checkbox
    };

    const handleCopy = () => {
        let messageToCopy = "";

        // ✅ Sir wali static message sirf tab dikhayein jab userType normal nahi ho
        if (userType !== 'normal') {
            messageToCopy += `Respected Sir,\nA vehicle has been traced out by our ground team.\nThe details of the vehicle and customer are as below:\n\n`;
        }

        // ✅ Selected fields ka message
        const selectedData = fields
            .filter(item => selectedFields[item.label])
            .map(item => `${item.label} : ${item.value}`)
            .join('\n');

        if (selectedData) {
            messageToCopy += selectedData;
            Clipboard.setString(messageToCopy);
            ToastAndroid.show("data Copied", ToastAndroid.SHORT);
        } else {
            // Optionally alert if nothing selected
            // Alert.alert('No Fields Selected', 'Please select at least one field to copy.');
        }

        closeModal();
    };


    const handleWhatsApp = async (sendAll = false) => {
        const useAll = sendAll || isAllSelected;

        // ✅ Static message
        const staticMessage = userType !== 'normal'
            ? `*Respected Sir*,\nA vehicle has been traced out by our ground team.\nThe details of the vehicle and customer are as below.\n\n`
            : ''
        // Selected fields ka message
        const selectedData = fields
            .filter(item => useAll || selectedFields[item.label])
            .map(item => `*${item.label}*: ${item.value}`)
            .join('\n');

        if (selectedData || staticMessage) {
            // Copy to clipboard
            Clipboard.setString(staticMessage + selectedData);

            // WhatsApp open karne ka code
            const messageContent = staticMessage + selectedData;
            try {
                const url = `whatsapp://send?text=${encodeURIComponent(messageContent)}`;
                const supported = await Linking.canOpenURL(url);

                if (supported) {
                    await Linking.openURL(url);
                } else {
                    const fallbackUrl = `https://wa.me/?text=${encodeURIComponent(messageContent)}`;
                    await Linking.openURL(fallbackUrl);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                Alert.alert('Error', 'There was an issue sending the message.');
            }
        } else {
            Alert.alert('No Fields Selected', 'Please select at least one field to send.');
        }

        closeModal();
    };


    const onShareDetails = async (sendAll = false) => {
        try {
            const useAll = sendAll || isAllSelected;

            // ✅ Static intro message
            const staticMessage = userType !== 'normal'
                ? `*Respected Sir*,\nA vehicle has been traced out by our ground team.\nThe details of the vehicle and customer are as below.\n\n`
                : ''
            // Selected fields
            const selectedData = fields
                .filter(item => useAll || selectedFields[item.label])
                .map(item => `${item.label}: ${item.value}`)
                .join('\n');

            if (!selectedData) {
                Alert.alert('No Fields Selected', 'Please select at least one field to share.');
                return;
            }

            // Combine static message + selected data
            const messageToShare = staticMessage + selectedData;

            const result = await Share.share({
                message: messageToShare,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log("Shared with activity type:", result.activityType);
                } else {
                    console.log("Shared successfully");
                }
            } else if (result.action === Share.dismissedAction) {
                console.log("Share dismissed");
            }
        } catch (error) {
            console.error(error.message);
        }

        closeModal();
    };


    const openModal = (type) => {
        if (userType == 'normal' && type == 'whatsapp') {
            // Directly send all fields to WhatsApp
            handleWhatsApp(true); // pass true for "send all"
        } else if (userType == 'normal' && type == 'share') {
            // Directly share all fields
            onShareDetails(true);
        } else {
            setModalType(type);
            setIsAllSelected(true);  // ✅ Checkbox ko checked karne ke liye
            const allSelected = fields.reduce((acc, item) => {
                acc[item.label] = true;
                return acc;
            }, {});
            setSelectedFields(allSelected);
            setDetailModal(true);
        }
    };

    const closeModal = () => {
        setDetailModal(false);
        setSelectedFields({});  // Deselect all fields
    };

    const handlePhoneCall = (phoneNumber) => {
        console.log("called", phoneNumber);

        let phone = phoneNumber.replace(/\D/g, ''); // Remove non-numeric characters
        if (phone) {
            Linking.openURL(`tel:${phone}`).catch(() => Alert('Failed to make a call'));
        }
    };
    const SecondPhoneCall = (phoneNumber) => {
        console.log("called", phoneNumber);

        if (!phoneNumber || typeof phoneNumber !== 'string') {
            Alert.alert("Invalid Number", "No valid phone number provided.");
            return;
        }

        const phone = phoneNumber.replace(/\D/g, ''); // Remove non-digits

        if (phone.length > 0) {
            Linking.openURL(`tel:${phone}`)
                .catch(() => Alert.alert("Error", "Failed to make a call."));
        } else {
            Alert.alert("Invalid Number", "Phone number is empty or invalid.");
        }
    };
    // 📩 SMS Function
    const SecondPhoneSMS = (phoneNumber) => {
        console.log("sms", phoneNumber);

        if (!phoneNumber || typeof phoneNumber !== "string") {
            Alert.alert("Invalid Number", "No valid phone number provided.");
            return;
        }

        const phone = phoneNumber.replace(/\D/g, ""); // Remove non-digit chars

        if (phone.length === 0) {
            Alert.alert("Invalid Number", "Phone number is empty or invalid.");
            return;
        }

        // ✅ Static intro message
        const staticMessage = userType !== 'normal'
            ? `*Respected Sir*,\nA vehicle has been traced out by our ground team.\nThe details of the vehicle and customer are as below.\n\n`
            : ''
        // ✅ Prepare fields message
        const fieldsMessage = fields
            .map(item => `${item.label}: ${item.value}`)
            .join('\n');

        // ✅ Complete message
        const messageToSend = staticMessage + fieldsMessage;

        // ✅ Open SMS
        const url = `sms:${phone}${messageToSend ? `?body=${encodeURIComponent(messageToSend)}` : ""}`;
        Linking.openURL(url).catch(() => Alert.alert("Error", "Failed to send SMS."));
    };


    // 💬 WhatsApp Function
    const SecondPhoneWhatsApp = (phoneNumber) => {
        console.log("whatsapp", phoneNumber);

        if (!phoneNumber || typeof phoneNumber !== "string") {
            Alert.alert("Invalid Number", "No valid phone number provided.");
            return;
        }

        const phone = phoneNumber.replace(/\D/g, ""); // Remove non-digit chars

        if (phone.length === 0) {
            Alert.alert("Invalid Number", "Phone number is empty or invalid.");
            return;
        }

        const staticMessage = userType !== 'normal'
            ? `*Respected Sir*,\nA vehicle has been traced out by our ground team.\nThe details of the vehicle and customer are as below.\n\n`
            : ''
        // ✅ Prepare fields message
        const fieldsMessage = fields
            .map(item => `${item.label}: ${item.value}`)
            .join('\n');

        // ✅ Complete message
        const messageToSend = staticMessage + fieldsMessage;

        // ✅ Open WhatsApp
        const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(messageToSend)}`;
        Linking.openURL(url)
            .catch(() =>
                Alert.alert(
                    "Error",
                    "Failed to open WhatsApp. Make sure it is installed."
                )
            );
    };

    const ThirdPhoneCall = (phoneNumber) => {


        if (!phoneNumber || typeof phoneNumber !== 'string') {
            Alert.alert("Invalid Number", "No valid phone number provided.");
            return;
        }

        const phone = phoneNumber.replace(/\D/g, ''); // Remove non-digits

        if (phone.length > 0) {
            Linking.openURL(`tel:${phone}`)
                .catch(() => Alert.alert("Error", "Failed to make a call."));
        } else {
            Alert.alert("Invalid Number", "Phone number is empty or invalid.");
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={colors.Brown} />
            </View>
        );
    }

    const sendWhatsApp = async (phoneNumber) => {
        try {
            if (!phoneNumber) {
                Alert.alert('Error', 'Phone number is required');
                return;
            }

            // Fields that always go in the message
            const alwaysIncludedFields = [
                { label: 'Agency Name', value: vehicleData.vehicle_finance_name },
                { label: 'Agency Contact', value: vehicleData.agency_person_name },
                { label: 'Agency Email', value: vehicleData.agency_contact_number },
            ];

            const alwaysIncludedData = alwaysIncludedFields
                .map(item => `${item.label}: *${item.value || '-'}*`)
                .join('\n');

            // Optional dynamic fields
            const filteredFields = fields.filter(item => {
                if (userType === 'SubAdmin' && vehicleData.owner_type === 'owner' && item.label.includes('MANAGER')) {
                    return false; // exclude manager fields
                }
                return true;
            });

            const allData = filteredFields
                .map(item => {
                    if (item.label.includes('MANAGER')) {
                        const name = item.name || '-';
                        return `${item.label}: *${name}* - ${item.number || '-'}`;
                    } else {
                        return `${item.label}: *${item.value || '-'}*`;
                    }
                })
                .join('\n');

            // Compose the message
            const staticMessage = `*Respected Sir*,\nA vehicle has been traced out by our ground team.\nThe details of the vehicle and customer are as below:\n\n`;
            const fullMessage = `${staticMessage}${allData}\n${alwaysIncludedData}`;

            // Copy to clipboard (optional)
            Clipboard.setString(fullMessage);

            // WhatsApp URL
            const phone = phoneNumber.replace(/\D/g, ''); // remove non-numeric
            const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(fullMessage)}`;

            const supported = await Linking.canOpenURL(url);

            if (supported) {
                await Linking.openURL(url);
                ToastAndroid.show('Opening WhatsApp...', ToastAndroid.SHORT);
            } else {
                // fallback to web
                const fallbackUrl = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
                await Linking.openURL(fallbackUrl);
            }

        } catch (error) {
            console.error('WhatsApp share error:', error);
            Alert.alert('Error', 'There was an issue sending to WhatsApp.');
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header Section */}
            <View style={{ backgroundColor: colors.Brown, paddingVertical: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
                <TouchableOpacity style={{ position: 'absolute', top: 15, left: 15 }}
                    onPress={() => {
                        navigation.goBack();
                    }}>
                    <Feather name="arrow-left" size={28} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', fontFamily: 'Inter-Bold', }}> Vehicle Details
                </Text>
                <View style={{ width: '25%', height: 50, justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 10, top: 3, flexDirection: 'row', gap: 15, }}>
                    <TouchableOpacity onPress={() => openModal('copy')}>
                        <Image source={Copy} style={{ width: 30, height: 30, tintColor: 'white' }} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => openModal('whatsapp')}>
                        <Image source={whatsapp} style={{ width: 25, height: 25 }} />
                    </TouchableOpacity>
                </View>
            </View>

            {!deleteModalVisible && (
                <ScrollView style={{ flex: 1, backgroundColor: 'white', margin: 10 }} keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
                    <View style={{ justifyContent: 'center', flexDirection: 'row', padding: 8 }}>
                        <Text style={{ color: colors.light_brown, fontFamily: 'Inter-Bold', fontSize: 16 }}>Vehicle Details</Text>
                    </View>
                    <View style={{ marginBottom: 3, borderWidth: 1, borderColor: '#ddd' }}>
                        {fields.map((item, index) => (
                            <View
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    borderBottomWidth: 0.5,
                                    borderColor: '#ccc',
                                    paddingVertical: 1.5

                                }}
                            >
                                <View style={{ width: '38%', justifyContent: 'center', alignItems: 'flex-start' }}>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: 'Inter-Regular',
                                            padding: 6,
                                            color: 'black',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                </View>


                                <View style={{ width: '62%' }}>
                                    <TouchableOpacity
                                        style={{
                                            borderRadius: 8,
                                            padding: 6,
                                            flexDirection: 'row', // Important for wrapping
                                            alignItems: 'flex-start', // Align text to start
                                            backgroundColor: 'white',
                                        }}
                                        onPress={() =>
                                            item.label === 'MANAGER' && item.value
                                                ? handlePhoneCall(item.value)
                                                : null
                                        }
                                        disabled={!item.value} // Disable if no value
                                        activeOpacity={1}
                                    >
                                        <Text
                                            style={{
                                                color: 'black',
                                                fontFamily: 'Inter-Bold',
                                                flexWrap: 'wrap', // Allow text to wrap
                                                flex: 1, // Take full available space
                                                flexDirection: 'row',
                                                lineHeight: 18, // Line spacing for better readability
                                                fontSize: 12
                                            }}
                                        >
                                            {item.value}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/*  <View style={{ marginTop: 10, borderWidth: 1, borderColor: '#ddd', }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, backgroundColor: '#ddd' }}>
                            <View style={{ width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'black', fontFamily: 'Inter-Bold', fontSize: 12 }}>FINANCE PERSON</Text>
                            </View>
                            <View style={{ width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'black', fontFamily: 'Inter-Bold', fontSize: 12 }}>FINANCE NUMBER</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <View style={{ width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 14 }}>{vehicleData.finance_contact_person_name || '---'}</Text>
                            </View>
                            <View style={{ width: '50%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 20 }}>

                                <TouchableOpacity onPress={() => SecondPhoneCall(vehicleData.finance_contact_number)} >
                                    <Text style={{ color: 'blue', fontFamily: 'Inter-Regular', fontSize: 14 }}>{vehicleData.finance_contact_number || '---'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    */}

                    <View style={{ justifyContent: 'center', flexDirection: 'row', padding: 8 }}>
                        <Text style={{ color: colors.light_brown, fontFamily: 'Inter-Bold', fontSize: 16 }}>Agency Details</Text>
                    </View>

                    <View style={{ marginTop: 10, borderWidth: 1, borderColor: '#ddd' }}>
                        {/* Agency Name */}
                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                            <View style={{ width: '38%', justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                    padding: 6,
                                    color: 'black',
                                    textTransform: 'uppercase',
                                }}>AGENCY NAME</Text>
                            </View>
                            <View style={{ width: '62%', justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={{
                                    color: 'black',
                                    fontFamily: 'Inter-Bold',
                                    flexWrap: 'wrap', // Allow text to wrap
                                    flex: 1, // Take full available space
                                    flexDirection: 'row',
                                    padding: 6,
                                    // Line spacing for better readability
                                    fontSize: 12
                                }}>Elina Corporation</Text>
                            </View>
                        </View>

                        {/* Agency Contact Number */}
                        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                        <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start' }}>
                            <Text style={{
                                fontSize: 12,
                                fontFamily: 'Inter-Regular',
                                padding: 6,
                                color: 'black',
                                textTransform: 'uppercase',
                            }}>AGENCY CONTACT NUMBER</Text>
                        </View>
                        <View style={{ width: '70%', justifyContent: 'center', alignItems: 'flex-start' }}>
                            <Text style={{
                                color: 'blue',
                                fontFamily: 'Inter-Bold',
                                flexWrap: 'wrap', // Allow text to wrap
                                flex: 1, // Take full available space
                                flexDirection: 'row',
                                padding: 6,// Line spacing for better readability
                                fontSize: 12
                            }}>8469588832</Text>
                        </View>
                    </View> */}

                        {/* Agency Address */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                            <View style={{ width: '38%', justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                    padding: 6,
                                    color: 'black',
                                    textTransform: 'uppercase',
                                }}>AGENCY ADDRESS</Text>
                            </View>
                            <View style={{ width: '62%', justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={{
                                    color: 'black',
                                    fontFamily: 'Inter-Bold',
                                    flexWrap: 'wrap', // Allow text to wrap
                                    flex: 1, // Take full available space
                                    flexDirection: 'row',
                                    padding: 6, // Line spacing for better readability
                                    fontSize: 12
                                }}>108, 1st Floor, Satkar Hotel Building, Unapani Road, Delhi Gate, Surat, Gujarat - 395003</Text>
                            </View>
                        </View>

                        {/* Confirmation Number */}
                        {/* <View style={{ flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                            <View style={{ justifyContent: 'center', flexDirection: 'row', padding: 6, width: '100%' }}>
                                <Text style={{ color: colors.light_brown, fontFamily: 'Inter-Bold', fontSize: 16 }}>Confirmation Number</Text>
                            </View>

                        </View>

                   
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                            <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                    padding: 6,
                                    color: 'black',
                                    textTransform: 'uppercase',
                                }}>MOBILE NO 1</Text>
                            </View>
                            <View style={{ width: '70%', flexDirection: 'row', alignItems: 'center', gap: 15, paddingRight: 5 }}>
                                <Text style={{
                                    color: 'blue',
                                    fontFamily: 'Inter-Bold',
                                    flexWrap: 'wrap', // Allow text to wrap
                                    flex: 1, // Take full available space
                                    flexDirection: 'row',
                                    padding: 6,// Line spacing for better readability
                                    fontSize: 12
                                }}>8469588832</Text>
                                <TouchableOpacity onPress={() => SecondPhoneCall('8469588832')}>
                                    <Image source={Call} style={{ width: 20, height: 20 }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => sendWhatsApp('8469588832')}>
                                    <Image source={whatsapp} style={{ width: 20, height: 20 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

               
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                    padding: 6,
                                    color: 'black',
                                    textTransform: 'uppercase',
                                }}>MOBILE NO 2</Text>
                            </View>
                            <View style={{ width: '70%', flexDirection: 'row', alignItems: 'center', gap: 15, paddingRight: 5 }}>
                                <Text style={{
                                    color: 'blue',
                                    fontFamily: 'Inter-Bold',
                                    flexWrap: 'wrap', // Allow text to wrap
                                    flex: 1, // Take full available space
                                    flexDirection: 'row',
                                    padding: 6,// Line spacing for better readability
                                    fontSize: 12
                                }}>8401988832</Text>
                                <TouchableOpacity onPress={() => SecondPhoneCall('8401988832')}>
                                    <Image source={Call} style={{ width: 20, height: 20 }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => sendWhatsApp('8401988832')}>
                                    <Image source={whatsapp} style={{ width: 20, height: 20 }} />
                                </TouchableOpacity>
                            </View>
                        </View> */}
                    </View>

                    {/* {userType === 'normal' && (
                    <View style={{
                        marginTop: 10,
                        borderWidth: 1,
                        borderColor: '#ddd',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 10,
                        paddingHorizontal: 10
                    }}>

                        <Text style={{
                            color: 'black',
                            fontFamily: 'Inter-Regular',
                            fontSize: 12
                        }}>
                            CONFIRMATION NUMBER
                        </Text>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <Image source={Call} style={{ width: 20, height: 20 }} />
                            <TouchableOpacity onPress={() => ThirdPhoneCall('02656631816')}>
                                <Text style={{ color: 'blue', fontFamily: 'Inter-Regular', fontSize: 12 }}>
                                    02656631816
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                )} */}
                </ScrollView>
            )}

            {!deleteModalVisible && (
                <View style={{ marginBottom: 2, flexDirection: "row", justifyContent: "space-between", marginHorizontal: 10, }} >
                    {/* Call Manager Button */}
                    <TouchableOpacity onPress={() => setCallManagerModal(true)} style={{ backgroundColor: colors.Brown, width: "49%", paddingVertical: 9, flexDirection: "row", alignItems: "center", justifyContent: "center", }} >
                        <Ionicons name="call" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#fff", }} >
                            Call Agency
                        </Text>
                    </TouchableOpacity>

                    {/* Share Details Button */}
                    <TouchableOpacity onPress={() => openModal("share")} style={{ backgroundColor: "#e2a502", width: "49%", paddingVertical: 9, flexDirection: "row", alignItems: "center", justifyContent: "center", }} >
                        <Ionicons name="share-social-sharp" size={20} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#fff", }} >
                            Share Details
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={DetailModal}
                onRequestClose={closeModal}
            >
                <TouchableOpacity onPress={closeModal} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>

                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '100%', backgroundColor: '#fff', borderRadius: 10, height: '90%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', backgroundColor: colors.Brown, padding: 10 }}>
                            <TouchableOpacity
                                style={{ justifyContent: 'center', alignItems: 'center' }}
                                onPress={closeModal}>
                                <Entypo name="cross" size={30} color="white" />
                            </TouchableOpacity>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 7, }}>
                                <Text
                                    style={{
                                        color: 'white',
                                        fontFamily: 'Inter-Bold',
                                        fontSize: 14,

                                        textAlign: 'center',
                                    }}
                                >
                                    {/* {modalType === 'copy' ? 'Copy' : 'WhatsApp'} */}
                                    Copy vehicle Detail
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 7, justifyContent: 'flex-end', padding: 3, flex: 1 }}>
                                <CheckBox
                                    value={isAllSelected}
                                    onValueChange={toggleSelectAll}
                                    tintColors={{ true: 'white', false: '#ccc' }}
                                />
                                <Text style={{ marginLeft: 8, fontWeight: 'bold', color: 'white', fontFamily: 'Inter-Regular' }}>
                                    {'Select All'}
                                </Text>
                            </View>
                        </View>

                        <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: 'white' }} contentContainerStyle={{ paddingBottom: 10 }}>

                            {fields.map((item) => (
                                <View
                                    key={item.label}
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginVertical: 3,
                                        borderBottomWidth: 0.5,
                                        borderColor: '#ccc',
                                        paddingHorizontal: 10
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: 'black',
                                            flex: 1,
                                            fontFamily: 'Inter-Regular',
                                        }}
                                    >
                                        {item.label}
                                    </Text>

                                    <CheckBox
                                        value={selectedFields[item.label] || false}
                                        onValueChange={() => toggleSelection(item.label)}
                                        tintColors={{ true: colors.Brown, false: '#ccc' }}
                                    />
                                </View>
                            ))}

                        </ScrollView>
                        <View style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: selectedFields && Object.keys(selectedFields).length > 0 ? colors.Brown : '#ccc', // Grey when disabled
                                    paddingVertical: 8,
                                    paddingHorizontal: 30,
                                    borderRadius: 8,
                                    width: '100%',
                                    alignItems: 'center',
                                    alignSelf: 'center',

                                    flexDirection: 'row',
                                    justifyContent: 'center', gap: 10
                                }}
                                onPress={modalType === 'copy' ? handleCopy : modalType == 'whatsapp' ? handleWhatsApp : onShareDetails}
                                disabled={!(selectedFields && Object.keys(selectedFields).length > 0)}
                            >
                                {modalType === 'whatsapp' && (
                                    <Image
                                        source={whatsapp}
                                        style={{ width: 20, height: 20 }}
                                    />
                                )}
                                <Text
                                    style={{
                                        color: selectedFields && Object.keys(selectedFields).length > 0 ? '#fff' : 'grey',
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Regular',
                                    }}
                                >
                                    {modalType == 'copy' ? 'Copy' : modalType == 'whatsapp' ? 'WhatsApp Send' : 'Share'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={CallManagerModal}
                onRequestClose={() => setCallManagerModal(false)}
            >
                <TouchableOpacity
                    onPress={() => { setCallManagerModal(false) }}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }} >
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{
                        backgroundColor: '#fff',
                        paddingBottom: 7,
                        paddingTop: 3,
                        minWidth: '85%',
                        borderRadius: 10,
                    }}
                    >


                        {/* First Agency Block */}
                        <View style={{ backgroundColor: '#f8f9fa', margin: 10, borderRadius: 8, padding: 10 }}>
                            <View style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', paddingVertical: 5 }}>
                                <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 14 }}>
                                    Agency 1
                                </Text>
                                <Text style={{ color: 'blue', fontFamily: 'Inter-Regular', fontSize: 14 }}>
                                    (8469588832)
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'center', gap: 15 }}>
                                <TouchableOpacity
                                    onPress={() => SecondPhoneCall('8469588832')}
                                    style={{ alignItems: 'center', height: 60, width: 80 }}>
                                    <FontAwesome name={'mobile-phone'} color={'#1f97f1'} size={25} />
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>Call</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => SecondPhoneSMS('+918469588832')}
                                    style={{ alignItems: 'center', height: 60, width: 80 }}>
                                    <Entypo name={'mail'} color={'#1f97f1'} size={25} />
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>Message</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => SecondPhoneWhatsApp('+918469588832')}
                                    style={{ alignItems: 'center', height: 60, width: 80 }}>
                                    <Image source={whatsapp} style={{ height: 25, width: 25 }} />
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>WhatsApp</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Second Agency Block */}
                        <View style={{ backgroundColor: '#f8f9fa', margin: 10, marginTop: 0, borderRadius: 8, padding: 10 }}>
                            <View style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', paddingVertical: 5 }}>
                                <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 14 }}>
                                    Agency 2
                                </Text>
                                <Text style={{ color: 'blue', fontFamily: 'Inter-Regular', fontSize: 14 }}>
                                    (8401988832)
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'center', gap: 15 }}>
                                <TouchableOpacity
                                    onPress={() => SecondPhoneCall('8401988832')}
                                    style={{ alignItems: 'center', height: 60, width: 80 }}>
                                    <FontAwesome name={'mobile-phone'} color={'#1f97f1'} size={25} />
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>Call</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => SecondPhoneSMS('+918401988832')}
                                    style={{ alignItems: 'center', height: 60, width: 80 }}>
                                    <Entypo name={'mail'} color={'#1f97f1'} size={25} />
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>Message</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => SecondPhoneWhatsApp('+918401988832')}
                                    style={{ alignItems: 'center', height: 60, width: 80 }}>
                                    <Image source={whatsapp} style={{ height: 25, width: 25 }} />
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>WhatsApp</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Close Button */}
                        <View style={{ alignSelf: 'flex-end', marginRight: 15, marginTop: 10 }}>
                            <TouchableOpacity onPress={() => setCallManagerModal(false)}>
                                <Text style={{ color: 'red', fontFamily: 'Inter-Medium', fontSize: 13 }}>CLOSE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                transparent={true}
                visible={deleteModalVisible}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" }}>
                        <ActivityIndicator size="large" color={colors.Brown} />
                        <Text style={{ marginTop: 15, fontSize: 14, color: "black", fontFamily: 'Inter-SemiBold' }}>
                            {deleteMessage}
                        </Text>
                    </View>
                </View>
            </Modal>

        </View >
    )
}

export default DetailScreen

const styles = StyleSheet.create({})