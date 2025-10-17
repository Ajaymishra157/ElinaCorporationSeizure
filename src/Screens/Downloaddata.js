import { View, Text, TouchableOpacity, NativeModules, Platform, StyleSheet, ActivityIndicator, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import colors from '../CommonFiles/Colors'
import Ionicons from 'react-native-vector-icons/Ionicons';
import KeepAwake from 'react-native-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ENDPOINTS } from '../CommonFiles/Constant';
import { db, bulkInsertVehicles } from '../utils/db';
import * as Progress from 'react-native-progress';

const { ForegroundService } = NativeModules;

const Downloaddata = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState('checking'); // 'checking', 'available', 'downloading', 'completed', 'no-update'
    const [progressPercent, setProgressPercent] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [vehiclecount, setVehiclecount] = useState(null);

    // Make sure countVehiclesInDB returns a promise with the count
    const countVehiclesInDB = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT COUNT(*) AS count FROM vehicles',
                    [],
                    (tx, results) => {
                        const total = results.rows.item(0).count;
                        console.log("📊 DB total vehicles count:", total);
                        setTotalItems(total);
                        resolve(total); // Make sure to resolve with the count
                    },
                    error => {
                        console.log("❌ Error counting vehicles:", error.message);
                        reject(error);
                    }
                );
            });
        });
    };

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

    const sanitizeVehicle = (v) => ({
        id: parseInt(v.id || 0),
        finance_name: v.finance_name || '',
        agreement_number: v.agreement_number || '',
        customer_name: v.customer_name || '',
        customer_address: v.customer_address || '',
        bucket: v.bucket || '',
        emi: v.emi || '',
        principle_outstanding: v.principle_outstanding || '',
        total_outstanding: v.total_outstanding || '',
        product: v.product || '',
        registration_number: v.registration_number || '',
        chassis_number: v.chassis_number || '',
        engine_number: v.engine_number || '',
        entry_date: v.entry_date || '',
        type: v.type || '',
        state_code: v.state_code || '',
        last_reg_no: v.last_reg_no || '',
        last_chassis_no: v.last_chassis_no || '',
        last_engine_no: v.last_engine_no || '',
        contact_person1: v.contact_person1 || '',
        contact_mobile1: v.contact_mobile1 || '',
        contact_person2: v.contact_person2 || '',
        contact_mobile2: v.contact_mobile2 || '',
        vehicle_maker: v.vehicle_maker || '',
        vehicle_agency_name: v.vehicle_agency_name || ''
    });

    // Handle device back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                // Block back button only when downloading
                if (syncStatus === 'downloading') {
                    return true; // Prevent back action
                }
                return false; // Allow back action
            }
        );

        return () => backHandler.remove();
    }, [syncStatus]);

    // Disable gesture back navigation during sync
    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: syncStatus !== 'downloading'
        });
    }, [syncStatus, navigation]);


    // Check for data update availability
    const checkForUpdate = async () => {
        setSyncStatus('checking');
        const userId = await AsyncStorage.getItem('staff_id');
        if (!userId) {
            console.log("❌ User ID not found");
            return;
        }

        try {
            // First, get the local count using the existing function
            const localCount = await countVehiclesInDB();

            // Then check API for latest count
            const response = await fetch(`${ENDPOINTS.UserWiseExpiry}?user_id=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.code == 200 && result.payload) {
                const apiVehicleCount = result.payload.vehicle_count;
                setVehiclecount(apiVehicleCount);

                // Compare counts to determine sync status
                if (apiVehicleCount == localCount) {
                    console.log("✅ No update needed - counts match");
                    setSyncStatus('no-update');
                } else {
                    console.log("🔄 Update available - counts differ");
                    setSyncStatus('available');
                }

            } else {
                console.log('❌ Error: Failed to load data from API');
                setSyncStatus('available'); // Fallback to available if API fails
            }
        } catch (error) {
            console.log('❌ Error checking for update:', error.message);
            setSyncStatus('available'); // Fallback to available if check fails
        }
    };

    const deleteAllVehicles = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `DELETE FROM vehicles`,
                    [],
                    async (tx, results) => {
                        console.log("✅ All old vehicle data deleted.");

                        try {
                            // 🔹 Reset counters
                            await AsyncStorage.removeItem("totalItemsCount");
                            setTotalItems(0);

                            console.log("🔄 Total items reset after deletion.");
                        } catch (e) {
                            console.log("⚠️ Failed to reset totalItemsCount:", e.message);
                        }

                        // Update UI counts if needed
                        // countVehiclesInDB();
                        resolve();
                    },
                    (error) => {
                        console.log("❌ Error deleting vehicles: ", error);
                        reject(error);
                    }
                );
            });
        });
    };

    const loadAllVehiclesPaginated = async (alldataget) => {
        setSyncStatus('downloading');
        await AsyncStorage.setItem("syncStatus", "incomplete");
        KeepAwake.activate();

        if (Platform.OS == "android") {
            await ForegroundService.start("Downloading data", "Preparing to sync…", "Downloaddata");
        }

        let offset = parseInt(await AsyncStorage.getItem("lastOffset")) || null;
        // let offset = 1;
        let keepLoading = true;
        let totalRecordsFetched = 0;

        try {
            const userId = await AsyncStorage.getItem('staff_id');
            const userType = await AsyncStorage.getItem('user_type');
            console.log("userType ye hai", userType);

            if (!userId) {
                console.log("❌ User ID not found");
                return;
            }

            // Step 1: Check if vehicles already exist in the database
            const dataExists = await checkIfDataExists();
            console.log("Data exists in DB:", dataExists);  // Log the result here

            // ✅ Handle reset only if offset is null (fresh sync)
            if (dataExists && alldataget == "yes" && !offset) {
                console.log("✅ Fresh sync requested → deleting old data...", offset);
                // setSyncPhase("deleting");
                await deleteAllVehicles();
                // countVehiclesInDB();
                // setSyncPhase("syncing");

                offset = 1; // fresh start
                await AsyncStorage.setItem("lastOffset", String(offset));
                // 🔹 Reset total items when starting from offset 1
                await AsyncStorage.removeItem("totalItemsCount");
                setTotalItems(0);
            } else if (!offset) {
                // No previous offset found → fresh start without delete (DB empty)
                offset = 1;
                await AsyncStorage.setItem("lastOffset", String(offset));
                await AsyncStorage.removeItem("totalItemsCount");
                setTotalItems(0);
            } else {
                // offset exists → resume
                console.log(`🔄 Resuming sync from stored offset: ${offset}`);
            }

            const endpoint = userType === 'normal'
                ? ENDPOINTS.VehicleList_Normal
                : ENDPOINTS.VehicleList_Full;


            // if (syncPhase !== "syncing") {
            //     setSyncPhase("syncing");
            // }
            while (keepLoading) {
                const url = `${endpoint}?user_id=${userId}&offset=${offset}&alldataget=${alldataget}`;
                const response = await fetch(url);
                const result = await response.json();
                console.log(url, 'abc');
                if (result.code == 200 && result.hasData !== 'nodata' && Array.isArray(result.payload)) {

                    const dataLength = result.payload.length;

                    // Log the count of records received for current offset
                    console.log(`📦 Offset ${offset} → Received ${dataLength} records`);

                    // Update progress based on our own total = 800000
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
                        // setLoadedCount(prev => prev + cleanedList.length);
                        // setTotalCount(prev => prev + cleanedList.length);
                        // ✅ Instead of recounting DB, update AsyncStorage + state
                        let currentCount = parseInt(await AsyncStorage.getItem("totalItemsCount")) || 0;
                        currentCount += cleanedList.length;
                        await AsyncStorage.setItem("totalItemsCount", String(currentCount));
                        setTotalItems(currentCount);
                        console.log(`✅ Bulk inserted ${cleanedList.length} vehicles`);

                    } catch (bulkErr) {
                        console.log(`❌ Bulk insert failed: ${bulkErr.message}`);
                    }

                    console.log(`✅ Page ${offset} inserted`);
                    offset += 1;
                    await AsyncStorage.setItem("lastOffset", String(offset));
                } else {
                    keepLoading = false;
                    console.log("✅ All data loaded into SQLite.");
                    // Clear offset and total count immediately on success
                    await AsyncStorage.removeItem("lastOffset");
                    await AsyncStorage.setItem("syncStatus", "complete");
                    setSyncStatus('completed');
                }
            }
        } catch (error) {
            console.log("❌ Error while loading data:", error.message);
        } finally {
            countVehiclesInDB();

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

    const handleDownload = () => {
        loadAllVehiclesPaginated(true, 'yes');
    };

    // Check for update when component mounts
    useEffect(() => {
        checkForUpdate();
    }, []);

    const renderContent = () => {
        switch (syncStatus) {
            case 'checking':
                return (
                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="sync" size={40} color={colors.light_brown} style={{ marginBottom: 10 }} />
                        <Text style={styles.title}>Checking for update...</Text>
                        <ActivityIndicator size="large" color={colors.Brown} style={{ marginTop: 20 }} />
                    </View>
                );

            case 'available':
                return (
                    <View style={styles.infoBox}>
                        {/* <MaterialCommunityIcons name="update" size={40} color="#2563EB" style={{ marginBottom: 10 }} /> */}
                        <Text style={styles.title}>Data update is available for download.</Text>
                        <TouchableOpacity
                            style={[styles.button, loading && { backgroundColor: "#999" }]}
                            onPress={handleDownload}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <MaterialCommunityIcons name="download" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>Download Now</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                );

            case 'downloading':
                return (
                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="download" size={40} color={colors.light_brown} style={{ marginBottom: 10 }} />
                        <Text style={styles.title}>Please wait until download completes.</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <Progress.Bar
                                progress={progressPercent / 100} // 0.0 to 1.0
                                width={280}
                                height={10}
                                borderRadius={5}
                                color="#7c7775ff"
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
                        </View>
                        {/* <View style={styles.statsContainer}>
                            <Text style={styles.statsText}>
                                Downloaded Records: {totalItems}
                            </Text>
                        </View> */}
                    </View>
                );

            case 'completed':
                return (
                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="check-circle" size={40} color="#10B981" style={{ marginBottom: 10 }} />
                        <Text style={styles.title}>Data is Downloaded successfully.</Text>


                    </View>
                );

            case 'no-update':
                return (
                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="check-circle" size={40} color="#10B981" style={{ marginBottom: 10 }} />
                        <Text style={styles.title}>No Update Available</Text>
                        <Text style={styles.subtitle}>
                            Your vehicle data is already up to date. No new data is available for download.
                        </Text>
                    </View>
                );

            default:
                return (
                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="car" size={40} color="#2563EB" style={{ marginBottom: 10 }} />
                        <Text style={styles.title}>Download Vehicle Data</Text>
                        <Text style={styles.subtitle}>
                            Get the latest vehicle data synced to your device for offline use.
                        </Text>
                    </View>
                );
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: colors.Brown, height: 55, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                {syncStatus != 'downloading' ? (
                    <TouchableOpacity onPress={() => navigation.goBack()} >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                ) : <Text></Text>}
                <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Inter-Bold', }}>Download Vehicle Data</Text>
                <Text></Text>
            </View>

            {/* Dynamic Content Section */}
            <View style={styles.container}>
                {renderContent()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FB",
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    infoBox: {
        alignItems: "center",
        marginBottom: 40,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontFamily: "Inter-Medium",
        fontSize: 18,
        color: "#1E1E1E",
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: "Inter-Regular",
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    button: {
        marginTop: 20,
        backgroundColor: colors.Brown,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
        width: 300
    },
    buttonText: {
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
        color: "#fff",
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 20,
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.Brown,
        borderRadius: 4,
    },
    progressText: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: "#374151",
        marginTop: 8,
    },
    statsContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    statsText: {
        fontFamily: "Inter-Regular",
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 5,
    },
    completedStats: {
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
        color: "#1E1E1E",
        marginBottom: 8,
    },
    successMessage: {
        fontFamily: "Inter-Regular",
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 10,
        paddingHorizontal: 10,
    },
});

export default Downloaddata;