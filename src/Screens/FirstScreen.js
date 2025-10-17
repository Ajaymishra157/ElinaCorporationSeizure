import { Image, Text, TouchableOpacity, View, TextInput, ScrollView, FlatList, RefreshControl, ActivityIndicator, Modal, BackHandler, ToastAndroid, PermissionsAndroid, Platform, NativeModules, Alert, Keyboard, StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import colors from '../CommonFiles/Colors';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Bottomtab from '../Component/Bottomtab';
import { ENDPOINTS } from '../CommonFiles/Constant';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import LoadingAnimation from '../assets/animations/Loading.json';
import { db, initDB, insertVehicle, getVehiclesPaginated, bulkInsertVehicles, searchByLastRegNo } from '../utils/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import KeepAwake from 'react-native-keep-awake';
import LocationAndNetworkChecker from '../CommonFiles/LocationAndNetworkChecker';
import RNExitApp from 'react-native-exit-app';
import { Dropdown } from 'react-native-element-dropdown';
import CustomSlider from '../CommonFiles/CustomSlider';



const { ForegroundService } = NativeModules;

const FirstScreen = () => {
  const route = useRoute()




  const inputRef = useRef(null);
  const [wasInputFocused, setWasInputFocused] = useState(false);

  // App Setting State
  const [appSettings, setAppSettings] = useState(null);
  const [isAppAvailable, setIsAppAvailable] = useState(true);
  const [appStatusMessage, setAppStatusMessage] = useState('');

  // Remember if the input was focused before navigating away
  const handleBlur = () => {
    setWasInputFocused(true);
  };

  const handleFocus = () => {
    setWasInputFocused(false); // It's now focused, so reset the "was focused before"
  };

  useFocusEffect(
    useCallback(() => {
      // When screen is focused
      if (wasInputFocused) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 300);

        return () => clearTimeout(timer);
      }
    }, [wasInputFocused])
  );

  const navigation = useNavigation();
  const remove = require('../assets/images/delete.png');
  const logout = require('../assets/images/logout.png');
  const reLoad = require('../assets/images/reload.png');
  const vehicle = require('../assets/images/vehicle.png');
  const setting = require('../assets/images/setting.png');

  const [scheduleType, setScheduleType] = useState('Reg No');
  const [searchQuery, setSearchQuery] = useState('');
  const [SearchVehicle, setSearchVehicle] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [SearchLoading, setSearchLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // Loading state for pagination
  const [page, setPage] = useState(1); // Page number for pagination
  const itemsPerPage = 10; // Number of items to load per page
  const [totalItems, setTotalItems] = useState(0);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [VisibleType, setVisibleType] = useState('Reg No')
  const [listType, setListType] = useState('List'); // Default is List

  const [selectedOption, setSelectedOption] = useState('List'); // for modal selection

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [SelectedDropdownItem, setSelectedDropdownItem] = useState('List');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);

  const [CloseAppModal, setCloseAppModal] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0); // like 7, 14, etc.
  const [SyncStatus, setSyncStatus] = useState(null);
  const [StatusVisible, setStatusVisible] = useState(false);
  const [totaldays, setTotalDays] = useState(null);
  const [username, setUsername] = useState(null);
  const [deletesyncstatus, setDeleteSyncstatus] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dummydata, setDummydata] = useState(null);

  const hasSynced = useRef(false); // ye baar baar sync hone se bachayega
  const flatListRef = useRef(null);
  const [lastOffset, setLastOffset] = useState(null);
  const [hasPendingRecovery, setHasPendingRecovery] = useState(false);

  const [menuVisible, setMenuVisible] = useState(modalopen == 'open' ? true : false);

  // ✅ NEW: Fetch App Settings API
  // ✅ NEW: Fetch App Settings API
  const fetchAppSettings = async () => {
    try {
      const response = await fetch(ENDPOINTS.app_setting_time, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.code === 200 && result.payload) {
        setAppSettings(result.payload);
        checkAppAvailability(result.payload);
      } else {
        console.log('❌ Error fetching app settings:', result.message);
        // Default settings agar API fail ho
        setIsAppAvailable(true);
      }
    } catch (error) {
      console.log('❌ Error fetching app settings:', error.message);
      // Default settings agar network error ho
      setIsAppAvailable(true);
    }
  };

  // ✅ NEW: Check App Availability based on settings
  // const checkAppAvailability = (settings) => {
  //   const { app_status, start_time, end_time, time_option } = settings;

  //   // Agar app_status "Close" hai to directly block karo
  //   if (app_status === "Close") {
  //     setIsAppAvailable(false);
  //     setAppStatusMessage('App is temporarily closed. Please try again later.');
  //     return;
  //   }

  //   // Agar app_status "Start" hai to time check karo
  //   if (app_status === "Start" && time_option === "Time Period") {
  //     const currentTime = new Date();
  //     const currentHours = currentTime.getHours();
  //     const currentMinutes = currentTime.getMinutes();


  //     // Convert time strings to hours and minutes
  //     const [startHours, startMinutes, startSeconds] = start_time.split(':').map(Number);
  //     const [endHours, endMinutes, endSeconds] = end_time.split(':').map(Number);


  //     // Convert everything to minutes for easy comparison
  //     const currentTimeInMinutes = currentHours * 60 + currentMinutes;
  //     const startTimeInMinutes = startHours * 60 + startMinutes;
  //     const endTimeInMinutes = endHours * 60 + endMinutes;

  //     // Check if current time is within the allowed time period
  //     const isWithinTime =
  //       currentTimeInMinutes >= startTimeInMinutes &&
  //       currentTimeInMinutes <= endTimeInMinutes;

  //     if (!isWithinTime) {
  //       setIsAppAvailable(false);
  //       setAppStatusMessage(`App is available only between ${start_time} to ${end_time}`);
  //     } else {
  //       setIsAppAvailable(true);
  //       setAppStatusMessage('');
  //     }
  //   } else {
  //     // Agar time period check nahi karna hai to direct allow karo
  //     setIsAppAvailable(true);
  //     setAppStatusMessage('');
  //   }
  // };


  const checkAppAvailability = (settings) => {
    const { app_status, start_time, end_time, time_option, app_message } = settings;

    if (app_status === "Permanent Close") {
      setIsAppAvailable(false);
      setAppStatusMessage(app_message);
      return;
    }

    if (app_status === "Permanent On") {
      setIsAppAvailable(true);
      setAppStatusMessage('');
      return;
    }

    if (app_status === "Time Frame" && time_option === "Time Period") {
      const currentTime = new Date();
      const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

      const [startHours, startMinutes] = start_time.split(':').map(Number);
      const [endHours, endMinutes] = end_time.split(':').map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      const isWithinTime = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;

      const formatTime = (timeStr) => {
        const [h, m] = timeStr.split(':');
        return `${h}:${m}`;
      }

      if (!isWithinTime) {
        setIsAppAvailable(false);
        setAppStatusMessage(app_message);
      } else {
        setIsAppAvailable(true);
        setAppStatusMessage('');
      }
    } else {
      setIsAppAvailable(true);
      setAppStatusMessage('');
    }
  };



  useFocusEffect(
    React.useCallback(() => {
      const checkLastOffsetAndCount = async () => {
        try {
          // get lastOffset
          const offset = await AsyncStorage.getItem("lastOffset");
          console.log("abc offset:", offset);
          setLastOffset(offset);

          // get stored total count
          // const storedCount = await AsyncStorage.getItem("totalItemsCount");
          // if (storedCount !== null) {
          //   console.log("📊 Restored totalItems from storage:", storedCount);
          //   setTotalItems(parseInt(storedCount, 10));
          // } else {
          //   console.log("⚠️ No stored total count found, fallback to DB count");
          //   countVehiclesInDB(); // fallback (slow but ensures correctness)
          // }
        } catch (err) {
          console.log("❌ Error restoring offset/count:", err.message);
        }
      };

      checkLastOffsetAndCount();
      fetchAppSettings();
    }, [])
  );


  useEffect(() => {
    countVehiclesInDB();
    fetchAppSettings();
  }, []);

  async function requestAndroidNotificationPermission() {
    if (Platform.OS != "android") return true;
    if (Platform.Version < 33) return true;

    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return res == PermissionsAndroid.RESULTS.GRANTED;
  }




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
          // Step 1: Count how many vehicles actually exist in this range
          tx.executeSql(
            `SELECT COUNT(*) as count FROM vehicles WHERE id BETWEEN ? AND ?`,
            [start, end],
            (_, result) => {
              const countInRange = result.rows.item(0).count;

              // Step 2: Delete vehicles in this range
              tx.executeSql(
                `DELETE FROM vehicles WHERE id BETWEEN ? AND ?`,
                [start, end],
                () => {
                  totalDeleted += countInRange;
                  console.log(`🗑 Deleted vehicles ${start}–${end} (deleted: ${countInRange}, total deleted: ${totalDeleted})`);
                  resolve();
                },
                (_, error) => {
                  console.log("❌ Error deleting range:", error.message);
                  reject(error);
                }
              );
            },
            (_, error) => {
              console.log("❌ Error counting vehicles in range:", error.message);
              reject(error);
            }
          );
        });
      });
    }

    // ✅ Instead of recounting DB, update AsyncStorage + state
    // let currentCount = parseInt(await AsyncStorage.getItem("totalItemsCount")) || 0;
    // currentCount -= totalDeleted;
    // if (currentCount < 0) currentCount = 0; // safety guard

    // await AsyncStorage.setItem("totalItemsCount", String(currentCount));

    // console.log(`✅ Finished deleting ${totalDeleted} vehicles. Updated total count: ${currentCount}`);
    countVehiclesInDB();
  };

  useEffect(() => {
    const checkCrashSync = async () => {
      if (__DEV__) {
        // run only once in dev too
        if (hasSynced.current) return;
      }

      const shouldSync = route.params?.shouldSync == true;
      const status = await AsyncStorage.getItem("syncStatus");
      console.log("ye hai downloads ka status", status)
      const lastOffset = await AsyncStorage.getItem("lastOffset");
      const days = Number(totaldays || 0);

      // 👉 Case 1: Manual Sync after login
      if (shouldSync && !hasSynced.current && days !== 0) {
        console.log("🚀 Sync triggered after login");
        loadAllVehiclesPaginated(true, 'no'); // manual
        hasSynced.current = true;
        return;
      }

      // Do NOT auto sync for crash recovery now.
      // Just set hasPendingRecovery to true and show button.
      if ((status == "incomplete" || lastOffset) && days !== 0) {
        setHasPendingRecovery(true); // ← New state
        console.log("⚠️ Crash recovery pending. Awaiting user action.");
        return;
      }

      console.log("⏸️ Sync skipped", { shouldSync, status, days, lastOffset });
    };

    checkCrashSync();
  }, [route.params?.shouldSync, totaldays]);

  // useEffect(() => {
  //   const checkCrashSync = async () => {
  //     if (__DEV__) {
  //       // run only once in dev too
  //       if (hasSynced.current) return;
  //     }

  //     const shouldSync = route.params?.shouldSync == true;
  //     const status = await AsyncStorage.getItem("syncStatus");
  //     const lastOffset = await AsyncStorage.getItem("lastOffset");
  //     const days = Number(totaldays || 0);

  //     // 👉 Case 1: Manual Sync after login
  //     if (shouldSync && !hasSynced.current && days !== 0) {
  //       console.log("🚀 Sync triggered after login");
  //       loadAllVehiclesPaginated(true); // manual
  //       hasSynced.current = true;
  //       return;
  //     }

  //     // 👉 Case 2: Crash Recovery
  //     // if ((status === "incomplete" || lastOffset) && days !== 0) {
  //     //   if (lastOffset) {
  //     //     console.log(`⚠️ Crash recovery: resuming from offset ${lastOffset}`);
  //     //   } else {
  //     //     console.log("⚠️ Crash recovery: no offset found, starting fresh");
  //     //   }
  //     //   setLoadingDone(false);
  //     //   loadAllVehiclesPaginated(false);
  //     //   hasSynced.current = true;
  //     //   return;
  //     // }

  //     if ((status == "incomplete" || lastOffset) && days !== 0) {
  //       setHasPendingRecovery(true); // ← New state
  //       console.log("⚠️ Crash recovery pending. Awaiting user action.");
  //       return;
  //     }

  //     console.log("⏸️ Sync skipped", { shouldSync, status, days, lastOffset });
  //   };

  //   checkCrashSync();
  // }, [route.params?.shouldSync, totaldays]);



  const fakedata = async () => {
    try {

      const response = await fetch(ENDPOINTS.dummy_data, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
      });

      const result = await response.json();
      if (result.code == 200) {
        setDummydata(result.dummay_data);
      } else {
        console.log('Error:', result.message || 'Failed to load staff data');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    }
  };

  const [allVehicles, setAllVehicles] = useState([]);

  const [dropdownData] = useState([

    { label: 'List Design', value: 'List' },

    { label: 'Grid Design', value: 'Grid' },
  ]);
  const [isStateVisible, setIsStateVisible] = useState(false);
  const [tempSelectedState, setTempSelectedState] = useState(null);
  const [SelectedState, setSelectedState] = useState('All');
  const [selectedStateOption, setSelectedStateOption] = useState('All');
  const [StateType, setStateType] = useState('All');


  const [StateData] = useState([
    { label: 'All', value: 'All' },
    { label: 'Andhra Pradesh', value: 'AP' },
    { label: 'Arunachal Pradesh', value: 'AR' },
    { label: 'Assam', value: 'AS' },
    { label: 'Bihar', value: 'BR' },
    { label: 'Chhattisgarh', value: 'CG' },
    { label: 'Goa', value: 'GA' },
    { label: 'Gujarat', value: 'GJ' },
    { label: 'Haryana', value: 'HR' },
    { label: 'Himachal Pradesh', value: 'HP' },
    { label: 'Jharkhand', value: 'JH' },
    { label: 'Karnataka', value: 'KA' },
    { label: 'Kerala', value: 'KL' },
    { label: 'Madhya Pradesh', value: 'MP' },
    { label: 'Maharashtra', value: 'MH' },
    { label: 'Manipur', value: 'MN' },
    { label: 'Meghalaya', value: 'ML' },
    { label: 'Mizoram', value: 'MZ' },
    { label: 'Nagaland', value: 'NL' },
    { label: 'Odisha', value: 'OD' },
    { label: 'Punjab', value: 'PB' },
    { label: 'Rajasthan', value: 'RJ' },
    { label: 'Sikkim', value: 'SK' },
    { label: 'Tamil Nadu', value: 'TN' },
    { label: 'Telangana', value: 'TS' },
    { label: 'Tripura', value: 'TR' },
    { label: 'Uttar Pradesh', value: 'UP' },
    { label: 'Uttarakhand', value: 'UK' },
    { label: 'West Bengal', value: 'WB' },
  ]);

  const [searchQuery2, setSearchQuery2] = useState('');

  const filteredStates = StateData.filter((item) =>
    item.label.toLowerCase().includes(searchQuery2.toLowerCase())
  );


  const [fontSize, setFontSize] = useState(14);
  const [tempFontSize, setTempFontSize] = useState(fontSize);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textStyle, setTextStyle] = useState([]);
  const [tempFontFamily, setTempFontFamily] = useState(fontFamily);
  const [tempTextStyle, setTempTextStyle] = useState([...textStyle]);

  const STORAGE_KEYS = {
    FONT_SIZE: 'fontSize',
    FONT_FAMILY: 'fontFamily',
    TEXT_STYLE: 'textStyle',
  };

  const fontFamilies = [
    { label: 'Inter', value: 'Inter' },
    { label: 'Poppins', value: 'Poppins' },
    { label: 'Lato', value: 'Lato' },
    { label: 'Montserrat', value: 'Montserrat' },
  ];


  useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const savedFontSize = await AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE);
      const savedFontFamily = await AsyncStorage.getItem(STORAGE_KEYS.FONT_FAMILY);
      const savedTextStyle = await AsyncStorage.getItem(STORAGE_KEYS.TEXT_STYLE);

      if (savedFontSize) {
        const size = parseFloat(savedFontSize);
        setFontSize(size);
        setTempFontSize(size);
      }
      if (savedFontFamily) {
        setFontFamily(savedFontFamily);
        setTempFontFamily(savedFontFamily);
      }
      if (savedTextStyle) {
        const styles = JSON.parse(savedTextStyle);
        setTextStyle(styles);
        setTempTextStyle(styles);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };




  const openModal = () => {
    // Set temporary state to current saved state
    setTempFontSize(fontSize);
    setTempFontFamily(fontFamily);
    setTempTextStyle([...textStyle]);
    setMenuVisible(true);
  };

  const handleSave = async () => {
    try {
      // Update actual state
      setFontSize(tempFontSize);
      setFontFamily(tempFontFamily);
      setTextStyle([...tempTextStyle]);

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.FONT_SIZE, tempFontSize.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.FONT_FAMILY, tempFontFamily);
      await AsyncStorage.setItem(STORAGE_KEYS.TEXT_STYLE, JSON.stringify(tempTextStyle));

      setMenuVisible(false);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };
  const toggleTextStyle = (styleName) => {
    if (tempTextStyle.includes(styleName)) {
      setTempTextStyle(tempTextStyle.filter(s => s !== styleName));
    } else {
      setTempTextStyle([...tempTextStyle, styleName]);
    }
  };

  const getFontFamily = () => {
    const isBold = tempTextStyle.includes('Bold');
    const isItalic = tempTextStyle.includes('Italic');

    if (isBold && isItalic) return `${tempFontFamily}-BoldItalic`;
    if (isBold) return `${tempFontFamily}-Bold`;
    if (isItalic) return `${tempFontFamily}-Italic`;
    return `${tempFontFamily}-Regular`;
  };

  const getTextDecoration = () => {
    return tempTextStyle.includes('Underline') ? 'underline' : 'none';
  };

  useEffect(() => {
    if (menuVisible) {

      setTempFontSize(fontSize);
    }
  }, [menuVisible]);

  useFocusEffect(
    useCallback(() => {
      const loadSavedView = async () => {
        try {
          const savedType = await AsyncStorage.getItem('selected_view_type');
          const savedState = await AsyncStorage.getItem('selected_state');
          if (savedType) {
            setListType(savedType);
            setSelectedOption(savedType);
          }
          if (savedState !== null) {
            setSelectedState(savedState);

            // ✅ also update dropdown label:
            const label = StateData.find((item) => item.value === savedState)?.label;
            if (label) setSelectedStateOption(label);
          }
        } catch (e) {
          console.error('Error loading view type', e);
        }
      };

      loadSavedView();
      requestAndroidNotificationPermission();
    }, [])
  );

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelect = (type) => {
    setListType(type);
    setSelectedDropdownItem(type);
    setIsDropdownVisible(false);
  };

  const [loadingDone, setLoadingDone] = useState(true);

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
        const syncStatus = result.payload.sync_status;
        const totaldays = result.payload.total_days;
        const deletesync = result.payload.staff_delete_sync_status;

        const name = result.payload.name;
        setSyncStatus(syncStatus);
        setTotalDays(totaldays);
        setDeleteSyncstatus(deletesync)
        setUsername(name);
      } else {
        console.log('❌ Error: Failed to load data');
      }
    } catch (error) {
      console.log('❌ Error fetching data:', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      UserWiseExpiryApi();
      fakedata();
    }, [])
  );

  const loadDeletedVehiclesPaginated = async () => {
    let offset = 1;
    let keepLoading = true;
    let totalRecordsFetched = 0;
    let allDeletedIds = [];
    setLoadingDone(false);

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
      }
      if (allDeletedIds.length > 0) {
        await deleteVehiclesByIds(allDeletedIds);
        await UserWiseExpiryApi();
      }
    } catch (error) {
      console.log("❌ Error while loading deleted vehicles:", error.message);
    }
  };

  const sanitizeVehicle = (v) => ({
    id: parseInt(v.id || 0),
    month: v.month || '',
    finance_name: v.finance_name || '',
    finance_contact_person_name: v.finance_contact_person_name || '',
    finance_contact_number: v.finance_contact_number || '',
    manager: v.manager || '',
    branch: v.branch || '',
    agreement_number: v.agreement_number || '',
    app_id: v.app_id === '-' ? '' : v.app_id,
    customer_name: v.customer_name || '',
    bucket: v.bucket || '',
    emi: v.emi || '',
    principle_outstanding: v.principle_outstanding === '-' ? '' : v.principle_outstanding,
    total_outstanding: v.total_outstanding === '-' ? '' : v.total_outstanding,
    product: v.product || '',
    fild_fos: v.fild_fos || '',
    registration_number: v.registration_number || '',
    chassis_number: v.chassis_number || '',
    engine_number: v.engine_number || '',
    repo_fos: v.repo_fos === '-' ? '' : v.repo_fos,
    entry_date: v.entry_date || '',
    type: v.type || '',
    last_reg_no: v.last_reg_no,       // ✅ new field
    last_chassis_no: v.last_chassis_no,   // ✅ new field
    last_engine_no: v.last_engine_no,
    state_code: v.state_code,
    vehicle_excel_upload_number: v.vehicle_excel_upload_number,
    customer_address: v.customer_address || '',

  });


  const checkIfDataExists = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM vehicles',
          [],
          (tx, results) => {
            const count = results.rows.item(0).count;
            resolve(count > 0); // ✅ Only true if at least 1 row exists
          },
          error => {
            console.log("❌ Error checking data existence:", error.message);
            reject(false);
          }
        );
      });
    });
  };

  const loadAllVehiclesPaginated = async (isManual = false, alldataget) => {

    await AsyncStorage.setItem("syncStatus", "incomplete");
    KeepAwake.activate();

    if (Platform.OS == "android") {
      await ForegroundService.start("Downloading data", "Preparing to sync…", "FirstScreen");
    }

    const savedOffset = await AsyncStorage.getItem("lastOffset");
    // 🔹 Decide offset
    let offset = 1;
    if (!isManual) {
      if (savedOffset) {
        offset = parseInt(savedOffset, 10);
        console.log(`🔄 Resuming sync from saved offset ${offset}`);
      }
    }

    // 🔹 Clear totalItemsCount if starting fresh
    // if (offset == 1) {
    //   await AsyncStorage.removeItem("totalItemsCount");
    //   setTotalItems(0);
    //   console.log("🔹 Starting fresh sync, totalItemsCount reset to 0");
    // }
    let keepLoading = true;
    let totalRecordsFetched = 0;

    try {
      const userId = await AsyncStorage.getItem('staff_id');
      const userType = await AsyncStorage.getItem('user_type');

      if (!userId) {
        console.log("❌ User ID not found");
        return;
      }

      // Step 1: Check if vehicles already exist in the database
      const dataExists = await checkIfDataExists();
      console.log("Data exists in DB:", dataExists, savedOffset);  // Log the result here
      setLoadingDone(false);

      if (dataExists && SyncStatus != "Yes" && !savedOffset) {
        console.log("✅ Data already exists in the database. Skipping the API call and hiding the modal.");
        await loadAllFromDB();      // 👍 Just load data from DB
        countVehiclesInDB();        // Update counters
        setLoadingDone(true);       // Stop loading animation
        return;
      }

      const endpoint = userType === 'normal'
        ? ENDPOINTS.VehicleList_Normal
        : ENDPOINTS.VehicleList_Full;

      while (keepLoading) {
        const url = `${endpoint}?user_id=${userId}&offset=${offset}&alldataget=${alldataget}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.code == 200 && result.hasData != 'nodata' && Array.isArray(result.payload)) {
          const dataLength = result.payload.length;

          // Log the count of records received for current offset
          console.log(`📦 Offset ${offset} → Received ${dataLength} records`);

          // ✅ Set progress percent here (if exists)
          if (result.per) {
            const per = Math.min(result.per, 100);
            setProgressPercent(per); // <-- this updates the progress bar
            if (Platform.OS == "android") {
              try {
                await ForegroundService.updateProgress(per, `${per}% completed`);
              } catch (e) {
                console.log("Notif update error:", e.message);
              }
            }
          }

          // Increment the total count
          totalRecordsFetched += dataLength;
          console.log(`✅ Total records fetched so far: ${totalRecordsFetched}`);

          try {

            const cleanedList = result.payload.map(item => sanitizeVehicle(item));
            await bulkInsertVehicles(cleanedList);

            // update local count instead of recounting
            // let currentCount = parseInt(await AsyncStorage.getItem("totalItemsCount")) || 0;
            // currentCount += cleanedList.length;
            // await AsyncStorage.setItem("totalItemsCount", String(currentCount));
            // setTotalItems(currentCount);

            countVehiclesInDB();

            console.log(`✅ Bulk inserted ${cleanedList.length} vehicles`);

          } catch (bulkErr) {
            console.log(`❌ Bulk insert failed: ${bulkErr.message}`);
          }

          // console.log(`✅ Page ${offset} inserted`);
          offset += 1;
          await AsyncStorage.setItem("lastOffset", String(offset));
        } else {
          keepLoading = false;
          console.log("✅ All data loaded into SQLite.");
          await AsyncStorage.setItem("syncStatus", "complete");
          await AsyncStorage.removeItem("lastOffset");
        }
      }
    } catch (error) {
      console.log("❌ Error while loading data:", error.message);
      KeepAwake.deactivate();
    } finally {
      await loadAllFromDB();
      countVehiclesInDB();
      console.log('abc')
      UserWiseExpiryApi();
      setLoadingDone(true); // to hide animation or progress bar
      setStatusVisible(false);
      // 🔹 Mark sync complete
      KeepAwake.deactivate();
      // 🔹 Stop service
      if (Platform.OS == "android") {
        try {
          await ForegroundService.stop();
        } catch (e) {
          console.log("Stop service error:", e.message);
        }
      }
    }
  };

  const countVehiclesInDB = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) AS count FROM vehicles',
        [],
        (tx, results) => {
          const total = results.rows.item(0).count;
          console.log("📊 DB total vehicles count:", total);
          setTotalItems(total);  // <- THIS IS KEY
        }
      );
    });
  };

  const loadAllFromDB = async () => {
    try {
      const initialVehicles = await getVehiclesPaginated(0, itemsPerPage);
      // setSearchVehicle(initialVehicles);
      setAllVehicles(initialVehicles);
      setPage(1);
    } catch (error) {
      console.log("❌ Error in paginated load from DB:", error);
    }
  };

  useEffect(() => {
    if (loadingDone) {
      loadAllFromDB();
      loadMoreData();       // OR loadMoreData(), depending on pagination use
    }
  }, [loadingDone]);

  const refreshData = async () => {

    if (!isAppAvailable) {
      ToastAndroid.show(appStatusMessage, ToastAndroid.LONG);
      return;
    }


    setProgressPercent(0);
    setPage(1);
    setSearchPerformed(false);

    const days = Number(totaldays || 0);

    if (days == 0) {
      console.log("⏸️ Subscription expired → skipping sync");
      return;
    }

    // ✅ Activate keep awake before starting sync
    KeepAwake.activate();

    if (SyncStatus === "Yes" && deletesyncstatus === "Yes") {
      console.log("🚀 SyncStatus=Yes & DeleteSync=Yes → Run delete sync first, then full sync");
      setIsDeleting(true);
      await loadDeletedVehiclesPaginated();
      setIsDeleting(false);
      await loadAllVehiclesPaginated(0, 'no'); // always reset offset
    }
    else if (SyncStatus === "Yes") {
      console.log("🚀 SyncStatus=Yes & DeleteSync=No → Run full sync only");
      await loadAllVehiclesPaginated(0, 'no');
    }
    else {
      console.log("🚀 SyncStatus=No & DeleteSync=No → Nothing to sync");
      KeepAwake.deactivate();
    }
  };

  const closeExitModal = () => {
    setCloseAppModal(false);

  }
  const confirmExit = () => {
    RNExitApp.exitApp();
    setCloseAppModal(false);
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        setCloseAppModal(true); // Show modal on back press
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener("hardwareBackPress", backAction);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", backAction);
    }, [])
  );

  useEffect(() => {
    initDB();
  }, []);


  const onRefresh = async () => {

    setRefreshing(true);
    setSearchQuery('');
    await loadAllFromDB();
    setSearchVehicle([]);
    setRefreshing(false);
  };

  // ADD this function if you want pagination
  const loadMoreData = async () => {
    if (loadingMore || SearchVehicle.length >= totalItems) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const newVehicles = await getVehiclesPaginated(
        (nextPage - 1) * itemsPerPage,
        itemsPerPage
      );

      // ✅ Important: check if data actually returned
      if (newVehicles.length > 0) {
        setSearchVehicle(prev => [...prev, ...newVehicles]);
        setPage(nextPage);
      }
    } catch (error) {
      console.log("❌ Error loading more vehicles:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (query) => {

    if (!isAppAvailable) {
      ToastAndroid.show(appStatusMessage, ToastAndroid.LONG);
      setSearchVehicle([]); // ✅ Clear any previous results
      setSearchPerformed(false); // ✅ Reset search performed flag
      return; // ✅ IMPORTANT: Return early, don't proceed with search
    }


    if (!query) {
      setSearchVehicle([]);
      setSearchLoading(false);
      return;
    }

    setSearchQuery('');
    // setSearchLoading(true);

    let sql = '';
    let params = [];

    // Helper → build prefix and nextPrefix
    const makeRange = (prefix) => {
      if (!prefix) return ['', ''];
      const lastChar = prefix.slice(-1);
      const nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
      const nextPrefix = prefix.slice(0, -1) + nextChar;
      return [prefix, nextPrefix];
    };

    // Prefix for number fields
    let prefix = query.toUpperCase();
    let range = makeRange(prefix);

    // Build SQL depending on search type
    if (scheduleType === "Reg No") {
      sql = `SELECT id, registration_number, type, product 
             FROM vehicles 
             WHERE last_reg_no >= ? AND last_reg_no < ?`;
      params = range;
    } else if (scheduleType === "Chassis No") {
      sql = `SELECT id, chassis_no, type, product 
             FROM vehicles 
             WHERE last_chassis_no >= ? AND last_chassis_no < ?`;
      params = range;
    } else if (scheduleType === "Engine No") {
      sql = `SELECT id, engine_no, type, product 
             FROM vehicles 
             WHERE last_engine_no >= ? AND last_engine_no < ?`;
      params = range;
    }

    // ✅ Add state filter if user selected a state
    if (SelectedState !== "All") {
      sql += " AND state_code = ?";
      params.push(SelectedState);
    }

    // Run search query
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (tx, results) => {
          const uniqueMap = new Map();

          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);

            let key = '';
            if (scheduleType === "Reg No") {
              key = row.registration_number;
            } else if (scheduleType === "Chassis No") {
              key = row.chassis_no;
            } else if (scheduleType === "Engine No") {
              key = row.engine_no;
            }

            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, row);
            }
          }

          const uniqueRows = Array.from(uniqueMap.values());

          setSearchVehicle(uniqueRows);
          setSearchPerformed(true);
          console.log(`🔍 Found ${uniqueRows.length} unique vehicles`);
          setSearchLoading(false);

          // 👇 scroll to top after new search
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
          }
        },
        (tx, error) => {
          console.error("❌ Error executing query:", error);
          setSearchLoading(false);
        }
      );
    });
  };

  function formatIndianNumber(num) {
    if (!num) return "0";
    let x = num.toString();
    let lastThree = x.substring(x.length - 3);
    let otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  }

  const transformToColumnWise = (data, numColumns = 2) => {
    const columnWise = [];
    const itemsPerColumn = Math.ceil(data.length / numColumns);

    for (let i = 0; i < itemsPerColumn; i++) {
      for (let j = 0; j < numColumns; j++) {
        const index = i + j * itemsPerColumn;
        if (index < data.length) {
          columnWise.push(data[index]);
        }
      }
    }
    return columnWise;
  };


  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      key={item.id}
      style={{ flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 5, paddingVertical: 2, marginBottom: 3, borderRadius: 0, alignItems: 'center', marginTop: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3.84, elevation: 3, }}
      onPress={() => navigation.navigate('DetailScreen', { vehicleId: item.id })}
      activeOpacity={1}
    >
      <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
        {(() => {
          const type = item.type?.toUpperCase();


          switch (type) {
            case 'TW':
              return (
                <Image
                  source={require('../assets/images/sportbike.png')}
                  style={{ width: 18, height: 18, resizeMode: 'contain' }}
                />
              );
            case 'CAR':
              return (
                <Image
                  source={require('../assets/images/car.png')}
                  style={{ width: 18, height: 18, resizeMode: 'contain' }}
                />
              );



          }
        })()}

      </View>

      <View style={{ width: '40%', justifyContent: 'center', alignItems: 'flex-start' }}>
        <Text style={{ fontSize: scheduleType === "Chassis No" ? 12 : fontSize, textAlign: 'center', color: 'black', fontFamily: getFontFamily(), textDecorationLine: getTextDecoration(), }}>
          {scheduleType === "Reg No"
            ? (item.registration_number || "-----")
            : scheduleType === "Chassis No"
              ? (item.chassis_no || "-----")
              : (item.engine_no || "-----")}
        </Text>
      </View>
      <View style={{ width: '50%', justifyContent: 'center', alignItems: 'flex-start' }}>
        <Text numberOfLines={1} style={{ fontSize: scheduleType === "Chassis No" ? 12 : 13, textAlign: 'left', color: 'black', fontFamily: 'Inter-Bold' }}>
          {item.product || '-----'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={{
        backgroundColor: '#fff',
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginVertical: 4,
        borderRadius: 0,
        width: '49%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 3,
      }}
      onPress={() => navigation.navigate('DetailScreen', { vehicleId: item.id })}
      activeOpacity={1}
    >
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingRight: 3,
          gap: 5,
        }}
      >
        {/* ✅ Fixed image container */}
        <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
          {item.type?.toUpperCase() === 'TW' ? (
            <Image
              source={require('../assets/images/sportbike.png')}
              style={{ width: 18, height: 18, resizeMode: 'contain' }}
            />
          ) : item.type?.toUpperCase() === 'CAR' ? (
            <Image
              source={require('../assets/images/car.png')}
              style={{ width: 18, height: 18, resizeMode: 'contain' }}
            />
          ) : null}
        </View>

        <Text
          style={{
            fontSize: scheduleType === "Chassis No" ? 12 : fontSize,
            color: 'black',
            fontFamily: getFontFamily(), textDecorationLine: getTextDecoration(),
            marginTop: 0,
          }}
        >
          {scheduleType === 'Reg No'
            ? item.registration_number || '-----'
            : scheduleType === 'Chassis No'
              ? item.chassis_no || '-----'
              : item.engine_no || '-----'}
        </Text>
      </View>
    </TouchableOpacity>
  );


  const renderStateItem = ({ item }) => (
    <TouchableOpacity
      style={{
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: 'white',
        flexDirection: 'row', justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ccc'
      }}
      onPress={() => {
        setTempSelectedState(item.value);
        setSelectedStateOption(item.label);
        setIsStateVisible(false);
      }}
    >
      <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Inter-Regular' }}>{item.label}</Text>

      {selectedStateOption === item.label && (
        <Entypo name="check" size={20} color="green" />
      )}
    </TouchableOpacity>
  );



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
        {isAppAvailable && totaldays !== 0 ? (
          <TouchableOpacity onPress={() => navigation.navigate('Menus')} style={{
            position: 'absolute',
            left: 10,
            top: 17
          }}>
            <Entypo name="menu" size={26} color="white" style={{ marginRight: 8 }} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26, marginRight: 8 }} /> // placeholder
        )}
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Elina Corporation
        </Text>

        {isAppAvailable && totaldays !== 0 ? (
          <TouchableOpacity onPress={openModal} style={{
            position: 'absolute', // 👈 Absolute positioning
            right: 10, // 👈 Right side se 5 margin
            top: 17
          }}>
            <Image source={setting} style={{ width: 26, height: 26, tintColor: 'white' }} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} /> // placeholder
        )}
      </View>

      <LocationAndNetworkChecker>
        {totaldays == 0 ? (

          <View style={{ flex: 1, backgroundColor: 'white', margin: 5 }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 10,
              borderWidth: 1,
              marginBottom: 0,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2
            }}>

              <Image source={require('../assets/images/logo.png')}
                style={{ width: 100, height: 100, alignSelf: 'center', resizeMode: 'contain' }} />
            </View>

            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: 'black', textTransform: 'capitalize' }}>
                Summary Of {username}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 0 }}>
              {/* Days Left */}
              <View style={{ borderWidth: 1, borderRadius: 10, width: '48%', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                <Image source={require('../assets/images/remain.png')} style={{ height: 40, width: 40, resizeMode: 'contain' }} />
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: 'black', marginTop: 5 }}>
                  Days Left
                </Text>
                <Text style={{ fontSize: 20, fontFamily: 'Inter-Bold', color: 'black' }}>0</Text>
              </View>

              {/* Status */}
              <View style={{ borderWidth: 1, borderRadius: 10, width: '48%', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                <Image source={require('../assets/images/accountstatus.png')} style={{ height: 40, width: 40, resizeMode: 'contain' }} />
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: 'black', }}>
                  Status
                </Text>
                <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: 'red', }}>
                  Schedule Expired
                </Text>
              </View>
            </View>

            {/* Bottom tab */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <Bottomtab />
            </View>
          </View>
        ) : (
          <>

            {!isAppAvailable && (
              <View style={{
                backgroundColor: '#ffebee',
                padding: 15,
                margin: 10,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#f44336'
              }}>
                <Text style={{
                  color: '#c62828',
                  fontSize: 14,
                  fontFamily: 'Inter-Medium',
                  textAlign: 'center'
                }}>
                  {appStatusMessage}
                </Text>
              </View>
            )}

            <View
              style={{ flex: 1, backgroundColor: 'white' }}
            >
              <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', gap: 7, margin: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: isAppAvailable ? colors.Brown : '#ccc', borderWidth: 1, borderRadius: 5, backgroundColor: 'white', paddingHorizontal: 10, height: 40, width: '70%' }} >
                  <FontAwesome5 name="search" size={15} color="#000" style={{ marginRight: 5 }} />

                  <TextInput ref={inputRef} style={{ flex: 1, fontSize: 14, fontFamily: 'Inter-Regular', color: isAppAvailable ? 'black' : '#ccc', padding: 0 }}
                    placeholder={scheduleType == 'Reg No' ? 'Search Register Number'
                      : scheduleType == 'Chassis No' ? 'Search Chassis Number'
                        : 'Search Engine Number'}
                    placeholderTextColor={isAppAvailable ? "gray" : "#ccc"}
                    value={searchQuery}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    maxLength={scheduleType === 'Reg No' ? 4 : 5}
                    keyboardType={scheduleType === 'Reg No' ? 'phone-pad' : 'email-address'}
                    onChangeText={(text) => {

                      if (!isAppAvailable) {
                        ToastAndroid.show(appStatusMessage, ToastAndroid.LONG);
                        return;
                      }

                      const filtered = text.replace(/[^a-zA-Z0-9]/g, ''); // allow letters and numbers

                      setSearchQuery(filtered);
                      if ((scheduleType === 'Reg No' && filtered.length === 4) ||
                        ((scheduleType === 'Chassis No' || scheduleType === 'Engine No') && filtered.length === 5)) {
                        handleSearch(filtered);
                      } else if (filtered.length == 0) {
                        setSearchVehicle([]); // ✅ clear results when input is empty

                      } else {
                        // loadAllFromDB(); // reload full list if less than 4 digits
                      }
                    }}
                  />

                </View>
                <View style={{ position: 'relative', width: '12%' }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: 'white', height: 40, borderRadius: 8, padding: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderColor: colors.Brown,
                      borderWidth: 1,
                      width: '100%',
                      paddingHorizontal: 5
                    }}
                    onPress={() => {
                      if (scheduleType == 'Reg No') {
                        setScheduleType('Chassis No');
                        setSearchVehicle([]);
                      } else if (scheduleType == 'Chassis No') {
                        setScheduleType('Engine No');
                        setSearchVehicle([]);
                      } else if (scheduleType == 'Engine No') {
                        setScheduleType('Reg No');
                        setSearchVehicle([]);
                      } else {
                        setScheduleType('Reg No');
                        setVisibleType('Reg No');
                        setSearchVehicle([]);
                      }
                    }}
                  >
                    <Image source={require('../assets/images/two_arrows.png')} style={{ height: 35, width: 35 }} />

                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={{
                    width: '12%',
                    marginRight: 10,
                    height: 40,
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: '#ccc',
                    borderRadius: 8,
                    flexDirection: 'row',
                    backgroundColor: colors.Brown
                  }}
                  onPress={() => {
                    setSelectedOption(listType); // pre-fill current view
                    setIsDropdownVisible(true);
                  }}
                >
                  <AntDesign name="filter" size={18} color="white" />
                </TouchableOpacity>

                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={isDropdownVisible}
                  onRequestClose={() => setIsDropdownVisible(false)}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,

                      justifyContent: 'flex-end',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    activeOpacity={1}
                    onPress={() => setIsDropdownVisible(false)}
                  >
                    <View

                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        width: '100%',
                        paddingVertical: 5,

                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          setIsDropdownVisible(false);
                          setIsStateVisible(false);
                        }}
                        style={{
                          marginRight: 10,
                          backgroundColor: 'white',
                          borderRadius: 50,
                        }}>
                        <Entypo name="cross" size={25} color="black" />
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        backgroundColor: 'white',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20,
                        paddingBottom: 40,
                        height: 450

                      }}
                      onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
                      onTouchEnd={e => e.stopPropagation()}
                    >
                      <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', marginBottom: 15, color: 'grey', fontFamily: 'Inter-Regular' }}>
                        Select Design
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '95%' }}>
                        {dropdownData.map((item) => (
                          <TouchableOpacity
                            key={item.value}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginVertical: 8,
                              paddingHorizontal: 15,
                              paddingVertical: 10,
                              borderRadius: 8,
                              backgroundColor: selectedOption === item.value ? '#c5e8e4' : 'transparent',

                            }}
                            onPress={() => {
                              setSelectedOption(item.value);
                              setSelectedDropdownItem(item.value);
                            }
                            }
                          >
                            <View
                              style={{
                                height: 20,
                                width: 20,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: colors.Brown,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 12,
                                flexDirection: 'row', borderWidth: 1
                              }}
                            >
                              {selectedOption === item.value && (
                                <View
                                  style={{
                                    height: 10,
                                    width: 10,
                                    borderRadius: 5,
                                    backgroundColor: colors.Brown,
                                  }}
                                />
                              )}
                            </View>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: 'black', fontFamily: 'Inter-Regular' }}>{item.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* State Selection */}
                      <View style={{ margin: 20 }}>
                        {/* State Selection Label */}
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'Inter-Bold',
                            marginBottom: 15,
                            color: 'grey',
                          }}
                        >
                          Select State
                        </Text>

                        {/* Dropdown Field */}
                        <View style={{}}>
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
                            onPress={() => {
                              setIsStateVisible(!isStateVisible);
                              setSearchQuery2('');
                            }}
                          >
                            <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Inter-Regular' }}>{selectedStateOption}</Text>
                            <Ionicons
                              name={isStateVisible ? 'chevron-up' : 'chevron-down'}
                              size={20}
                              color="black"
                            />
                          </TouchableOpacity>

                          {/* Dropdown List */}
                          <Modal
                            animationType="fade"
                            transparent={true}
                            visible={isStateVisible}
                            onRequestClose={() => setIsStateVisible(false)}
                          >
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-end',
                                  width: '80%',
                                  backgroundColor: 'white'
                                }}>
                                <View style={{ width: '80%', borderBottomWidth: 1, borderColor: '#ccc', flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, alignItems: 'center', borderTopLeftRadius: 10, }}>
                                  <Text style={{ color: 'black', fontFamily: 'Inter-regular', fontSize: 16 }}>Select State(राज्य चुनें)</Text>
                                </View>
                                <View style={{ width: '20%', borderBottomWidth: 1, borderColor: '#ccc', flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, alignItems: 'center', borderTopRightRadius: 10, }}>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setIsStateVisible(false);

                                    }}
                                    style={{
                                      marginRight: 5,
                                      backgroundColor: 'white',
                                      borderRadius: 50,
                                    }}>
                                    <Entypo name="cross" size={30} color="grey" />
                                  </TouchableOpacity>

                                </View>
                              </View>

                              {/* Search Input */}
                              <View
                                style={{
                                  backgroundColor: 'white',
                                  width: '80%',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: '#ccc',
                                  paddingHorizontal: 10,

                                }}
                              >
                                <Feather name="search" size={20} color="#999" style={{ marginRight: 8 }} />
                                <TextInput
                                  placeholder="Search"
                                  placeholderTextColor="#999"

                                  value={searchQuery2}
                                  onChangeText={setSearchQuery2}
                                  style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    fontSize: 16,
                                    fontFamily: 'Inter-Regular',
                                    color: 'black',
                                  }}
                                />

                                {searchQuery2 ? (
                                  <TouchableOpacity
                                    onPress={() => {
                                      setSearchQuery2('');

                                    }
                                    }
                                    style={{
                                      padding: 5,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Entypo name="cross" size={20} color="black" />
                                  </TouchableOpacity>
                                ) : null}
                              </View>
                              <View
                                style={{
                                  backgroundColor: 'white',
                                  width: '80%',
                                  maxHeight: '70%',
                                }}
                              >
                                <FlatList
                                  data={filteredStates}
                                  showsVerticalScrollIndicator={false}
                                  renderItem={renderStateItem}
                                  keyExtractor={(item) => item.value}
                                  keyboardShouldPersistTaps="handled"
                                />
                              </View>
                            </View>
                          </Modal>
                        </View>
                      </View>

                      {/* Buttons */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginTop: 25,

                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setIsDropdownVisible(false);
                            setIsStateVisible(false);
                          }}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            backgroundColor: '#ccc',
                            borderRadius: 8,
                            width: '45%',
                            justifyContent: 'center', alignItems: 'center'
                          }}
                        >
                          <Text style={{ fontFamily: 'Inter-Bold', color: 'black' }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={async () => {
                            try {
                              setListType(selectedOption);
                              await AsyncStorage.setItem('selected_view_type', selectedOption);
                              // Fetch the previous state
                              const previousState = await AsyncStorage.getItem('selected_state');

                              // Determine which state to save
                              const stateToSave = tempSelectedState ?? previousState ?? 'All';

                              // Update UI and AsyncStorage
                              setSelectedState(stateToSave);
                              await AsyncStorage.setItem('selected_state', stateToSave);

                              // ✅ Set selectedStateOption from label
                              const label = StateData.find(item => item.value === stateToSave)?.label;
                              if (label) setSelectedStateOption(label);
                            } catch (e) {
                              console.error('Error saving view type', e);
                            }
                            setIsDropdownVisible(false);
                            setIsStateVisible(false);
                            setAllVehicles([]);
                            setSearchVehicle([]);
                          }}

                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            backgroundColor: colors.Brown,
                            borderRadius: 8,
                            width: '45%',
                            justifyContent: 'center', alignItems: 'center'
                          }}
                        >
                          <Text style={{ fontFamily: 'Inter-Bold', color: 'white' }}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>


              {/* ✅ NEW: Show message when app is not available and user tries to search */}
              {/* {!isAppAvailable && searchPerformed && (
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20
                }}>
                  <Image source={vehicle} style={{ width: 70, height: 70, marginBottom: 20 }} />
                  <Text style={{
                    fontFamily: 'Inter-Regular',
                    color: 'red',
                    fontSize: 16,
                    textAlign: 'center'
                  }}>
                    {appStatusMessage}
                  </Text>
                  <Text style={{
                    fontFamily: 'Inter-Regular',
                    color: '#666',
                    fontSize: 14,
                    textAlign: 'center',
                    marginTop: 10
                  }}>
                    Please try again during available hours
                  </Text>
                </View>
              )}
                */}

              {searchPerformed && SearchVehicle.length > 0 && (
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ddd',
                  borderBottomWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  marginHorizontal: 0,
                  marginBottom: 5,
                  // borderRadius: 5
                }}>
                  <Text style={{ fontFamily: 'Inter-Bold', color: 'black' }}>
                    {SearchVehicle.length} Vehicles Found
                  </Text>
                  <TouchableOpacity onPress={() => {
                    setSearchQuery('');
                    setSearchVehicle([]);
                    setSearchPerformed(false);
                  }}>
                    <Text style={{ fontFamily: 'Inter-Bold', color: 'black' }}>Clear</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!searchPerformed
                //  &&
                //  isAppAvailable 
                ? (
                  // 👇 Initial Home Screen (when no search done)
                  <ScrollView contentContainerStyle={{ padding: 5 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: 'black', marginLeft: 5 }}>
                      Welcome!
                    </Text>
                    <View style={{
                      backgroundColor: '#fff',
                      borderRadius: 10,

                      borderWidth: 1,
                      marginBottom: 10,
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2
                    }}>

                      <Image source={require('../assets/images/logo.png')}
                        style={{ width: 150, height: 100, alignSelf: 'center', resizeMode: 'contain' }} />
                    </View>

                    <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: 'black', marginLeft: 5 }}>
                      Addition Function
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 0, paddingHorizontal: 0 }}>
                      {/* Days Left */}
                      <View style={{ borderWidth: 1, borderRadius: 10, width: '48%', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                        <View style={{
                          // backgroundColor: '#fff',
                          // borderRadius: 10,
                          // padding: 20,
                          // borderWidth: 1,
                          // shadowColor: '#000',
                          // shadowOpacity: 0.1,
                          // shadowRadius: 4,
                          // elevation: 2
                        }}>

                          <View style={{ alignItems: 'center' }}>
                            <Image source={require('../assets/images/totalvehicle.png')}
                              style={{ width: 60, height: 60, marginBottom: 0 }} />
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: 'black' }}>
                              Total Vehicles
                            </Text>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-SemiBold', marginTop: 0, color: 'black' }}>
                              {formatIndianNumber(totalItems > 0 ? totalItems + dummydata : totalItems)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Days Left */}
                      <View style={{ borderWidth: 1, borderRadius: 10, width: '48%', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                        <Image source={require('../assets/images/remain.png')} style={{ height: 60, width: 60, resizeMode: 'contain' }} />
                        <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: 'black', marginTop: 5 }}>
                          Days Left
                        </Text>
                        <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: 'black' }}>{totaldays}</Text>
                      </View>
                    </View>
                  </ScrollView>
                ) : SearchLoading ? (
                  // 👇 Loading animation while searching
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LottieView source={LoadingAnimation} autoPlay loop style={{ width: 200, height: 200 }} />
                  </View>
                ) : SearchVehicle.length === 0 && isAppAvailable ? (
                  <View
                    style={{ height: 600, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={vehicle} style={{ width: 70, height: 70, marginTop: 30, }} />
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        color: 'red',
                        marginTop: 20

                      }}>
                      No Vehicles Found
                    </Text>
                  </View>
                ) : isAppAvailable && SearchVehicle.length > 0 ? (
                  <FlatList
                    ref={flatListRef}
                    data={
                      listType === "Grid"
                        ? transformToColumnWise(
                          [...SearchVehicle].sort((a, b) => {
                            const fieldA =
                              scheduleType === "Reg No"
                                ? a.registration_number
                                : scheduleType === "Chassis No"
                                  ? a.chassis_no
                                  : a.engine_no;

                            const fieldB =
                              scheduleType === "Reg No"
                                ? b.registration_number
                                : scheduleType === "Chassis No"
                                  ? b.chassis_no
                                  : b.engine_no;

                            return (fieldA || "").localeCompare(fieldB || "");
                          })
                        )
                        : [...SearchVehicle].sort((a, b) => {
                          const fieldA =
                            scheduleType === "Reg No"
                              ? a.registration_number
                              : scheduleType === "Chassis No"
                                ? a.chassis_no
                                : a.engine_no;

                          const fieldB =
                            scheduleType === "Reg No"
                              ? b.registration_number
                              : scheduleType === "Chassis No"
                                ? b.chassis_no
                                : b.engine_no;

                          return (fieldA || "").localeCompare(fieldB || "");
                        })
                    }
                    extraData={SearchVehicle}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={listType === 'Grid' ? renderGridItem : renderItem}
                    numColumns={listType === 'Grid' ? 2 : 1}
                    key={listType === 'Grid' ? 'g' : 'l'} // Force re-render on layout change
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: keyboardVisible ? 340 : 30 }}
                    columnWrapperStyle={listType === 'Grid' ? { justifyContent: 'space-between' } : null}
                  />
                ) : null}

            </View>
            {/* {StatusVisible && progressPercent < 100 && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 70,
                  left: 10,
                  right: 10,
                  backgroundColor: 'white',
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 5,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row'
                }}
              >


                <Progress.Bar
                  progress={progressPercent / 100}
                  width={200}
                  height={10}
                  borderRadius={5}
                  color="#1fc091"
                />

                <Text
                  style={{

                    fontSize: 12,
                    fontWeight: '500',
                    color: '#555',
                  }}
                >
                  {progressPercent}% Completed
                </Text>
              </View>
            )} */}

            {(SyncStatus == "Yes" && route.params?.shouldSync !== true && !lastOffset) && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', }}>
                <TouchableOpacity style={{ backgroundColor: isAppAvailable ? colors.Brown : '#ccc', bottom: 80, marginRight: 10, paddingHorizontal: 10, paddingVertical: 7, width: 120, borderRadius: 10, gap: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }} onPress={refreshData} disabled={!isAppAvailable}  >
                  <MaterialIcons name="download" size={22} color="#fff" />
                  <Text style={{ color: '#fff', fontFamily: 'Inter-Light', fontSize: 12, textTransform: 'uppercase' }}>Download</Text>
                </TouchableOpacity>
              </View>
            )}

            {hasPendingRecovery && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', }}>
                <TouchableOpacity style={{ backgroundColor: isAppAvailable ? colors.Brown : '#ccc', bottom: 80, marginRight: 10, paddingHorizontal: 10, paddingVertical: 7, width: 120, borderRadius: 10, gap: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }} disabled={!isAppAvailable}
                  onPress={() => {
                    KeepAwake.activate();
                    console.log("⏬ User triggered crash recovery sync");
                    loadAllVehiclesPaginated(false, 'yes');
                    hasSynced.current = true;
                    setHasPendingRecovery(false); // hide button after sync starts
                  }} >
                  <MaterialIcons name="download" size={22} color="#fff" />
                  <Text style={{ color: '#fff', fontFamily: 'Inter-Light', fontSize: 12, textTransform: 'uppercase' }}>Downloads</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0
            }}>
              <Bottomtab />
            </View>
          </>
        )}
        <Modal
          animationType="fade"
          transparent={true}
          visible={CloseAppModal}
          onRequestClose={closeExitModal}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            onPress={closeExitModal}
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
                Confirmation
              </Text>
              <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
                Are you sure you want to Really Exit ?
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
                  onPress={closeExitModal}>
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
                  onPress={confirmExit}>
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

        {!loadingDone && (
          <Modal visible transparent animationType="fade">
            <View style={{
              flex: 1, justifyContent: 'center', alignItems: 'center',
              backgroundColor: '#00000070'
            }}>
              <View style={{
                width: 320, height: 150, backgroundColor: 'white',
                borderRadius: 20, justifyContent: 'center', alignItems: 'center',
                shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25, shadowRadius: 3.5, elevation: 5,
                padding: 20,
              }}>

                {isDeleting &&
                  <View style={{ alignItems: 'center' }}>
                    <ActivityIndicator color={'#022e29'} size='large' />
                  </View>
                }

                <Text style={{
                  marginTop: 10, fontFamily: 'Inter-Bold', color: 'black',
                  fontSize: 18, textAlign: 'center',
                }}>
                  {isDeleting ? 'We Are Deleting Records...' : 'Downloading Data...'}
                </Text>

                {!isDeleting &&
                  <>
                    <Progress.Bar
                      progress={progressPercent / 100} // 0.0 to 1.0
                      width={280}
                      height={10}
                      borderRadius={5}
                      color="#050505ff"
                      style={{ marginTop: 15 }}
                    />

                    <Text style={{
                      marginTop: 5,
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      {progressPercent}% Completed
                    </Text>
                  </>}
              </View>
            </View>
          </Modal>
        )}

        {/* Modal Menu */}
        <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
          <TouchableOpacity style={styles.overlay} onPress={() => setMenuVisible(false)}>
            <TouchableOpacity style={styles.modalBox} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.title}>Vehicle Number Settings</Text>

              {/* Preview */}
              <View style={styles.previewBox}>
                <Text
                  style={{
                    fontFamily: getFontFamily(),
                    fontSize: tempFontSize,
                    textDecorationLine: getTextDecoration(),
                    color: '#000',
                  }}
                >
                  MH-12-AB-1234
                </Text>
              </View>

              {/* Font Family Dropdown */}
              <Text style={styles.sliderLabel}>Font Family</Text>
              <Dropdown
                style={styles.dropdown}
                data={fontFamilies}
                labelField="label"
                valueField="value"
                placeholder="Select Font Family"
                autoScroll={false}
                value={tempFontFamily}
                placeholderStyle={{ color: '#999', fontFamily: 'Inter-Regular', fontSize: 14 }}
                selectedTextStyle={{ color: '#000', fontFamily: 'Inter-Regular', fontSize: 14 }}
                onChange={(item) => setTempFontFamily(item.value)}
                renderItem={(item) => (
                  <View style={styles.dropdownItem}>
                    <Text style={{ color: '#000', fontFamily: 'Inter-Regular', fontSize: 14 }}>{item.label}</Text>
                  </View>
                )}
              />

              {/* Font Size Slider */}
              <Text style={styles.sliderLabel}>Font Size: {Math.round(tempFontSize)}</Text>
              <CustomSlider
                min={10}
                max={20}
                step={1}
                value={tempFontSize}
                onValueChange={(val) => setTempFontSize(val)}
              />

              {/* Text Style Buttons */}
              <Text style={styles.sliderLabel}>Text Style</Text>
              <View style={styles.textStyleContainer}>
                {['Bold', 'Italic', 'Underline'].map((styleName) => (
                  <TouchableOpacity
                    key={styleName}
                    onPress={() => toggleTextStyle(styleName)}
                    style={[
                      styles.textStyleButton,
                      tempTextStyle.includes(styleName) && styles.textStyleButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.textStyleButtonText,
                      tempTextStyle.includes(styleName) && styles.textStyleButtonTextActive
                    ]}>
                      {styleName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Footer Buttons */}
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() => {
                    setTempFontSize(fontSize);
                    setTempFontFamily(fontFamily);
                    setTempTextStyle([...textStyle]);
                    setMenuVisible(false);
                  }}

                  style={styles.resetBtn}
                >
                  <Text style={styles.resetBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

      </LocationAndNetworkChecker>
    </View >
  );
};

export default FirstScreen;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: colors.light_brown,
    fontFamily: 'Inter-Bold'
  },
  previewBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  sliderLabel: {
    marginTop: 15,
    marginBottom: 8,
    color: '#000',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  textStyleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  textStyleButton: {
    paddingVertical: 8, // Increased padding for better touch area
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    flex: 0.3,
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
    minHeight: 40, // Fixed height for consistency
  },
  textStyleButtonActive: {
    backgroundColor: colors.light_brown,
    borderColor: colors.light_brown,
  },
  textStyleButtonText: {
    color: '#000',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center', // Center text horizontally
    includeFontPadding: false, // Remove extra font padding
    textAlignVertical: 'center', // Center text vertically
  },
  textStyleButtonTextActive: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  resetBtnText: {
    color: '#666',
    fontFamily: 'Inter-Medium',
  },
  saveBtn: {
    backgroundColor: colors.Brown,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
  },
});
