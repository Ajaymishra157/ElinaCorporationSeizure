import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchAndStoreBaseUrl = async () => {
  try {
    const response = await fetch('https://kbtenterprise.webmastersinfotech.in/eassyreppo_url_app_constant.php');
    const json = await response.json();

    if (json?.base_url) {
      await AsyncStorage.setItem('BASE_URL', json.base_url);
      console.log('Fetched and stored BASE_URL:', json.base_url);
      return json.base_url;
    } else {
      throw new Error('BASE_URL not found in response');
    }
  } catch (error) {
    console.error('Error fetching BASE_URL:', error);
    return null;
  }
};

export const getStoredBaseUrl = async () => {
  return await AsyncStorage.getItem('BASE_URL');
};