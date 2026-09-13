import { useState } from "react";
import { Pressable, ScrollView, Text, View, useColorScheme } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { SymbolView } from "expo-symbols";
import { i18n } from "@/lib/i18n";
import { setUserName, useUserName } from "@/lib/local-storage";
import { CategoryIconSettings } from "@/components/CategoryIconSettings";
import { ExcelImportSection } from "@/components/ExcelImportSection";
import { BackupSection } from "@/components/BackupSection";
import ProfilePicture from "@/components/ProfilePicture";

const tabs = [
  { key: "general", labelKey: "settings.tabs.general" },
  { key: "categories", labelKey: "settings.tabs.categories" },
  { key: "import", labelKey: "settings.tabs.import" },
] as const;

const Settings = () => {
  const isDark = useColorScheme() === "dark";
  const [tabIndex, setTabIndex] = useState(0);
  const activeTab = tabs[tabIndex].key;
  const { name } = useUserName();

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <View className={"gap-4 px-4 pb-2 pt-2"}>
        <Text className={"text-[28px] font-bold text-black dark:text-white"}>
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
            className={
              "flex-row items-center gap-3 rounded-2xl bg-surface dark:bg-surface-dark px-3.5 py-3"
            }
          >
            <ProfilePicture name={name ?? ""} />
            <View className={"flex-1"}>
              <Text className={"text-base font-semibold text-black dark:text-white"}>
                {name || i18n.t("settings.setUsername")}
              </Text>
              <Text className={"text-[12.5px] text-secondary dark:text-secondary-dark"}>
                {i18n.t("settings.localProfile")}
              </Text>
            </View>
            <SymbolView
              name={"chevron.right"}
              size={14}
              tintColor={isDark ? "#636366" : "#A0A0A8"}
              resizeMode={"scaleAspectFit"}
            />
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
