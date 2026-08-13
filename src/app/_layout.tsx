import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { OnboardingProvider, useOnboarding } from "@/store/Onboarding";
import { useCurrentUser } from "@/lib/supabase";

import "./global.css";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { hasOnboarded } = useOnboarding();
  const { user, loading: authLoading } = useCurrentUser();

  if (hasOnboarded === null || authLoading) {
    return null;
  }

  const isAuthenticated = !!user;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name={"(tabs)"} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
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
