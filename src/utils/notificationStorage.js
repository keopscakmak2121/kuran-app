// src/utils/notificationStorage.js - CAPACITOR NATIVE VERSION + SOUND OPTIONS
import { LocalNotifications } from '@capacitor/local-notifications';

const NOTIFICATION_SETTINGS_KEY = 'quran_notification_settings';

// 🎵 SES SEÇENEKLERİ
export const SOUND_OPTIONS = {
  adhan: [
    { id: 'adhan1', name: 'Ezan 1', file: 'adhan1.mp3' },
    { id: 'adhan2', name: 'Ezan 2', file: 'adhan2.mp3' },
    { id: 'adhan3', name: 'Ezan 3', file: 'adhan3.mp3' },
    { id: 'adhan4', name: 'Ezan 4', file: 'adhan4.mp3' },
    { id: 'adhan5', name: 'Ezan 5', file: 'adhan5.mp3' },
    { id: 'adhan6', name: 'Ezan 6', file: 'adhan6.mp3' }
  ],
  notification: [
    { id: 'notification1', name: 'Bildirim 1', file: 'notification1.mp3' },
    { id: 'notification2', name: 'Bildirim 2', file: 'notification2.mp3' },
    { id: 'notification3', name: 'Bildirim 3', file: 'notification3.mp3' },
    { id: 'notification4', name: 'Bildirim 4', file: 'notification4.mp3' },
    { id: 'default', name: 'Varsayılan Ses', file: 'default' }
  ]
};

// Varsayılan bildirim ayarları
export const getDefaultNotificationSettings = () => ({
  enabled: false,
  prayerNotifications: {
    Fajr: { enabled: true, minutesBefore: 10 },
    Sunrise: { enabled: true, minutesBefore: 5 },
    Dhuhr: { enabled: true, minutesBefore: 10 },
    Asr: { enabled: true, minutesBefore: 10 },
    Maghrib: { enabled: true, minutesBefore: 10 },
    Isha: { enabled: true, minutesBefore: 10 }
  },
  sound: true,
  soundType: 'adhan', // 'adhan' veya 'notification'
  selectedAdhan: 'adhan1', // Seçili ezan sesi
  selectedNotification: 'notification1', // Seçili bildirim sesi
  vibration: true,
  vibrationPattern: [0, 500, 200, 500], // Titreşim deseni (ms)
  customMessage: false,
  messageTemplate: '{prayer} namazına {minutes} dakika kaldı'
});

// Bildirim ayarlarını al
export const getNotificationSettings = () => {
  try {
    const settings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (settings) {
      return { ...getDefaultNotificationSettings(), ...JSON.parse(settings) };
    }
    return getDefaultNotificationSettings();
  } catch (error) {
    console.error('Bildirim ayarları yüklenirken hata:', error);
    return getDefaultNotificationSettings();
  }
};

// Bildirim ayarlarını kaydet
export const saveNotificationSettings = (settings) => {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Bildirim ayarları kaydedilirken hata:', error);
    return false;
  }
};

// Tüm bildirimleri aç/kapat
export const toggleAllNotifications = (enabled) => {
  const settings = getNotificationSettings();
  settings.enabled = enabled;
  return saveNotificationSettings(settings);
};

// Ses dosyası yolunu al
export const getSoundPath = (soundId, soundType) => {
  if (soundId === 'default') {
    return 'default'; // Sistem varsayılan sesi
  }
  
  const soundList = soundType === 'adhan' ? SOUND_OPTIONS.adhan : SOUND_OPTIONS.notification;
  const sound = soundList.find(s => s.id === soundId);
  
  if (sound) {
    return `sounds/${sound.file}`;
  }
  
  return 'default';
};

// Bildirim mesajı oluştur
export const createNotificationMessage = (prayerName, minutesBefore) => {
  const settings = getNotificationSettings();
  const prayerNames = {
    Fajr: 'İmsak',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı'
  };

  const turkishName = prayerNames[prayerName] || prayerName;

  if (settings.customMessage && settings.messageTemplate) {
    return settings.messageTemplate
      .replace('{prayer}', turkishName)
      .replace('{minutes}', minutesBefore);
  }

  if (minutesBefore === 0) {
    return `${turkishName} namazı vakti girdi! 🕌`;
  }

  return `${turkishName} namazına ${minutesBefore} dakika kaldı`;
};

// ============================================
// CAPACITOR NATIVE BİLDİRİM İZİNLERİ
// ============================================

// Bildirim izni durumunu kontrol et
export const checkNotificationPermission = async () => {
  try {
    const result = await LocalNotifications.checkPermissions();
    console.log('📱 Native izin durumu:', result.display);
    return result.display; // 'granted', 'denied', veya 'prompt'
  } catch (error) {
    console.error('İzin kontrolü hatası:', error);
    return 'denied';
  }
};

// Bildirim izni iste
export const requestNotificationPermission = async () => {
  try {
    const result = await LocalNotifications.requestPermissions();
    console.log('📱 İzin sonucu:', result.display);
    return result.display;
  } catch (error) {
    console.error('İzin isteme hatası:', error);
    return 'denied';
  }
};

// Ayarları sıfırla
export const resetNotificationSettings = () => {
  localStorage.removeItem(NOTIFICATION_SETTINGS_KEY);
  return getDefaultNotificationSettings();
};