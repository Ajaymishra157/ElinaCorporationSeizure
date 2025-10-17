import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Modal,
  ActivityIndicator,
  NativeModules,
  Linking,
} from "react-native";
import RNFS from "react-native-fs";
import DeviceInfo from "react-native-device-info";
import * as Progress from 'react-native-progress';

const { InstallApk } = NativeModules;

const VERSION_URL = "https://kbtenterprise.webmastersinfotech.in/APK/version.json";

const AppUpdateChecker = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      const response = await fetch(VERSION_URL, { cache: "no-store" });
      const data = await response.json();

      const currentVersion = parseInt(DeviceInfo.getBuildNumber(), 10);
      const latestVersion = parseInt(data.versionCode, 10);

      if (latestVersion > currentVersion) {
        setUpdateInfo(data);
        Alert.alert(
          "Update Available",
          "A new version is available. Please update now.",
          [
            { text: "Later" },
            { text: "Update", onPress: () => downloadApk(data.apkUrl) },
          ]
        );
      }
    } catch (e) {
      console.log("Update check failed:", e);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === "android" && Platform.Version < 30) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to storage to download update",
          buttonPositive: "OK",
          buttonNegative: "Cancel",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const downloadApk = async (url) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    setDownloading(true);
    const tempPath = `${RNFS.CachesDirectoryPath}/easyreppo-latest.apk`;

    try {
      // 1️⃣ Download APK
      await RNFS.downloadFile({
        fromUrl: url,
        toFile: tempPath,
        progress: (res) => {
          const percent = (res.bytesWritten / res.contentLength) * 100;
          setProgress(percent.toFixed(0));
        },
      }).promise;

      // 2️⃣ Move APK to Downloads
      const destinationPath = `${RNFS.DownloadDirectoryPath}/easyreppo-latest.apk`;
      await RNFS.moveFile(tempPath, destinationPath);
      console.log("APK moved to Downloads:", destinationPath);

      setDownloading(false);

      if (Platform.OS === "android" && Platform.Version >= 26) {
        const canInstall = await InstallApk.canRequestPackageInstalls();
        if (!canInstall) {
          Alert.alert(
            "Permission Required",
            "Please allow install from unknown sources for this app",
            [
              {
                text: "Open Settings",
                onPress: async () => {
                  await InstallApk.openInstallPermissionSettings();

                  // ⏳ Poll for permission change
                  const interval = setInterval(async () => {
                    const retry = await InstallApk.canRequestPackageInstalls();
                    if (retry) {
                      clearInterval(interval);
                      console.log("✅ Install permission granted");
                      InstallApk.install(destinationPath); // 🧨 Start install now
                    }
                  }, 1000); // Check every 1 sec
                },
              },
              { text: "Cancel" },
            ]
          );
          return; // ❌ Stop here, wait for user to grant permission
        }
      }
      InstallApk.install(destinationPath);
    } catch (err) {
      setDownloading(false);
      console.log("Download/Move/Install failed:", err);
      Alert.alert("Error", "Failed to download or install APK");
    }
  };

  return (
    <View style={{ padding: 0 }}>
      {/* <Text>Current Version: {DeviceInfo.getBuildNumber()}</Text>

      {updateInfo && (
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "brown",
            borderRadius: 5,
          }}
          onPress={() => downloadApk(updateInfo.apkUrl)}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Update Now
          </Text>
        </TouchableOpacity>
      )} */}

      {/* Progress Modal */}
      <Modal visible={downloading} transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "70%",
              alignItems: "center",
            }}
          >
            <Text style={{ marginBottom: 10, color: "#000", fontFamily: 'Inter-Bold', fontSize: 16 }}>
              Downloading Update...
            </Text>
            <Progress.Bar
              progress={progress / 100}
              width={200}
              color="#9a7b4f"
              animated
              borderRadius={5}
            />
            <Text style={{ marginTop: 10, color: "#000" }}>{progress}%</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AppUpdateChecker;
