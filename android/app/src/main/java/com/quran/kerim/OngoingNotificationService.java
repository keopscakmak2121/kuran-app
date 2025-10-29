package com.quran.kerim;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class OngoingNotificationService extends Service {

    private static final int NOTIFICATION_ID = 1;
    private static final String CHANNEL_ID = "prayer_times_channel";
    private static final String CHANNEL_NAME = "Namaz Vakitleri";

    private Handler handler;
    private Runnable updateRunnable;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        handler = new Handler();
        updateRunnable = new Runnable() {
            @Override
            public void run() {
                updateNotification();
                handler.postDelayed(this, 60 * 1000); // Her dakika çalıştır
            }
        };
        updateRunnable.run(); // İlk güncelleme hemen

        return START_STICKY;
    }

    private void updateNotification() {
        String kalanSure = getKalanSure(); // Şu an için örnek, ister vakit hesabı ekle
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Namaz Vakitleri")
                .setContentText("Kalan süre: " + kalanSure)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setOngoing(true)
                .build();
        startForeground(NOTIFICATION_ID, notification);
    }

    // Burada gerçek kalan süre hesabını yazabilirsin
    private String getKalanSure() {
        // Örnek: sadece saati ve dakikayı göster
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
        return sdf.format(new Date());
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
    public void onDestroy() {
        if (handler != null && updateRunnable != null) {
            handler.removeCallbacks(updateRunnable);
        }
        stopForeground(true);
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}