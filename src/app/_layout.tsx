import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { OnboardingProvider, useOnboarding } from "@/store/Onboarding";

import "./global.css";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { hasOnboarded } = useOnboarding();

  useEffect(() => {
    if (hasOnboarded !== null) {
      SplashScreen.hideAsync();
    }
  }, [hasOnboarded]);

  if (hasOnboarded === null) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasOnboarded}>
        <Stack.Screen name={"(tabs)"} />
        <Stack.Screen name={"transactions"} />
        <Stack.Screen
          name={"transaction/[id]"}
          options={{ presentation: "modal" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!hasOnboarded}>
        <Stack.Screen name={"(onboarding)"} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <StatusBar style={"auto"} />
      <RootNavigator />
    </OnboardingProvider>
  );
}
