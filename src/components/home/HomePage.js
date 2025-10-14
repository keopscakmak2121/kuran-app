// src/components/home/HomePage.js
import React, { useState, useEffect } from 'react';
import {
  getPrayerTimesByCoordinates,
  getUserLocation,
  getNextPrayer
} from '../../utils/prayerTimesApi';
import { 
  sendTestNotification,
  initNotificationService
} from '../../utils/notificationService';
import { 
  checkNotificationPermission,
  requestNotificationPermission
} from '../../utils/notificationStorage';
import { getBookmarks } from '../../utils/bookmarkStorage';
import { getTotalNotesCount } from '../../utils/noteStorage';
import { getStats } from '../../utils/statsStorage';

// Import yeni componentler
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
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadPrayerTimes();
    loadDailyVerse();
    loadStats();
    checkPermission();
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

      const result = await getPrayerTimesByCoordinates(
        coords.latitude,
        coords.longitude
      );

      if (result.success) {
        setTimings(result.timings);
        setNextPrayer(getNextPrayer(result.timings));
      }
    } catch (error) {
      console.error('Namaz vakitleri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyVerse = async () => {
    try {
      setVerseLoading(true);
      
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      
      const totalVerses = 6236;
      const verseNumber = (dayOfYear % totalVerses) + 1;
      
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verseNumber}/editions/quran-uthmani,tr.diyanet`);
      const data = await response.json();
      
      if (data.code === 200) {
        setDailyVerse({
          arabic: data.data[0].text,
          translation: data.data[1].text,
          surah: data.data[0].surah.name,
          surahNumber: data.data[0].surah.number,
          ayahNumber: data.data[0].numberInSurah
        });
      }
    } catch (error) {
      console.error('Günlük ayet yüklenemedi:', error);
    } finally {
      setVerseLoading(false);
    }
  };

  const loadStats = () => {
    try {
      const readingStats = getStats();
      const bookmarks = getBookmarks();
      const notes = getTotalNotesCount();

      setStats({
        surahs: readingStats.totalReadingSessions || 0,
        bookmarks: bookmarks.length || 0,
        notes: notes || 0
      });
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const handleNotificationRequest = async () => {
    const result = await requestNotificationPermission();
    
    if (result === 'granted') {
      setNotificationPermission('granted');
      sendTestNotification();
      
      if (timings) {
        initNotificationService(timings);
      }
      
      alert('✅ Bildirimler aktif edildi! Test bildirimi gönderildi.');
    } else if (result === 'denied') {
      alert('❌ Bildirim izni reddedildi. Tarayıcı ayarlarından izin verebilirsiniz.');
    } else {
      alert('⚠️ Bildirim izni alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.');
    }
  };

  const handleRefreshLocation = async () => {
    localStorage.removeItem('userCoords');
    await loadPrayerTimes();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Hoşgeldin Mesajı */}
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '30px 20px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          color: '#059669',
          marginBottom: '10px',
          margin: 0
        }}>
          🕌 Kuran-ı Kerim
        </h1>
        <p style={{ 
          fontSize: '15px', 
          color: textSec,
          margin: '10px 0 0 0'
        }}>
          Bugün {new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Bildirim İzni Uyarısı */}
      {notificationPermission !== 'granted' && notificationPermission !== 'not-supported' && (
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#92400e', marginBottom: '5px' }}>
              🔔 Namaz Vakti Bildirimleri
            </div>
            <div style={{ fontSize: '14px', color: '#78350f' }}>
              Namaz vakitlerini kaçırmamak için bildirimleri aktif edin
            </div>
          </div>
          <button
            onClick={handleNotificationRequest}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            Aktif Et
          </button>
        </div>
      )}

      {/* Bildirim Aktif Mesajı */}
      {notificationPermission === 'granted' && timings && (
        <div style={{
          backgroundColor: '#d1fae5',
          borderRadius: '12px',
          padding: '15px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #059669',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>✅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#065f46' }}>
              Bildirimler Aktif
            </div>
            <div style={{ fontSize: '12px', color: '#047857' }}>
              Namaz vakitleri için bildirim alacaksınız
            </div>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              whiteSpace: 'nowrap'
            }}
          >
            ⚙️ Ayarlar
          </button>
        </div>
      )}

      {/* Bir Sonraki Vakit - COMPONENT */}
      <NextPrayerCard 
        nextPrayer={nextPrayer}
        timings={timings}
        darkMode={darkMode}
      />

      {/* Namaz Vakitleri Kartları - COMPONENT */}
      <PrayerTimeCards
        timings={timings}
        loading={loading}
        darkMode={darkMode}
        onRefresh={handleRefreshLocation}
      />

      {/* Hızlı Erişim Butonları - COMPONENT */}
      <QuickAccessButtons
        darkMode={darkMode}
        onNavigate={onNavigate}
      />

      {/* Günlük Ayet - COMPONENT */}
      <DailyVerseCard
        dailyVerse={dailyVerse}
        verseLoading={verseLoading}
        darkMode={darkMode}
      />

      {/* İstatistikler */}
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          color: text,
          margin: '0 0 15px 0'
        }}>
          📊 İstatistiklerim
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px'
        }}>
          <StatCard
            icon="📖"
            title="Okunan"
            value={stats.surahs}
            subtitle="oturum"
            darkMode={darkMode}
            onClick={() => onNavigate('stats')}
          />
          <StatCard
            icon="⭐"
            title="Yer İmleri"
            value={stats.bookmarks}
            subtitle="ayet"
            darkMode={darkMode}
            onClick={() => onNavigate('bookmarks')}
          />
          <StatCard
            icon="📝"
            title="Notlar"
            value={stats.notes}
            subtitle="not"
            darkMode={darkMode}
            onClick={() => onNavigate('notes')}
          />
        </div>
      </div>
    </div>
  );
};

// İstatistik Kartı Component (HomePage içinde kalabilir)
const StatCard = ({ icon, title, value, subtitle, darkMode, onClick }) => (
  <div
    onClick={onClick}
    style={{
      backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
      padding: '15px',
      borderRadius: '10px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#059669';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = darkMode ? '#374151' : '#e5e7eb';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>
      {icon}
    </div>
    <div style={{ 
      fontSize: '12px', 
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: '5px'
    }}>
      {title}
    </div>
    <div style={{ 
      fontSize: '24px', 
      fontWeight: 'bold', 
      color: darkMode ? '#f3f4f6' : '#1f2937',
      marginBottom: '3px'
    }}>
      {value}
    </div>
    <div style={{ 
      fontSize: '11px', 
      color: darkMode ? '#9ca3af' : '#6b7280'
    }}>
      {subtitle}
    </div>
  </div>
);

export default HomePage;