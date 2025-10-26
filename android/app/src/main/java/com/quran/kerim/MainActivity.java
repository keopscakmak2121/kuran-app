package com.quran.kerim;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // WebView'e JavaScript interface ekle
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new WebAppInterface(), "Android");
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