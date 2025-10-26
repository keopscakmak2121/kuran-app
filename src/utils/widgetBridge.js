// src/utils/widgetBridge.js

export const updatePrayerWidget = async (prayerTimes) => {
  try {
    // Android WebView'den direkt Java metodunu çağır
    if (window.Android && window.Android.updateWidget) {
      window.Android.updateWidget(
        prayerTimes.Imsak || prayerTimes.Fajr,
        prayerTimes.Sunrise,
        prayerTimes.Dhuhr,
        prayerTimes.Asr,
        prayerTimes.Maghrib,
        prayerTimes.Isha
      );
      console.log('✅ Widget güncellendi (Direct call)');
    } else {
      console.log('⚠️ Android bridge bulunamadı');
    }
  } catch (error) {
    console.error('❌ Widget güncelleme hatası:', error);
  }
};