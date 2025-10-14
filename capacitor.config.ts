import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quran.kerim',
  appName: 'Kuran-ı Kerim',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'localhost',
    iosScheme: 'capacitor'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;