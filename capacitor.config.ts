import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.negroni.membership',
  appName: 'Negroni Membership',
  webDir: 'public',
  server: {
    // Development: apunta a /member (app para clientes)
    // Production: cambiar a tu URL de Vercel + /member
    url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000/member',
    cleartext: true, // Permite HTTP en desarrollo
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'app.negroni.com', // Para deep links
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0A0A',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0A0A0A',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Geolocation: {
      // Permisos para ubicar sucursales cercanas
      requirePermissions: true,
    },
    Haptics: {
      // Feedback táctil para mejor UX
    },
    LocalNotifications: {
      // Para notificaciones locales sin servidor
    },
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'Negroni Membership',
    // Para Apple Wallet Pass updates
    backgroundColor: '#0A0A0A',
  },
  android: {
    allowMixedContent: true, // Solo en desarrollo
    backgroundColor: '#0A0A0A',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
