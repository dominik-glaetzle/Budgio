import { Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Accounts() {
  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <Text className={"text-black dark:text-white"}>Accounts</Text>
    </SafeAreaView>
  );
}
