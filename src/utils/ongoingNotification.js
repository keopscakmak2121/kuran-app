// src/utils/ongoingNotification.js
import { LocalNotifications } from '@capacitor/local-notifications';

const ONGOING_NOTIFICATION_ID = 999999;

const createOngoingChannel = async () => {
  try {
    await LocalNotifications.createChannel({
      id: 'ongoing_prayer',
      name: 'Kalıcı Namaz Vakti',
      description: 'Sonraki namaz vaktini gösterir',
      importance: 2,
      visibility: 1,
      sound: undefined,
      vibration: false
    });
    console.log('✅ Ongoing kanal oluşturuldu');
  } catch (error) {
    console.error('❌ Kanal oluşturma hatası:', error);
  }
};

export const showOngoingNotification = async (prayerTimes) => {
  try {
    await createOngoingChannel();
    
    const nextPrayer = getNextPrayer(prayerTimes);
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: ONGOING_NOTIFICATION_ID,
          title: `🕌 Sonraki Namaz: ${nextPrayer.name} Vakti`,
          body: `⏰ Saat: ${nextPrayer.time}  •  ⏳ Kalan Süre: ${nextPrayer.remaining}`,
          smallIcon: 'ic_stat_mosque',
          ongoing: true,
          autoCancel: false,
          silent: true,
          channelId: 'ongoing_prayer'
        }
      ]
    });
    
    console.log('✅ Kalıcı bildirim gösteriliyor');
  } catch (error) {
    console.error('❌ Kalıcı bildirim hatası:', error);
  }
};

export const hideOngoingNotification = async () => {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: ONGOING_NOTIFICATION_ID }]
    });
    console.log('✅ Kalıcı bildirim gizlendi');
  } catch (error) {
    console.error('❌ Kalıcı bildirim iptal hatası:', error);
  }
};

export const updateOngoingNotification = async (prayerTimes) => {
  await showOngoingNotification(prayerTimes);
};

function getNextPrayer(timings) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const prayers = [
    { name: 'İmsak', time: timings.Fajr || timings.Imsak },
    { name: 'Güneş', time: timings.Sunrise },
    { name: 'Öğle', time: timings.Dhuhr },
    { name: 'İkindi', time: timings.Asr },
    { name: 'Akşam', time: timings.Maghrib },
    { name: 'Yatsı', time: timings.Isha }
  ];
  
  for (const prayer of prayers) {
    if (currentTime < prayer.time) {
      const remaining = calculateRemaining(currentTime, prayer.time);
      return { ...prayer, remaining };
    }
  }
  
  const remaining = calculateRemaining(currentTime, prayers[0].time, true);
  return { ...prayers[0], remaining };
}

function calculateRemaining(current, target, tomorrow = false) {
  const [ch, cm] = current.split(':').map(Number);
  const [th, tm] = target.split(':').map(Number);
  
  let diffMinutes = (th * 60 + tm) - (ch * 60 + cm);
  if (tomorrow || diffMinutes < 0) diffMinutes += 24 * 60;
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (hours > 0) {
    return `${hours} saat ${minutes} dakika`;
  }
  return `${minutes} dakika`;
}