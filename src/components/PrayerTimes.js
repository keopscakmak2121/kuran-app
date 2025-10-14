// src/components/PrayerTimes.js
import React, { useState, useEffect } from 'react';
import {
  getPrayerTimesByCoordinates,
  getWeeklyPrayerTimes,
  getUserLocation,
  turkishCities,
  getNextPrayer,
  isPrayerTimePassed
} from '../utils/prayerTimesApi';
import {
  initNotificationService,
  checkAndRefreshNotifications
} from '../utils/notificationService';

const PrayerTimes = ({ darkMode }) => {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [useGPS, setUseGPS] = useState(true);
  const [viewMode, setViewMode] = useState('today'); // today, weekly
  const [weeklyTimings, setWeeklyTimings] = useState([]);
  const [nextPrayer, setNextPrayer] = useState(null);

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  useEffect(() => {
    loadPrayerTimes();
    
    const interval = setInterval(() => {
      if (timings) setNextPrayer(getNextPrayer(timings));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timings) setNextPrayer(getNextPrayer(timings));
  }, [timings]);

  // Namaz vakitlerini getiren provider fonksiyon
  const getPrayerTimingsProvider = async () => {
    try {
      if (useGPS) {
        const coords = await getUserLocation();
        const result = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
        return result.success ? result.timings : null;
      } else if (selectedCity) {
        const city = turkishCities.find(c => c.name === selectedCity);
        if (city) {
          const result = await getPrayerTimesByCoordinates(city.latitude, city.longitude);
          return result.success ? result.timings : null;
        }
      }
    } catch (err) {
      console.error('Prayer timings provider error:', err);
    }
    return null;
  };

  const loadPrayerTimes = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useGPS) {
        const coords = await getUserLocation();
        setLocation(coords);
        const result = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
        if (result.success) {
          setTimings(result.timings);
          
          // ✅ BİLDİRİM SERVİSİNİ BAŞLAT
          await initNotificationService(result.timings, getPrayerTimingsProvider);
          console.log('✅ Bildirimler ayarlandı!');
        } else {
          throw new Error(result.error);
        }
      } else {
        if (!selectedCity) {
          setError('Lütfen bir şehir seçin');
          setLoading(false);
          return;
        }

        const city = turkishCities.find(c => c.name === selectedCity);
        if (city) {
          const result = await getPrayerTimesByCoordinates(city.latitude, city.longitude);
          if (result.success) {
            setTimings(result.timings);
            setLocation({ latitude: city.latitude, longitude: city.longitude });
            
            // ✅ BİLDİRİM SERVİSİNİ BAŞLAT
            await initNotificationService(result.timings, getPrayerTimingsProvider);
            console.log('✅ Bildirimler ayarlandı!');
          } else {
            throw new Error(result.error);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyTimes = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const result = await getWeeklyPrayerTimes(location.latitude, location.longitude);
      if (result.success) setWeeklyTimings(result.weekly);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'weekly' && location) loadWeeklyTimes();
  }, [viewMode, location]);

  const prayerNames = [
    { key: 'Fajr', name: 'İmsak', icon: '🌙' },
    { key: 'Sunrise', name: 'Güneş', icon: '🌅' },
    { key: 'Dhuhr', name: 'Öğle', icon: '☀️' },
    { key: 'Asr', name: 'İkindi', icon: '🌤️' },
    { key: 'Maghrib', name: 'Akşam', icon: '🌆' },
    { key: 'Isha', name: 'Yatsı', icon: '🌃' }
  ];

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: text }}>Namaz Vakitleri</h2>

      {/* Konum Seçimi */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={() => { setUseGPS(true); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: useGPS ? '#059669' : (darkMode ? '#6b7280' : '#d1d5db'),
              color: useGPS ? 'white' : text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📍 Konumumu Kullan
          </button>
          
          <button
            onClick={() => { setUseGPS(false); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: !useGPS ? '#059669' : (darkMode ? '#6b7280' : '#d1d5db'),
              color: !useGPS ? 'white' : text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🏙️ Şehir Seç
          </button>
        </div>

        {!useGPS && (
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
              borderRadius: '6px',
              backgroundColor: darkMode ? '#374151' : 'white',
              color: text,
              fontSize: '14px',
              marginBottom: '10px'
            }}
          >
            <option value="">Şehir seçin...</option>
            {turkishCities.map((city) => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={loadPrayerTimes}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? (darkMode ? '#6b7280' : '#d1d5db') : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {loading ? 'Yükleniyor...' : 'Vakitleri Getir'}
        </button>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Bir Sonraki Vakit */}
      {nextPrayer && timings && (
        <div style={{
          padding: '20px',
          backgroundColor: '#059669',
          borderRadius: '12px',
          marginBottom: '20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>
            {nextPrayer.tomorrow ? 'Yarın' : 'Bir Sonraki Vakit'}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
            {nextPrayer.time}
          </div>
          <div style={{ fontSize: '18px' }}>{nextPrayer.name}</div>
        </div>
      )}

      {/* Görünüm Modu */}
      {timings && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setViewMode('today')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: viewMode === 'today' ? '#059669' : (darkMode ? '#6b7280' : '#d1d5db'),
              color: viewMode === 'today' ? 'white' : text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📅 Bugün
          </button>
          
          <button
            onClick={() => setViewMode('weekly')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: viewMode === 'weekly' ? '#059669' : (darkMode ? '#6b7280' : '#d1d5db'),
              color: viewMode === 'weekly' ? 'white' : text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📆 Haftalık
          </button>
        </div>
      )}

      {/* Bugünkü Vakitler - Kompakt Yatay */}
      {viewMode === 'today' && timings && (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
          {prayerNames.map((prayer) => {
            const time = timings[prayer.key];
            const passed = isPrayerTimePassed(time);

            return (
              <div
                key={prayer.key}
                style={{
                  minWidth: '110px',
                  flex: '0 0 auto',
                  padding: '12px',
                  backgroundColor: passed ? (darkMode ? '#374151' : '#e5e7eb') : (darkMode ? '#4b5563' : '#f9fafb'),
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: passed ? 0.6 : 1,
                  border: passed ? `2px solid ${darkMode ? '#6b7280' : '#d1d5db'}` : '2px solid transparent'
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{prayer.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: text, marginBottom: '4px', textAlign: 'center' }}>
                  {prayer.name}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: text }}>{time}</div>
                {passed && (
                  <div style={{ fontSize: '10px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '2px' }}>
                    Geçti
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Haftalık Vakitler */}
      {viewMode === 'weekly' && weeklyTimings.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: darkMode ? '#4b5563' : '#f3f4f6' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: text }}>Gün</th>
                {prayerNames.slice(0, 5).map((prayer) => (
                  <th key={prayer.key} style={{ padding: '12px', textAlign: 'center', color: text }}>
                    {prayer.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeklyTimings.map((day, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: `1px solid ${darkMode ? '#6b7280' : '#e5e7eb'}`,
                    backgroundColor: index === 0 ? (darkMode ? '#374151' : '#f9fafb') : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: index === 0 ? 'bold' : 'normal', color: text }}>
                    {day.dayName}{index === 0 && ' (Bugün)'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Fajr}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Dhuhr}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Asr}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Maghrib}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Isha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Boş Durum */}
      {!loading && !timings && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🕌</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Namaz vakitlerini görmek için</div>
          <div style={{ fontSize: '14px' }}>Konumunuzu paylaşın veya şehir seçin</div>
        </div>
      )}
    </div>
  );
};

export default PrayerTimes;