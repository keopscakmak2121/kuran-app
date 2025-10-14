// src/utils/tafsirStorage.js

const TAFSIR_CACHE_KEY = 'quran_tafsir_cache';

// Mevcut tefsirler
export const tafsirs = [
  { 
    id: 'tr.ozturk', 
    name: 'Öztürk Tefsiri',
    author: 'Yaşar Nuri Öztürk',
    language: 'tr'
  },
  { 
    id: 'tr.ayati', 
    name: 'Ayati Tefsiri',
    author: 'Muhammed Emîn Şehinşah',
    language: 'tr'
  },
  { 
    id: 'en.maududi', 
    name: 'Tafhim-ul-Quran',
    author: 'Abul Ala Maududi',
    language: 'en'
  },
  { 
    id: 'en.jalalayn', 
    name: 'Tafsir al-Jalalayn',
    author: 'Jalal ad-Din al-Mahalli',
    language: 'en'
  }
];

// Tefsir cache'inden al
export const getCachedTafsir = (surahNumber, ayahNumber, tafsirId) => {
  try {
    const cache = localStorage.getItem(TAFSIR_CACHE_KEY);
    if (!cache) return null;
    
    const cacheData = JSON.parse(cache);
    const key = `${surahNumber}-${ayahNumber}-${tafsirId}`;
    
    return cacheData[key] || null;
  } catch (error) {
    console.error('Tefsir cache okuma hatası:', error);
    return null;
  }
};

// Tefsir'i cache'e kaydet
export const cacheTafsir = (surahNumber, ayahNumber, tafsirId, tafsirText) => {
  try {
    let cache = {};
    const existingCache = localStorage.getItem(TAFSIR_CACHE_KEY);
    
    if (existingCache) {
      cache = JSON.parse(existingCache);
    }
    
    const key = `${surahNumber}-${ayahNumber}-${tafsirId}`;
    cache[key] = {
      text: tafsirText,
      cachedAt: new Date().toISOString()
    };
    
    // Cache boyutunu kontrol et (max 100 tefsir)
    const keys = Object.keys(cache);
    if (keys.length > 100) {
      // En eski 20 tanesini sil
      const sortedKeys = keys
        .map(k => ({ key: k, date: cache[k].cachedAt }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 20)
        .map(item => item.key);
      
      sortedKeys.forEach(k => delete cache[k]);
    }
    
    localStorage.setItem(TAFSIR_CACHE_KEY, JSON.stringify(cache));
    return true;
  } catch (error) {
    console.error('Tefsir cache kaydetme hatası:', error);
    return false;
  }
};

// API'den tefsir al
export const fetchTafsir = async (surahNumber, ayahNumber, tafsirId = 'tr.ozturk') => {
  try {
    // Önce cache'e bak
    const cached = getCachedTafsir(surahNumber, ayahNumber, tafsirId);
    if (cached) {
      return cached.text;
    }
    
    // API'den çek
    const response = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${tafsirId}`
    );
    
    if (!response.ok) {
      throw new Error('Tefsir yüklenemedi');
    }
    
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      const tafsirText = data.data.text;
      
      // Cache'e kaydet
      cacheTafsir(surahNumber, ayahNumber, tafsirId, tafsirText);
      
      return tafsirText;
    }
    
    return null;
  } catch (error) {
    console.error('Tefsir yükleme hatası:', error);
    throw error;
  }
};

// Cache'i temizle
export const clearTafsirCache = () => {
  try {
    localStorage.removeItem(TAFSIR_CACHE_KEY);
    return true;
  } catch (error) {
    console.error('Tefsir cache temizleme hatası:', error);
    return false;
  }
};

// Cache boyutunu al
export const getTafsirCacheSize = () => {
  try {
    const cache = localStorage.getItem(TAFSIR_CACHE_KEY);
    if (!cache) return 0;
    
    const cacheData = JSON.parse(cache);
    return Object.keys(cacheData).length;
  } catch (error) {
    return 0;
  }
};

// Tefsir bilgisini al
export const getTafsirInfo = (tafsirId) => {
  return tafsirs.find(t => t.id === tafsirId) || tafsirs[0];
};