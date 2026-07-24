import { ScrollView } from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { GreetingHeader } from "@/components/GreetingHeader";
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionList } from "@/components/TransactionList";
import { CategoryChart } from "@/components/CategoryChart";
import { mockAccount, mockTransactions } from "@/lib/mock-data";

export default function Index() {
  const [chartKey, setChartKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setChartKey((key) => key + 1);
    }, []),
  );

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <ScrollView
        className={"flex-1"}
        contentContainerClassName={"gap-6 px-4 pb-8"}
      >
        <GreetingHeader name="Max" />
        <SummaryCard account={mockAccount} />
        <CategoryChart key={chartKey} transactions={mockTransactions} />
        <TransactionList transactions={mockTransactions} />
      </ScrollView>
    </SafeAreaView>
  );
}
