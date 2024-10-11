import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import Constants from "expo-constants";
import SafeThemeProvider from "@/src/providers/SafeThemeProvider";
import SpaceMono from "../assets/fonts/SpaceMono-Regular.ttf";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeThemeProvider>
  );
}

let AppEntryPoint = RootLayout;

if (Constants?.expoConfig?.extra?.storybookEnabled === "true") {
  AppEntryPoint = require("../.storybook").default;
}

export default AppEntryPoint;
