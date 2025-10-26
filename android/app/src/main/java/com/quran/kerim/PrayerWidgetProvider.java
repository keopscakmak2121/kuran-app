package com.quran.kerim;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class PrayerWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "widget_prefs";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Boş - her widget kendi sınıfında güncelleniyor
    }
    
    // Yardımcı metodlar
    public static String[] getPrayerTimes(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return new String[]{
            prefs.getString("imsak", "05:30"),
            prefs.getString("gunes", "07:00"),
            prefs.getString("ogle", "13:15"),
            prefs.getString("ikindi", "16:00"),
            prefs.getString("aksam", "18:30"),
            prefs.getString("yatsi", "20:00")
        };
    }
    
    public static String[] getNextPrayerData(Context context) {
        String[] times = getPrayerTimes(context);
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
            Date now = new Date();
            String currentTime = sdf.format(now);
            
            String[][] prayers = {
                {"İmsak", times[0]},
                {"Güneş", times[1]},
                {"Öğle", times[2]},
                {"İkindi", times[3]},
                {"Akşam", times[4]},
                {"Yatsı", times[5]}
            };
            
            for (String[] prayer : prayers) {
                if (currentTime.compareTo(prayer[1]) < 0) {
                    long diff = sdf.parse(prayer[1]).getTime() - sdf.parse(currentTime).getTime();
                    long hours = diff / (60 * 60 * 1000);
                    long minutes = (diff % (60 * 60 * 1000)) / (60 * 1000);
                    String remaining = hours + "s " + minutes + "dk";
                    return new String[]{prayer[0], prayer[1], remaining};
                }
            }
            
            return new String[]{"İmsak", times[0], "Yarın"};
            
        } catch (Exception e) {
            return new String[]{"İmsak", times[0], "-"};
        }
    }
    
    public static void updatePrayerTimes(Context context, String imsak, String gunes, 
                                        String ogle, String ikindi, String aksam, String yatsi) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("imsak", imsak);
        editor.putString("gunes", gunes);
        editor.putString("ogle", ogle);
        editor.putString("ikindi", ikindi);
        editor.putString("aksam", aksam);
        editor.putString("yatsi", yatsi);
        editor.apply();
        
        // Tüm widget'ları güncelle
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        
        int[] smallIds = appWidgetManager.getAppWidgetIds(
            new android.content.ComponentName(context, SmallWidgetProvider.class));
        for (int id : smallIds) {
            SmallWidgetProvider.updateWidget(context, appWidgetManager, id);
        }
        
        int[] mediumIds = appWidgetManager.getAppWidgetIds(
            new android.content.ComponentName(context, MediumWidgetProvider.class));
        for (int id : mediumIds) {
            MediumWidgetProvider.updateWidget(context, appWidgetManager, id);
        }
        
        int[] largeIds = appWidgetManager.getAppWidgetIds(
            new android.content.ComponentName(context, LargeWidgetProvider.class));
        for (int id : largeIds) {
            LargeWidgetProvider.updateWidget(context, appWidgetManager, id);
        }
    }
}