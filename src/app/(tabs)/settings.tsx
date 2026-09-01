import { useState } from "react";
import { Pressable, ScrollView, Text, View, useColorScheme } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { i18n } from "@/lib/i18n";
import { setUserName } from "@/lib/local-storage";
import { CategoryIconSettings } from "@/components/CategoryIconSettings";
import { ExcelImportSection } from "@/components/ExcelImportSection";
import { BackupSection } from "@/components/BackupSection";

const tabs = [
  { key: "general", labelKey: "settings.tabs.general" },
  { key: "categories", labelKey: "settings.tabs.categories" },
  { key: "import", labelKey: "settings.tabs.import" },
] as const;

const Settings = () => {
  const isDark = useColorScheme() === "dark";
  const [tabIndex, setTabIndex] = useState(0);
  const activeTab = tabs[tabIndex].key;

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <View className={"gap-4 px-4 pb-2 pt-2"}>
        <Text className={"text-2xl font-bold text-black dark:text-white"}>
          {i18n.t("tabs.settings")}
        </Text>
        <SegmentedControl
          values={tabs.map((tab) => i18n.t(tab.labelKey))}
          selectedIndex={tabIndex}
          onValueChange={(value) => {
            const index = tabs.findIndex(
              (tab) => i18n.t(tab.labelKey) === value,
            );
            if (index >= 0) {
              setTabIndex(index);
            }
          }}
          appearance={isDark ? "dark" : "light"}
          style={{ height: 32 }}
        />
      </View>

      <ScrollView
        className={"flex-1"}
        contentContainerClassName={"gap-6 px-4 pb-8 pt-4"}
      >
        {activeTab === "general" ? (
          <Pressable
            onPress={() => setUserName("Dominik")}
            className={"rounded-2xl bg-surface dark:bg-surface-dark px-4 py-3.5"}
          >
            <Text className={"text-base text-black dark:text-white"}>
              {i18n.t("settings.setUsername")}
            </Text>
          </Pressable>
        ) : null}

        {activeTab === "categories" ? <CategoryIconSettings /> : null}

        {activeTab === "import" ? (
          <>
            <ExcelImportSection />
            <BackupSection />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
