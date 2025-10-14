// src/utils/settingsStorage.js

const SETTINGS_KEY = 'quran_settings';

// Varsayılan ayarlar
const getDefaultSettings = () => ({
  reciter: 'alafasy',
  translation: 'tr.diyanet',
  fontSize: 20,
  darkMode: false,
  audioSpeed: 1.0,
  autoRepeat: false,
  autoPlay: false,
  showArabic: true,
  showTranslation: true,
  notificationsEnabled: true,
  arabicFont: 'amiri',
  showTajweed: true  // YENİ EKLEME - Tecvid göster
});

// Mevcut meal seçenekleri
export const translations = [
  { id: 'tr.diyanet', name: 'Diyanet İşleri', author: 'Diyanet İşleri Başkanlığı' },
  { id: 'tr.vakfi', name: 'Diyanet Vakfı', author: 'Diyanet Vakfı' },
  { id: 'tr.ates', name: 'Süleymaniye Vakfı', author: 'Süleyman Ateş' },
  { id: 'tr.golpinarli', name: 'Gölpınarlı Meali', author: 'Abdülbaki Gölpınarlı' },
  { id: 'tr.yuksel', name: 'Mesaj Meali', author: 'Edip Yüksel' },
  { id: 'tr.transliteration', name: 'Transliterasyon', author: 'Okunuş' }
];

// Mevcut kari seçenekleri
export const reciters = [
  { 
    id: 'alafasy', 
    name: 'Mishary Rashid Alafasy',
    code: 'Alafasy_128kbps',
    country: 'Kuveyt'
  },
  { 
    id: 'saad', 
    name: 'Saad Al-Ghamdi',
    code: 'Ghamadi_40kbps',
    country: 'Suudi Arabistan'
  },
  { 
    id: 'abdulbasit', 
    name: 'Abdul Basit Abd us-Samad',
    code: 'Abdul_Basit_Murattal_192kbps',
    country: 'Mısır'
  },
  { 
    id: 'hudhaify', 
    name: 'Ali Al-Hudhaify',
    code: 'Hudhaify_128kbps',
    country: 'Suudi Arabistan'
  },
  { 
    id: 'muaiqly', 
    name: 'Maher Al-Muaiqly',
    code: 'Muaiqly_128kbps',
    country: 'Suudi Arabistan'
  }
];

// Arapça font seçenekleri
export const arabicFonts = [
  { 
    id: 'amiri', 
    name: 'Amiri',
    description: 'Klasik ve Zarif',
    family: "'Amiri', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  },
  { 
    id: 'scheherazade', 
    name: 'Scheherazade New',
    description: 'Geleneksel Naskh',
    family: "'Scheherazade New', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  },
  { 
    id: 'lateef', 
    name: 'Lateef',
    description: 'Modern ve Net',
    family: "'Lateef', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  },
  { 
    id: 'harmattan', 
    name: 'Harmattan',
    description: 'Temiz ve Okunaklı',
    family: "'Harmattan', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  },
  { 
    id: 'aref', 
    name: 'Aref Ruqaa',
    description: 'Ruqaa Stili',
    family: "'Aref Ruqaa', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  }
];

// Ayarları al
export const getSettings = () => {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? { ...getDefaultSettings(), ...JSON.parse(settings) } : getDefaultSettings();
  } catch (error) {
    console.error('Ayarlar yüklenirken hata:', error);
    return getDefaultSettings();
  }
};

// Ayarları kaydet
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Ayarlar kaydedilirken hata:', error);
    return false;
  }
};

// Tek bir ayarı güncelle
export const updateSetting = (key, value) => {
  const settings = getSettings();
  settings[key] = value;
  return saveSettings(settings);
};

// Belirli bir ayarı al
export const getSetting = (key) => {
  const settings = getSettings();
  return settings[key];
};

// Ayarları sıfırla
export const resetSettings = () => {
  localStorage.removeItem(SETTINGS_KEY);
  return getDefaultSettings();
};

// Kari bilgisini al
export const getReciterInfo = (reciterId) => {
  return reciters.find(r => r.id === reciterId) || reciters[0];
};

// Meal bilgisini al
export const getTranslationInfo = (translationId) => {
  return translations.find(t => t.id === translationId) || translations[0];
};

// Arapça font bilgisini al
export const getArabicFontInfo = (fontId) => {
  return arabicFonts.find(f => f.id === fontId) || arabicFonts[0];
};

// Arapça font family'yi al
export const getArabicFontFamily = (fontId) => {
  const font = getArabicFontInfo(fontId);
  return font.family;
};