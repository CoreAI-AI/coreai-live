import { useState, useEffect, useCallback } from 'react';

interface AppLockSettings {
  enabled: boolean;
  pin: string | null;
  biometricEnabled: boolean;
  lockAfterMinutes: number;
  lastActivityTime: number;
}

const DEFAULT_SETTINGS: AppLockSettings = {
  enabled: false,
  pin: null,
  biometricEnabled: false,
  lockAfterMinutes: 1,
  lastActivityTime: Date.now(),
};

export const useAppLock = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [settings, setSettings] = useState<AppLockSettings>(DEFAULT_SETTINGS);
  const [isSetupMode, setIsSetupMode] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('app_lock_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSettings(parsed);
      
      // Check if should be locked on load
      if (parsed.enabled) {
        const timeSinceLastActivity = Date.now() - parsed.lastActivityTime;
        const lockTimeout = parsed.lockAfterMinutes * 60 * 1000;
        if (timeSinceLastActivity > lockTimeout) {
          setIsLocked(true);
        }
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: AppLockSettings) => {
    localStorage.setItem('app_lock_settings', JSON.stringify(newSettings));
    setSettings(newSettings);
  }, []);

  // Update activity time
  const updateActivity = useCallback(() => {
    if (settings.enabled) {
      const updated = { ...settings, lastActivityTime: Date.now() };
      saveSettings(updated);
    }
  }, [settings, saveSettings]);

  // Set up activity tracking
  useEffect(() => {
    if (!settings.enabled) return;

    const handleActivity = () => updateActivity();
    
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Check lock status periodically
    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - settings.lastActivityTime;
      const lockTimeout = settings.lockAfterMinutes * 60 * 1000;
      if (timeSinceLastActivity > lockTimeout && !isLocked) {
        setIsLocked(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(interval);
    };
  }, [settings, isLocked, updateActivity]);

  // Enable app lock with PIN
  const enableLock = useCallback((pin: string) => {
    const newSettings: AppLockSettings = {
      ...settings,
      enabled: true,
      pin,
      lastActivityTime: Date.now(),
    };
    saveSettings(newSettings);
    setIsSetupMode(false);
  }, [settings, saveSettings]);

  // Disable app lock
  const disableLock = useCallback(() => {
    const newSettings: AppLockSettings = {
      ...DEFAULT_SETTINGS,
      lastActivityTime: Date.now(),
    };
    saveSettings(newSettings);
    setIsLocked(false);
  }, [saveSettings]);

  // Toggle biometric
  const toggleBiometric = useCallback((enabled: boolean) => {
    const newSettings = { ...settings, biometricEnabled: enabled };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Set lock timeout
  const setLockTimeout = useCallback((minutes: number) => {
    const newSettings = { ...settings, lockAfterMinutes: minutes };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Verify PIN
  const verifyPin = useCallback((inputPin: string): boolean => {
    if (inputPin === settings.pin) {
      setIsLocked(false);
      updateActivity();
      return true;
    }
    return false;
  }, [settings.pin, updateActivity]);

  // Authenticate with biometric
  const authenticateWithBiometric = useCallback(async (): Promise<boolean> => {
    if (!settings.biometricEnabled) return false;

    try {
      // Check if Web Authentication API is available
      if (!window.PublicKeyCredential) {
        console.log('WebAuthn not supported');
        return false;
      }

      // Check for platform authenticator (fingerprint/face)
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        console.log('Platform authenticator not available');
        return false;
      }

      // Create a simple credential request for biometric
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'CoreAI App Lock' },
          user: {
            id: new Uint8Array(16),
            name: 'user',
            displayName: 'App User',
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      });

      if (credential) {
        setIsLocked(false);
        updateActivity();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, [settings.biometricEnabled, updateActivity]);

  // Lock the app manually
  const lockApp = useCallback(() => {
    if (settings.enabled) {
      setIsLocked(true);
    }
  }, [settings.enabled]);

  return {
    isLocked,
    settings,
    isSetupMode,
    setIsSetupMode,
    enableLock,
    disableLock,
    toggleBiometric,
    setLockTimeout,
    verifyPin,
    authenticateWithBiometric,
    lockApp,
    updateActivity,
  };
};
