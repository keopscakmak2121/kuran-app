package com.quran.kerim;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.IBinder;
import android.widget.RemoteViews;
import androidx.core.app.NotificationCompat;
import org.json.JSONException;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class OngoingNotificationService extends Service {

    private static final int NOTIFICATION_ID = 1;
    private static final String CHANNEL_ID = "prayer_times_channel";
    private static final String CHANNEL_NAME = "Namaz Vakitleri";
    private static final int ALARM_REQUEST_CODE = 1001;
    private JSONObject prayerTimes = null;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        String prayerTimesJson = intent.getStringExtra("prayerTimes");
        if (prayerTimesJson != null) {
            try {
                prayerTimes = new JSONObject(prayerTimesJson);
            } catch (JSONException e) {
                prayerTimes = null;
            }
        }

        updateNotification();
        scheduleNextUpdate();
        return START_STICKY;
    }

    private void scheduleNextUpdate() {
        AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(this, OngoingNotificationService.class);
        if (prayerTimes != null) {
            intent.putExtra("prayerTimes", prayerTimes.toString());
        }
        PendingIntent pendingIntent = PendingIntent.getService(
                this,
                ALARM_REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)
        );
        long triggerAtMillis = System.currentTimeMillis() + 60 * 1000;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
        }
    }

    private void updateNotification() {
        android.util.Log.d("BILDIRIM_TEST", "Custom bildirim fonksiyonu ÇALIŞTI!");

        RemoteViews remoteViews = new RemoteViews(getPackageName(), R.layout.custom_notification);

        // Örnek veri (bunları dinamik yapabilirsin)
        remoteViews.setTextViewText(R.id.location, "Gaziantep");
        remoteViews.setTextViewText(R.id.date, getFormattedDate());
        remoteViews.setTextViewText(R.id.hijri, "1442, Recep 8 - Sabaha : 07:17");
        remoteViews.setTextViewText(R.id.imsak_time, prayerTimes != null ? prayerTimes.optString("Fajr", "--:--") : "05:47");
        remoteViews.setTextViewText(R.id.sabah_time, prayerTimes != null ? prayerTimes.optString("Sunrise", "--:--") : "06:06");
        remoteViews.setTextViewText(R.id.gunes_time, prayerTimes != null ? prayerTimes.optString("Sunrise", "--:--") : "07:06");
        remoteViews.setTextViewText(R.id.ogle_time, prayerTimes != null ? prayerTimes.optString("Dhuhr", "--:--") : "12:49");
        remoteViews.setTextViewText(R.id.ikindi_time, prayerTimes != null ? prayerTimes.optString("Asr", "--:--") : "15:53");
        remoteViews.setTextViewText(R.id.aksam_time, prayerTimes != null ? prayerTimes.optString("Maghrib", "--:--") : "18:22");
        remoteViews.setTextViewText(R.id.yatsi_time, prayerTimes != null ? prayerTimes.optString("Isha", "--:--") : "19:37");

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setCustomContentView(remoteViews)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH);

        Notification notification = builder.build();
        startForeground(NOTIFICATION_ID, notification);
    }

    private String getFormattedDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM EEEE", Locale.getDefault());
        return sdf.format(new Date());
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Namaz vakitleri bildirimleri");
            channel.enableLights(true);
            channel.setLightColor(Color.GREEN);
            channel.enableVibration(false);
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(this, OngoingNotificationService.class);
        PendingIntent pendingIntent = PendingIntent.getService(
                this,
                ALARM_REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)
        );
        if (alarmManager != null) {
            alarmManager.cancel(pendingIntent);
        }
        stopForeground(true);
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}