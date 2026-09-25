import { Capacitor } from '@capacitor/core';

/**
 * Platform detection utility for VMW Admin.
 * Prepares the codebase for unified Web, Android, and iOS runtime.
 */
export const isNative = Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform(); // 'web' | 'android' | 'ios'
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isAndroid = Capacitor.getPlatform() === 'android';
export const isWeb = Capacitor.getPlatform() === 'web';

export default {
  isNative,
  getPlatform,
  isIOS,
  isAndroid,
  isWeb,
};
