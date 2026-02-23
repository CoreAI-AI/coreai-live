import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7b25901092dc4bb9960068c87278c3ce',
  appName: 'CoreAI',
  webDir: 'dist',
  server: {
    url: 'https://7b259010-92dc-4bb9-9600-68c87278c3ce.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    Camera: {
      iosPermissionsText: 'CoreAI needs camera access to capture and analyze images',
      androidPermissionsText: 'CoreAI needs camera access to capture and analyze images'
    }
  }
};

export default config;
