import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { useAccounts, useTransactions, useUserName } from "@/lib/local-storage";
import { i18n } from "@/lib/i18n";
import { GreetingHeader } from "@/components/GreetingHeader";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { OverviewHero } from "@/components/OverviewHero";
import { InsightsGrid } from "@/components/InsightsGrid";
import { CategorySpendingChart } from "@/components/CategorySpendingChart";
import { TransactionList } from "@/components/TransactionList";

const insightViews = [
  { key: "cards", labelKey: "home.viewCards" },
  { key: "chart", labelKey: "home.viewChart" },
] as const;

function useMonthRanges() {
  return useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    return { monthStart, nextMonthStart, previousMonthStart };
  }, []);
}

export default function Index() {
  const isDark = useColorScheme() === "dark";
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [insightViewIndex, setInsightViewIndex] = useState(0);
  const { accounts, loading: accountLoading } = useAccounts();
  const account =
    accounts.find((entry) => entry.id === selectedAccountId) ??
    accounts[0] ??
    null;
  const { transactions } = useTransactions(account?.id ?? null);
  const { name } = useUserName();
  const { monthStart, nextMonthStart, previousMonthStart } = useMonthRanges();

  const monthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const occurredAt = new Date(transaction.occurred_at);
        return occurredAt >= monthStart && occurredAt < nextMonthStart;
      }),
    [transactions, monthStart, nextMonthStart],
  );

  const previousMonthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const occurredAt = new Date(transaction.occurred_at);
        return occurredAt >= previousMonthStart && occurredAt < monthStart;
      }),
    [transactions, previousMonthStart, monthStart],
  );

  const totalIn = useMemo(
    () =>
      monthTransactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [monthTransactions],
  );

  const totalOut = useMemo(
    () =>
      monthTransactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [monthTransactions],
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.locale, {
        month: "long",
        year: "numeric",
      }).format(monthStart),
    [monthStart],
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
        contentContainerClassName={"gap-5 pb-8 pt-2"}
      >
        <GreetingHeader name={name ?? ""} />

        <AccountSwitcher
          accounts={accounts}
          selectedId={account?.id ?? null}
          onSelect={setSelectedAccountId}
        />

        <OverviewHero
          totalIn={totalIn}
          totalOut={totalOut}
          monthLabel={monthLabel}
        />

        <View className={"gap-2.5 px-4"}>
          <View className={"flex-row items-center justify-between gap-3"}>
            <Text
              className={"text-[17px] font-bold text-black dark:text-white"}
            >
              {i18n.t("home.insights")}
            </Text>
            <SegmentedControl
              values={insightViews.map((view) => i18n.t(view.labelKey))}
              selectedIndex={insightViewIndex}
              onValueChange={(value) => {
                const index = insightViews.findIndex(
                  (view) => i18n.t(view.labelKey) === value,
                );
                if (index >= 0) {
                  setInsightViewIndex(index);
                }
              }}
              appearance={isDark ? "dark" : "light"}
              style={{ height: 28, width: 140 }}
            />
          </View>
          {insightViews[insightViewIndex].key === "cards" ? (
            <InsightsGrid
              monthTransactions={monthTransactions}
              previousMonthTransactions={previousMonthTransactions}
              monthStart={monthStart}
            />
          ) : (
            <CategorySpendingChart transactions={monthTransactions} />
          )}
        </View>

        <View className={"px-4"}>
          <TransactionList
            transactions={monthTransactions.slice(0, 6)}
            accountId={account?.id ?? null}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
