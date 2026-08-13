import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { i18n } from "@/lib/i18n";
import { accentColor, placeholderColor } from "@/constants/colors";
import { signInWithEmail, signUpNewUser } from "@/lib/supabase";
import { useOnboarding } from "@/store/Onboarding";

type AuthMode = "signUp" | "signIn";

export default function SignUp() {
  const { completeOnboarding } = useOnboarding();
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const placeholder = isDark ? placeholderColor.dark : placeholderColor.light;

  const [mode, setMode] = useState<AuthMode>("signUp");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  const isSignUp = mode === "signUp";

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !name)) {
      setError(i18n.t("auth.missingFields"));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const { data, error: authError } = isSignUp
      ? await signUpNewUser(email, password, name)
      : await signInWithEmail(email, password);

    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (isSignUp && !data.session) {
      setConfirmationPending(true);
      return;
    }

    completeOnboarding();
  };

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className={"flex-1"}
      >
        <ScrollView
          className={"flex-1"}
          contentContainerClassName={"flex-1 justify-center gap-6 px-6"}
          keyboardShouldPersistTaps={"handled"}
        >
          <View className={"gap-2"}>
            <Text className={"text-3xl font-bold text-black dark:text-white"}>
              {isSignUp
                ? i18n.t("auth.signUpTitle")
                : i18n.t("auth.signInTitle")}
            </Text>
            <Text
              className={"text-base text-secondary dark:text-secondary-dark"}
            >
              {isSignUp
                ? i18n.t("auth.signUpSubtitle")
                : i18n.t("auth.signInSubtitle")}
            </Text>
          </View>

          {confirmationPending ? (
            <View
              className={"rounded-2xl bg-surface dark:bg-surface-dark p-4"}
            >
              <Text className={"text-base text-black dark:text-white"}>
                {i18n.t("auth.confirmEmail")}
              </Text>
            </View>
          ) : (
            <>
              <View className={"gap-3"}>
                {isSignUp ? (
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={i18n.t("auth.namePlaceholder")}
                    placeholderTextColor={placeholder}
                    autoComplete={"name"}
                    className={
                      "rounded-xl bg-surface dark:bg-surface-dark px-4 py-3 text-base text-black dark:text-white"
                    }
                  />
                ) : null}
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={i18n.t("auth.emailPlaceholder")}
                  placeholderTextColor={placeholder}
                  autoCapitalize={"none"}
                  keyboardType={"email-address"}
                  autoComplete={"email"}
                  className={
                    "rounded-xl bg-surface dark:bg-surface-dark px-4 py-3 text-base text-black dark:text-white"
                  }
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={i18n.t("auth.passwordPlaceholder")}
                  placeholderTextColor={placeholder}
                  secureTextEntry
                  autoComplete={isSignUp ? "new-password" : "password"}
                  className={
                    "rounded-xl bg-surface dark:bg-surface-dark px-4 py-3 text-base text-black dark:text-white"
                  }
                />
              </View>

              {error ? (
                <Text className={"text-sm text-red-500"}>{error}</Text>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={({ pressed }) => ({
                  backgroundColor: tint,
                  opacity: pressed || isSubmitting ? 0.85 : 1,
                })}
                className={"items-center rounded-2xl py-4"}
              >
                <Text className={"text-base font-semibold text-white"}>
                  {isSubmitting
                    ? i18n.t("auth.submitting")
                    : isSignUp
                      ? i18n.t("auth.signUpCta")
                      : i18n.t("auth.signInCta")}
                </Text>
              </Pressable>
            </>
          )}

          <Pressable
            onPress={() => {
              setMode(isSignUp ? "signIn" : "signUp");
              setError(null);
              setConfirmationPending(false);
            }}
          >
            <Text
              className={
                "text-center text-sm text-secondary dark:text-secondary-dark"
              }
            >
              {isSignUp
                ? i18n.t("auth.switchToSignIn")
                : i18n.t("auth.switchToSignUp")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
