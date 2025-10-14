// src/components/settings/NotificationSettings.js - SES DİNLEME ÖZELLİĞİ EKLENDI
import React, { useState, useRef } from 'react';
import { requestNotificationPermission, SOUND_OPTIONS } from '../../utils/notificationStorage';
import { sendTestNotification } from '../../utils/notificationService';

const NotificationSettings = ({ 
  notificationSettings, 
  notificationPermission,
  darkMode,
  onNotificationChange,
  onPrayerNotificationChange,
  onPermissionUpdate
}) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';
  const cardBg = darkMode ? '#4b5563' : '#f9fafb';

  // 🔊 Ses önizleme için state ve ref
  const [playingSound, setPlayingSound] = useState(null);
  const audioRef = useRef(null);

  // 🔊 Ses önizleme fonksiyonu
  const handlePreviewSound = (soundFile, soundId) => {
    try {
      // Eğer aynı ses çalıyorsa durdur
      if (playingSound === soundId && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlayingSound(null);
        return;
      }

      // Önceki sesi durdur
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Yeni ses oluştur ve çal
      const audio = new Audio(`/sounds/${soundFile}`);
      audioRef.current = audio;
      setPlayingSound(soundId);

      // 15 saniye sonra otomatik durdur
      audio.currentTime = 0;
      const maxDuration = 15; // 15 saniye önizleme

      audio.play().catch(err => {
        console.error('Ses çalma hatası:', err);
        alert('⚠️ Ses dosyası yüklenemedi. Dosyanın /public/sounds/ klasöründe olduğundan emin olun.');
        setPlayingSound(null);
      });

      // Ses bittiğinde veya 15 saniye dolduğunda durdur
      audio.ontimeupdate = () => {
        if (audio.currentTime >= maxDuration) {
          audio.pause();
          audio.currentTime = 0;
          setPlayingSound(null);
        }
      };

      audio.onended = () => {
        setPlayingSound(null);
      };

      audio.onerror = () => {
        console.error('Ses yükleme hatası');
        setPlayingSound(null);
      };

    } catch (error) {
      console.error('Ses önizleme hatası:', error);
      setPlayingSound(null);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        onPermissionUpdate(permission);
        alert('✅ Bildirim izni verildi!\n\nNamaz vakti bildirimleri artık çalışacak.');
        
        setTimeout(() => {
          sendTestNotification();
        }, 1000);
      } else if (permission === 'denied') {
        alert('❌ Bildirim izni reddedildi.\n\nİzni değiştirmek için:\n\n1. Telefon Ayarları → Uygulamalar\n2. Kuran-ı Kerim uygulamasını bulun\n3. Bildirimler → Açık');
      } else {
        alert('⚠️ Bildirim izni alınamadı.');
      }
    } catch (error) {
      console.error('İzin alma hatası:', error);
      alert('❌ Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleToggleNotifications = (enabled) => {
    if (enabled && notificationPermission !== 'granted') {
      handleRequestPermission();
    } else {
      onNotificationChange('enabled', enabled);
    }
  };

  const handleTestNotification = () => {
    sendTestNotification();
    alert('🔔 Test bildirimi 2 saniye içinde gelecek!\n\nSeçili ses ve titreşim ayarlarınızla test ediliyor.');
  };

  const prayerNames = {
    Fajr: { name: 'İmsak', icon: '🌙' },
    Sunrise: { name: 'Güneş', icon: '🌅' },
    Dhuhr: { name: 'Öğle', icon: '☀️' },
    Asr: { name: 'İkindi', icon: '🌤️' },
    Maghrib: { name: 'Akşam', icon: '🌆' },
    Isha: { name: 'Yatsı', icon: '🌙' }
  };

  return (
    <div>
      <h3 style={{ 
        fontSize: '20px', 
        marginBottom: '20px', 
        color: text,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        🔔 Bildirim Ayarları
      </h3>

      {/* İZİN DURUMU BANNER */}
      {notificationPermission === 'prompt' && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #f59e0b'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#92400e',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚠️ Bildirim İzni Gerekli
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#78350f',
            marginBottom: '15px',
            lineHeight: '1.5'
          }}>
            Namaz vakti bildirimlerini alabilmek için uygulama izni vermeniz gerekiyor.
          </div>
          <button
            onClick={handleRequestPermission}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📱 İzin Ver
          </button>
        </div>
      )}

      {notificationPermission === 'denied' && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #ef4444'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#991b1b',
            marginBottom: '10px'
          }}>
            ❌ Bildirim İzni Reddedildi
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#7f1d1d',
            lineHeight: '1.5'
          }}>
            Bildirimleri açmak için:<br/>
            <strong>Telefon Ayarları → Uygulamalar → Kuran-ı Kerim → Bildirimler → Açık</strong>
          </div>
        </div>
      )}

      {/* ANA BİLDİRİM AÇMA/KAPAMA */}
      <div style={{
        padding: '20px',
        backgroundColor: cardBg,
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: text,
              marginBottom: '5px'
            }}>
              🕌 Namaz Vakti Bildirimleri
            </div>
            <div style={{ fontSize: '13px', color: textSec }}>
              Tüm bildirimleri aç/kapat
            </div>
          </div>
          
          <label style={{ 
            position: 'relative', 
            display: 'inline-block', 
            width: '60px', 
            height: '34px' 
          }}>
            <input
              type="checkbox"
              checked={notificationSettings.enabled}
              onChange={(e) => handleToggleNotifications(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: notificationSettings.enabled ? '#059669' : '#d1d5db',
              transition: '0.4s',
              borderRadius: '34px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '26px',
                width: '26px',
                left: notificationSettings.enabled ? '30px' : '4px',
                bottom: '4px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }}></span>
            </span>
          </label>
        </div>
      </div>

      {/* SES AYARLARI */}
      {notificationSettings.enabled && (
        <>
          <div style={{
            padding: '20px',
            backgroundColor: cardBg,
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: text,
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔊 Ses Ayarları
            </h4>

            {/* SES AÇ/KAPAT */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '15px',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
            }}>
              <div>
                <div style={{ fontSize: '14px', color: text, marginBottom: '3px' }}>
                  Bildirim Sesi
                </div>
                <div style={{ fontSize: '12px', color: textSec }}>
                  Ses çalma
                </div>
              </div>
              
              <label style={{ 
                position: 'relative', 
                display: 'inline-block', 
                width: '50px', 
                height: '28px' 
              }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.sound}
                  onChange={(e) => onNotificationChange('sound', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notificationSettings.sound ? '#059669' : '#d1d5db',
                  transition: '0.4s',
                  borderRadius: '28px'
                }}>
                  <span style={{
                    position: 'absolute',
                    height: '22px',
                    width: '22px',
                    left: notificationSettings.sound ? '25px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%'
                  }}></span>
                </span>
              </label>
            </div>

            {/* SES TİPİ SEÇİMİ */}
            {notificationSettings.sound && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '14px', color: text, marginBottom: '8px', display: 'block' }}>
                    Ses Tipi
                  </label>
                  <select
                    value={notificationSettings.soundType}
                    onChange={(e) => onNotificationChange('soundType', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                      backgroundColor: darkMode ? '#1f2937' : 'white',
                      color: text,
                      fontSize: '14px'
                    }}
                  >
                    <option value="adhan">🕌 Ezan Sesi</option>
                    <option value="notification">🔔 Bildirim Sesi</option>
                  </select>
                </div>

                {/* EZAN SESİ SEÇİMİ - DİNLE BUTONU EKLENDI */}
                {notificationSettings.soundType === 'adhan' && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '14px', color: text, marginBottom: '8px', display: 'block' }}>
                      Ezan Sesi Seçin
                    </label>
                    
                    {/* Her ezan için radio button + dinle butonu */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {SOUND_OPTIONS.adhan.map(sound => (
                        <div 
                          key={sound.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                            borderRadius: '6px',
                            border: notificationSettings.selectedAdhan === sound.id 
                              ? '2px solid #059669' 
                              : '2px solid transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => onNotificationChange('selectedAdhan', sound.id)}
                        >
                          <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            cursor: 'pointer',
                            flex: 1
                          }}>
                            <input
                              type="radio"
                              name="adhan"
                              value={sound.id}
                              checked={notificationSettings.selectedAdhan === sound.id}
                              onChange={() => onNotificationChange('selectedAdhan', sound.id)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: text, fontSize: '14px' }}>
                              {sound.name}
                            </span>
                          </label>
                          
                          {/* DİNLE BUTONU */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewSound(sound.file, sound.id);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: playingSound === sound.id ? '#dc2626' : '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontWeight: 'bold'
                            }}
                          >
                            {playingSound === sound.id ? '⏹️ Durdur' : '🔊 Dinle'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BİLDİRİM SESİ SEÇİMİ - DİNLE BUTONU EKLENDI */}
                {notificationSettings.soundType === 'notification' && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '14px', color: text, marginBottom: '8px', display: 'block' }}>
                      Bildirim Sesi Seçin
                    </label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {SOUND_OPTIONS.notification.map(sound => (
                        <div 
                          key={sound.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                            borderRadius: '6px',
                            border: notificationSettings.selectedNotification === sound.id 
                              ? '2px solid #059669' 
                              : '2px solid transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => onNotificationChange('selectedNotification', sound.id)}
                        >
                          <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            cursor: 'pointer',
                            flex: 1
                          }}>
                            <input
                              type="radio"
                              name="notification"
                              value={sound.id}
                              checked={notificationSettings.selectedNotification === sound.id}
                              onChange={() => onNotificationChange('selectedNotification', sound.id)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: text, fontSize: '14px' }}>
                              {sound.name}
                            </span>
                          </label>
                          
                          {/* DİNLE BUTONU - Varsayılan ses için devre dışı */}
                          {sound.id !== 'default' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewSound(sound.file, sound.id);
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: playingSound === sound.id ? '#dc2626' : '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontWeight: 'bold'
                              }}
                            >
                              {playingSound === sound.id ? '⏹️ Durdur' : '🔊 Dinle'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* TİTREŞİM AYARLARI */}
          <div style={{
            padding: '20px',
            backgroundColor: cardBg,
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: text,
                  marginBottom: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📳 Titreşim
                </div>
                <div style={{ fontSize: '13px', color: textSec }}>
                  Bildirim geldiğinde titreşim
                </div>
              </div>
              
              <label style={{ 
                position: 'relative', 
                display: 'inline-block', 
                width: '50px', 
                height: '28px' 
              }}>
                <input
                  type="checkbox"
                  checked={notificationSettings.vibration}
                  onChange={(e) => onNotificationChange('vibration', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notificationSettings.vibration ? '#059669' : '#d1d5db',
                  transition: '0.4s',
                  borderRadius: '28px'
                }}>
                  <span style={{
                    position: 'absolute',
                    height: '22px',
                    width: '22px',
                    left: notificationSettings.vibration ? '25px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%'
                  }}></span>
                </span>
              </label>
            </div>
          </div>

          {/* TEST BİLDİRİMİ */}
          <div style={{
            padding: '20px',
            backgroundColor: cardBg,
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <button
              onClick={handleTestNotification}
              style={{
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🔔 Test Bildirimi Gönder
            </button>
            <div style={{ 
              fontSize: '12px', 
              color: textSec, 
              marginTop: '10px' 
            }}>
              Seçili ayarlarla test bildirimi gönderilir
            </div>
          </div>

          {/* NAMAZ VAKİTLERİ AYARLARI */}
          <div style={{
            padding: '20px',
            backgroundColor: cardBg,
            borderRadius: '8px'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: text,
              marginBottom: '15px'
            }}>
              🕌 Namaz Vakitleri
            </h4>

            {Object.keys(prayerNames).map(prayer => (
              <div 
                key={prayer}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{prayerNames[prayer].icon}</span>
                  <span style={{ color: text, fontSize: '14px' }}>
                    {prayerNames[prayer].name}
                  </span>
                </div>
                
                <label style={{ 
                  position: 'relative', 
                  display: 'inline-block', 
                  width: '50px', 
                  height: '28px' 
                }}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.prayerNotifications[prayer]?.enabled}
                    onChange={(e) => onPrayerNotificationChange(prayer, 'enabled', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: notificationSettings.prayerNotifications[prayer]?.enabled ? '#059669' : '#d1d5db',
                    transition: '0.4s',
                    borderRadius: '28px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      height: '22px',
                      width: '22px',
                      left: notificationSettings.prayerNotifications[prayer]?.enabled ? '25px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.4s',
                      borderRadius: '50%'
                    }}></span>
                  </span>
                </label>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSettings;