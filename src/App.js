import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import Header from './components/Header';
import HomePage from './components/home/HomePage';
import SurahList from './components/SurahList';
import QuranReader from './components/QuranReader';
import EsmaUlHusna from './components/EsmaUlHusna';
import Bookmarks from './components/bookmarks/Bookmarks';
import PrayerTimes from './components/PrayerTimes';
import QiblaFinder from './components/QiblaFinder';
import Search from './components/Search';
import Settings from './components/settings/Settings';
import Statistics from './components/Statistics';
import Notes from './components/Notes';
import { allSurahs } from './data/surahs';
import { 
  downloadSurah, 
  deleteSurah, 
  getDownloadedSurahs,
  getTotalSize,
  formatBytes
} from './utils/audioStorage';
// 🔔 BİLDİRİM SERVİSİ EKLEME
import { 
  initNotificationService, 
  scheduleNotifications 
} from './utils/notificationService';
import { 
  getPrayerTimesByCoordinates, 
  getUserLocation 
} from './utils/prayerTimesApi';

const App = () => {
  const [highlightWord, setHighlightWord] = useState('');
  const [scrollToAyah, setScrollToAyah] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [downloadedSurahs, setDownloadedSurahs] = useState({});
  const [totalStorageSize, setTotalStorageSize] = useState(0);
  
  // 🔙 NAVİGASYON GEÇMİŞİ (Stack)
  const [navigationHistory, setNavigationHistory] = useState(['home']);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const bg = darkMode ? '#1f2937' : '#f0fdf4';
  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  // 🔙 ANDROID GERİ TUŞU YÖNETİMİ
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      console.log('🔙 Geri tuşuna basıldı, mevcut view:', currentView);
      console.log('📚 Navigasyon geçmişi:', navigationHistory);

      // KURAN OKUMA EKRANINDAYSAN
      if (selectedSurah) {
        console.log('📖 Kuran okuma ekranından çıkılıyor...');
        handleBackFromQuran();
        return;
      }

      // ANA SAYFADA DEĞİLSEN
      if (currentView !== 'home') {
        console.log('🏠 Ana sayfaya dönülüyor...');
        navigateBack();
        return;
      }

      // ANA SAYFADAYSAN - UYGULAMADAN ÇIK
      console.log('❌ Uygulamadan çıkılıyor...');
      CapacitorApp.exitApp();
    });

    // Cleanup
    return () => {
      backButtonListener.remove();
    };
  }, [currentView, selectedSurah, navigationHistory]);

  // 🔙 GERİ GİTME FONKSİYONU
  const navigateBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Mevcut sayfayı çıkar
      const previousPage = newHistory[newHistory.length - 1]; // Bir önceki sayfayı al
      
      console.log('📍 Geri gidiliyor:', currentView, '→', previousPage);
      
      setNavigationHistory(newHistory);
      setCurrentView(previousPage);
      setSelectedSurah(null);
    } else {
      // Geçmiş yoksa ana sayfaya git
      setCurrentView('home');
      setNavigationHistory(['home']);
    }
  };

  // 🔄 SAYFA DEĞİŞTİRME (Geçmişe ekler)
  const handleNavigate = (view) => {
    console.log('🔄 Sayfa değiştiriliyor:', currentView, '→', view);
    
    // Eğer aynı sayfaya gidiyorsa geçmişe ekleme
    if (view === currentView) {
      return;
    }

    // Geçmişe ekle
    setNavigationHistory([...navigationHistory, view]);
    setCurrentView(view);
    
    if (view === 'home' || view === 'quran' || view === 'esma') {
      setSelectedSurah(null);
    }
  };

  // 🔔 BİLDİRİM SERVİSİNİ BAŞLAT
  useEffect(() => {
    const initNotifications = async () => {
      try {
        console.log('🚀 Bildirim servisi başlatılıyor...');
        
        // Konum al ve namaz vakitlerini getir
        const coords = await getUserLocation();
        const result = await getPrayerTimesByCoordinates(
          coords.latitude,
          coords.longitude
        );

        if (result.success) {
          console.log('✅ Namaz vakitleri alındı:', result.timings);
          
          // Bildirim servisini başlat
          const prayerTimingsProvider = async () => {
            const coords = await getUserLocation();
            const result = await getPrayerTimesByCoordinates(
              coords.latitude,
              coords.longitude
            );
            return result.success ? result.timings : null;
          };

          await initNotificationService(result.timings, prayerTimingsProvider);
          console.log('✅ Bildirim servisi başarıyla başlatıldı');
        }
      } catch (error) {
        console.error('❌ Bildirim servisi başlatma hatası:', error);
      }
    };

    initNotifications();
    loadDownloadedSurahs();
    loadStorageSize();
  }, []);

  const loadDownloadedSurahs = async () => {
    const downloaded = await getDownloadedSurahs();
    setDownloadedSurahs(downloaded);
  };

  const loadStorageSize = async () => {
    const size = await getTotalSize();
    setTotalStorageSize(size);
  };

  const filteredSurahs = allSurahs.filter(surah =>
    surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.nameArabic.includes(searchTerm) ||
    surah.number.toString().includes(searchTerm)
  );

  const handleDownload = async (surah, onProgress) => {
    try {
      await downloadSurah(surah.number, surah.ayahCount, onProgress);
      await loadDownloadedSurahs();
      await loadStorageSize();
      alert(`${surah.name} suresi başarıyla indirildi!`);
    } catch (error) {
      console.error('İndirme hatası:', error);
      alert('İndirme sırasında bir hata oluştu.');
    }
  };

  const handleDelete = async (surah) => {
    try {
      await deleteSurah(surah.number, surah.ayahCount);
      await loadDownloadedSurahs();
      await loadStorageSize();
      alert(`${surah.name} suresi silindi.`);
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme sırasında bir hata oluştu.');
    }
  };

  const getDownloadedSurahsList = () => {
    return allSurahs.filter(surah => downloadedSurahs[surah.number]);
  };

  const handleAyahClick = (surahNumber, ayahNumber, fromView) => {
    const surah = allSurahs.find(s => s.number === surahNumber);
    if (surah) {
      setPreviousView(fromView);
      setSelectedSurah(surah);
      
      // Geçmişe ekle
      setNavigationHistory([...navigationHistory, 'quran']);
      setCurrentView('quran');
    }
  };

  const handleBackFromQuran = () => {
    setSelectedSurah(null);
    navigateBack();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, fontFamily: 'Arial, sans-serif' }}>
      <Header 
        onNavigate={handleNavigate}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {/* ANA SAYFA */}
        {currentView === 'home' && (
          <HomePage 
            darkMode={darkMode}
            onNavigate={handleNavigate}
          />
        )}

        {/* KURAN OKU SAYFASI */}
        {currentView === 'quran' && (
          <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
            {selectedSurah ? (
              <QuranReader 
                surah={selectedSurah}
                darkMode={darkMode}
                onBack={handleBackFromQuran}
                highlightWord={highlightWord}
                scrollToAyah={scrollToAyah}
              />
            ) : (
              <SurahList 
                surahs={filteredSurahs}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                darkMode={darkMode}
                downloadedSurahs={downloadedSurahs}
                onSurahClick={(surah) => {
                  setPreviousView('quran');
                  setSelectedSurah(surah);
                  setHighlightWord('');
                  setScrollToAyah(null);
                }}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {/* ESMAÜL HÜSNA */}
        {currentView === 'esma' && (
          <EsmaUlHusna darkMode={darkMode} />
        )}

        {/* AYET ARAMA */}
        {currentView === 'search' && (
          <Search 
            darkMode={darkMode}
            onAyahClick={(surahNumber, ayahNumber, searchWord) => {
              handleAyahClick(surahNumber, ayahNumber, 'search', searchWord);
            }}
          />
        )}

        {/* YER İMLERİ */}
        {currentView === 'bookmarks' && (
          <Bookmarks 
            darkMode={darkMode}
            onAyahClick={(surahNumber, ayahNumber) => 
              handleAyahClick(surahNumber, ayahNumber, 'bookmarks', '')
            }
          />
        )}

        {/* İNDİRİLENLER */}
        {currentView === 'downloads' && (
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: text }}>
              İndirilen Sureler
            </h2>
            
            <div style={{
              padding: '15px',
              backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '16px', color: text, marginBottom: '5px' }}>
                <strong>Toplam:</strong> {getDownloadedSurahsList().length} Sure
              </div>
              <div style={{ fontSize: '16px', color: text }}>
                <strong>Disk Kullanımı:</strong> {formatBytes(totalStorageSize)}
              </div>
            </div>

            {getDownloadedSurahsList().length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: darkMode ? '#9ca3af' : '#6b7280' 
              }}>
                Henüz indirilmiş sure yok
              </div>
            ) : (
              <SurahList 
                surahs={getDownloadedSurahsList()}
                searchTerm=""
                setSearchTerm={() => {}}
                darkMode={darkMode}
                downloadedSurahs={downloadedSurahs}
                onSurahClick={(surah) => {
                  setPreviousView('downloads');
                  setSelectedSurah(surah);
                  setNavigationHistory([...navigationHistory, 'quran']);
                  setCurrentView('quran');
                }}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {/* NAMAZ VAKİTLERİ */}
        {currentView === 'prayerTimes' && (
          <PrayerTimes darkMode={darkMode} />
        )}

        {/* KIBLE */}
        {currentView === 'qibla' && (
          <QiblaFinder darkMode={darkMode} />
        )}

        {/* NOTLARIM */}
        {currentView === 'notes' && (
          <Notes 
            darkMode={darkMode}
            onAyahClick={(surahNumber, ayahNumber) => 
              handleAyahClick(surahNumber, ayahNumber, 'notes', '')
            }
          />
        )}

        {/* AYARLAR */}
        {currentView === 'settings' && (
          <Settings darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />
        )}

        {/* İSTATİSTİKLER */}
        {currentView === 'stats' && (
          <Statistics darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default App;