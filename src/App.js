import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/home/HomePage';
import SurahList from './components/SurahList';
import QuranReader from './components/QuranReader';
import EsmaUlHusna from './components/EsmaUlHusna'; // YENİ EKLEME!
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

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [downloadedSurahs, setDownloadedSurahs] = useState({});
  const [totalStorageSize, setTotalStorageSize] = useState(0);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const bg = darkMode ? '#1f2937' : '#f0fdf4';
  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  // Sayfa yüklendiğinde indirilen sureleri kontrol et
  useEffect(() => {
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

  // Sure indirme fonksiyonu
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

  // Sure silme fonksiyonu
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

  // İndirilen sure listesi
  const getDownloadedSurahsList = () => {
    return allSurahs.filter(surah => downloadedSurahs[surah.number]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, fontFamily: 'Arial, sans-serif' }}>
      <Header 
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'home' || view === 'quran' || view === 'esma') {
            setSelectedSurah(null); // Sure okuyucuyu kapat
          }
        }}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {/* ANA SAYFA - Namaz Vakitleri */}
        {currentView === 'home' && (
          <HomePage 
            darkMode={darkMode}
            onNavigate={setCurrentView}
          />
        )}

        {/* KURAN OKU SAYFASI */}
        {currentView === 'quran' && (
          <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
            {selectedSurah ? (
              <QuranReader 
                surah={selectedSurah}
                darkMode={darkMode}
                onBack={() => setSelectedSurah(null)}
              />
            ) : (
              <SurahList 
                surahs={filteredSurahs}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                darkMode={darkMode}
                downloadedSurahs={downloadedSurahs}
                onSurahClick={(surah) => setSelectedSurah(surah)}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {/* ESMAÜL HÜSNA SAYFASI - ARTIK AYRI BİR SAYFA */}
        {currentView === 'esma' && (
          <EsmaUlHusna darkMode={darkMode} />
        )}

        {/* AYET ARAMA */}
        {currentView === 'search' && (
          <Search 
            darkMode={darkMode}
            onAyahClick={(surahNumber, ayahNumber) => {
              const surah = allSurahs.find(s => s.number === surahNumber);
              if (surah) {
                setSelectedSurah(surah);
                setCurrentView('quran');
              }
            }}
          />
        )}

        {/* YER İMLERİ */}
        {currentView === 'bookmarks' && (
          <Bookmarks 
            darkMode={darkMode}
            onAyahClick={(surahNumber, ayahNumber) => {
              const surah = allSurahs.find(s => s.number === surahNumber);
              if (surah) {
                setSelectedSurah(surah);
                setCurrentView('quran');
              }
            }}
          />
        )}

        {/* İNDİRİLENLER SAYFASI */}
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
                  setSelectedSurah(surah);
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
            onAyahClick={(surahNumber, ayahNumber) => {
              const surah = allSurahs.find(s => s.number === surahNumber);
              if (surah) {
                setSelectedSurah(surah);
                setCurrentView('quran');
              }
            }}
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