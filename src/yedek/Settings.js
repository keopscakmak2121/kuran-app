// src/components/Settings.js
import React, { useState, useEffect } from 'react';
import { 
  getSettings, 
  saveSettings, 
  resetSettings,
  reciters,
  translations,
  arabicFonts,
  getArabicFontFamily
} from '../utils/settingsStorage';
import { 
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  checkNotificationPermission
} from '../utils/notificationStorage';
import { sendTestNotification } from '../utils/notificationService';

const Settings = ({ darkMode, onDarkModeToggle }) => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadSettings();
    loadNotificationSettings();
    checkPermission();
  }, []);

  const loadSettings = () => {
    const currentSettings = getSettings();
    setSettings(currentSettings);
  };

  const loadNotificationSettings = () => {
    const notifSettings = getNotificationSettings();
    setNotificationSettings(notifSettings);
  };

  const checkPermission = async () => {
    const permission = await checkNotificationPermission();
    setNotificationPermission(permission);
  };

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleNotificationChange = (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
    
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handlePrayerNotificationChange = (prayerName, key, value) => {
    const newSettings = { ...notificationSettings };
    newSettings.prayerNotifications[prayerName][key] = value;
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
    
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      handleNotificationChange('enabled', true);
      alert('✅ Bildirim izni verildi!');
    } else if (permission === 'denied') {
      alert('❌ Bildirim izni reddedildi. Tarayıcı ayarlarından izin verebilirsiniz.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Tüm ayarları varsayılana döndürmek istediğinize emin misiniz?')) {
      const defaultSettings = resetSettings();
      setSettings(defaultSettings);
      alert('Ayarlar sıfırlandı!');
    }
  };

  const clearCache = () => {
    if (window.confirm('Önbelleği temizlemek istediğinize emin misiniz? Bu işlem indirilen sesleri silmeyecek.')) {
      sessionStorage.clear();
      alert('Önbellek temizlendi!');
    }
  };

  if (!settings || !notificationSettings) {
    return (
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        color: text
      }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          margin: '0 0 10px 0', 
          color: text,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ⚙️ Ayarlar
          {saving && (
            <span style={{
              fontSize: '14px',
              color: '#10b981',
              fontWeight: 'normal'
            }}>
              ✓ Kaydedildi
            </span>
          )}
        </h2>
      </div>

      {/* BİLDİRİM AYARLARI */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
        borderRadius: '10px'
      }}>
        <h3 style={{ fontSize: '18px', color: text, marginBottom: '20px' }}>
          🔔 Bildirim Ayarları
        </h3>

        {/* Bildirim İzni Durumu */}
        {notificationPermission !== 'granted' && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '10px', fontWeight: 'bold' }}>
              ⚠️ Bildirim İzni Gerekli
            </div>
            <div style={{ fontSize: '13px', color: '#78350f', marginBottom: '10px' }}>
              Namaz vakti bildirimlerini alabilmek için tarayıcı izni vermeniz gerekiyor.
            </div>
            <button
              onClick={requestPermission}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              📢 İzin Ver
            </button>
          </div>
        )}

        {/* Bildirimleri Aç/Kapat */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: darkMode ? '#374151' : '#e5e7eb',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{ color: text, fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
              🔔 Namaz Vakti Bildirimleri
            </div>
            <div style={{ fontSize: '12px', color: textSec }}>
              Tüm bildirimleri aç/kapat
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
            <input
              type="checkbox"
              checked={notificationSettings.enabled}
              onChange={(e) => handleNotificationChange('enabled', e.target.checked)}
              disabled={notificationPermission !== 'granted'}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: notificationPermission === 'granted' ? 'pointer' : 'not-allowed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: notificationSettings.enabled ? '#059669' : '#ccc',
              transition: '0.4s',
              borderRadius: '24px',
              opacity: notificationPermission === 'granted' ? 1 : 0.5
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: notificationSettings.enabled ? '28px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* Test Bildirimi */}
        {notificationSettings.enabled && notificationPermission === 'granted' && (
          <button
            onClick={() => sendTestNotification()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}
          >
            🔔 Test Bildirimi Gönder
          </button>
        )}

        {/* Vakit Bazlı Ayarlar */}
        {notificationSettings.enabled && (
          <div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: text,
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: `2px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
            }}>
              Vakit Ayarları
            </div>

            {Object.keys(notificationSettings.prayerNotifications).map(prayerName => {
              const prayer = notificationSettings.prayerNotifications[prayerName];
              const prayerNames = {
                Fajr: 'İmsak',
                Sunrise: 'Güneş',
                Dhuhr: 'Öğle',
                Asr: 'İkindi',
                Maghrib: 'Akşam',
                Isha: 'Yatsı'
              };

              return (
                <div key={prayerName} style={{
                  padding: '15px',
                  backgroundColor: darkMode ? '#374151' : 'white',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: `2px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: text }}>
                      🕌 {prayerNames[prayerName]}
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                      <input
                        type="checkbox"
                        checked={prayer.enabled}
                        onChange={(e) => handlePrayerNotificationChange(prayerName, 'enabled', e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: prayer.enabled ? '#059669' : '#ccc',
                        transition: '0.4s',
                        borderRadius: '24px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: '18px',
                          width: '18px',
                          left: prayer.enabled ? '28px' : '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.4s',
                          borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                  </div>

                  {prayer.enabled && (
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: textSec,
                        fontSize: '13px'
                      }}>
                        Kaç dakika önce bildirim: {prayer.minutesBefore} dk
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="5"
                        value={prayer.minutesBefore}
                        onChange={(e) => handlePrayerNotificationChange(prayerName, 'minutesBefore', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: textSec,
                        marginTop: '5px'
                      }}>
                        <span>Vakitte</span>
                        <span>15 dk</span>
                        <span>30 dk önce</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Ses Ayarı */}
        {notificationSettings.enabled && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <div>
                <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  🔊 Bildirim Sesi
                </div>
                <div style={{ fontSize: '12px', color: textSec }}>
                  Bildirimde ses çal
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.sound}
                  onChange={(e) => handleNotificationChange('sound', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notificationSettings.sound ? '#059669' : '#ccc',
                  transition: '0.4s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    height: '18px',
                    width: '18px',
                    left: notificationSettings.sound ? '28px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ARAPÇA FONT AYARLARI */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
        borderRadius: '10px'
      }}>
        <h3 style={{ fontSize: '18px', color: text, marginBottom: '20px' }}>
          🔤 Arapça Yazı Tipi
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {arabicFonts.map(font => (
            <div
              key={font.id}
              onClick={() => handleChange('arabicFont', font.id)}
              style={{
                padding: '15px',
                backgroundColor: settings.arabicFont === font.id 
                  ? '#059669' 
                  : (darkMode ? '#374151' : 'white'),
                color: settings.arabicFont === font.id ? 'white' : text,
                borderRadius: '8px',
                cursor: 'pointer',
                border: `2px solid ${settings.arabicFont === font.id ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb')}`,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    marginBottom: '3px'
                  }}>
                    {font.name}
                  </div>
                  <div style={{ 
                    fontSize: '12px',
                    opacity: 0.8
                  }}>
                    {font.description}
                  </div>
                </div>
                {settings.arabicFont === font.id && (
                  <span style={{ fontSize: '20px' }}>✓</span>
                )}
              </div>
              
              <div style={{
                fontSize: '20px',
                fontFamily: font.family,
                textAlign: 'right',
                direction: 'rtl',
                padding: '10px',
                backgroundColor: settings.arabicFont === font.id 
                  ? 'rgba(255,255,255,0.1)' 
                  : (darkMode ? '#1f2937' : '#f9fafb'),
                borderRadius: '6px',
                lineHeight: '1.8'
              }}>
                {font.preview}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SES AYARLARI */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
        borderRadius: '10px'
      }}>
        <h3 style={{ fontSize: '18px', color: text, marginBottom: '20px' }}>
          🎙️ Ses Ayarları
        </h3>

        {/* Kari Seçimi */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            color: text,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Kari Seçimi
          </label>
          <select
            value={settings.reciter}
            onChange={(e) => handleChange('reciter', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: `2px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
              backgroundColor: darkMode ? '#374151' : 'white',
              color: text,
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            {reciters.map(reciter => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name} ({reciter.country})
              </option>
            ))}
          </select>
        </div>

        {/* Ses Hızı */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            color: text,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Ses Hızı: {settings.audioSpeed}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.25"
            value={settings.audioSpeed}
            onChange={(e) => handleChange('audioSpeed', parseFloat(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px',
            color: textSec,
            marginTop: '5px'
          }}>
            <span>Yavaş (0.5x)</span>
            <span>Normal (1x)</span>
            <span>Hızlı (2x)</span>
          </div>
        </div>

        {/* Otomatik Tekrar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div>
            <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              Otomatik Tekrar
            </div>
            <div style={{ fontSize: '12px', color: textSec }}>
              Ayet bitince tekrar başa dön
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
            <input
              type="checkbox"
              checked={settings.autoRepeat}
              onChange={(e) => handleChange('autoRepeat', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: settings.autoRepeat ? '#059669' : '#ccc',
              transition: '0.4s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: settings.autoRepeat ? '28px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* Otomatik Çalma */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              Otomatik Çalma
            </div>
            <div style={{ fontSize: '12px', color: textSec }}>
              Ayet bitince sonrakini otomatik çal
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
            <input
              type="checkbox"
              checked={settings.autoPlay}
              onChange={(e) => handleChange('autoPlay', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: settings.autoPlay ? '#059669' : '#ccc',
              transition: '0.4s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: settings.autoPlay ? '28px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>
      </div>

      {/* OKUMA AYARLARI */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
        borderRadius: '10px'
      }}>
        <h3 style={{ fontSize: '18px', color: text, marginBottom: '20px' }}>
          📖 Okuma Ayarları
        </h3>

        {/* Meal Seçimi */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            color: text,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Meal Seçimi
          </label>
          <select
            value={settings.translation}
            onChange={(e) => handleChange('translation', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: `2px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
              backgroundColor: darkMode ? '#374151' : 'white',
              color: text,
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            {translations.map(translation => (
              <option key={translation.id} value={translation.id}>
                {translation.name} - {translation.author}
              </option>
            ))}
          </select>
        </div>

        {/* Font Boyutu */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            color: text,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Varsayılan Font Boyutu: {settings.fontSize}px
          </label>
          <input
            type="range"
            min="14"
            max="32"
            step="2"
            value={settings.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px',
            color: textSec,
            marginTop: '5px'
          }}>
            <span>Küçük (14px)</span>
            <span>Orta (20px)</span>
            <span>Büyük (32px)</span>
          </div>
        </div>

        {/* Arapça Göster */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div>
            <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              Arapça Metni Göster
            </div>
            <div style={{ fontSize: '12px', color: textSec }}>
              Ayetlerin arapça metnini göster
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
            <input
              type="checkbox"
              checked={settings.showArabic}
              onChange={(e) => handleChange('showArabic', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: settings.showArabic ? '#059669' : '#ccc',
              transition: '0.4s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: settings.showArabic ? '28px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* Tecvid Göster */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div>
            <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              🎨 Tecvid Göster (Renkli)
            </div>
            <div style={{ fontSize: '12px', color: textSec }}>
              Tecvid kurallarına göre renkli göster
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
            <input
              type="checkbox"
              checked={settings.showTajweed}
              onChange={(e) => handleChange('showTajweed', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: settings.showTajweed ? '#059669' : '#ccc',
              transition: '0.4s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: settings.showTajweed ? '28px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* Meal Göster */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              Meali Göster
            </div>
            <div style={{ fontSize: '12px', color: textSec }}>
              Türkçe meal metnini göster
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
            <input
              type="checkbox"
              checked={settings.showTranslation}
              onChange={(e) => handleChange('showTranslation', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: settings.showTranslation ? '#059669' : '#ccc',
              transition: '0.4s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: settings.showTranslation ? '28px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>
      </div>

      {/* GENEL AYARLAR */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
        borderRadius: '10px'
      }}>
        <h3 style={{ fontSize: '18px', color: text, marginBottom: '20px' }}>
          🔧 Genel Ayarlar
        </h3>

        {/* Karanlık Mod */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div>
            <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              Karanlık Mod
            </div>
            <div style={{ fontSize: '12px', color: textSec }}>
              Koyu tema kullan
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => {
                onDarkModeToggle();
                handleChange('darkMode', !darkMode);
              }}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: darkMode ? '#059669' : '#ccc',
              transition: '0.4s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: darkMode ? '28px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>
      </div>

      {/* BUTONLAR */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={clearCache}
          style={{
            flex: '1',
            minWidth: '150px',
            padding: '12px 20px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🗑️ Önbelleği Temizle
        </button>

        <button
          onClick={handleReset}
          style={{
            flex: '1',
            minWidth: '150px',
            padding: '12px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔄 Ayarları Sıfırla
        </button>
      </div>
    </div>
  );
};

export default Settings;