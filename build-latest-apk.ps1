# ==============================
#  KURAN-APP - APK YENİLEME
#  Hazırlayan: ChatGPT (GPT-5)
# ==============================

Write-Host "`n🚀 Güncel APK oluşturma başlatılıyor..." -ForegroundColor Cyan

# 1️⃣ Proje dizinine git
Set-Location "C:\Users\osman\Desktop\kuran-app"

# 2️⃣ Web içeriğini Android'e kopyala
Write-Host "`n📂 Web içeriği Android'e kopyalanıyor..." -ForegroundColor Yellow
npx cap copy android

# 3️⃣ Senkronizasyon (plugin ve config)
Write-Host "`n🔁 Capacitor senkronizasyonu..." -ForegroundColor Yellow
npx cap sync android

# 4️⃣ Gradle temizliği
Write-Host "`n🧹 Gradle temizleniyor..." -ForegroundColor Yellow
cd android
./gradlew clean

# 5️⃣ Debug APK oluştur
Write-Host "`n📦 APK oluşturuluyor..." -ForegroundColor Green
./gradlew assembleDebug

# 6️⃣ APK yolunu göster
$apkPath = "C:\Users\osman\Desktop\kuran-app\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host "`n✅ İşlem tamamlandı! Güncel APK burada:" -ForegroundColor Green
    Write-Host $apkPath -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ APK oluşturulamadı! Hata için yukarıyı kontrol et." -ForegroundColor Red
}

# 7️⃣ (İsteğe bağlı) Android Studio’yu aç
# Start-Process "C:\Program Files\Android\Android Studio\bin\studio64.exe" "C:\Users\osman\Desktop\kuran-app\android"
