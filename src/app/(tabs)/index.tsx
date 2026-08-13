import { ActivityIndicator, ScrollView, Text } from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { GreetingHeader } from "@/components/GreetingHeader";
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionList } from "@/components/TransactionList";
import { CategoryChart } from "@/components/CategoryChart";
import {
  getDisplayName,
  getTransactions,
  useAccount,
  useCurrentUser,
} from "@/lib/supabase";
import { i18n } from "@/lib/i18n";
import { Transaction } from "@/types/models";

export default function Index() {
  const [chartKey, setChartKey] = useState(0);
  const { user } = useCurrentUser();
  const displayName = getDisplayName(user) ?? user?.email ?? "";
  const { account, loading: accountLoading } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadTransactions = useCallback(() => {
    if (!account) {
      return;
    }
    getTransactions(account.id).then(({ data }) => {
      setTransactions(data ?? []);
    });
  }, [account]);

  useFocusEffect(
    useCallback(() => {
      setChartKey((key) => key + 1);
      loadTransactions();
    }, [loadTransactions]),
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
        contentContainerClassName={"gap-6 px-4 pb-8"}
      >
        <GreetingHeader name={displayName} />
        <SummaryCard account={account} />
        <CategoryChart key={chartKey} transactions={transactions} />
        <TransactionList transactions={transactions} />
      </ScrollView>
    </SafeAreaView>
  );
}
