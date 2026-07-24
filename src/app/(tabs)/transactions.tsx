import { Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transactions() {
  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <Text className={"text-black dark:text-white"}>Transactions</Text>
    </SafeAreaView>
  );
}
