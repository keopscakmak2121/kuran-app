// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import {
  getPrayerTimesByCoordinates,
  getUserLocation,
  getNextPrayer,
  isPrayerTimePassed
} from '../utils/prayerTimesApi';

const HomePage = ({ darkMode, onNavigate }) => {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState(null);

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const loadPrayerTimes = async () => {
    try {
      const coords = await getUserLocation();
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

  const prayerInfo = [
    { key: 'Fajr', name: 'İmsak', icon: '🌙', color: '#6366f1' },
    { key: 'Sunrise', name: 'Güneş', icon: '🌅', color: '#f59e0b' },
    { key: 'Dhuhr', name: 'Öğle', icon: '☀️', color: '#eab308' },
    { key: 'Asr', name: 'İkindi', icon: '🌤️', color: '#fb923c' },
    { key: 'Maghrib', name: 'Akşam', icon: '🌆', color: '#f97316' },
    { key: 'Isha', name: 'Yatsı', icon: '🌃', color: '#8b5cf6' }
  ];

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
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          color: '#059669',
          marginBottom: '10px',
          margin: 0
        }}>
          🕌 Kuran-ı Kerim
        </h1>
        <p style={{ 
          fontSize: '16px', 
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

      {/* Bir Sonraki Vakit */}
      {nextPrayer && timings && (
        <div style={{
          backgroundColor: '#059669',
          borderRadius: '12px',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
          color: 'white'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.9 }}>
            {nextPrayer.tomorrow ? 'Yarın' : 'Bir Sonraki Vakit'}
          </div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
            {nextPrayer.time}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {nextPrayer.name}
          </div>
        </div>
      )}

      {/* Namaz Vakitleri Kartları */}
      {loading ? (
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: text
        }}>
          Namaz vakitleri yükleniyor...
        </div>
      ) : timings ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px'
        }}>
          {prayerInfo.map((prayer) => {
            const time = timings[prayer.key];
            const passed = isPrayerTimePassed(time);

            return (
              <div
                key={prayer.key}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: `3px solid ${passed ? (darkMode ? '#4b5563' : '#e5e7eb') : prayer.color}`,
                  opacity: passed ? 0.6 : 1,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => !passed && (e.currentTarget.style.transform = 'translateY(-5px)')}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                  {prayer.icon}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: text,
                  marginBottom: '8px'
                }}>
                  {prayer.name}
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: passed ? textSec : prayer.color
                }}>
                  {time}
                </div>
                {passed && (
                  <div style={{ fontSize: '12px', color: textSec, marginTop: '5px' }}>
                    Geçti
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: text
        }}>
          Namaz vakitleri yüklenemedi. Lütfen konum izni verin.
        </div>
      )}

      {/* Hızlı Erişim Butonları */}
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
          ⚡ Hızlı Erişim
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '10px'
        }}>
          <QuickButton 
            icon="📖" 
            text="Kuran Oku" 
            darkMode={darkMode}
            onClick={() => onNavigate('quran')}
          />
          <QuickButton 
            icon="✨" 
            text="Esmaül Hüsna" 
            darkMode={darkMode}
            onClick={() => onNavigate('esma')}
          />
          <QuickButton 
            icon="⭐" 
            text="Yer İmleri" 
            darkMode={darkMode}
            onClick={() => onNavigate('bookmarks')}
          />
          <QuickButton 
            icon="🔍" 
            text="Ayet Ara" 
            darkMode={darkMode}
            onClick={() => onNavigate('search')}
          />
          <QuickButton 
            icon="🧭" 
            text="Kıble" 
            darkMode={darkMode}
            onClick={() => onNavigate('qibla')}
          />
          <QuickButton 
            icon="📝" 
            text="Notlarım" 
            darkMode={darkMode}
            onClick={() => onNavigate('notes')}
          />
        </div>
      </div>

      {/* Günlük Ayet */}
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderLeft: '4px solid #059669'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          color: '#059669',
          margin: '0 0 15px 0'
        }}>
          📜 Günün Ayeti
        </h3>
        <p style={{
          fontSize: '18px',
          lineHeight: '1.8',
          color: text,
          textAlign: 'right',
          direction: 'rtl',
          marginBottom: '15px',
          fontWeight: '600'
        }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p style={{
          fontSize: '15px',
          lineHeight: '1.6',
          color: text,
          margin: 0
        }}>
          Rahman ve Rahim olan Allah'ın adıyla...
        </p>
        <div style={{
          marginTop: '15px',
          fontSize: '13px',
          color: textSec,
          textAlign: 'right'
        }}>
          - Fatiha Suresi, 1. Ayet
        </div>
      </div>
    </div>
  );
};

// Hızlı Erişim Butonu
const QuickButton = ({ icon, text, darkMode, onClick }) => (
  <button 
    onClick={onClick}
    style={{
      padding: '15px',
      backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#059669';
      e.target.style.color = 'white';
      e.target.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = darkMode ? '#4b5563' : '#f3f4f6';
      e.target.style.color = darkMode ? '#f3f4f6' : '#1f2937';
      e.target.style.transform = 'translateY(0)';
    }}
  >
    <span style={{ fontSize: '20px' }}>{icon}</span>
    <span>{text}</span>
  </button>
);

export default HomePage;