import { ActivityIndicator, ScrollView, Text } from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { TransactionList } from "@/components/TransactionList";
import { CategoryChart } from "@/components/CategoryChart";
import { useAccount, useTransactions, useUserName } from "@/lib/local-storage";
import { i18n } from "@/lib/i18n";
import { BalanceCard } from "@/components/SummaryCard";
import { GreetingHeader } from "@/components/GreetingHeader";

export default function Index() {
  const [chartKey, setChartKey] = useState(0);
  const { account, loading: accountLoading } = useAccount();
  const { transactions } = useTransactions(account?.id ?? null);
  const { name } = useUserName();

  useFocusEffect(
    useCallback(() => {
      setChartKey((key) => key + 1);
    }, []),
  );

  if (accountLoading) {
    return (
      <SafeAreaView
        className={"flex-1 items-center justify-center bg-white dark:bg-black"}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!account) {
    return (
      <SafeAreaView
        className={
          "flex-1 items-center justify-center bg-white dark:bg-black px-8"
        }
      >
        <Text
          className={
            "text-center text-base text-secondary dark:text-secondary-dark"
          }
        >
          {i18n.t("home.noAccount")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <ScrollView
        className={"flex-1"}
        contentContainerClassName={"gap-6 px-4 pb-8 pt-4"}
      >
        <GreetingHeader name={name ?? ""} />
        <BalanceCard account={account} />
        <CategoryChart key={chartKey} transactions={transactions} />
        <TransactionList transactions={transactions} />
      </ScrollView>
    </SafeAreaView>
  );
}
