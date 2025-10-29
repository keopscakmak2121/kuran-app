package com.quran.kerim;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

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
            java.util.Calendar cal = java.util.Calendar.getInstance();
            int currentHours = cal.get(java.util.Calendar.HOUR_OF_DAY);
            int currentMinutes = cal.get(java.util.Calendar.MINUTE);
            int currentTotalMinutes = currentHours * 60 + currentMinutes;
            
            android.util.Log.d("WidgetDebug", "Current time: " + currentHours + ":" + currentMinutes);
            
            String[][] prayers = {
                {"İmsak", times[0]},
                {"Güneş", times[1]},
                {"Öğle", times[2]},
                {"İkindi", times[3]},
                {"Akşam", times[4]},
                {"Yatsı", times[5]}
            };
            
            for (String[] prayer : prayers) {
                String[] prayerTimeParts = prayer[1].split(":");
                int prayerHours = Integer.parseInt(prayerTimeParts[0]);
                int prayerMinutes = Integer.parseInt(prayerTimeParts[1]);
                int prayerTotalMinutes = prayerHours * 60 + prayerMinutes;
                
                android.util.Log.d("WidgetDebug", "Checking " + prayer[0] + " at " + prayer[1]);
                
                if (currentTotalMinutes < prayerTotalMinutes) {
                    int diffMinutes = prayerTotalMinutes - currentTotalMinutes;
                    int hours = diffMinutes / 60;
                    int minutes = diffMinutes % 60;
                    String remaining = hours > 0 ? hours + "s " + minutes + "dk" : minutes + "dk";
                    
                    android.util.Log.d("WidgetDebug", "Next prayer: " + prayer[0] + " Remaining: " + remaining);
                    
                    return new String[]{prayer[0], prayer[1], remaining};
                }
            }
            
            return new String[]{"İmsak", times[0], "Yarın"};
            
        } catch (Exception e) {
            android.util.Log.e("WidgetDebug", "Error: " + e.getMessage());
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