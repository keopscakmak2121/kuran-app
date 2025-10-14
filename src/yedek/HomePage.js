// src/components/home/HomePage.js (Güncellenmiş - SW entegrasyonu ile)
import React, { useState, useEffect } from 'react';
import { getUserLocation, getPrayerTimes, getNextPrayer } from '../../utils/prayerTimesHelper';
import { 
  initNotificationService,
  scheduleNotifications,
  clearAllNotifications
} from '../../utils/notificationService';
import { 
  checkNotificationPermission,
  requestNotificationPermission
} from '../../utils/notificationStorage';
import { getBookmarks } from '../../utils/bookmarkStorage';
import { getTotalNotesCount } from '../../utils/noteStorage';
import { getStats } from '../../utils/statsStorage';

import NextPrayerCard from './NextPrayerCard';
import PrayerTimeCards from './PrayerTimeCards';
import DailyVerseCard from './DailyVerseCard';
import QuickAccessButtons from './QuickAccessButtons';

const HomePage = ({ darkMode, onNavigate }) => {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [stats, setStats] = useState({
    surahs: 0,
    bookmarks: 0,
    notes: 0
  });
  const [notificationPermission, setNotificationPermission] = useState('default');

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  useEffect(() => {
    loadPrayerTimes();
    loadDailyVerse();
    loadStats();
    checkPermission();
    
    // Service Worker mesajlarını dinle
    setupServiceWorkerListeners();
  }, []);

  useEffect(() => {
    // Her dakika bir sonraki vakti güncelle
    const interval = setInterval(() => {
      if (timings) {
        setNextPrayer(getNextPrayer(timings));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [timings]);

  useEffect(() => {
    // Namaz vakitleri yüklendiğinde bildirim servisini başlat
    if (timings && notificationPermission === 'granted') {
      initNotificationService(timings);
    }
  }, [timings, notificationPermission]);

  // Service Worker event listener'larını kur
  const setupServiceWorkerListeners = () => {
    // Namaz vakitlerini yenileme eventi
    window.addEventListener('refresh-prayer-times', () => {
      console.log('🔄 Namaz vakitleri yenileniyor (SW)');
      loadPrayerTimes();
    });

    // Offline'dan online'a geçince sync
    window.addEventListener('sync-prayer-times', () => {
      console.log('🔄 Namaz vakitleri senkronize ediliyor (SW)');
      loadPrayerTimes();
    });

    // Online/Offline durumu
    window.addEventListener('online', () => {
      console.log('🌐 İnternet bağlantısı geri geldi');
      loadPrayerTimes();
    });

    window.addEventListener('offline', () => {
      console.log('📴 İnternet bağlantısı kesildi');
    });
  };

  const checkPermission = async () => {
    const permission = await checkNotificationPermission();
    setNotificationPermission(permission);
  };

  const loadPrayerTimes = async () => {
    try {
      setLoading(true);

      let coords = null;
      const savedCoords = localStorage.getItem('userCoords');

      if (savedCoords) {
        coords = JSON.parse(savedCoords);
      } else {
        coords = await getUserLocation();
        localStorage.setItem('userCoords', JSON.stringify(coords));
      }

      const prayerData = await getPrayerTimes(
        coords.latitude,
        coords.longitude,
        coords.city
      );

      setTimings(prayerData.timings);
      setNextPrayer(getNextPrayer(prayerData.timings));

      // Bildirimleri yeniden zamanla
      if (notificationPermission === 'granted') {
        await scheduleNotifications(prayerData.timings);
      }

    } catch (error) {
      console.error('Namaz vakitleri yüklenirken hata:', error);
      alert('Namaz vakitleri yüklenemedi. Lütfen konum izni verin.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async () => {
    try {
      // Bildirimleri temizle
      await clearAllNotifications();
      
      // Mevcut konumu sil
      localStorage.removeItem('userCoords');
      
      // Yeni konumu al ve vakitleri yükle
      await loadPrayerTimes();
      
      alert('✅ Konum güncellendi ve bildirimler yeniden zamanlandı!');
    } catch (error) {
      console.error('Konum güncelleme hatası:', error);
      alert('Konum güncellenirken bir hata oluştu.');
    }
  };

  const loadDailyVerse = async () => {
    try {
      setVerseLoading(true);
      
      // Günün tarihini kullanarak seed oluştur
      const today = new Date().toDateString();
      const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const surahNumber = (seed % 114) + 1;
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/tr.diyanet`);
      const data = await response.json();
      
      const randomAyah = data.data.ayahs[Math.floor(Math.random() * data.data.ayahs.length)];
      
      setDailyVerse({
        surahName: data.data.englishName,
        ayahNumber: randomAyah.numberInSurah,
        text: randomAyah.text,
        surahNumber: surahNumber
      });
    } catch (error) {
      console.error('Günlük ayet yüklenirken hata:', error);
    } finally {
      setVerseLoading(false);
    }
  };

  const loadStats = () => {
    const readingStats = getStats();
    const bookmarks = getBookmarks();
    const notesCount = getTotalNotesCount();

    setStats({
      surahs: readingStats.completedSurahs.length,
      bookmarks: bookmarks.length,
      notes: notesCount
    });
  };

  // PWA Kurulum Banner
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Uygulama PWA olarak kurulu değilse banner göster
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone && !localStorage.getItem('pwa-prompt-dismissed')) {
      setTimeout(() => setShowInstallPrompt(true), 5000);
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: text
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🕌</div>
          <div>Namaz vakitleri yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* PWA Kurulum Banner */}
      {showInstallPrompt && (
        <div style={{
          backgroundColor: '#059669',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>📱 Uygulamayı Yükle</strong>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              Offline kullanım ve bildirimler için ana ekrana ekleyin
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              id="install-button"
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#059669',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Yükle
            </button>
            <button
              onClick={() => {
                setShowInstallPrompt(false);
                localStorage.setItem('pwa-prompt-dismissed', 'true');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid white',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Daha Sonra
            </button>
          </div>
        </div>
      )}

      {/* İçerik */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <NextPrayerCard 
          nextPrayer={nextPrayer}
          darkMode={darkMode}
        />

        <PrayerTimeCards 
          timings={timings}
          darkMode={darkMode}
          onLocationUpdate={handleLocationUpdate}
        />

        <DailyVerseCard 
          dailyVerse={dailyVerse}
          verseLoading={verseLoading}
          darkMode={darkMode}
          onNavigate={onNavigate}
        />

        <QuickAccessButtons 
          stats={stats}
          darkMode={darkMode}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
};

export default HomePage;