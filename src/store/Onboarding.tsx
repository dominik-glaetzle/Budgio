import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ONBOARDING_KEY = "hasCompletedOnboarding";

interface OnboardingContextValue {
  hasOnboarded: boolean | null;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasOnboarded(value === "true");
      SplashScreen.hideAsync();
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setHasOnboarded(true);
  }, []);

  return (
    <OnboardingContext.Provider value={{ hasOnboarded, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
