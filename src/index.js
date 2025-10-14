// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker'ı kaydet
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('✅ PWA hazır! Offline kullanabilirsiniz.');
    
    // Kullanıcıya bildir (isteğe bağlı)
    if (window.confirm('Uygulama artık offline çalışabilir. Ana ekrana eklemek ister misiniz?')) {
      // PWA kurulum banner'ı göster
    }
  },
  onUpdate: (registration) => {
    console.log('🔄 Yeni sürüm mevcut!');
    
    // Kullanıcıya bildir
    if (window.confirm('Yeni bir güncelleme var. Şimdi yüklemek ister misiniz?')) {
      // Yeni service worker'ı aktif et
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    }
  }
});

// Service Worker mesajlarını dinle
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('📨 Service Worker\'dan mesaj:', event.data);
    
    // Özel eventler için dispatch
    if (event.data.type === 'REFRESH_PRAYER_TIMES') {
      window.dispatchEvent(new CustomEvent('refresh-prayer-times'));
    }
    
    if (event.data.type === 'SYNC_PRAYER_TIMES') {
      window.dispatchEvent(new CustomEvent('sync-prayer-times'));
    }
  });
}

// PWA Install Banner
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💾 PWA yükleme banner\'ı hazır');
  e.preventDefault();
  deferredPrompt = e;
  
  // Install butonunu göster (varsa)
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA kurulum sonucu: ${outcome}`);
        deferredPrompt = null;
        installButton.style.display = 'none';
      }
    });
  }
});

// PWA yükleme başarılı
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA başarıyla yüklendi!');
  deferredPrompt = null;
});