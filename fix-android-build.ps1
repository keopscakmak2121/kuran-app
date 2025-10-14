# ==============================
#  KURAN-APP ANDROID BUILD FIX
#  Hazırlayan: ChatGPT (GPT-5)
# ==============================

Write-Host "🔧 Android derleme onarım süreci başlatılıyor..." -ForegroundColor Cyan

# === 1. Çalışan işlemleri kapat ===
Write-Host "`n📦 Java, Gradle, Node, Android Studio işlemleri sonlandırılıyor..." -ForegroundColor Yellow
Get-Process -Name "java","gradle","node","studio64" -ErrorAction SilentlyContinue | Stop-Process -Force

# === 2. Klasörlere geç ve temizle ===
Set-Location "C:\Users\osman\Desktop\kuran-app"

Write-Host "`n🧹 Geçici dosyalar temizleniyor..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ".\android\app\build"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ".\android\build"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ".\android\.gradle"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ".\node_modules"
Remove-Item -Force -ErrorAction SilentlyContinue "package-lock.json"

Write-Host "`n📦 Gerekli bağımlılıklar yükleniyor..." -ForegroundColor Cyan
npm install

Write-Host "`n🔁 Capacitor senkronizasyonu yapılıyor..." -ForegroundColor Cyan
npx cap sync android

# === 3. Gradle temizliği ===
Write-Host "`n🧰 Gradle temizleniyor..." -ForegroundColor Cyan
cd android
./gradlew clean

# === 4. Debug derleme başlat ===
Write-Host "`n🚀 Derleme başlatılıyor..." -ForegroundColor Green
./gradlew assembleDebug

# === 5. Android Studio’yu aç ===
Write-Host "`n📂 Android Studio açılıyor..." -ForegroundColor Cyan
Start-Process "C:\Program Files\Android\Android Studio\bin\studio64.exe" "C:\Users\osman\Desktop\kuran-app\android"

Write-Host "`n✅ İşlem tamamlandı! Artık Android Studio’da projeni çalıştırabilirsin." -ForegroundColor Green
