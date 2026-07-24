import { Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <Text className={"text-black dark:text-white"}>Settings</Text>
    </SafeAreaView>
  );
};
export default Settings;
