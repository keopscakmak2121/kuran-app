// src/utils/notificationService.js - CAPACITOR NATIVE VERSION + SOUND & VIBRATION
import { LocalNotifications } from '@capacitor/local-notifications';
import { 
  getNotificationSettings, 
  createNotificationMessage,
  checkNotificationPermission,
  getSoundPath
} from './notificationStorage';

// ============================================
// NATIVE BİLDİRİM YÖNETİMİ
// ============================================

// Bildirim sistemini başlat
export const initNotificationSystem = async () => {
  try {
    const permission = await checkNotificationPermission();
    
    if (permission !== 'granted') {
      console.log('⚠️ Bildirim izni yok:', permission);
      return { success: false, reason: permission };
    }

    console.log('✅ Bildirim sistemi hazır');
    return { success: true };
  } catch (error) {
    console.error('❌ Bildirim sistemi başlatma hatası:', error);
    return { success: false, reason: 'error' };
  }
};

// ============================================
// NAMAZ VAKTİ BİLDİRİMLERİ
// ============================================

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

    // Eğer vakit geçmişse, yarına ayarla
    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }

    // X dakika önce bildirim zamanı hesapla
    const notificationDate = new Date(prayerDate.getTime() - (prayerSetting.minutesBefore * 60 * 1000));

    // Sadece gelecekteki vakitler için bildirim ayarla
    if (notificationDate > now) {
      notificationTimes.push({
        id: prayerName.charCodeAt(0) + prayerSetting.minutesBefore, // Unique ID
        prayerName,
        prayerTime: prayerDate.toISOString(),
        notificationTime: notificationDate.toISOString(),
        minutesBefore: prayerSetting.minutesBefore,
        message: createNotificationMessage(prayerName, prayerSetting.minutesBefore)
      });
    }
  });

  return notificationTimes.sort((a, b) => 
    new Date(a.notificationTime) - new Date(b.notificationTime)
  );
};

// Bildirimleri zamanla (NATIVE + SOUND)
export const scheduleNotifications = async (prayerTimings) => {
  try {
    const notificationTimes = calculateNotificationTimes(prayerTimings);
    
    if (notificationTimes.length === 0) {
      console.log('🔭 Zamanlanacak bildirim yok');
      return [];
    }

    const settings = getNotificationSettings();

    // Önce tüm bildirimleri temizle
    const pending = await LocalNotifications.getPending();
    await LocalNotifications.cancel({ notifications: pending.notifications });

    // Ses dosyası yolunu belirle
    let soundName = 'default';
    if (settings.sound) {
      if (settings.soundType === 'adhan') {
        soundName = getSoundPath(settings.selectedAdhan, 'adhan');
      } else {
        soundName = getSoundPath(settings.selectedNotification, 'notification');
      }
    }

    // Yeni bildirimleri hazırla
    const notifications = notificationTimes.map(notif => {
      const prayerNames = {
        Fajr: 'İmsak',
        Sunrise: 'Güneş',
        Dhuhr: 'Öğle',
        Asr: 'İkindi',
        Maghrib: 'Akşam',
        Isha: 'Yatsı'
      };

      const notification = {
        id: notif.id,
        title: `🕌 ${prayerNames[notif.prayerName]} Vakti`,
        body: notif.message,
        schedule: { at: new Date(notif.notificationTime) },
        smallIcon: 'ic_stat_icon_config',
        iconColor: '#059669',
        channelId: 'prayer-times'
      };

      // Ses ekle
      if (settings.sound) {
        if (soundName === 'default') {
          notification.sound = 'default';
        } else {
          notification.sound = soundName;
        }
      }

      // Titreşim ekle
      if (settings.vibration) {
        notification.vibrate = settings.vibrationPattern || [0, 500, 200, 500];
      }

      return notification;
    });

    // Bildirimleri zamanla
    await LocalNotifications.schedule({ notifications });

    console.log(`✅ ${notifications.length} bildirim zamanlandı`);
    console.log(`🔊 Ses: ${soundName}`);
    console.log(`📳 Titreşim: ${settings.vibration ? 'Açık' : 'Kapalı'}`);
    
    return notificationTimes;
  } catch (error) {
    console.error('❌ Bildirim zamanlama hatası:', error);
    return [];
  }
};

// Test bildirimi gönder (NATIVE + SOUND)
export const sendTestNotification = async () => {
  try {
    const settings = getNotificationSettings();

    // Ses dosyası yolunu belirle
    let soundName = 'default';
    if (settings.sound) {
      if (settings.soundType === 'adhan') {
        soundName = getSoundPath(settings.selectedAdhan, 'adhan');
      } else {
        soundName = getSoundPath(settings.selectedNotification, 'notification');
      }
    }

    const notification = {
      id: 99999,
      title: '🕌 Test Bildirimi',
      body: 'Bildirimler çalışıyor! ✅',
      schedule: { at: new Date(Date.now() + 2000) }, // 2 saniye sonra
      smallIcon: 'ic_stat_icon_config',
      iconColor: '#059669'
    };

    // Ses ekle
    if (settings.sound) {
      if (soundName === 'default') {
        notification.sound = 'default';
      } else {
        notification.sound = soundName;
      }
    }

    // Titreşim ekle
    if (settings.vibration) {
      notification.vibrate = settings.vibrationPattern || [0, 500, 200, 500];
    }

    await LocalNotifications.schedule({ notifications: [notification] });
    
    console.log('✅ Test bildirimi gönderildi');
    console.log(`🔊 Ses: ${soundName}`);
    console.log(`📳 Titreşim: ${settings.vibration ? 'Açık' : 'Kapalı'}`);
  } catch (error) {
    console.error('❌ Test bildirimi hatası:', error);
  }
};

// Tüm bildirimleri iptal et
export const clearAllNotifications = async () => {
  try {
    const pending = await LocalNotifications.getPending();
    await LocalNotifications.cancel({ notifications: pending.notifications });
    localStorage.removeItem('scheduled_notifications');
    console.log('✅ Tüm bildirimler temizlendi');
  } catch (error) {
    console.error('❌ Bildirim temizleme hatası:', error);
  }
};

// Bir sonraki bildirimi getir
export const getNextNotification = (prayerTimings) => {
  const notificationTimes = calculateNotificationTimes(prayerTimings);
  return notificationTimes.length > 0 ? notificationTimes[0] : null;
};

// Bildirim servisini başlat (namaz vakitleriyle)
export const initNotificationService = async (prayerTimings) => {
  try {
    const initResult = await initNotificationSystem();
    
    if (!initResult.success) {
      console.log('⚠️ Bildirim sistemi başlatılamadı:', initResult.reason);
      return false;
    }

    await scheduleNotifications(prayerTimings);
    console.log('✅ Bildirim servisi başlatıldı');
    return true;
  } catch (error) {
    console.error('❌ Bildirim servisi başlatma hatası:', error);
    return false;
  }
};