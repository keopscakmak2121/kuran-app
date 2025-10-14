// src/utils/notificationService.js - CAPACITOR NATIVE VERSION + SOUND & VIBRATION (FIXED)
import { LocalNotifications } from '@capacitor/local-notifications';
import { 
  getNotificationSettings, 
  createNotificationMessage,
  checkNotificationPermission,
  getSoundPath
} from './notificationStorage';

// ============================================
// ANDROID BİLDİRİM KANALI
// ============================================

// Bildirim kanalını oluştur (Android için gerekli)
export const createNotificationChannel = async () => {
  try {
    await LocalNotifications.createChannel({
      id: 'prayer-times',
      name: 'Namaz Vakitleri',
      description: 'Namaz vakti bildirimleri',
      importance: 5,
      visibility: 1,
      sound: 'default',
      vibration: true
    });
    console.log('✅ Bildirim kanalı oluşturuldu');
  } catch (error) {
    console.error('❌ Kanal oluşturma hatası:', error);
  }
};

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

    // Android için kanal oluştur
    await createNotificationChannel();

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
        id: prayerName.charCodeAt(0) + prayerSetting.minutesBefore,
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

// 🔊 SES DOSYASINI BELİRLE (ANDROID NATIVE FORMAT)
const getNativeSound = (settings) => {
  if (!settings.sound) {
    return null; // Ses kapalıysa null döner
  }

  // Ezan sesi seçiliyse
  if (settings.soundType === 'adhan') {
    const selectedAdhan = settings.selectedAdhan || 'adhan1';
    return selectedAdhan; // Android: res/raw/adhan1.mp3
  }

  // Bildirim sesi seçiliyse
  const selectedNotif = settings.selectedNotification || 'notification1';
  if (selectedNotif === 'default') {
    return 'default'; // Sistem varsayılan sesi
  }
  
  return selectedNotif; // Android: res/raw/notification1.mp3
};

// Bildirimleri zamanla (NATIVE + SOUND - DÜZELTİLDİ)
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
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    // 🔊 Ses dosyasını belirle
    const soundFile = getNativeSound(settings);

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
        channelId: 'prayer-times'
      };

      // 🔊 Ses ekle (DÜZELTME)
      if (soundFile) {
        notification.sound = soundFile;
      }

      // 📳 Titreşim ekle
      if (settings.vibration) {
        notification.vibrate = true;
      }

      return notification;
    });

    // Bildirimleri zamanla
    await LocalNotifications.schedule({ notifications });

    console.log(`✅ ${notifications.length} bildirim zamanlandı`);
    console.log(`🔊 Ses dosyası: ${soundFile || 'kapalı'}`);
    console.log('📋 Bildirimler:', notificationTimes.map(n => `${n.prayerName}: ${new Date(n.notificationTime).toLocaleString('tr-TR')}`));
    
    return notificationTimes;
  } catch (error) {
    console.error('❌ Bildirim zamanlama hatası:', error);
    return [];
  }
};

// Test bildirimi gönder (NATIVE + SOUND - DÜZELTİLDİ)
export const sendTestNotification = async () => {
  try {
    const settings = getNotificationSettings();

    // 🔊 Ses dosyasını belirle
    const soundFile = getNativeSound(settings);

    const notification = {
      id: 99999,
      title: '🕌 Test Bildirimi',
      body: 'Bildirimler çalışıyor! ✅',
      schedule: { at: new Date(Date.now() + 2000) },
      channelId: 'prayer-times'
    };

    // 🔊 Ses ekle
    if (soundFile) {
      notification.sound = soundFile;
    }

    // 📳 Titreşim ekle
    if (settings.vibration) {
      notification.vibrate = true;
    }

    await LocalNotifications.schedule({ notifications: [notification] });
    
    console.log('✅ Test bildirimi gönderildi');
    console.log(`🔊 Test ses: ${soundFile || 'kapalı'}`);
  } catch (error) {
    console.error('❌ Test bildirimi hatası:', error);
  }
};

// Tüm bildirimleri iptal et
export const clearAllNotifications = async () => {
  try {
    const pending = await LocalNotifications.getPending();
    await LocalNotifications.cancel({ notifications: pending.notifications });
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

// ============================================
// GÜNLÜK OTOMATİK YENİLEME SİSTEMİ
// ============================================

let dailyRefreshTimer = null;

// Gece yarısı bildirimleri yenile
export const setupDailyRefresh = async (prayerTimingsProvider) => {
  if (dailyRefreshTimer) {
    clearTimeout(dailyRefreshTimer);
  }

  const scheduleNextRefresh = async () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 5, 0, 0);

    const msUntilMidnight = tomorrow - now;

    console.log(`📅 Sonraki yenileme: ${tomorrow.toLocaleString('tr-TR')}`);

    dailyRefreshTimer = setTimeout(async () => {
      try {
        console.log('🔄 Günlük bildirim yenilemesi başlıyor...');
        
        const newPrayerTimings = await prayerTimingsProvider();
        
        if (newPrayerTimings) {
          await scheduleNotifications(newPrayerTimings);
          console.log('✅ Bildirimler güncellendi');
        }
        
        scheduleNextRefresh();
      } catch (error) {
        console.error('❌ Günlük yenileme hatası:', error);
        scheduleNextRefresh();
      }
    }, msUntilMidnight);
  };

  await scheduleNextRefresh();
};

// Uygulama açılışında bildirimleri kontrol et ve yenile
export const checkAndRefreshNotifications = async (prayerTimings) => {
  try {
    const pending = await LocalNotifications.getPending();
    const pendingCount = pending.notifications.length;

    console.log(`📊 Bekleyen bildirim sayısı: ${pendingCount}`);

    if (pendingCount < 3) {
      console.log('🔄 Bildirimler yeniden ayarlanıyor...');
      await scheduleNotifications(prayerTimings);
    } else {
      console.log('✅ Bildirimler zaten ayarlanmış');
    }

    return true;
  } catch (error) {
    console.error('❌ Bildirim kontrol hatası:', error);
    return false;
  }
};

// Bildirim servisini başlat
export const initNotificationService = async (prayerTimings, prayerTimingsProvider) => {
  try {
    const initResult = await initNotificationSystem();
    
    if (!initResult.success) {
      console.log('⚠️ Bildirim sistemi başlatılamadı:', initResult.reason);
      return false;
    }

    await checkAndRefreshNotifications(prayerTimings);
    
    if (prayerTimingsProvider) {
      await setupDailyRefresh(prayerTimingsProvider);
    }

    console.log('✅ Bildirim servisi başlatıldı');
    return true;
  } catch (error) {
    console.error('❌ Bildirim servisi başlatma hatası:', error);
    return false;
  }
};