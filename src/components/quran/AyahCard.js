// src/components/AyahCard.js - OK İŞARETİ KARTIN SOL BOŞLUĞUNA HİZALANDI
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
  const isActive = currentAyah === ayah.number;
  
  // Ok işareti için soldan boşluk bırakıyoruz
  // Ok işaretini kartın normal 12px padding'inin içine, içeriği itmeyecek şekilde yerleştirmek için 30px yaptık
  const cardPaddingLeft = isActive ? '30px' : '12px';

  return (
    // Ana Kapsayıcı Kart - position: relative ok işaretini konumlandırmak için kritik
    <div
      style={{
        position: 'relative', // Ok işareti için
        padding: '12px',
        paddingLeft: cardPaddingLeft, // Ok işareti için ek boşluk
        backgroundColor: (darkMode ? '#4b5563' : '#f9fafb'),
        borderRadius: '10px',
        // Okunan ayet için daha belirgin bir kenarlık
        border: isActive ? '1px solid #059669' : '1px solid transparent', 
        boxShadow: 'none',
        transition: 'all 0.3s, padding-left 0.3s' // padding-left animasyonu ekledik
      }}
    >
      
      {/* 🟢 OK İŞARETİ (INDICATOR) - KARTIN SOL İÇ BOŞLUĞUNA HİZALANDI */}
      {isActive && (
        <div 
          style={{
            position: 'absolute',
            left: '3px', // 12px'lik orijinal padding alanının sol kenarına yakın
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#059669', // Yeşil renk
            fontSize: '24px', 
            lineHeight: '1',
            fontWeight: 'bold',
            zIndex: 10,
          }}
        >
          ▶
        </div>
      )}
      {/* 🟢 OK İŞARETİ BİTİŞ */}

      {/* Arapça Metin Div'i */}
      <div style={{
        padding: '8px', 
        borderRadius: '6px',
        // Okunurken hafif bir arka plan vurgusu
        backgroundColor: isActive 
          ? (darkMode ? '#3e4a57' : '#e0f2f1') 
          : 'transparent',
        transition: 'background-color 0.3s',
        
        fontSize: fontSize + 4,
        textAlign: 'right',
        lineHeight: '2',
        color: text,
        fontWeight: '600',
        marginBottom: '10px',
        direction: 'rtl',
        fontFamily: getArabicFontFamily(arabicFont),
        letterSpacing: '0.5px',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
      }}>
        <span 
          className={showTajweed ? 'tajweed-text' : ''}
          dangerouslySetInnerHTML={{ __html: ayah.arabic }}
        />
        <span> ﴿{ayah.number}﴾</span>
      </div>

      {/* Türkçe Çeviri, Notlar ve Kontroller aynı kalır. */}
      <div style={{
        fontSize: fontSize - 2,
        lineHeight: '1.8',
        color: text,
        marginBottom: '10px'
      }}>
        {ayah.turkish}
      </div>

      {note && (
        <div style={{
          backgroundColor: darkMode ? '#374151' : '#fef3c7',
          padding: '8px',
          borderRadius: '8px',
          marginBottom: '10px',
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