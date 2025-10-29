package com.quran.kerim;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class LargeWidgetProvider extends AppWidgetProvider {

    private static final String ACTION_AUTO_UPDATE = "com.quran.kerim.WIDGET_UPDATE_LARGE";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
        scheduleUpdates(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_AUTO_UPDATE.equals(intent.getAction())) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            int[] ids = appWidgetManager.getAppWidgetIds(
                new android.content.ComponentName(context, LargeWidgetProvider.class));
            for (int id : ids) {
                updateWidget(context, appWidgetManager, id);
            }
        }
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        cancelUpdates(context);
    }

    static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        String[] times = PrayerWidgetProvider.getPrayerTimes(context);
        String[] nextPrayer = PrayerWidgetProvider.getNextPrayerData(context);
        String currentDate = new SimpleDateFormat("dd MMMM", new Locale("tr")).format(new Date());
        
        // Şu anki vakti bul
        String currentPrayer = getCurrentPrayer(times);
        
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_large);
        views.setTextViewText(R.id.widget_date_large, currentDate);
        views.setTextViewText(R.id.widget_next_prayer, nextPrayer[0]);
        views.setTextViewText(R.id.widget_next_time, nextPrayer[1]);
        views.setTextViewText(R.id.widget_remaining, nextPrayer[2] + " kaldı");
        
        // Tüm vakitleri göster ve aktif olanı vurgula
        setTimeWithHighlight(views, R.id.time_imsak_large, times[0], currentPrayer.equals("İmsak"));
        setTimeWithHighlight(views, R.id.time_gunes_large, times[1], currentPrayer.equals("Güneş"));
        setTimeWithHighlight(views, R.id.time_ogle_large, times[2], currentPrayer.equals("Öğle"));
        setTimeWithHighlight(views, R.id.time_ikindi_large, times[3], currentPrayer.equals("İkindi"));
        setTimeWithHighlight(views, R.id.time_aksam_large, times[4], currentPrayer.equals("Akşam"));
        setTimeWithHighlight(views, R.id.time_yatsi_large, times[5], currentPrayer.equals("Yatsı"));
        
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
    
    private static void setTimeWithHighlight(RemoteViews views, int viewId, String time, boolean isActive) {
        views.setTextViewText(viewId, time);
        if (isActive) {
            views.setTextColor(viewId, 0xFFFFFFFF); // Beyaz - aktif
        } else {
            views.setTextColor(viewId, 0xFF10B981); // Yeşil - normal
        }
    }
    
    private static String getCurrentPrayer(String[] times) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
            String currentTime = sdf.format(new Date());
            
            // İmsak-Güneş arası
            if (currentTime.compareTo(times[0]) >= 0 && currentTime.compareTo(times[1]) < 0) {
                return "İmsak";
            }
            // Güneş-Öğle arası
            else if (currentTime.compareTo(times[1]) >= 0 && currentTime.compareTo(times[2]) < 0) {
                return "Güneş";
            }
            // Öğle-İkindi arası
            else if (currentTime.compareTo(times[2]) >= 0 && currentTime.compareTo(times[3]) < 0) {
                return "Öğle";
            }
            // İkindi-Akşam arası
            else if (currentTime.compareTo(times[3]) >= 0 && currentTime.compareTo(times[4]) < 0) {
                return "İkindi";
            }
            // Akşam-Yatsı arası
            else if (currentTime.compareTo(times[4]) >= 0 && currentTime.compareTo(times[5]) < 0) {
                return "Akşam";
            }
            // Yatsı-Gece yarısı veya Gece yarısı-İmsak arası
            else {
                return "Yatsı";
            }
        } catch (Exception e) {
            return "";
        }
    }

    private void scheduleUpdates(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, LargeWidgetProvider.class);
        intent.setAction(ACTION_AUTO_UPDATE);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 2, intent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        alarmManager.setRepeating(AlarmManager.ELAPSED_REALTIME,
            SystemClock.elapsedRealtime() + 60000, 60000, pendingIntent);
    }

    private void cancelUpdates(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, LargeWidgetProvider.class);
        intent.setAction(ACTION_AUTO_UPDATE);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 2, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        alarmManager.cancel(pendingIntent);
    }
}