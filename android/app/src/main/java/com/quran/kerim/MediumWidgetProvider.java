package com.quran.kerim;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MediumWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        String[] times = PrayerWidgetProvider.getPrayerTimes(context);
        String currentDate = new SimpleDateFormat("dd MMMM", new Locale("tr")).format(new Date());
        
        // Şu anki vakti bul
        String currentPrayer = getCurrentPrayer(times);
        
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_medium);
        views.setTextViewText(R.id.widget_date, currentDate);
        
        // Her namaz için arka plan rengini ayarla
        setPrayerRow(views, R.id.prayer_imsak, R.id.time_imsak, times[0], currentPrayer.equals("İmsak"));
        setPrayerRow(views, R.id.prayer_gunes, R.id.time_gunes, times[1], currentPrayer.equals("Güneş"));
        setPrayerRow(views, R.id.prayer_ogle, R.id.time_ogle, times[2], currentPrayer.equals("Öğle"));
        setPrayerRow(views, R.id.prayer_ikindi, R.id.time_ikindi, times[3], currentPrayer.equals("İkindi"));
        setPrayerRow(views, R.id.prayer_aksam, R.id.time_aksam, times[4], currentPrayer.equals("Akşam"));
        setPrayerRow(views, R.id.prayer_yatsi, R.id.time_yatsi, times[5], currentPrayer.equals("Yatsı"));
        
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
    
    private static void setPrayerRow(RemoteViews views, int rowId, int timeId, String time, boolean isActive) {
        views.setTextViewText(timeId, time);
        if (isActive) {
            views.setInt(rowId, "setBackgroundColor", 0xFF10B981); // Yeşil arka plan
        } else {
            views.setInt(rowId, "setBackgroundColor", 0x00000000); // Şeffaf
        }
    }
    
    private static String getCurrentPrayer(String[] times) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
            String currentTime = sdf.format(new Date());
            
            if (currentTime.compareTo(times[0]) >= 0 && currentTime.compareTo(times[1]) < 0) {
                return "İmsak";
            } else if (currentTime.compareTo(times[1]) >= 0 && currentTime.compareTo(times[2]) < 0) {
                return "Güneş";
            } else if (currentTime.compareTo(times[2]) >= 0 && currentTime.compareTo(times[3]) < 0) {
                return "Öğle";
            } else if (currentTime.compareTo(times[3]) >= 0 && currentTime.compareTo(times[4]) < 0) {
                return "İkindi";
            } else if (currentTime.compareTo(times[4]) >= 0 && currentTime.compareTo(times[5]) < 0) {
                return "Akşam";
            } else {
                return "Yatsı";
            }
        } catch (Exception e) {
            return "";
        }
    }
}