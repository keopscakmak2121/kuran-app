package com.quran.kerim;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

public class SmallWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        String[] nextPrayer = PrayerWidgetProvider.getNextPrayerData(context);
        
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_small);
        views.setTextViewText(R.id.widget_prayer_name, nextPrayer[0]);
        views.setTextViewText(R.id.widget_prayer_time, nextPrayer[1]);
        views.setTextViewText(R.id.widget_remaining_time, nextPrayer[2]);
        
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}