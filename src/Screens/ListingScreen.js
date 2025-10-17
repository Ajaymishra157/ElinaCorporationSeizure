import { ActivityIndicator, Alert, FlatList, Modal, PermissionsAndroid, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import colors from '../CommonFiles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ENDPOINTS } from '../CommonFiles/Constant';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FileViewer from 'react-native-file-viewer';
import LottieView from 'lottie-react-native';
import LoadingAnimation from '../assets/animations/Loading.json'

const ListingScreen = () => {
  const navigation = useNavigation();

  const [List, setList] = useState([]);
  const [ListLoading, setListLoading] = useState(false);

  const [selectedHistory, setSelectedHistory] = useState(null);
  console.log("xxxx", selectedHistory);
  const [modalVisible, setModalVisible] = useState(false);
  const [id, setId] = useState(null);
  console.log("ye id hai", id);
  const [preLoading, setPreLoading] = useState(false);  // For Pre button loading state
  const [postLoading, setPostLoading] = useState(false);

  const [PreMailLoading, setPreMailLoading] = useState(false);
  const [PostMailLoading, setPostMailLoading] = useState(false);


  const [PrePdfLoading, setPrePdfLoading] = useState(false);
  const [PostPdfLoading, setPostPdfLoading] = useState(false);

  const [text, setText] = useState(null);
  const [originalPsoList, setOriginalPsoList] = useState([]);



  const openModal = item => {
    setSelectedHistory(item); // Set selected item data to show in the modal
    setModalVisible(true); // Show the modal
    setPreLoading(false);
    setPostLoading(false);
  };


  const closeModal = () => {
    setModalVisible(false); // Hide the modal
    setSelectedHistory(null); // Clear the selected item data
  };



  const intimationList = async () => {
    setListLoading(true);
    try {
      const response = await fetch(ENDPOINTS.Intimation_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

      });

      const result = await response.json();

      if (response.ok) {
        if (result.code === 200) {
          setList(result.payload); // Successfully received data
          setId(result.payload.id);
          setOriginalPsoList(result.payload);
        } else {
          ToastAndroid.show("no data take", ToastAndroid.SHORT);
          console.log('Error:', 'Failed to load staff data');
          setList([]);
        }
      } else {
        console.log('HTTP Error:', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    intimationList();
  }, []);



  const PrePostEmailSendApi = async (type, id) => {
    console.log("type ye hai", type, id);

    if (type === 'pre') {
      setPreLoading(true); // Show loader for Pre button
    } else if (type === 'post') {
      setPostLoading(true); // Show loader for Post button
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
          setModalVisible(false);
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

  const handleTextChange = (inputText) => {
    setText(inputText);

    // If inputText is empty, show the original data
    if (inputText === '') {
      setList(originalPsoList);  // Reset to original data
    } else {
      // Filter data based on Name, Reg No, or Agg No
      const filtered = originalPsoList.filter(item => {
        const lowerCaseInput = inputText.toLowerCase();
        return (
          item.customer_name.toLowerCase().includes(lowerCaseInput) ||
          item.rc_no.toLowerCase().includes(lowerCaseInput) ||
          item.engine_no.toLowerCase().includes(lowerCaseInput) ||
          item.chassis_no.toLowerCase().includes(lowerCaseInput)

        );
      });

      setList(filtered); // Update filtered data state
    }
  };

  const PreDownloadPDF = async () => {
    setPrePdfLoading(true);

    const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Inter-Regular';
                font-size: 14px;
                color: black;
                padding: 20px;
                background-color: white;
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
                  margin-bottom: 15px;
                  
                }
                  .header-text{
                  text-decoration: underline;
                  }
              .static-text {
                font-size: 14px;
                margin-Top: 10px;
                margin-bottom: 10px;
                text-align: justify;
              }
                .static-Top {
    
    
    
    font-size: 14px;
    
    }
    
              .details-row {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
              }
              .details-row div {
                width: 48%; /* Both left and right columns take up nearly half the space */
              }
              .static-name {
    width: 40%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: 14px;
    margin-bottom: 10px;
    }
    
    
            </style>
          </head>
          <body>
            <!-- Header -->
            <div class="header-title">
             <h3 class="header-text" style="text-align:center">PRE Intimation of Repossession to Police Station</h3></div>
            
             <div class="static-Top">

          To</br>
          Police Inspector,</br>
            ${selectedHistory.police_station_address || '------'}</br>
            ${selectedHistory.police_station_area || '------'}</br>

            </div>
            

        </div>
    
            <!-- Static Message -->
            <div class="static-text">
             This is to inform you that below customer has default in payment and has not shown up to pay
    money even after several reminders. We are going to repossess the vehicle
            </div>
    
            <!-- Table for Dynamic Vehicle Details -->
            <table>
            
              <tr>
                <th>Loan Agreement No</th>
                    <td><strong>:</strong></td>
                <td>${selectedHistory.loan_no || '----------'
      }</td>
              </tr>
                </tr>
                <th>Customer Name</th>
                    <td><strong>:</strong></td>
                <td>${selectedHistory.customer_name || '----------'}</td>
              </tr>
               <tr>
                <th>Vehicle Registration No</th>
                    <td><strong>:</strong></td>
                <td>${selectedHistory.rc_no || '----------'}</td>
              </tr>
              <tr>
                <th>Product Model</th>
                    <td><strong>:</strong></td>
                <td>${selectedHistory.product || '----------'}</td>
            
                </tr>
              <tr>
                <th>Engine No</th>
                    <td><strong>:</strong></td>
                <td>${selectedHistory.engine_no || '----------'}</td>
              </tr>
              <tr>
                <tr>
                <th>Chassis No</th>
                    <td><strong>:</strong></td>
                <td>${selectedHistory.chassis_no || '----------'}</td>
              </tr>
               
            <!-- Date and Time Row -->
        <tr>
          <th>Date</th>
              <td><strong>:</strong></td>
          <td>${selectedHistory.form_date || '----------'}</td>
        </tr>
        <tr>
          <th>Time</th>
              <td><strong>:</strong></td>
          <td>${selectedHistory.form_time || '----------'}</td>
        </tr>
    
            </table>
    
            <!-- Static Footer Text with 3 Paragraphs -->
            <div class="static-text">
             
              <p>Please do not take any complains of vehicle being stolen from the customer.</p>
            </div>
    
            <!-- Finance and Agency Details (Displayed on left and right side) -->
            <div class="static-name">
          
            <p>${selectedHistory.finance_name || '----------'
      }</p>
             <p>${selectedHistory.agency_select || '----------'
      }</p>
      
        
          
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
          ? `${RNFS.DownloadDirectoryPath}/PRE_PDF(${selectedHistory.loan_no}).pdf` // Pre download
          : `${RNFS.DocumentDirectoryPath}/PRE_PDF(${selectedHistory.loan_no}).pdf`; // iOS uses Document directory

      // Move the file to the Downloads folder (Android)
      await RNFS.moveFile(file.filePath, destinationPath);
      console.log('PDF saved to:', destinationPath);

      // Optionally, trigger the system to scan the file (Android)
      if (Platform.OS === 'android') {
        await RNFS.scanFile(destinationPath); // Makes the file visible in file explorer
      }

      // Inform the user that the PDF is saved
      Alert.alert(
        'PDF Downloaded',
        'Your PDF has been saved to your device in the Downloads folder.',
      );
    } catch (error) {
      console.error('Error generating or saving PDF:', error);
      Alert.alert('Error', 'There was an issue generating or saving the PDF.');
    } finally {
      setPrePdfLoading(false);
    }
  };

  const PostDownloadPDF = async () => {

    setPostPdfLoading(true);
    const htmlContent = `
          <html>
            <head>
              <style>
                body {
                  font-family: 'Inter-Regular';
                  font-size: 14px;
                  color: black;
                  padding: 20px;
                  background-color: white;
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
                  margin-bottom: 15px;
                  
                }
                  .header-text{
                  text-decoration: underline;
                  }
                .static-text {
                  font-size: 14px;
                  margin-Top: 10px;
                  margin-bottom: 10px;
                  text-align: justify;
                }
                  .static-Top {
    
     
      
      font-size: 14px;
     
    }
    
                .details-row {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 15px;
                }
                .details-row div {
                  width: 48%; /* Both left and right columns take up nearly half the space */
                }
                .static-name {
      width: 40%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    
              </style>
            </head>
            <body>
              <!-- Header -->
              <div class="header-title">
              <h3 class="header-text" style="text-align:center">Post Intimation of Repossession to Police Station</h3></div>
            <div class="static-Top">

          To</br>
          Police Inspector,</br>
           ${selectedHistory.police_station_address || '------'}</br>
            ${selectedHistory.police_station_area || '------'}</br>

             </div>
            

        </div>
              <!-- Static Message -->
              <div class="static-text">
                This is to inform you that below customer has default in payment and has not shown up to pay money
    even after several reminders. We had repossessed the vehicle.
              </div>
    
              <!-- Table for Dynamic Vehicle Details -->
              <table>
              
                <tr>
                  <th>Loan Agreement No</th>
                              <td><strong>:</strong></td>
                  <td>${selectedHistory.loan_no || '----------'
      }</td>
                </tr>
                  </tr>
                  <th>Customer Name</th>
                  <td><strong>:</strong></td>
                  <td>${selectedHistory.customer_name || '----------'}</td>
                </tr>
                 <tr>
                  <th>Vehicle Registration No</th>
                  <td><strong>:</strong></td>
                  <td>${selectedHistory.rc_no || '----------'}</td>
                </tr>
                <tr>
                  <th>Product Model</th>
                  <td><strong>:</strong></td>
                  <td>${selectedHistory.product || '----------'}</td>
              
                  </tr>
                <tr>
                  <th>Engine No</th>
                  <td><strong>:</strong></td>
                  <td>${selectedHistory.engine_no || '----------'}</td>
                </tr>
                <tr>
                  <tr>
                  <th>Chassis No</th>
                  <td><strong>:</strong></td>
                  <td>${selectedHistory.chassis_no || '----------'}</td>
                </tr>
                 
              <!-- Date and Time Row -->
         <tr>
          <th>Date</th>
          <td><strong>:</strong></td>
          <td>${selectedHistory.form_date || '----------'}</td>
        </tr>
        <tr>
          <th>Time</th>
          <td><strong>:</strong></td>
          <td>${selectedHistory.form_time || '----------'}</td>
        </tr>
    
              </table>
    
              <!-- Static Footer Text with 3 Paragraphs -->
              <div class="static-text">
               
                <p>Please do not take any complains of vehicle being stolen from the customer.</p>
              </div>
    
              <!-- Finance and Agency Details (Displayed on left and right side) -->
              <div class="static-name">
            
              <p>${selectedHistory.finance_name || '----------'
      }</p>
             <p>${selectedHistory.agency_select || '----------'
      }</p>
      
       
          
            
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
          ? `${RNFS.DownloadDirectoryPath}/POST_PDF(${selectedHistory.loan_no}).pdf` // Post download
          : `${RNFS.DocumentDirectoryPath}/POST_PDF(${selectedHistory.loan_no}).pdf`; // iOS uses Document directory

      // Move the file to the Downloads folder (Android)
      await RNFS.moveFile(file.filePath, destinationPath);
      console.log('PDF saved to:', destinationPath);

      // Optionally, trigger the system to scan the file (Android)
      if (Platform.OS === 'android') {
        await RNFS.scanFile(destinationPath); // Makes the file visible in file explorer
      }

      // Inform the user that the PDF is saved
      Alert.alert(
        'PDF Downloaded',
        'Your PDF has been saved to your device in the Downloads folder.',
      );
    } catch (error) {
      console.error('Error generating or saving PDF:', error);
      Alert.alert('Error', 'There was an issue generating or saving the PDF.');
    } finally {
      setPostPdfLoading(false);
    }
  };




  const PrePdfAfterMail = async () => {

    setPreMailLoading(true);
    setModalVisible(false);



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
      width: 100%;               /* Removed quotes */
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
          <span><strong>${selectedHistory.agency_select || '----------'}</strong> &lt;${selectedHistory.agency_email || '----------'}&gt;</span>
        </div>
      </div>
    
      <div class="separator"></div>
    
      <!-- Header -->
      <div class="header-title">PRE POLICE REPO INTIMATION OF VEHICLE ${selectedHistory.rc_no || '----------'} </div>
    
      <div class="separator"></div>
    
        <div class="agency-info2">
      <span><strong>${selectedHistory.agency_select || '----------'}</strong> &lt;${selectedHistory.agency_email || '----------'}&gt;</span>
      <span>${selectedHistory.email_entrydate || '----------'}</span>
    </div>
    
      <div class="agency-info3">
      <span><strong>To </strong></span>
      <span style="padding: 0 8px;">:</span> <!-- Extra padding for space -->
      <span>${selectedHistory.police_station_email || '----------'}</span>
    </div>
    
    
          <div class="static-Top">
    
                To</br>
                Police Inspector,</br>
                 ${selectedHistory.police_station_address || '------'}</br>
            ${selectedHistory.police_station_area || '------'}</br>
                  
    
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
                <td>${selectedHistory.loan_no || '----------'
      }</td>
              </tr>
                </tr>
                <th>Customer Name</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.customer_name || '----------'}</td>
              </tr>
               <tr>
                <th>Vehicle Registration No</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.rc_no || '----------'}</td>
              </tr>
              <tr>
                <th>Product Model</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.product || '----------'}</td>
            
                </tr>
              <tr>
                <th>Engine No</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.engine_no || '----------'}</td>
              </tr>
              <tr>
                <tr>
                <th>Chassis No</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.chassis_no || '----------'}</td>
              </tr>
               
            <!-- Date and Time Row -->
        <tr>
          <th>Date</th>
            <td><strong>:</strong></td>
          <td>${selectedHistory.form_date || '----------'}</td>
        </tr>
        <tr>
          <th>Time</th>
            <td><strong>:</strong></td>
          <td>${selectedHistory.form_time || '----------'}</td>
        </tr>
    
            </table>
    
      <!-- Footer Text -->
      <div class="static-text">
        Please do not take any complaints of the vehicle being stolen from the customer.
      </div>
    
      <!-- Footer Details -->
      <div class="footer-details">
        <p>${selectedHistory.finance_name || '----------'}</p>
        <p>${selectedHistory.agency_select || '----------'}</p>
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
          ? `${RNFS.DownloadDirectoryPath}/PRE_PDF(${selectedHistory.rc_no}).pdf` // Pre download
          : `${RNFS.DocumentDirectoryPath}/PRE_PDF(${selectedHistory.rc_no}).pdf`; // iOS uses Document directory

      // Move the file to the Downloads folder (Android)
      await RNFS.moveFile(file.filePath, destinationPath);
      console.log('PDF saved to:', destinationPath);

      navigation.navigate('PDFViewerScreen', { pdfUrl: destinationPath });

      // Optionally, trigger the system to scan the file (Android)
      if (Platform.OS === 'android') {
        await RNFS.scanFile(destinationPath); // Makes the file visible in file explorer
      }

      // 📂 Open PDF after download
      // await FileViewer.open(destinationPath, { showOpenWithDialog: true });
      // console.log('PDF opened successfully');

      // Alert.alert('PDF Downloaded', 'Your PDF has been saved and opened.');

    } catch (error) {
      console.error('Error generating, saving, or opening PDF:', error);

    } finally {
      setPreMailLoading(false);
    }
  };

  const PostPdfAfterMail = async () => {
    setPostMailLoading(true);
    setModalVisible(false);

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
                 width: 100%;  
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
                  <span><strong>${selectedHistory.agency_select || '----------'}</strong> &lt;${selectedHistory.agency_email || '----------'}&gt;</span>
                </div>
              </div>
      
              <div class="separator"></div>
      
              <!-- Header Title -->
            <div class="header-title">POST POLICE REPO INTIMATION OF VEHICLE ${selectedHistory.rc_no || '----------'} </div>
      
              <div class="separator"></div>
      
              <!-- Agency Info -->
              <div class="agency-info2">
                <span><strong>${selectedHistory.agency_select || '----------'}</strong> &lt;${selectedHistory.agency_email || '----------'}&gt;</span>
                <span>${selectedHistory.email_entrydate || '----------'}</span>
              </div>
      
              <!-- Recipient Info -->
              <div class="agency-info3">
                <span><strong>To </strong></span>
                <span style="padding: 0 8px;">:</span>
                <span>${selectedHistory.police_station_email || '----------'}</span>
              </div>
      
              <div class="static-Top">
                To</br>
                Police Inspector,</br>
              ${selectedHistory.police_station_address || '------'}</br>
            ${selectedHistory.police_station_area || '------'}</br>
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
                <td>${selectedHistory.loan_no || '----------'
      }</td>
              </tr>
                </tr>
                <th>Customer Name</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.customer_name || '----------'}</td>
              </tr>
               <tr>
                <th>Vehicle Registration No</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.rc_no || '----------'}</td>
              </tr>
              <tr>
                <th>Product Model</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.product || '----------'}</td>
            
                </tr>
              <tr>
                <th>Engine No</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.engine_no || '----------'}</td>
              </tr>
              <tr>
                <tr>
                <th>Chassis No</th>
                  <td><strong>:</strong></td>
                <td>${selectedHistory.chassis_no || '----------'}</td>
              </tr>
               
            <!-- Date and Time Row -->
        <tr>
          <th>Date</th>
            <td><strong>:</strong></td>
          <td>${selectedHistory.form_date || '----------'}</td>
        </tr>
        <tr>
          <th>Time</th>
            <td><strong>:</strong></td>
          <td>${selectedHistory.form_time || '----------'}</td>
        </tr>
    
            </table>
      
              <!-- Footer Text -->
              <div class="static-text">
                <p>Please do not take any complaints of the vehicle being stolen from the customer.</p>
              </div>
      
              <!-- Footer Details -->
              <div class="footer-details">
                <p>${selectedHistory.finance_name || '----------'}</p>
             <p>${selectedHistory.agency_select || '----------'}</p>
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
          ? `${RNFS.DownloadDirectoryPath}/POST_PDF(${selectedHistory.rc_no}).pdf`
          : `${RNFS.DocumentDirectoryPath}/POST_PDF(${selectedHistory.rc_no}).pdf`;

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


  // Render each item in the table
  const renderItem = ({ item, index }) => (
    <View style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
      <View style={{ width: '7%', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Regular' }}>{index + 1 || '----'}</Text>
      </View>
      <View style={{ width: '30%', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Regular', fontSize: 13 }}>{item.customer_name || '----'}</Text>
      </View>
      <View style={{ width: '28%', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Regular' }}>{item.rc_no || '----'}</Text>
        <TouchableOpacity style={{ backgroundColor: item.confirm_status == 'Confirm' ? 'green' : 'red', padding: 3, borderRadius: 5 }} disabled={true}>
          <Text style={{ fontSize: 12, color: 'white', fontFamily: 'Inter-Regular' }}>{item.confirm_status || '----'}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Regular' }}>{item.entrydate || '----'}</Text>
      </View>
      <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => openModal(item)}
          style={{
            width: '100%',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <AntDesign name="infocirlceo" size={20} color="black" />
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
            position: 'absolute', top: 1, left: 5,

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
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Pso Confirm/Cancel List
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

            placeholder="Search Name/Rc No"
            placeholderTextColor="grey"
            value={text}
            onChangeText={handleTextChange}
          />
          {text ? (
            <TouchableOpacity
              onPress={() => {

                setText(''); // Clear the search text
                setList(originalPsoList);
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
                fontSize: 14,
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
                textAlign: 'left',
                fontSize: 14,
                color: 'black',
              }}>
              NAME
            </Text>
          </View>
          <View
            style={{
              width: '25%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
                fontSize: 14,
                color: 'black',
              }}>
              RC NO
            </Text>
          </View>

          <View
            style={{
              width: '25%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
                fontSize: 14,
                color: 'black',
              }}>
              DATE
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
                fontSize: 14,
                color: 'black',
              }}>
              {/* Empty column */}
            </Text>
          </View>
        </View>


      </View>
      {/* Area List */}
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {ListLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LottieView
              source={LoadingAnimation}  // Path to your Lottie animation file
              autoPlay
              loop
              style={{ width: 200, height: 200 }}  // Customize the size as needed
            />
          </View>
        ) : (
          <FlatList
            keyboardShouldPersistTaps='handled'
            data={List}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray', fontFamily: 'Inter-Regular' }}>
                No List Found
              </Text>
            }
          />
        )}
      </View>


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
            {selectedHistory && (
              <>
                {/* <TouchableOpacity
                              style={{
                                position: 'absolute',
                                right: 5,
                                top: 12,
                                width: '20%',
                                flexDirection: 'row',
                                justifyContent: 'center',
                              }}
                              onPress={closeModal}>
                              <Entypo name="cross" size={30} color="black" />
                            </TouchableOpacity> */}

                <View
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    alignItems: 'center'
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: 'Inter-Medium',
                      marginBottom: 20,
                      color: 'black',
                      textAlign: 'center',
                    }}>
                    Details
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
                      Name:{' '}
                    </Text>
                    {selectedHistory.customer_name}
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
                      RC No:{' '}
                    </Text>
                    {selectedHistory.rc_no}
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
                      Date:{' '}
                    </Text>
                    {selectedHistory.form_date}
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
                      Time:{' '}
                    </Text>
                    {selectedHistory.form_time}
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
                      Loan/Agreement No:{' '}
                    </Text>
                    {selectedHistory.engine_no}
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
                      Engine No:{' '}
                    </Text>
                    {selectedHistory.engine_no}
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
                      Chasis No:{' '}
                    </Text>
                    {selectedHistory.chassis_no}
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
                    {selectedHistory.entrydate}
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
                      Repossession Agent :{' '}
                    </Text>
                    {selectedHistory.reposession_agent || '---'}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>

                    <Text
                      style={{

                        fontWeight: 'bold',
                        color: '#333',
                        fontFamily: 'Inter-Medium',
                      }}>
                      Confirm Status:{' '}
                    </Text>
                    <TouchableOpacity style={{ backgroundColor: selectedHistory.confirm_status == 'Confirm' ? 'green' : 'red', padding: 3, borderRadius: 5 }} disabled={true}>
                      <Text style={{ fontSize: 12, color: 'white', fontFamily: 'Inter-Regular' }}>{selectedHistory.confirm_status || '----'}</Text>
                    </TouchableOpacity>


                  </View>


                </ScrollView>



                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  {selectedHistory.confirm_status == 'Confirm' && (
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
                        width: '48%',
                        marginRight: 10, // Space between buttons
                        flexDirection: 'row', // Icon aur text ko side-by-side dikhane ke liye
                        alignItems: 'center', // Vertically center karne ke liye
                      }}
                      disabled={PrePdfLoading}
                    >
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

                  )}

                  {selectedHistory.confirm_status == 'Confirm' && (
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
                        alignItems: 'center', // Center align for icon & text
                      }}
                      disabled={PostPdfLoading} // Disable button during loading
                    >
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

                  )}

                </View> */}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>

                  {/* {selectedHistory.confirm_status == 'Confirm' && (
                    <TouchableOpacity
                      onPress={() => {
                        PrePostEmailSendApi('pre', selectedHistory.id);  // Send selectedHistory.id
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
                        width: '48%', 
                        marginRight: 10, 
                        flexDirection: 'row',
                        gap: 10
                      }}
                      disabled={preLoading}  
                    >
                      {preLoading ? (
                        <ActivityIndicator size="small" color={colors.Brown} /> 
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
                  )} */}

                  {/* {selectedHistory.confirm_status == 'Confirm' && (
                    <TouchableOpacity
                      onPress={() => {
                        PrePostEmailSendApi('post', selectedHistory.id);  // Send selectedHistory.id
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
                        width: '48%', 
                        flexDirection: 'row',
                        gap: 10
                      }}
                      disabled={postLoading}  
                    >
                      {postLoading ? (
                        <ActivityIndicator size="small" color={colors.Brown} />  
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
                  )} */}
                  {selectedHistory.confirm_status == 'Confirm' && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      {/* Pre Download PDF Button */}
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
                        disabled={PreMailLoading} // Disable button during loading
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
                          {PreMailLoading ? 'Processing...' : 'Pre PDF'} {/* Change text during loading */}
                        </Text>
                      </TouchableOpacity>

                      {/* Post Download PDF Button */}

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
                        disabled={PostMailLoading}
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

              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

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
            navigation.navigate('SearchVehicle', { from: 'home' });
          }}>
          <AntDesign name="plus" color="white" size={18} />
        </TouchableOpacity>
      </View>

    </View>
  )
}

export default ListingScreen

const styles = StyleSheet.create({})
