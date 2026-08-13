import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { i18n } from "@/lib/i18n";
import { accentColor, secondaryColor, surfaceColor } from "@/constants/colors";

const featureKeys = [
  "onboarding.balance.title",
  "onboarding.spending.title",
  "onboarding.quickAdd.title",
];

export default function Welcome() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const ink = isDark ? "#FFFFFF" : "#000000";
  const mutedInk = isDark ? secondaryColor.dark : secondaryColor.light;
  const cardBackground = isDark
    ? `${surfaceColor.dark}CC`
    : `${surfaceColor.light}CC`;
  const gradientColors = isDark
    ? (["#000000", "#071B33"] as const)
    : (["#FFFFFF", "#DCEBFF"] as const);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(0.92)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 14000,
        useNativeDriver: true,
      }),
    ).start();
  }, [fadeAnim, floatAnim, pulseAnim, rotateAnim, slideAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: gradientColors[0] }]}
    >
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: `${tint}1A`,
              transform: [{ rotate }, { scale: pulseAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.backdropSecondary,
            {
              backgroundColor: `${tint}14`,
              transform: [{ translateY: floatAnim }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.14)"
                  : "rgba(0,0,0,0.06)",
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: tint }]}>
              {i18n.t("onboarding.welcome.badge")}
            </Text>
          </View>

          <Text style={[styles.title, { color: ink }]}>
            {i18n.t("onboarding.welcome.title")}
          </Text>
          <Text style={[styles.subtitle, { color: mutedInk }]}>
            {i18n.t("onboarding.welcome.subtitle")}
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBackground,
                borderColor: isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.06)",
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${tint}26` }]}>
              <Text style={styles.icon}>💳</Text>
            </View>
            <Text style={[styles.cardTitle, { color: ink }]}>
              {i18n.t("onboarding.welcome.cardTitle")}
            </Text>
            <Text style={[styles.cardText, { color: mutedInk }]}>
              {i18n.t("onboarding.welcome.cardText")}
            </Text>
          </View>

          <View style={styles.featureList}>
            {featureKeys.map((key) => (
              <View key={key} style={styles.featureRow}>
                <View style={[styles.dot, { backgroundColor: tint }]} />
                <Text style={[styles.featureText, { color: ink }]}>
                  {i18n.t(key)}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: tint, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push("/sign-up")}
          >
            <Text style={styles.primaryButtonText}>
              {i18n.t("onboarding.getStarted")}
            </Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  backdrop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -40,
    right: -40,
  },
  backdropSecondary: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 40,
    left: -32,
  },
  content: {
    zIndex: 1,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 320,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  icon: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardText: {
    lineHeight: 22,
    fontSize: 14,
  },
  featureList: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
