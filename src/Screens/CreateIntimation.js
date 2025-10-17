import {
    Alert,
    FlatList,
    Image,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
    Linking,
    ActivityIndicator
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../CommonFiles/Colors';
import { ENDPOINTS } from '../CommonFiles/Constant';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import DateTimePicker from '@react-native-community/datetimepicker';
import AntDesign from 'react-native-vector-icons/AntDesign'
import AsyncStorage from '@react-native-async-storage/async-storage';
import FileViewer from 'react-native-file-viewer';

const CreateIntimation = () => {
    const whatsapp = require('../assets/images/whatsapp.png');



    const route = useRoute();

    const navigation = useNavigation();

    const [text, setText] = useState(null);

    const [startDate, setStartDate] = useState(new Date()); // Default to current date
    const [endDate, setEndDate] = useState(null); // Set endDate to null initially

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showAfterMailButtons, setShowAfterMailButtons] = useState(false);

    const [isAreaVisible, setIsAreaVisible] = useState(false);
    const [areaList, setAreaList] = useState([]);
    const [filteredAreaList, setFilteredAreaList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [selectedAreaId, setselectedAreaId] = useState('');

    const [ReppoAgency, setReppoAgency] = useState('');

    const [AreaAddress, setAreaAddress] = useState('');
    const [areaNameError, setAreaNameError] = useState('');
    const [IntimationLoading, setIntimationLoading] = useState(false)
    const [AreaEmail, setAreaEmail] = useState('');
    const [Id, setId] = useState('');
    console.log("ye hai id", Id);

    const [date, setDate] = useState('');
    console.log("ye date hai ab se", date);
    const [time, setTime] = useState('');
    const [AgencyEmail, setAgencyEmail] = useState('');

    const [loanNo, setLoanNo] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [rcNo, setRcNo] = useState('');
    const [product, setProduct] = useState('');
    const [engineNo, setEngineNo] = useState('');
    const [chasisNo, setChasisNo] = useState('');
    const [financeName, setfinanceName] = useState('');
    const [EntryTime, setEntryTime] = useState('');

    const [showTimePicker, setShowTimePicker] = useState(false); // To control the visibility of the time picker
    const [selectedTime, setSelectedTime] = useState(new Date()); // To hold the selected time
    const [preLoading, setPreLoading] = useState(false);  // For Pre button loading state
    const [postLoading, setPostLoading] = useState(false);

    const [PreMailLoading, setPreMailLoading] = useState(false);
    const [PostMailLoading, setPostMailLoading] = useState(false);

    const [PrePdfLoading, setPrePdfLoading] = useState(false);
    const [PostPdfLoading, setPostPdfLoading] = useState(false);






    // Fetch area list from the API
    useEffect(() => {
        fetchAreaList();
    }, []);



    const fetchAreaList = async () => {
        try {
            const response = await fetch(ENDPOINTS.Area_list);
            const result = await response.json();
            if (result.code === 200) {
                setAreaList(result.payload);  // Save the full list
                setFilteredAreaList(result.payload);  // Save the full list for search functionality
            } else {
                console.log('Error:', result.message);
            }
        } catch (error) {
            console.log('Error fetching data:', error.message);
        }
    };

    // Handle search query to filter the area list
    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text) {
            const filtered = areaList.filter(item =>
                item.manage_area_name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredAreaList(filtered);
        } else {
            setFilteredAreaList(areaList); // Reset to full list if search query is empty
        }
    };

    useEffect(() => {
        if (filteredAreaList.length > 0) {
            const defaultArea = filteredAreaList[0]; // First area in the list
            setSelectedArea(defaultArea.manage_area_name);
            setselectedAreaId(defaultArea.manage_email_id);

        }
    }, [filteredAreaList]);

    // Handle area selection
    const handleSelectArea = (item) => {
        setSelectedArea(item.manage_area_name);
        setAreaEmail(item.manage_emailid);
        setselectedAreaId(item.manage_email_id)
        setAreaAddress(item.manage_address);
        setIsAreaVisible(false); // Hide dropdown after selection
        setSearchQuery(''); // Clear search query
    };


    const [currentDate, setCurrentDate] = useState('');




    const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Track dropdown visibility
    const [selectedType, setSelectedType] = useState('Select Type'); // Store selected type
    console.log('selected type', selectedType);
    const [dropdownData] = useState([
        { label: 'Confirm', value: 'Confirm' },
        { label: 'Cancel', value: 'Cancel' },
    ]); // Static data for dropdown

    const [isAgencyVisible, setIsAgencyVisible] = useState(false);
    const [SelectedAgency, setSelectedAgency] = useState('MAA JAGDAMBA SERVICE');  // Store selected type
    const [SendAgency, setSendAgency] = useState('');
    console.log('selected type', selectedType);
    const [AgencyData] = useState([
        { label: 'MAA JAGDAMBA SERVICE', value: 'Maa Jagadamba' },
        { label: 'KANHA ENTERPRISE', value: 'Kanha Enterprise' },
    ]);
    const [AgencyError, setAgencyError] = useState('');
    const [AreaError, setAreaError] = useState('');



    useEffect(() => {
        // Get today's date in the format DD-MM-YYYY
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        setDate(formattedDate);

        // Get current time and subtract 15 minutes if 'Confirm'
        let currentTime = new Date();

        // If selectedType is 'Confirm', subtract 15 minutes
        if (selectedType === 'Confirm') {
            currentTime = new Date(currentTime.getTime() - 15 * 60 * 1000); // Subtract 15 minutes
        }

        // Format the time in HH:MM format
        const hours = String(currentTime.getHours()).padStart(2, '0');
        const minutes = String(currentTime.getMinutes()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        setTime(formattedTime);
        setSelectedTime(currentTime); // Set the initial selected time after subtracting 15 minutes if 'Confirm'
    }, [selectedType]);

    // Function to handle time selection
    const handleTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || selectedTime;
        setShowTimePicker(false);
        setSelectedTime(currentDate);

        // Format the time in HH:MM format
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        setTime(formattedTime);
    };

    const AgencyDropdown = () => {
        setIsAgencyVisible(!isAgencyVisible);
    };

    const handleAgency = Agency => {
        setSelectedAgency(Agency.label);
        setSendAgency(Agency.value)
        setIsAgencyVisible(false);
    };

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };
    const handleSelect = staff => {
        setSelectedType(staff.value);
        // Close the dropdown after selection
        setIsDropdownVisible(false);
    };

    // Function to get the current date in DD-MM-YYYY format
    const getCurrentDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0'); // Ensure two-digit day
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
        const year = today.getFullYear();

        return `${day}-${month}-${year}`;
    };

    // Set the current date when the component is mounted
    useEffect(() => {
        setCurrentDate(getCurrentDate());
    }, []); //

    const AddIntimation = async (shouldNavigateBack = true) => {

        // let isValid = true;

        // // Reset previous errors
        // setAgencyError('');
        // setAreaError('');

        // // Validation: Check if both agency and area are selected
        // if (SelectedAgency === 'Select Agency' || !SelectedAgency) {
        //   setAgencyError('Agency Name is Required');
        //   isValid = false; // Mark form as invalid if no agency is selected
        // }

        // if (!selectedArea) {
        //   setAreaError('Area Name is Required');
        //   isValid = false; // Mark form as invalid if no area is selected
        // }

        // if (!isValid) {
        //   return; // Stop further execution if validation fails
        // }



        try {
            const staffId = await AsyncStorage.getItem('staff_id');

            const currentTime = new Date();

            // If selectedType is 'Confirm', subtract 15 minutes
            if (selectedType == 'Confirm') {
                currentTime.setMinutes(currentTime.getMinutes() - 15); // Subtract 15 minutes
            }

            // Format the time into a readable format (HH:mm)
            const hours = currentTime.getHours().toString().padStart(2, '0');  // Ensure two-digit format
            const minutes = currentTime.getMinutes().toString().padStart(2, '0');  // Ensure two-digit format
            const formattedTime = `${hours}:${minutes}`;

            console.log("formatted time", formattedTime);

            const response = await fetch(ENDPOINTS.Add_Intimation, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({

                    loan_no: loanNo,
                    rc_no: rcNo,
                    chassis_no: chasisNo,
                    engine_no: engineNo,
                    product: product,
                    customer_name: customerName,
                    customer_address: 'NA',
                    reppo_address: 'NA',
                    confirm_status: selectedType,
                    agency_select: SelectedAgency,
                    finance_name: financeName,
                    police_station_area: selectedAreaId,
                    intimation_status: selectedType,
                    agency_name: SendAgency,
                    form_date: date,
                    form_time: selectedType === 'Confirm' ? formattedTime : time,
                    staff_id: staffId || '',
                    reposession_agent: ReppoAgency || '',
                }),
            });



            const result = await response.json();

            if (response.ok) {
                if (result.code == 200) {
                    ToastAndroid.show("Intimation Submitted Successfully", ToastAndroid.SHORT);
                    setId(result.payload.id);
                    setAgencyEmail(result.payload.agency_email);
                    if (shouldNavigateBack == true) {
                        navigation.goBack(); // Yaha navigation hona chahiye
                    }
                    return result.payload.id;
                } else {
                    console.log('Error:', 'Failed to load staff data');
                }
            } else {
                console.log('HTTP Error:', result.message || 'Something went wrong');
            }
        } catch (error) {
            console.log('Error fetching data:', error.message);
        } finally {
            setIntimationLoading(false)
        }

    };



    const formatDate = date => {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your storage to save PDF files.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Storage permission granted');
                } else {
                    console.log('Storage permission denied');

                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    useEffect(() => {
        requestStoragePermission();
    }, []);

    //     const PreDownloadPDF = async () => {
    //         AddIntimation(true);
    //         setPrePdfLoading(true);
    //         const htmlContent = `
    //     <html>
    //       <head>
    //         <style>
    //           body {
    //             font-family: 'Inter-Regular';
    //             font-size: 14px;
    //             color: black;
    //             padding: 20px;
    //             background-color: white;
    //           }
    //           table {
    //             width: 100%;
    //             border-collapse: collapse;
    //             margin-top: 20px;
    //           }
    //           th, td {
    //             padding: 10px;
    //             text-align: left;

    //           }
    //           th {
    //             font-weight: bold;
    //           }
    //           .header-title {
    //             text-align: center;
    //             font-size: 14px;
    //             font-weight: bold;
    //             margin-bottom: 15px;
    //           }
    //              .header-text{
    //                   text-decoration: underline;
    //                   }
    //           .static-text {
    //             font-size: 14px;
    //             margin-Top: 10px;
    //             margin-bottom: 10px;
    //             text-align: justify;
    //           }
    //             .static-Top {



    // font-size: 14px;

    // }

    //           .details-row {
    //             display: flex;
    //             justify-content: space-between;
    //             margin-top: 15px;
    //           }
    //           .details-row div {
    //             width: 48%; /* Both left and right columns take up nearly half the space */
    //           }
    //           .static-name {
    // width: 40%;
    // display: flex;
    // flex-direction: row;
    // justify-content: space-between;
    // font-size: 14px;
    // margin-bottom: 10px;
    // }


    //         </style>
    //       </head>
    //       <body>
    //         <!-- Header -->
    //         <div class="header-title"><h3 class="header-text" style="text-align:center">PRE Intimation of Repossession to Police Station</h3></div>
    //         <!-- Static Message -->
    //         <div class="static-Top">

    //           To</br>
    //           Police Inspector,</br>
    //            ${AreaAddress || '------'}</br>
    //             ${selectedArea || '------'}</br>


    //         </div>

    //         <!-- Static Message -->
    //         <div class="static-text">
    //          This is to inform you that below customer has default in payment and has not shown up to pay
    // money even after several reminders. We are going to repossess the vehicle
    //         </div>

    //         <!-- Table for Dynamic Vehicle Details -->
    //         <table>

    //           <tr>
    //             <th>Loan Agreement No</th>
    //             <td><strong>:</strong></td>
    //             <td>${.vehicle_agreement_no || '----------'
    //             }</td>
    //           </tr>
    //             </tr>
    //             <th>Customer Name</th>
    //             <td><strong>:</strong></td>
    //             <td>${.vehicle_customer_name || '----------'}</td>
    //           </tr>
    //            <tr>
    //             <th>Vehicle Registration No</th>
    //             <td><strong>:</strong></td>
    //             <td>${.vehicle_registration_no || '----------'}</td>
    //           </tr>
    //           <tr>
    //             <th>Product Model</th>
    //             <td><strong>:</strong></td>
    //             <td>${.vehicle_product || '----------'}</td>

    //             </tr>
    //           <tr>
    //             <th>Engine No</th>
    //             <td><strong>:</strong></td>
    //             <td>${.vehicle_engine_no || '----------'}</td>
    //           </tr>
    //           <tr>
    //             <tr>
    //             <th>Chassis No</th>
    //             <td><strong>:</strong></td>
    //             <td>${.vehicle_chassis_no || '----------'}</td>
    //           </tr>

    //         <!-- Date and Time Row -->
    //     <tr>
    //       <th>Date</th>
    //       <td><strong>:</strong></td>
    //       <td>${date || '----------'}</td>
    //     </tr>
    //     <tr>
    //       <th>Time</th>
    //       <td><strong>:</strong></td>
    //       <td>${time || '----------'}</td>
    //     </tr>

    //         </table>

    //         <!-- Static Footer Text with 3 Paragraphs -->
    //         <div class="static-text">

    //           <p>Please do not take any complains of vehicle being stolen from the customer.</p>
    //         </div>

    //         <!-- Finance and Agency Details (Displayed on left and right side) -->
    //         <div class="static-name">

    //         <p>${.vehicle_finance_name || '----------'
    //             }</p>
    //    <p>${SelectedAgency || '----------'
    //             }</p>


    //       </div>
    //       </body>
    //     </html>
    //   `;

    //         try {
    //             // Generate PDF from HTML content
    //             const options = {
    //                 html: htmlContent,
    //                 fileName: 'IntimationDetails',
    //                 directory: RNFS.CachesDirectoryPath, // Save in app's temporary directory
    //             };

    //             const file = await RNHTMLtoPDF.convert(options);
    //             console.log('PDF file created:', file.filePath);

    //             // Define the destination path directly to the Downloads folder (Android)
    //             const destinationPath =
    //                 Platform.OS === 'android'
    //                     ? `${RNFS.DownloadDirectoryPath}/PRE_PDF(${.vehicle_registration_no}).pdf` // Pre download
    //                     : `${RNFS.DocumentDirectoryPath}/PRE_PDF(${.vehicle_registration_no}).pdf`; // iOS uses Document directory

    //             // Move the file to the Downloads folder (Android)
    //             await RNFS.moveFile(file.filePath, destinationPath);
    //             console.log('PDF saved to:', destinationPath);

    //             // Optionally, trigger the system to scan the file (Android)
    //             if (Platform.OS === 'android') {
    //                 await RNFS.scanFile(destinationPath); // Makes the file visible in file explorer
    //             }

    //             // Inform the user that the PDF is saved
    //             Alert.alert(
    //                 'PDF Downloaded',
    //                 'Your PDF has been saved to your device in the Downloads folder.',
    //             );
    //         } catch (error) {
    //             console.error('Error generating or saving PDF:', error);
    //             Alert.alert('Error', 'There was an issue generating or saving the PDF.');
    //         } finally {
    //             setPrePdfLoading(false);
    //         }
    //     };


    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const PrePostEmailSendApi = async (type) => {
        console.log("type ye hai", type, Id);

        if (type === 'pre') {
            setPreLoading(true); // Show loader for Pre button
        } else if (type === 'post') {
            setPostLoading(true); // Show loader for Post button
        }

        // Delay the execution by 200 milliseconds
        await delay(150);

        // Call AddIntimation and wait for the ID
        const id = await AddIntimation(false); // This will give us the ID from the successful submission of intimation

        if (!id) {
            // If no ID is returned, show a message and stop further execution
            ToastAndroid.show("Intimation submission failed. Please try again.", ToastAndroid.SHORT);
            if (type === 'pre') setPreLoading(false);
            if (type === 'post') setPostLoading(false);
            return;
        }

        try {
            const response = await fetch(ENDPOINTS.Mail_Send_Pdf, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,  // Use the ID obtained from AddIntimation
                    pdf: type, // Type could be 'pre' or 'post', depending on the button clicked
                }),
            });

            const result = await response.json();

            if (response.ok) {
                // Check the code in the response to decide which message to show
                if (result.code === 200) {
                    ToastAndroid.show('Mail Send Successfully', ToastAndroid.SHORT);
                    // navigation.goBack();
                    setShowAfterMailButtons(true);
                } else if (result.code === 400) {
                    // Handle case for code 400
                    ToastAndroid.show(result.message || 'Something went wrong', ToastAndroid.SHORT);
                } else {
                    // Handle other cases or unknown codes
                    ToastAndroid.show('Failed to send mail. Please try again later.', ToastAndroid.SHORT);
                }
            } else {
                console.log('HTTP Error:', result.message || 'Something went wrong');
                ToastAndroid.show(result.message || 'Something went wrong', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.log('Error fetching data:', error.message);
            ToastAndroid.show('Error fetching data. Please try again later.', ToastAndroid.SHORT);
        } finally {
            if (type === 'pre') setPreLoading(false);
            if (type === 'post') setPostLoading(false);
        }
    };



    //     const PostDownloadPDF = async () => {
    //         AddIntimation(true);
    //         setPostPdfLoading(true);

    //         const htmlContent = `
    //       <html>
    //         <head>
    //           <style>
    //             body {
    //               font-family: 'Inter-Regular';
    //               font-size: 14px;
    //               color: black;
    //               padding: 20px;
    //               background-color: white;
    //             }
    //             table {
    //               width: 100%;
    //               border-collapse: collapse;
    //               margin-top: 20px;
    //             }
    //             th, td {
    //               padding: 10px;
    //               text-align: left;

    //             }
    //             th {
    //               font-weight: bold;
    //             }
    //             .header-title {
    //               text-align: center;
    //               font-size: 14px;
    //               font-weight: bold;
    //               margin-bottom: 15px;
    //             }
    //               .header-text{
    //                   text-decoration: underline;
    //                   }
    //             .static-text {
    //               font-size: 14px;
    //               margin-Top: 10px;
    //               margin-bottom: 10px;
    //               text-align: justify;
    //             }
    //               .static-Top {



    //   font-size: 14px;

    // }

    //             .details-row {
    //               display: flex;
    //               justify-content: space-between;
    //               margin-top: 15px;
    //             }
    //             .details-row div {
    //               width: 48%; /* Both left and right columns take up nearly half the space */
    //             }
    //             .static-name {
    //   width: 40%;
    //   display: flex;
    //   flex-direction: row;
    //   justify-content: space-between;
    //   font-size: 14px;
    //   margin-bottom: 10px;
    // }


    //           </style>
    //         </head>
    //         <body>
    //           <!-- Header -->
    //           <div class="header-title"><h3 class="header-text" style="text-align:center">Post Intimation of Repossession to Police Station</h3></div>
    //           <!-- Static Message -->
    //           <div class="static-Top">

    //             To</br>
    //             Police Inspector,</br>
    //              ${AreaAddress || '------'}</br>
    //               ${selectedArea || '------'}</br>


    //           </div>

    //           <!-- Static Message -->
    //           <div class="static-text">
    //             This is to inform you that below customer has default in payment and has not shown up to pay money
    // even after several reminders. We had repossessed the vehicle.
    //           </div>

    //           <!-- Table for Dynamic Vehicle Details -->
    //           <table>

    //             <tr>
    //               <th>Loan Agreement No</th>
    //               <td><strong>:</strong></td>
    //               <td>${.vehicle_agreement_no || '----------'
    //             }</td>
    //             </tr>
    //               </tr>
    //               <th>Customer Name</th>
    //               <td><strong>:</strong></td>
    //               <td>${.vehicle_customer_name || '----------'}</td>
    //             </tr>
    //              <tr>
    //               <th>Vehicle Registration No</th>
    //               <td><strong>:</strong></td>
    //               <td>${.vehicle_registration_no || '----------'}</td>
    //             </tr>
    //             <tr>
    //               <th>Product Model</th>
    //               <td><strong>:</strong></td>
    //               <td>${.vehicle_product || '----------'}</td>

    //               </tr>
    //             <tr>
    //               <th>Engine No</th>
    //               <td><strong>:</strong></td>
    //               <td>${.vehicle_engine_no || '----------'}</td>
    //             </tr>
    //             <tr>
    //               <tr>
    //               <th>Chassis No</th>
    //               <td><strong>:</strong></td>
    //               <td>${.vehicle_chassis_no || '----------'}</td>
    //             </tr>

    //           <!-- Date and Time Row -->
    //       <tr>
    //         <th>Date</th>
    //         <td><strong>:</strong></td>
    //         <td>${date || '----------'}</td>
    //       </tr>
    //       <tr>
    //         <th>Time</th>
    //         <td><strong>:</strong></td>
    //         <td>${time || '----------'}</td>
    //       </tr>

    //           </table>

    //           <!-- Static Footer Text with 3 Paragraphs -->
    //           <div class="static-text">

    //             <p>Please do not take any complains of vehicle being stolen from the customer.</p>
    //           </div>

    //           <!-- Finance and Agency Details (Displayed on left and right side) -->
    //           <div class="static-name">

    //           <p>${.vehicle_finance_name || '----------'
    //             }</p>
    //      <p>${SelectedAgency || '----------'
    //             }</p>


    //         </div>
    //         </body>
    //       </html>
    //     `;

    //         try {
    //             // Generate PDF from HTML content
    //             const options = {
    //                 html: htmlContent,
    //                 fileName: 'IntimationDetails',
    //                 directory: RNFS.CachesDirectoryPath, // Save in app's temporary directory
    //             };

    //             const file = await RNHTMLtoPDF.convert(options);
    //             console.log('PDF file created:', file.filePath);

    //             // Define the destination path directly to the Downloads folder (Android)
    //             const destinationPath =
    //                 Platform.OS === 'android'
    //                     ? `${RNFS.DownloadDirectoryPath}/POST_pdf(${.vehicle_registration_no}).pdf` // Post download
    //                     : `${RNFS.DocumentDirectoryPath}/Post_pdf(${.vehicle_registration_no}).pdf`; // iOS uses Document directory

    //             // Move the file to the Downloads folder (Android)
    //             await RNFS.moveFile(file.filePath, destinationPath);
    //             console.log('PDF saved to:', destinationPath);

    //             // Optionally, trigger the system to scan the file (Android)
    //             if (Platform.OS === 'android') {
    //                 await RNFS.scanFile(destinationPath); // Makes the file visible in file explorer
    //             }

    //             // Inform the user that the PDF is saved
    //             Alert.alert(
    //                 'PDF Downloaded',
    //                 'Your PDF has been saved to your device in the Downloads folder.',
    //             );
    //         } catch (error) {
    //             console.error('Error generating or saving PDF:', error);
    //             Alert.alert('Error', 'There was an issue generating or saving the PDF.');
    //         } finally {
    //             setPostPdfLoading(false);
    //         }
    //     };


    const PrePdfAfterMail = async () => {
        AddIntimation();
        setPreMailLoading(true);

        const htmlContent = `
          <html>
      <head>
        <style>
          body {
            font-family: 'Inter-Regular', sans-serif;
            font-size: 14px;
            color: black;
            padding: 20px;
            background-color: white;
          }
          .mail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          .mail-header img {
            width: 30px;
            height: 30px;
            margin-right: 8px;
          }
          .mail-header .gmail-text {
            font-size: 14px;
            font-weight: bold;
          }
          .agency-info {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 15px;
            font-size: 14px;
            color: #333;
          }
             .agency-info2 {
            display: flex;
             justify-content: space-between;
            margin-bottom: 15px;
            font-size: 14px;
            color: #333;
          }
            .agency-info3 {
            display: flex;
             justify-content: flex-start;
            margin-bottom: 15px;
            font-size: 14px;
            color: #333;
          }

          .separator {
            border-top: 1px solid #000;
            margin: 10px 0;
          }
          .header-title {
        display: flex;           /* Enables flex layout */
        justify-content: flex-start; /* Aligns content to the left */
        align-items: center;     /* Vertically centers content */
        font-size: 16px;
        font-weight: bold;
        margin: 15px 0;
      }

          .static-text {
            font-size: 14px;
            margin: 10px 0;
            text-align: justify;
          }
          .info-label {
            font-weight: bold;
          }
      .info-item {
        margin-bottom: 10px;     /* Increased spacing */
        padding: 8px;            /* Adds padding inside */
        line-height: 1.5;        /* Improves readability */
        display: flex;           
        justify-content: space-around;  /* Equal spacing around items */
        align-items: center;     /* Vertically centers content */
      }

        table {
                    width: 80%;
                    border-collapse: collapse;
                    margin-top: 20px;
                  }
                  th, td {
                    padding: 10px;
                    text-align: left;

                  }
                  th {
                    font-weight: bold;
                  }
                  .header-title {
                    text-align: center;
                    font-size: 14px;
                    font-weight: bold;
                    justify-content: flex-start;

                  }


        .footer-details {
        margin-top: 20px;
        font-size: 14px;
        font-weight: bold;
        width: 70%;               /* Removed quotes */
        display: flex;            /* Added flex display */
        justify-content: space-between; /* Aligns items with space between */
      }

                 .static-Top {



        font-size: 14px;

      }
        </style>
      </head>
      <body>
        <!-- Mail Header -->
        <div class="mail-header">
          <div style="display: flex; align-items: center;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png" alt="Gmail Icon">
            <span class="gmail-text">Gmail</span>
          </div>
          <div class="agency-info">
            <span><strong>${SelectedAgency || '----------'}</strong> &lt;${AgencyEmail || '----------'}&gt;</span>
          </div>
        </div>

        <div class="separator"></div>

        <!-- Header -->
        <div class="header-title">PRE POLICE REPO INTIMATION OF VEHICLE ${rcNo || '----------'} </div>

        <div class="separator"></div>

          <div class="agency-info2">
        <span><strong>${SelectedAgency || '----------'}</strong> &lt;${AgencyEmail || '----------'}&gt;</span>
        <span>${AgencyEmail || '----------'}</span>
      </div>

        <div class="agency-info3">
        <span><strong>To </strong></span>
        <span style="padding: 0 8px;">:</span> <!-- Extra padding for space -->
        <span>${AreaEmail || '----------'}</span>
      </div>


            <div class="static-Top">

                  To</br>
                  Police Inspector,</br>
                   ${AreaAddress || '------'}</br>
                    ${selectedArea || '------'}</br>


                </div>

        <!-- Static Message -->
        <div class="static-text">
          This is to inform you that the below customer has defaulted in payment and has not shown up to pay even after several reminders. We are going to repossess the vehicle.
        </div>

        <!-- Table for Dynamic Vehicle Details -->
                <table>

                  <tr>
                    <th>Loan Agreement No</th>
                      <td><strong>:</strong></td>
                    <td>${loanNo || '----------'
            }</td>
                  </tr>
                    </tr>
                    <th>Customer Name</th>
                      <td><strong>:</strong></td>
                    <td>${customerName || '----------'}</td>
                  </tr>
                   <tr>
                    <th>Vehicle Registration No</th>
                      <td><strong>:</strong></td>
                    <td>${rcNo || '----------'}</td>
                  </tr>
                  <tr>
                    <th>Product Model</th>
                      <td><strong>:</strong></td>
                    <td>${product || '----------'}</td>

                    </tr>
                  <tr>
                    <th>Engine No</th>
                      <td><strong>:</strong></td>
                    <td>${engineNo || '----------'}</td>
                  </tr>
                  <tr>
                    <tr>
                    <th>Chassis No</th>
                      <td><strong>:</strong></td>
                    <td>${chasisNo || '----------'}</td>
                  </tr>

                <!-- Date and Time Row -->
            <tr>
              <th>Date</th>
                <td><strong>:</strong></td>
              <td>${date || '----------'}</td>
            </tr>
            <tr>
              <th>Time</th>
                <td><strong>:</strong></td>
              <td>${time || '----------'}</td>
            </tr>

                </table>

        <!-- Footer Text -->
        <div class="static-text">
          Please do not take any complaints of the vehicle being stolen from the customer.
        </div>

        <!-- Footer Details -->
        <div class="footer-details">
          <p>${financeName || '----------'}</p>
          <p>${SelectedAgency || '----------'}</p>
        </div>
      </body>
      </html>

          `;



        try {
            // Generate PDF from HTML content
            const options = {
                html: htmlContent,
                fileName: 'IntimationDetails',
                directory: RNFS.CachesDirectoryPath, // Save in app's temporary directory
            };

            const file = await RNHTMLtoPDF.convert(options);
            console.log('PDF file created:', file.filePath);

            // Define the destination path directly to the Downloads folder (Android)
            const destinationPath =
                Platform.OS === 'android'
                    ? `${RNFS.DownloadDirectoryPath}/PRE_PDF(${rcNo}).pdf` // Pre download
                    : `${RNFS.DocumentDirectoryPath}/Pre_PDF(${rcNo}).pdf`; // iOS uses Document directory

            // Move the file to the Downloads folder (Android)
            await RNFS.moveFile(file.filePath, destinationPath);
            console.log('PDF saved to:', destinationPath);

            navigation.navigate('PDFViewerScreen', { pdfUrl: destinationPath });

            // Optionally, trigger the system to scan the file (Android)
            if (Platform.OS === 'android') {
                await RNFS.scanFile(destinationPath); // Makes the file visible in file explorer
            }
            // // 📂 Open PDF after download
            // await FileViewer.open(destinationPath);
            // console.log('PDF opened successfully');

            // Alert.alert('PDF Downloaded', 'Your PDF has been saved and opened.');

        } catch (error) {
            console.error('Error generating, saving, or opening PDF:', error);

        } finally {
            setPreMailLoading(false);
        }
    };

    const PostPdfAfterMail = async () => {
        AddIntimation();
        setPostMailLoading(true);

        const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Inter-Regular', sans-serif;
                font-size: 14px;
                color: black;
                padding: 20px;
                background-color: white;
              }
              .mail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
              }
              .mail-header img {
                width: 30px;
                height: 30px;
                margin-right: 8px;
              }
              .mail-header .gmail-text {
                font-size: 14px;
                font-weight: bold;
              }
              .agency-info {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 15px;
                font-size: 14px;
                color: #333;
              }
              .agency-info2 {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                font-size: 14px;
                color: #333;
              }
              .agency-info3 {
                display: flex;
                justify-content: flex-start;
                margin-bottom: 15px;
                font-size: 14px;
                color: #333;
              }
              .separator {
                border-top: 1px solid #000;
                margin: 10px 0;
              }
              .header-title {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                font-size: 16px;
                font-weight: bold;
                margin: 15px 0;
              }
              .static-text {
                font-size: 14px;
                margin: 10px 0;
                text-align: justify;
              }
              .info-label {
                font-weight: bold;
              }
              .info-item {
                margin-bottom: 10px;
                padding: 8px;
                line-height: 1.5;
                display: flex;
                justify-content: space-around;
                align-items: center;
              }
              table {
                width: 80%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                padding: 10px;
                text-align: left;

              }
              th {
                font-weight: bold;
              }
              .footer-details {
                margin-top: 20px;
                font-size: 14px;
                font-weight: bold;
               width: 70%;  
                justify-content: space-between;
              }
              .static-Top {
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <!-- Mail Header -->
            <div class="mail-header">
              <div style="display: flex; align-items: center;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png" alt="Gmail Icon">
                <span class="gmail-text">Gmail</span>
              </div>
              <div class="agency-info">
                <span><strong>${SelectedAgency || '----------'}</strong> &lt;${AgencyEmail || '----------'}&gt;</span>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Header Title -->
          <div class="header-title">POST POLICE REPO INTIMATION OF VEHICLE ${rcNo || '----------'} </div>

            <div class="separator"></div>

            <!-- Agency Info -->
            <div class="agency-info2">
              <span><strong>${SelectedAgency || '----------'}</strong> &lt;${AgencyEmail || '----------'}&gt;</span>
              <span>${AgencyEmail || '----------'}</span>
            </div>

            <!-- Recipient Info -->
            <div class="agency-info3">
              <span><strong>To </strong></span>
              <span style="padding: 0 8px;">:</span>
              <span>${AreaEmail || '----------'}</span>
            </div>

            <div class="static-Top">
              To</br>
              Police Inspector,</br>
              ${AreaAddress || '------'}</br>
              ${selectedArea || '------'}</br>
            </div>

            <!-- Static Message -->
            <div class="static-text">
              This is to inform you that below customer has defaulted in payment and has not shown up to pay even after several reminders. We had repossessed the vehicle.
            </div>

            <!-- Vehicle Details Table -->
            <table>
              <tr>
              <th>Loan Agreement No</th>
               <td><strong>:</strong></td>
              <td>${loanNo || '----------'}</td>
              </tr>
              <tr><th>Customer Name</th>  <td><strong>:</strong></td><td>${customerName || '----------'}</td></tr>
              <tr><th>Vehicle Registration No</th>  <td><strong>:</strong></td><td>${rcNo || '----------'}</td></tr>
              <tr><th>Product Model</th>  <td><strong>:</strong></td><td>${product || '----------'}</td></tr>
              <tr><th>Engine No</th>  <td><strong>:</strong></td><td>${engineNo || '----------'}</td></tr>
              <tr><th>Chassis No</th>  <td><strong>:</strong></td><td>${chasisNo || '----------'}</td></tr>
              <tr><th>Date</th>  <td><strong>:</strong></td><td>${date || '----------'}</td></tr>
              <tr><th>Time</th>  <td><strong>:</strong></td><td>${time || '----------'}</td></tr>
            </table>

            <!-- Footer Text -->
            <div class="static-text">
              <p>Please do not take any complaints of the vehicle being stolen from the customer.</p>
            </div>

            <!-- Footer Details -->
            <div class="footer-details">
              <p>${financeName || '----------'}</p>
              <p>${SelectedAgency || '----------'}</p>
            </div>
          </body>
        </html>
      `;

        try {
            const options = {
                html: htmlContent,
                fileName: 'IntimationDetails',
                directory: RNFS.CachesDirectoryPath,
            };

            const file = await RNHTMLtoPDF.convert(options);
            console.log('PDF file created:', file.filePath);

            const destinationPath =
                Platform.OS === 'android'
                    ? `${RNFS.DownloadDirectoryPath}/POST_pdf(${rcNo}).pdf`
                    : `${RNFS.DocumentDirectoryPath}/Post_pdf(${rcNo}).pdf`;

            await RNFS.moveFile(file.filePath, destinationPath);
            console.log('PDF saved to:', destinationPath);

            navigation.navigate('PDFViewerScreen', { pdfUrl: destinationPath });

            if (Platform.OS === 'android') {
                await RNFS.scanFile(destinationPath);
            }

            // // Open PDF using FileViewer
            // await FileViewer.open(destinationPath)
            //   .then(() => {
            //     console.log('PDF opened successfully');
            //   })
            //   .catch(error => {
            //     console.error('Error opening PDF:', error);

            //   });

            // Alert.alert('PDF Downloaded', 'Your PDF has been saved to your device in the Downloads folder.');
        } catch (error) {
            console.error('Error generating or saving PDF:', error);

        } finally {
            setPostMailLoading(false);
        }
    };




    //     const GeneratePdf = async () => {


    //         // Create the message content
    //         const messageContent = `*Manager :* ${.vehicle_manager || ''}
    // *Month :* ${.vehicle_month || ''}
    // *Finance :* ${.vehicle_finance_name || ''}
    // *Branch :* ${.vehicle_branch || ''}
    // *Agreement Number :* ${.vehicle_agreement_no || ''}
    // *App ID :* ${.vehicle_app_id || ''}
    // *Customer Name :* ${.vehicle_customer_name || ''}
    // *Product :* ${.vehicle_product || ''}
    // *Bucket :* ${.vehicle_bucket || ''}
    // *EMI :* ${.vehicle_emi || ''}
    // *Principle Outstanding :* ${.vehicle_principle_outstanding || ''}
    // *Total Outstanding :* ${.vehicle_total_outstanding || ''}
    // *RC Number :* ${.vehicle_registration_no || ''}
    // *Chassis Number :* ${.vehicle_chassis_no || ''}
    // *Engine Number :* ${.vehicle_engine_no || ''}
    // *Repo Fos :* ${.vehicle_repo_fos || ''}
    // *Field Fos :* ${.vehicle_fild_fos || ''}`;

    //         try {
    //             const url = `whatsapp://send?text=${encodeURIComponent(messageContent)}`;

    //             // Check if WhatsApp can handle the URL scheme
    //             const supported = await Linking.canOpenURL(url);

    //             if (supported) {
    //                 console.log('WhatsApp is supported, opening...');
    //                 await Linking.openURL(url); // This opens WhatsApp with the message pre-filled
    //             } else {
    //                 // WhatsApp is not installed or cannot open the URL scheme
    //                 console.log('WhatsApp not supported or not installed. Trying the fallback...');

    //                 // Fallback to WhatsApp Web or App Store (for devices without WhatsApp)
    //                 const fallbackUrl = `https://wa.me/?text=${encodeURIComponent(messageContent)}`;
    //                 await Linking.openURL(fallbackUrl);
    //             }
    //         } catch (error) {
    //             console.error('Error sending message:', error);
    //             Alert.alert('Error', 'There was an issue sending the message.');
    //         }
    //     };




    const handlePhoneCall = (phoneNumber) => {
        let phone = phoneNumber.replace(/\D/g, ''); // Remove non-numeric characters
        if (phone) {
            Linking.openURL(`tel:${phone}`).catch(() => Alert('Failed to make a call'));
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
                    style={{ position: 'absolute', top: 15, left: 15 }}
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
                    Intimation
                </Text>

                {/* <View
                    style={{
                        width: '15%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        right: 6,
                        top: 16,

                    }}>

                    <TouchableOpacity

                    >
                        <Image source={whatsapp} style={{ width: 24, height: 24 }} />
                    </TouchableOpacity>
                </View> */}
            </View>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
                keyboardShouldPersistTaps="handled">
                <View style={{ padding: 20 }}>

                    <View style={{ marginBottom: 20, borderWidth: 1, borderBottomWidth: 0 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, padding: 8 }}>
                            <Text style={{ width: '30%', fontSize: 12, fontFamily: 'Inter-Bold', color: 'black', textTransform: 'uppercase' }}>Loan No</Text>
                            <TextInput
                                style={{ width: '70%', borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 6, fontSize: 12, fontFamily: 'Inter-Regular' }}
                                value={loanNo}
                                onChangeText={setLoanNo}
                                placeholder="Enter Loan No"
                                placeholderTextColor='#ccc'
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, padding: 8 }}>
                            <Text style={{ width: '30%', fontSize: 12, fontFamily: 'Inter-Bold', color: 'black', textTransform: 'uppercase' }}>Customer Name</Text>
                            <TextInput
                                style={{ width: '70%', borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 6, fontSize: 12, fontFamily: 'Inter-Regular' }}
                                value={customerName}
                                onChangeText={setCustomerName}
                                placeholder="Enter Customer Name"
                                placeholderTextColor='#ccc'
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, padding: 8 }}>
                            <Text style={{ width: '30%', fontSize: 12, fontFamily: 'Inter-Bold', color: 'black', textTransform: 'uppercase' }}>RC No</Text>
                            <TextInput
                                style={{ width: '70%', borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 6, fontSize: 12, fontFamily: 'Inter-Regular' }}
                                value={rcNo}
                                onChangeText={setRcNo}
                                placeholder="Enter RC No"
                                placeholderTextColor='#ccc'
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, padding: 8 }}>
                            <Text style={{ width: '30%', fontSize: 12, fontFamily: 'Inter-Bold', color: 'black', textTransform: 'uppercase' }}>Product</Text>
                            <TextInput
                                style={{ width: '70%', borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 6, fontSize: 12, fontFamily: 'Inter-Regular' }}
                                value={product}
                                onChangeText={setProduct}
                                placeholder="Enter Product"
                                placeholderTextColor='#ccc'
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, padding: 8 }}>
                            <Text style={{ width: '30%', fontSize: 12, fontFamily: 'Inter-Bold', color: 'black', textTransform: 'uppercase' }}>Engine No</Text>
                            <TextInput
                                style={{ width: '70%', borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 6, fontSize: 12, fontFamily: 'Inter-Regular' }}
                                value={engineNo}
                                onChangeText={setEngineNo}
                                placeholder="Enter Engine No"
                                placeholderTextColor='#ccc'
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, padding: 8 }}>
                            <Text style={{ width: '30%', fontSize: 12, fontFamily: 'Inter-Bold', color: 'black', textTransform: 'uppercase' }}>Chasis No</Text>
                            <TextInput
                                style={{ width: '70%', borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 6, fontSize: 12, fontFamily: 'Inter-Regular' }}
                                value={chasisNo}
                                onChangeText={setChasisNo}
                                placeholder="Enter Chasis No"
                                placeholderTextColor='#ccc'
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, padding: 8 }}>
                            <Text style={{ width: '30%', fontSize: 12, fontFamily: 'Inter-Bold', color: 'black', textTransform: 'uppercase' }}>Finance Name</Text>
                            <TextInput
                                style={{ width: '70%', borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 6, fontSize: 12, fontFamily: 'Inter-Regular' }}
                                value={financeName}
                                onChangeText={setfinanceName}
                                placeholder="Enter Finance Name"
                                placeholderTextColor='#ccc'
                            />
                        </View>




                    </View>

                    {/*   Agency Name */}
                    {/* <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 5,
              fontFamily: 'Inter-Medium',
              color: 'black',
            }}>
            Agency Name
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 12,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: '#ddd',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 14,
              color: 'black',
            }}
            disabled>
            <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
              {.vehicle_agency_name || '----------'}
            </Text>
          </TouchableOpacity> */}


                    {/* Staff Type */}
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            marginBottom: 5,
                            fontFamily: 'Inter-Medium',
                            color: 'black',
                        }}>
                        Vehicle Confirmation Type
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
                                        color: selectedType ? 'black' : 'black',
                                    }}>
                                    {selectedType}
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
                                                onPress={() => handleSelect(item)}>
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

                    {selectedType !== 'Select Type' && (
                        <View style={{ marginTop: 10 }}>
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    marginBottom: 5,
                                    fontFamily: 'Inter-Medium',
                                    color: 'black',
                                }}
                            >
                                Repossession Agent
                            </Text>

                            <View
                                style={{
                                    width: '100%',
                                    marginBottom: 15,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    height: 50,
                                    backgroundColor: 'white',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    borderColor: '#ddd',
                                    paddingHorizontal: 10,
                                }}
                            >
                                <TextInput
                                    style={{
                                        flex: 1,
                                        fontSize: 16,
                                        fontFamily: 'Inter-Regular',
                                        color: 'black',
                                        height: 50,
                                    }}
                                    placeholder="Enter Agent Name"
                                    placeholderTextColor="grey"
                                    value={ReppoAgency}
                                    onChangeText={setReppoAgency}
                                />
                            </View>
                        </View>
                    )}

                    {/* Staff Type */}
                    {selectedType !== 'Cancel' && selectedType !== 'Select Type' && (
                        <View style={{}}>
                            <Text
                                style={{
                                    fontSize: 14,
                                    marginBottom: 5,
                                    fontFamily: 'Inter-Medium',
                                    color: 'black',
                                    marginTop: 10
                                }}>
                                Select Agency
                            </Text>

                            {/* Agency Dropdown */}

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
                                            marginBottom: 3
                                        }}
                                        onPress={AgencyDropdown}>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: 'Inter-Regular',
                                                color: SelectedAgency ? 'black' : 'black',
                                            }}>
                                            {SelectedAgency}
                                        </Text>

                                        <Ionicons
                                            name={isAgencyVisible ? 'chevron-up' : 'chevron-down'}
                                            size={20}
                                            color="black"
                                        />
                                    </TouchableOpacity>



                                    {/* Dropdown list visibility */}
                                    {isAgencyVisible && (
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
                                            }}>
                                            <FlatList
                                                data={AgencyData}
                                                keyboardShouldPersistTaps="handled"
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={{
                                                            padding: 12,
                                                            borderBottomColor: '#ddd',
                                                            borderBottomWidth: 1,
                                                        }}
                                                        onPress={() => handleAgency(item)}>
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
                            {AgencyError ? (
                                <Text
                                    style={{
                                        color: 'red',
                                        fontSize: 14,
                                        marginBottom: 5,
                                        marginLeft: 10,
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    {AgencyError}
                                </Text>
                            ) : null}

                        </View>

                    )}

                    {/* Search Text button */}
                    {selectedType !== 'Cancel' && selectedType !== 'Select Type' && ( // Only render this if 'isCancelled' is false
                        <View style={{ flex: 1 }}>

                            {/* Area Dropdown */}
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    marginBottom: 5,
                                    fontFamily: 'Inter-Medium',
                                    color: 'black',
                                }}>
                                Select Area
                            </Text>
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
                                    marginBottom: 3
                                }}
                                onPress={() => setIsAreaVisible(!isAreaVisible)}>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontFamily: 'Inter-Regular',
                                        color: selectedArea ? 'black' : 'black',
                                    }}>
                                    {selectedArea ? selectedArea : 'Select Area'}
                                </Text>

                                <Ionicons
                                    name={isAreaVisible ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color="black"
                                />
                            </TouchableOpacity>

                            {AreaError ? (
                                <Text
                                    style={{
                                        color: 'red',
                                        fontSize: 14,
                                        marginBottom: 5,
                                        marginLeft: 10,
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    {AreaError}
                                </Text>
                            ) : null}



                            {/* Dropdown and Search Input */}
                            {isAreaVisible && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: '85%',
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'white',
                                        borderRadius: 8,
                                        borderColor: '#ddd',
                                        borderWidth: 1,
                                        zIndex: 1,
                                        marginTop: 2,
                                    }}>
                                    {/* Search Input for filtering dropdown */}
                                    <TextInput
                                        style={{
                                            height: 40,
                                            borderColor: '#ddd',
                                            borderWidth: 1,
                                            borderRadius: 8,
                                            paddingLeft: 10,
                                        }}
                                        placeholder="Search Area"
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                    />

                                    {/* Scrollable dropdown list */}
                                    <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150 }} keyboardShouldPersistTaps='handled'  >
                                        {filteredAreaList.map((item) => (
                                            <TouchableOpacity
                                                key={item.manage_email_id}
                                                style={{
                                                    padding: 12,
                                                    borderBottomColor: '#ddd',
                                                    borderBottomWidth: 1,
                                                }}
                                                onPress={() => handleSelectArea(item)}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        fontFamily: 'Inter-Regular',
                                                        color: 'black',
                                                    }}
                                                >
                                                    {item.manage_area_name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                </View>
                            )}

                        </View>
                    )}
                    {selectedType !== 'Cancel' && selectedType !== 'Select Type' && (
                        <View style={{ marginBottom: 20 }}>
                            {/* Label Section */}
                            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                                {/* Date Label */}
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Medium',
                                        color: 'black',
                                        flex: 1,
                                        textAlign: 'center',
                                    }}>
                                    Date
                                </Text>
                                {/* Time Label */}
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Medium',
                                        color: 'black',
                                        flex: 1,
                                        textAlign: 'center',
                                    }}>
                                    Time
                                </Text>
                            </View>

                            {/* Values Section */}
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: 8,

                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                                disabled>
                                {/* Date Value */}
                                <View
                                    style={{
                                        width: '50%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: 10,
                                        borderRightWidth: 1,
                                        borderColor: '#ddd',
                                    }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                                        {date || '----------'}
                                    </Text>
                                </View>

                                {/* Time Value */}
                                <TouchableOpacity
                                    onPress={() => setShowTimePicker(true)} // Show the time picker on press
                                    style={{
                                        width: '50%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: 10,
                                    }}>

                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                                        {time || '----------'}
                                    </Text>

                                </TouchableOpacity>
                            </TouchableOpacity>
                            {showTimePicker && (
                                <DateTimePicker
                                    value={selectedTime}
                                    mode="time"
                                    display="spinner"
                                    onChange={handleTimeChange}
                                />
                            )}
                        </View>

                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        {selectedType !== 'Select Type' && selectedType !== 'Confirm' && (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: colors.Brown,
                                    paddingVertical: 15,
                                    paddingHorizontal: 10,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: 20,
                                    width: '100%',
                                    marginRight: 10,
                                }}
                                onPress={() => AddIntimation(true)}>
                                <Text
                                    style={{
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Bold',
                                    }}>
                                    Save
                                </Text>
                            </TouchableOpacity>
                        )}



                        {/* {selectedType !== 'Cancel' && selectedType !== 'Select Type' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <TouchableOpacity
                  onPress={PreDownloadPDF}
                  style={{
                    backgroundColor: 'white',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderColor: colors.Brown,
                    borderWidth: 1,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 20,
                    width: '48%', // Adjust width so both buttons fit
                    marginRight: 10, // Space between buttons
                    flexDirection: 'row',
                    gap: 10
                  }}
                  disabled={selectedType === 'Cancel' || PreMailLoading}>
                  {PrePdfLoading ? (
                    <ActivityIndicator size="small" color={colors.Brown} />
                  ) : (
                    <>
                      <AntDesign name='download' color='black' size={20} style={{ marginRight: 8 }} />
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 12,
                          fontWeight: 'bold',
                          fontFamily: 'Inter-Bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        Pre PDF
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={PostDownloadPDF}
                  style={{
                    backgroundColor: 'white',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderColor: colors.Brown,
                    borderWidth: 1,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 20,
                    width: '48%', // Adjust width so both buttons fit
                    flexDirection: 'row',
                    gap: 10
                  }}
                  disabled={selectedType === 'Cancel'}>
                  {PostPdfLoading ? (
                    <ActivityIndicator size="small" color={colors.Brown} />
                  ) : (
                    <>
                      <AntDesign name='download' color='black' size={20} style={{ marginRight: 8 }} />
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 12,
                          fontWeight: 'bold',
                          fontFamily: 'Inter-Bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        Post PDF
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )} */}

                        {selectedType !== 'Cancel' && selectedType !== 'Select Type' && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>

                                {/* Pre Download PDF Button */}
                                <TouchableOpacity
                                    onPress={() => {
                                        PrePostEmailSendApi('pre');
                                    }}
                                    style={{
                                        backgroundColor: 'white',
                                        paddingVertical: 12,
                                        paddingHorizontal: 20,
                                        borderColor: colors.Brown,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: 20,
                                        width: '48%', // Adjust width so both buttons fit
                                        marginRight: 10, // Space between buttons
                                        flexDirection: 'row',
                                        gap: 10
                                    }}
                                    disabled={selectedType === 'Cancel' || preLoading}  // Disable if loading
                                >
                                    {preLoading ? (
                                        <ActivityIndicator size="small" color={colors.Brown} />  // Show spinner while loading
                                    ) : (
                                        <>
                                            <AntDesign name='mail' color='black' size={20} />
                                            <Text
                                                style={{
                                                    color: 'black',
                                                    fontSize: 12,
                                                    fontWeight: 'bold',
                                                    fontFamily: 'Inter-Bold',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                Pre Pdf Mail
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* Post Download PDF Button */}
                                <TouchableOpacity
                                    onPress={() => {
                                        PrePostEmailSendApi('post');
                                    }}
                                    style={{
                                        backgroundColor: 'white',
                                        paddingVertical: 12,
                                        paddingHorizontal: 20,
                                        borderColor: colors.Brown,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: 20,
                                        width: '48%', // Adjust width so both buttons fit
                                        flexDirection: 'row',
                                        gap: 10
                                    }}
                                    disabled={selectedType === 'Cancel' || postLoading}  // Disable if loading
                                >
                                    {postLoading ? (
                                        <ActivityIndicator size="small" color={colors.Brown} />  // Show spinner while loading
                                    ) : (
                                        <>
                                            <AntDesign name='mail' color='black' size={20} />
                                            <Text
                                                style={{
                                                    color: 'black',
                                                    fontSize: 12,
                                                    fontWeight: 'bold',
                                                    fontFamily: 'Inter-Bold',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                Post Pdf Mail
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                            </View>
                        )}

                        {/* {selectedType !== 'Cancel' && selectedType !== 'Select Type' &&  ( */}
                        {showAfterMailButtons && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <TouchableOpacity
                                    onPress={PrePdfAfterMail}
                                    style={{
                                        backgroundColor: 'white',
                                        paddingVertical: 12,
                                        paddingHorizontal: 20,
                                        borderColor: colors.Brown,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: 20,
                                        width: '48%',
                                        marginRight: 10,
                                        flexDirection: 'row',
                                        gap: 10,
                                    }}
                                    disabled={selectedType === 'Cancel' || PreMailLoading} // Disable button during loading
                                >
                                    {PreMailLoading ? (
                                        <ActivityIndicator size="small" color="black" /> // Loading spinner
                                    ) : (
                                        <AntDesign name="download" color="black" size={20} />
                                    )}
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            fontFamily: 'Inter-Bold',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {PreMailLoading ? 'Processing...' : 'Pre PDF'}
                                    </Text>
                                </TouchableOpacity>


                                <TouchableOpacity
                                    onPress={PostPdfAfterMail}
                                    style={{
                                        backgroundColor: 'white',
                                        paddingVertical: 12,
                                        paddingHorizontal: 20,
                                        borderColor: colors.Brown,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: 20,
                                        width: '48%',
                                        flexDirection: 'row',
                                        gap: 10,
                                    }}
                                    disabled={selectedType === 'Cancel' || PostMailLoading}
                                >
                                    {PostMailLoading ? (
                                        <ActivityIndicator size="small" color="black" />
                                    ) : (
                                        <AntDesign name="download" color="black" size={20} />
                                    )}
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            fontFamily: 'Inter-Bold',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {PostMailLoading ? 'Processing...' : 'Post PDF'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                    </View>

                </View>
            </ScrollView>
        </View>
    );
};

export default CreateIntimation;
