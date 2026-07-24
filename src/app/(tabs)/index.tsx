import { Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <Text className={"text-2xl text-black dark:text-white"}>Index</Text>
    </SafeAreaView>
  );
}
