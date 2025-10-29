package com.quran.kerim;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.widget.RemoteViews;

public class SmallWidgetProvider extends AppWidgetProvider {

    private static final String ACTION_AUTO_UPDATE = "com.quran.kerim.WIDGET_UPDATE";

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
                new android.content.ComponentName(context, SmallWidgetProvider.class));
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
        String[] nextPrayer = PrayerWidgetProvider.getNextPrayerData(context);
        
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_small);
        views.setTextViewText(R.id.widget_prayer_name, nextPrayer[0]);
        views.setTextViewText(R.id.widget_prayer_time, nextPrayer[1]);
        views.setTextViewText(R.id.widget_remaining_time, nextPrayer[2]);
        
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private void scheduleUpdates(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, SmallWidgetProvider.class);
        intent.setAction(ACTION_AUTO_UPDATE);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        alarmManager.setRepeating(AlarmManager.ELAPSED_REALTIME,
            SystemClock.elapsedRealtime() + 60000, 60000, pendingIntent);
    }

    private void cancelUpdates(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, SmallWidgetProvider.class);
        intent.setAction(ACTION_AUTO_UPDATE);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        alarmManager.cancel(pendingIntent);
    }
}