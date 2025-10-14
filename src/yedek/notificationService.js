// src/utils/notificationService.js
import { 
  getNotificationSettings, 
  createNotificationMessage,
  checkNotificationPermission 
} from './notificationStorage';

// Web Notification API kullanarak bildirim gönder
export const sendWebNotification = (title, body, options = {}) => {
  if (!('Notification' in window)) {
    console.log('Bu tarayıcı bildirimleri desteklemiyor');
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/logo192.png', // Public klasöründeki logo
        badge: '/logo192.png',
        tag: 'prayer-time',
        requireInteraction: false,
        silent: !options.sound,
        ...options
      });

      // Bildirime tıklandığında
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Web bildirimi gönderilemedi:', error);
    }
  }
};

// Namaz vakti hesapla ve bildirim zamanlarını belirle
export const calculateNotificationTimes = (prayerTimings) => {
  if (!prayerTimings) return [];

  const settings = getNotificationSettings();
  if (!settings.enabled) return [];

  const notificationTimes = [];
  const now = new Date();

  Object.keys(settings.prayerNotifications).forEach(prayerName => {
    const prayerSetting = settings.prayerNotifications[prayerName];
    
    if (!prayerSetting.enabled) return;

    const prayerTime = prayerTimings[prayerName];
    if (!prayerTime) return;

    // Namaz vaktini parse et (HH:MM formatında)
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);

    // X dakika önce bildirim zamanı hesapla
    const notificationDate = new Date(prayerDate.getTime() - (prayerSetting.minutesBefore * 60 * 1000));

    // Sadece gelecekteki vakitler için bildirim ayarla
    if (notificationDate > now) {
      notificationTimes.push({
        prayerName,
        prayerTime: prayerDate,
        notificationTime: notificationDate,
        minutesBefore: prayerSetting.minutesBefore,
        message: createNotificationMessage(prayerName, prayerSetting.minutesBefore)
      });
    }
  });

  return notificationTimes.sort((a, b) => a.notificationTime - b.notificationTime);
};

// Bildirim zamanlayıcılarını ayarla
let notificationTimeouts = [];

export const scheduleNotifications = (prayerTimings) => {
  // Önceki zamanlayıcıları temizle
  clearAllNotifications();

  const notificationTimes = calculateNotificationTimes(prayerTimings);
  const now = new Date();

  notificationTimes.forEach(notification => {
    const delay = notification.notificationTime - now;

    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        sendPrayerNotification(notification);
      }, delay);

      notificationTimeouts.push(timeoutId);
      
      console.log(`📅 Bildirim ayarlandı: ${notification.prayerName} - ${notification.message}`);
    }
  });

  return notificationTimes;
};

// Namaz vakti bildirimi gönder
const sendPrayerNotification = (notification) => {
  const settings = getNotificationSettings();
  
  const prayerNames = {
    Fajr: 'İmsak',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı'
  };

  const title = `🕌 ${prayerNames[notification.prayerName]} Vakti`;
  
  sendWebNotification(title, notification.message, {
    sound: settings.sound,
    vibrate: settings.vibration ? [200, 100, 200] : undefined
  });
};

// Tüm bildirimleri iptal et
export const clearAllNotifications = () => {
  notificationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  notificationTimeouts = [];
  console.log('🔕 Tüm bildirimler iptal edildi');
};

// Test bildirimi gönder
export const sendTestNotification = () => {
  sendWebNotification(
    '🕌 Test Bildirimi',
    'Namaz vakti bildirimleri çalışıyor! ✅',
    { sound: true }
  );
};

// Bildirim servisini başlat
export const initNotificationService = async (prayerTimings) => {
  const permission = await checkNotificationPermission();
  
  if (permission === 'not-supported') {
    console.log('Bildirimler desteklenmiyor');
    return false;
  }

  if (permission !== 'granted') {
    console.log('Bildirim izni yok');
    return false;
  }

  const settings = getNotificationSettings();
  
  if (!settings.enabled) {
    console.log('Bildirimler kapalı');
    return false;
  }

  if (prayerTimings) {
    scheduleNotifications(prayerTimings);
    return true;
  }

  return false;
};

// Bir sonraki bildirimi getir
export const getNextNotification = (prayerTimings) => {
  const notificationTimes = calculateNotificationTimes(prayerTimings);
  return notificationTimes.length > 0 ? notificationTimes[0] : null;
};