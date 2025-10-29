package com.quran.kerim;

import android.content.Intent;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OngoingNotification")
public class OngoingNotificationPlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        getActivity().startForegroundService(new Intent(getContext(), OngoingNotificationService.class));
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), OngoingNotificationService.class));
        call.resolve();
    }
}