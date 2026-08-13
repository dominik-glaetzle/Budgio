import React from "react";
import { useColorScheme } from "react-native";
import { NativeTabs, NativeTabTrigger } from "expo-router/unstable-native-tabs";
import { i18n } from "@/lib/i18n";
import { accentColor } from "@/constants/colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor =
    colorScheme === "dark" ? accentColor.dark : accentColor.light;

  return (
    <NativeTabs tintColor={tintColor}>
      <NativeTabs.Trigger name="index">
        <NativeTabTrigger.Icon sf={"chart.pie"} />
        <NativeTabs.Trigger.Label>
          {i18n.t("tabs.index")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="transactions">
        <NativeTabTrigger.Icon sf={"chart.bar"} />
        <NativeTabs.Trigger.Label>
          {i18n.t("tabs.transactions")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="accounts">
        <NativeTabTrigger.Icon sf={"person"} />
        <NativeTabs.Trigger.Label>
          {i18n.t("tabs.accounts")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabTrigger.Icon sf={"gear"} />
        <NativeTabs.Trigger.Label>
          {i18n.t("tabs.settings")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add" role={"search"}>
        <NativeTabTrigger.Icon sf={"plus"} />
        <NativeTabs.Trigger.Label>
          {i18n.t("tabs.add")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
