import { ActivityIndicator, ScrollView, Text } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { TransactionList } from "@/components/TransactionList";
import { CategoryChart } from "@/components/CategoryChart";
import {
  useAccounts,
  useTransactions,
  useUserName,
} from "@/lib/local-storage";
import { i18n } from "@/lib/i18n";
import { AccountCarousel } from "@/components/AccountCarousel";
import { GreetingHeader } from "@/components/GreetingHeader";

export default function Index() {
  const [chartKey, setChartKey] = useState(0);
  const [accountIndex, setAccountIndex] = useState(0);
  const { accounts, loading: accountLoading } = useAccounts();
  const account = accounts[Math.min(accountIndex, accounts.length - 1)] ?? null;
  const { transactions } = useTransactions(account?.id ?? null);
  const { name } = useUserName();

  const monthTransactions = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return transactions.filter((transaction) => {
      const occurredAt = new Date(transaction.occurred_at);
      return occurredAt >= monthStart && occurredAt < nextMonthStart;
    });
  }, [transactions]);

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

  if (accounts.length === 0) {
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
        <AccountCarousel accounts={accounts} onIndexChange={setAccountIndex} />
        <CategoryChart key={chartKey} transactions={monthTransactions} />
        <TransactionList transactions={monthTransactions} />
      </ScrollView>
    </SafeAreaView>
  );
}
