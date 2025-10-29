package com.quran.kerim;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.content.Intent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // WebView'e JavaScript interface ekle
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new WebAppInterface(), "Android");
    }

    @Override
    public void onResume() {
        super.onResume();
        // ÖRNEK prayerTimes JSON STRING! (Gerçek veriyi JS'den veya cache'den güncel olarak almalısın)
        String prayerTimesJsonString = "{\"Fajr\":\"05:45\",\"Sunrise\":\"07:00\",\"Dhuhr\":\"12:30\",\"Asr\":\"15:45\",\"Maghrib\":\"18:10\",\"Isha\":\"19:30\"}";
        Intent serviceIntent = new Intent(this, OngoingNotificationService.class);
        serviceIntent.putExtra("prayerTimes", prayerTimesJsonString);
        startService(serviceIntent);
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void updateWidget(String imsak, String gunes, String ogle,
                                 String ikindi, String aksam, String yatsi) {
            PrayerWidgetProvider.updatePrayerTimes(
                    MainActivity.this,
                    imsak, gunes, ogle, ikindi, aksam, yatsi
            );
        }
    }
}