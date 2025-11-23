import { useEffect } from "react";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { useSupabase } from "@/hooks/useSupabase";
import { SupabaseProvider } from "@/providers/supabase-provider";

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SupabaseProvider>
      <RootNavigator />
    </SupabaseProvider>
  );
}

function RootNavigator() {
  const { isLoaded, session } = useSupabase();

  useEffect(() => {
    console.log("RootLayout: isLoaded changed", isLoaded);
    console.log("RootLayout: session exists?", !!session);
    if (isLoaded) {
      console.log("RootLayout: Hiding splash screen");
      SplashScreen.hide();
    }
  }, [isLoaded, session]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: "none",
        animationDuration: 0,
      }}
    >
      <Stack.Screen name="(protected)" redirect={!session} />
      <Stack.Screen name="(public)" redirect={!!session} />
    </Stack>
  );
}
