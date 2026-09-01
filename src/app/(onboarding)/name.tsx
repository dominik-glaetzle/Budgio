import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { i18n } from "@/lib/i18n";
import { accentColor, placeholderColor } from "@/constants/colors";
import { setUserName } from "@/lib/local-storage";
import { useOnboarding } from "@/store/Onboarding";

export default function Name() {
  const { completeOnboarding } = useOnboarding();
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const placeholder = isDark ? placeholderColor.dark : placeholderColor.light;

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(i18n.t("onboarding.name.error"));
      return;
    }

    await setUserName(trimmed);
    completeOnboarding();
  };

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className={"flex-1 justify-center gap-6 px-6"}
      >
        <View className={"gap-2"}>
          <Text className={"text-3xl font-bold text-black dark:text-white"}>
            {i18n.t("onboarding.name.title")}
          </Text>
          <Text
            className={"text-base text-secondary dark:text-secondary-dark"}
          >
            {i18n.t("onboarding.name.subtitle")}
          </Text>
        </View>

        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError(null);
          }}
          placeholder={i18n.t("onboarding.name.placeholder")}
          placeholderTextColor={placeholder}
          autoComplete={"name"}
          autoFocus
          className={
            "rounded-xl bg-surface dark:bg-surface-dark px-4 py-3 text-base text-black dark:text-white"
          }
        />

        {error ? (
          <Text className={"text-sm text-red-500"}>{error}</Text>
        ) : null}

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => ({
            backgroundColor: tint,
            opacity: pressed ? 0.85 : 1,
          })}
          className={"items-center rounded-2xl py-4"}
        >
          <Text className={"text-base font-semibold text-white"}>
            {i18n.t("onboarding.name.continueCta")}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
