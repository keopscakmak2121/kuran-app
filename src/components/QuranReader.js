// src/components/QuranReader.js
import React, { useState, useEffect, useRef } from 'react';
import { getAudio } from '../utils/audioStorage';
import { addBookmark, removeBookmarkByAyah, isBookmarked } from '../utils/bookmarkStorage';
import { getNote, saveNote } from '../utils/noteStorage';
import { startReadingSession, endReadingSession } from '../utils/statsStorage';
import { getSettings } from '../utils/settingsStorage';
import NoteModal from './quran/NoteModal';
import Bismillah from './quran/Bismillah';
import AyahCard from './quran/AyahCard';
import TafsirModal from './quran/TafsirModal';

const QuranReader = ({ surah, darkMode, onBack }) => {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAyah, setCurrentAyah] = useState(null);
  const [fontSize, setFontSize] = useState(20);
  const [arabicFont, setArabicFont] = useState('amiri');
  const [showTajweed, setShowTajweed] = useState(true);
  const [copiedAyah, setCopiedAyah] = useState(null);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState({});
  const [notes, setNotes] = useState({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteAyah, setCurrentNoteAyah] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [showTafsirModal, setShowTafsirModal] = useState(false);
  const [currentTafsirAyah, setCurrentTafsirAyah] = useState(null);
  const audioRef = useRef(null);

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  useEffect(() => {
    fetchSurah();
  }, [surah.number]);

  useEffect(() => {
    const settings = getSettings();
    if (settings) {
      setArabicFont(settings.arabicFont);
      setShowTajweed(settings.showTajweed);
    }
  }, []);

  useEffect(() => {
    startReadingSession(surah.number, surah.name);
    return () => {
      endReadingSession();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [surah.number, surah.name]);

  useEffect(() => {
    if (verses.length > 0) {
      loadBookmarks();
      loadNotes();
    }
  }, [verses]);

  const loadBookmarks = () => {
    const bookmarks = {};
    verses.forEach(ayah => {
      bookmarks[ayah.number] = isBookmarked(surah.number, ayah.number);
    });
    setBookmarkedAyahs(bookmarks);
  };

  const loadNotes = () => {
    const loadedNotes = {};
    verses.forEach(ayah => {
      const note = getNote(surah.number, ayah.number);
      if (note) {
        loadedNotes[ayah.number] = note.note;
      }
    });
    setNotes(loadedNotes);
  };

  const fetchSurah = async () => {
    try {
      setLoading(true);
      const settings = getSettings();

      if (settings.showTajweed) {
        const response = await fetch(
          `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${surah.number}`
        );
        const data = await response.json();
        
        const translationResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${surah.number}/tr.diyanet`
        );
        const translationData = await translationResponse.json();

        if (data && data.verses) {
          const combined = data.verses.map((verse, index) => ({
            number: verse.verse_number,
            arabic: verse.text_uthmani_tajweed,
            turkish: translationData.data.ayahs[index]?.text || '',
            globalNumber: verse.id
          }));
          
          setVerses(combined);
        }
      } else {
        const response = await fetch(
          `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-simple,tr.diyanet`
        );
        const data = await response.json();

        if (data.code === 200 && data.data && data.data.length >= 2) {
          const arabic = data.data[0].ayahs;
          const turkish = data.data[1].ayahs;

          const combined = arabic.map((ayah, index) => ({
            number: ayah.numberInSurah,
            arabic: ayah.text,
            turkish: turkish && turkish[index] ? turkish[index].text : '',
            globalNumber: ayah.number
          }));
          setVerses(combined);
        }
      }
    } catch (error) {
      console.error('Sure yükleme hatası:', error);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  const playAyah = async (ayahNumber) => {
    try {
      if (currentAyah === ayahNumber && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setCurrentAyah(null);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const targetAyah = verses.find(v => v.number === ayahNumber);
      const globalAyahNumber = targetAyah ? targetAyah.globalNumber : null;

      if (!globalAyahNumber) {
        alert('Ayet bilgisi bulunamadı.');
        return;
      }

      const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
      console.log('🎵 Ses URL:', audioUrl);

      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = audioUrl;
      audioRef.current = audio;
      
      setCurrentAyah(ayahNumber);

      audio.addEventListener('canplaythrough', () => {
        console.log('✅ Ses yüklendi, çalınıyor');
        audio.play().catch(error => {
          console.error('❌ Çalma hatası:', error);
          setCurrentAyah(null);
        });
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.error('❌ Ses hatası:', e);
        alert('Ses dosyası yüklenemedi.');
        setCurrentAyah(null);
      }, { once: true });

      audio.addEventListener('ended', () => {
        console.log('✅ Ses bitti');
        setCurrentAyah(null);
        audioRef.current = null;
      }, { once: true });

    } catch (error) {
      console.error('❌ Genel hata:', error);
      alert('Hata: ' + error.message);
      setCurrentAyah(null);
    }
  };

  const copyAyah = (ayah) => {
    const textToCopy = `${ayah.arabic}\n\n${ayah.turkish}\n\n(${surah.name} Suresi, ${ayah.number}. Ayet)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(ayah.number);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const toggleBookmark = (ayah) => {
    const isCurrentlyBookmarked = bookmarkedAyahs[ayah.number];

    if (isCurrentlyBookmarked) {
      removeBookmarkByAyah(surah.number, ayah.number);
      setBookmarkedAyahs(prev => ({ ...prev, [ayah.number]: false }));
    } else {
      try {
        addBookmark({
          surahNumber: surah.number,
          surahName: surah.name,
          ayahNumber: ayah.number,
          arabicText: ayah.arabic,
          turkishText: ayah.turkish,
          category: 'genel'
        });
        setBookmarkedAyahs(prev => ({ ...prev, [ayah.number]: true }));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const openNoteModal = (ayah) => {
    setCurrentNoteAyah(ayah);
    const existingNote = getNote(surah.number, ayah.number);
    setNoteText(existingNote ? existingNote.note : '');
    setShowNoteModal(true);
  };

  const saveNoteHandler = () => {
    if (currentNoteAyah) {
      saveNote(surah.number, currentNoteAyah.number, noteText, surah.name);

      if (noteText.trim() === '') {
        setNotes(prev => {
          const newNotes = { ...prev };
          delete newNotes[currentNoteAyah.number];
          return newNotes;
        });
      } else {
        setNotes(prev => ({ ...prev, [currentNoteAyah.number]: noteText }));
      }

      closeNoteModal();
    }
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setCurrentNoteAyah(null);
    setNoteText('');
  };

  const openTafsirModal = (ayah) => {
    setCurrentTafsirAyah(ayah);
    setShowTafsirModal(true);
  };

  const closeTafsirModal = () => {
    setShowTafsirModal(false);
    setCurrentTafsirAyah(null);
  };

  if (loading) {
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
    <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Geri
        </button>

        <h2 style={{ color: text, margin: 0 }}>
          {surah.name} ({surah.nameArabic})
        </h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setFontSize(Math.max(14, fontSize - 2))}
            style={{
              padding: '8px 12px',
              backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
              color: text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            A-
          </button>
          <span style={{ color: text, fontSize: '14px' }}>{fontSize}px</span>
          <button
            onClick={() => setFontSize(Math.min(32, fontSize + 2))}
            style={{
              padding: '8px 12px',
              backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
              color: text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            A+
          </button>
        </div>
      </div>

      <Bismillah 
        surahNumber={surah.number}
        fontSize={fontSize}
        arabicFont={arabicFont}
        darkMode={darkMode}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {verses.map((ayah) => (
          <AyahCard
            key={ayah.number}
            ayah={ayah}
            surahName={surah.name}
            fontSize={fontSize}
            arabicFont={arabicFont}
            showTajweed={showTajweed}
            darkMode={darkMode}
            currentAyah={currentAyah}
            copiedAyah={copiedAyah}
            isBookmarked={bookmarkedAyahs[ayah.number]}
            note={notes[ayah.number]}
            onPlay={playAyah}
            onCopy={copyAyah}
            onToggleBookmark={toggleBookmark}
            onOpenNote={openNoteModal}
            onOpenTafsir={openTafsirModal}
          />
        ))}
      </div>

      {showNoteModal && (
        <NoteModal
          darkMode={darkMode}
          ayah={currentNoteAyah}
          surahName={surah.name}
          initialNote={noteText}
          onSave={saveNoteHandler}
          onClose={closeNoteModal}
        />
      )}

      {showTafsirModal && (
        <TafsirModal
          darkMode={darkMode}
          ayah={currentTafsirAyah}
          surahName={surah.name}
          surahNumber={surah.number}
          onClose={closeTafsirModal}
        />
      )}
    </div>
  );
};

export default QuranReader;