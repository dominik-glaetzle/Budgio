import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { useOnboarding } from "@/store/Onboarding";

export default function OnboardingLayout() {
  const isDark = useColorScheme() === "dark";
  const { hasOnboarded } = useOnboarding();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: isDark ? "#000000" : "#FFFFFF" },
      }}
    >
      <Stack.Protected guard={!hasOnboarded}>
        <Stack.Screen name="welcome" />
      </Stack.Protected>
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
