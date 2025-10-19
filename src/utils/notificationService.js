// src/utils/notificationService.js - CAPACITOR NATIVE VERSION + SOUND & VIBRATION (FIXED V2)
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

// Bildirim kanalını oluştur - DİNAMİK KANAL (Her ses için ayrı)
export const createNotificationChannel = async (soundFile = null) => {
  try {
    // Ses varsa kanal ID'sine ekle
    const channelId = soundFile ? `prayer-times-${soundFile}` : 'prayer-times-default';
    const channelName = soundFile ? `Namaz Vakitleri (${soundFile})` : 'Namaz Vakitleri';
    
    await LocalNotifications.createChannel({
      id: channelId,
      name: channelName,
      description: 'Namaz vakti bildirimleri',
      importance: 5,
      visibility: 1,
      sound: soundFile || undefined,
      vibration: true
    });
    
    console.log(`✅ Bildirim kanalı oluşturuldu: ${channelId}`);
    return channelId;
  } catch (error) {
    console.error('❌ Kanal oluşturma hatası:', error);
    throw error;
  }
};

// ============================================
// NATIVE BİLDİRİM YÖNETİMİ
// ============================================

// Bildirim sistemini başlat (DİNAMİK KANAL)
export const initNotificationSystem = async () => {
  try {
    const permission = await checkNotificationPermission();
    
    if (permission !== 'granted') {
      console.log('⚠️ Bildirim izni yok:', permission);
      return { success: false, reason: permission };
    }

    // Varsayılan kanal oluştur (ses olmadan)
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

    // 🕌 ADJUSTMENT (önce/sonra) değerini uygula
    const adjustmentMinutes = prayerSetting.adjustment || 0;
    const notificationDate = new Date(prayerDate.getTime() + (adjustmentMinutes * 60 * 1000));

    // Sadece gelecekteki vakitler için bildirim ayarla
    if (notificationDate > now) {
      notificationTimes.push({
        id: prayerName.charCodeAt(0) + Math.abs(adjustmentMinutes) + Date.now() % 1000,
        prayerName,
        prayerTime: prayerDate.toISOString(),
        notificationTime: notificationDate.toISOString(),
        adjustment: adjustmentMinutes,
        message: createNotificationMessage(prayerName, adjustmentMinutes)
      });
    }
  });

  return notificationTimes.sort((a, b) => 
    new Date(a.notificationTime) - new Date(b.notificationTime)
  );
};

// 🔊 SES DOSYASINI BELİRLE (ANDROID NATIVE FORMAT) - .mp3 UZANTISI KALDIRILDI
const getNativeSound = (settings) => {
  if (!settings.sound) {
    console.log('🔇 Ses kapalı');
    return null; // Ses kapalıysa null döner
  }

  let soundFile = null;

  // Ezan sesi seçiliyse
  if (settings.soundType === 'adhan') {
    const selectedAdhan = settings.selectedAdhan || 'adhan1';
    soundFile = selectedAdhan; // Android: UZANTI OLMADAN! (res/raw/adhan1.mp3)
    console.log(`🕌 Ezan sesi seçildi: ${soundFile}`);
  } 
  // Bildirim sesi seçiliyse
  else {
    const selectedNotif = settings.selectedNotification || 'notification1';
    if (selectedNotif === 'default') {
      soundFile = null; // Sistem varsayılan sesi için null
      console.log('🔔 Sistem varsayılan sesi kullanılacak');
    } else {
      soundFile = selectedNotif; // Android: UZANTI OLMADAN! (res/raw/notification1.mp3)
      console.log(`🔔 Bildirim sesi seçildi: ${soundFile}`);
    }
  }
  
  return soundFile;
};

// Bildirimleri zamanla (NATIVE + SOUND - DÜZELTİLDİ V2)
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
      console.log(`🗑️ ${pending.notifications.length} eski bildirim temizlendi`);
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
        channelId: 'prayer-times',
        smallIcon: 'ic_stat_mosque', // Android icon
        ongoing: false,
        autoCancel: true
      };

      // 🔊 Ses ekle (DÜZELTİLMİŞ)
      if (soundFile) {
        notification.sound = soundFile;
        notification.soundName = soundFile;
      }

      // 📳 Titreşim ekle
      if (settings.vibration) {
        notification.vibrate = true;
      }

      console.log(`📋 Bildirim hazırlandı: ${prayerNames[notif.prayerName]} - ${new Date(notif.notificationTime).toLocaleString('tr-TR')}`);
      console.log(`   🔊 Ses: ${soundFile || 'kapalı'}`);
      console.log(`   📳 Titreşim: ${settings.vibration ? 'açık' : 'kapalı'}`);

      return notification;
    });

    // Bildirimleri zamanla
    await LocalNotifications.schedule({ notifications });

    console.log(`✅ ${notifications.length} bildirim zamanlandı`);
    console.log(`🔊 Aktif ses dosyası: ${soundFile || 'kapalı'}`);
    
    return notificationTimes;
  } catch (error) {
    console.error('❌ Bildirim zamanlama hatası:', error);
    console.error('Detay:', error.message);
    return [];
  }
};

// Test bildirimi gönder (DİNAMİK KANAL KULLANIMI)
export const sendTestNotification = async () => {
  try {
    console.log('🚀 Test bildirimi başlıyor...');
    
    // İzin kontrolü
    const permission = await LocalNotifications.checkPermissions();
    console.log('📱 İzin durumu:', permission);
    
    if (permission.display !== 'granted') {
      console.error('❌ Bildirim izni yok!');
      return;
    }

    const settings = getNotificationSettings();
    console.log('⚙️ Ayarlar:', settings);

    // 🔊 Ses dosyasını belirle
    const soundFile = getNativeSound(settings);

    // KANAL OLUŞTUR (Ses ile birlikte)
    console.log('🔄 Bildirim kanalı oluşturuluyor...');
    const channelId = await createNotificationChannel(soundFile);

    const notification = {
      id: Math.floor(Math.random() * 100000),
      title: '🕌 Test Bildirimi',
      body: 'Bildirimler çalışıyor! ✅',
      channelId: channelId, // Dinamik kanal ID
      smallIcon: 'ic_stat_mosque',
      ongoing: false,
      autoCancel: true
    };

    // 🔊 Ses ekle
    if (soundFile) {
      notification.sound = soundFile;
      notification.soundName = soundFile;
      console.log(`🔊 Ses dosyası: ${soundFile}`);
    }

    // 📳 Titreşim ekle
    if (settings.vibration) {
      notification.vibrate = true;
      console.log('📳 Titreşim: açık');
    }

    console.log('📦 Bildirim objesi:', JSON.stringify(notification, null, 2));

    // ANINDA BİLDİRİM
    const result = await LocalNotifications.schedule({ 
      notifications: [{
        ...notification,
        schedule: { at: new Date(Date.now() + 500) }
      }]
    });
    
    console.log('✅ Schedule sonucu:', result);
    
    // Pending bildirimleri kontrol et
    setTimeout(async () => {
      const pending = await LocalNotifications.getPending();
      console.log(`📋 Bekleyen bildirimler (${pending.notifications.length}):`, pending.notifications);
    }, 1000);

  } catch (error) {
    console.error('❌ Test bildirimi HATASI:', error);
    console.error('Hata tipi:', error.name);
    console.error('Hata mesajı:', error.message);
    console.error('Hata stack:', error.stack);
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
}