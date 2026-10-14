import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to access the host. For a physical device, use your computer's LAN IP.
export const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3333/api'
  : 'http://localhost:3333/api';
