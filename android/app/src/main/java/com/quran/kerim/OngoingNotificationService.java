package com.quran.kerim;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

public class OngoingNotificationService extends Service {

    private static final int NOTIFICATION_ID = 1;
    private static final String CHANNEL_ID = "prayer_times_channel";
    private static final String CHANNEL_NAME = "Namaz Vakitleri";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        String contentText = "Namaz vakitleri için bildirim aktif";

        // TODO: Preferences'tan güncel vakitleri çekip contentText'i güncelleyebilirsin

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Namaz Vakitleri")
                .setContentText(contentText)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setOngoing(true)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopForeground(true);
        super.onDestroy();
    }
}