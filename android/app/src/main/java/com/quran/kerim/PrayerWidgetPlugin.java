package com.quran.kerim;

import android.util.Log;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PrayerWidgetPlugin")
public class PrayerWidgetPlugin extends Plugin {

    private static final String TAG = "PrayerWidgetPlugin";

    @Override
    public void load() {
        Log.d(TAG, "✅ PrayerWidgetPlugin LOADED!");
    }

    @PluginMethod
    public void updateWidget(PluginCall call) {
        Log.d(TAG, "updateWidget called!");
        
        String imsak = call.getString("imsak", "05:30");
        String gunes = call.getString("gunes", "07:00");
        String ogle = call.getString("ogle", "13:15");
        String ikindi = call.getString("ikindi", "16:00");
        String aksam = call.getString("aksam", "18:30");
        String yatsi = call.getString("yatsi", "20:00");

        Log.d(TAG, "Times: " + imsak + ", " + gunes + ", " + ogle);

        // Widget'ı güncelle
        PrayerWidgetProvider.updatePrayerTimes(
            getContext(), 
            imsak, gunes, ogle, ikindi, aksam, yatsi
        );

        call.resolve();
    }
}