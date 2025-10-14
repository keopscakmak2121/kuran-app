// src/components/quran/AyahCard.js
import React from 'react';
import { getArabicFontFamily } from '../../utils/settingsStorage';
import AyahControls from './AyahControls';

const AyahCard = ({
  ayah,
  surahName,
  fontSize,
  arabicFont,
  showTajweed,
  darkMode,
  currentAyah,
  copiedAyah,
  isBookmarked,
  note,
  onPlay,
  onCopy,
  onToggleBookmark,
  onOpenNote,
  onOpenTafsir
}) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
        borderRadius: '10px',
        border: currentAyah === ayah.number ? '2px solid #059669' : '2px solid transparent',
        transition: 'all 0.3s'
      }}
    >
      {/* Arapça */}
      <div style={{
        fontSize: fontSize + 4,
        textAlign: 'right',
        lineHeight: '2',
        color: text,
        fontWeight: '600',
        marginBottom: '15px',
        direction: 'rtl',
        fontFamily: getArabicFontFamily(arabicFont),
        letterSpacing: '0.5px',
        whiteSpace: 'normal',
        wordWrap: 'break-word'
      }}>
        <span 
          className={showTajweed ? 'tajweed-text' : ''}
          dangerouslySetInnerHTML={{ __html: ayah.arabic }}
        />
        <span> ﴿{ayah.number}﴾</span>
      </div>

      {/* Türkçe Meal */}
      <div style={{
        fontSize: fontSize - 2,
        lineHeight: '1.8',
        color: text,
        marginBottom: '15px'
      }}>
        {ayah.turkish}
      </div>

      {/* Not Varsa Göster */}
      {note && (
        <div style={{
          backgroundColor: darkMode ? '#374151' : '#fef3c7',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '15px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#f59e0b',
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            📝 Notunuz:
          </div>
          <div style={{
            fontSize: '14px',
            color: text,
            lineHeight: '1.6'
          }}>
            {note}
          </div>
        </div>
      )}

      {/* Butonlar */}
      <AyahControls
        ayah={ayah}
        currentAyah={currentAyah}
        copiedAyah={copiedAyah}
        isBookmarked={isBookmarked}
        hasNote={!!note}
        darkMode={darkMode}
        onPlay={onPlay}
        onCopy={onCopy}
        onToggleBookmark={onToggleBookmark}
        onOpenNote={onOpenNote}
        onOpenTafsir={onOpenTafsir}
      />
    </div>
  );
};

export default AyahCard;