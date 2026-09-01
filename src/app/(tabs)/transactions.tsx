import { ActivityIndicator, SectionList, Text, View } from "react-native";
import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccount, useTransactions } from "@/lib/local-storage";
import { i18n } from "@/lib/i18n";
import { Transaction } from "@/types/models";
import { TransactionRow } from "@/components/TransactionRow";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDayLabel(occurredAt: string) {
  const date = new Date(occurredAt);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return i18n.t("common.today");
  }
  if (isSameDay(date, yesterday)) {
    return i18n.t("common.yesterday");
  }
  return new Intl.DateTimeFormat(i18n.locale, {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(date);
}

function groupByDay(transactions: Transaction[]) {
  const sections: { title: string; data: Transaction[] }[] = [];
  const indexByTitle = new Map<string, number>();

  for (const transaction of transactions) {
    const title = getDayLabel(transaction.occurred_at);
    const existingIndex = indexByTitle.get(title);
    if (existingIndex === undefined) {
      indexByTitle.set(title, sections.length);
      sections.push({ title, data: [transaction] });
    } else {
      sections[existingIndex].data.push(transaction);
    }
  }

  return sections;
}

export default function Transactions() {
  const { account, loading: accountLoading } = useAccount();
  const { transactions, loading: transactionsLoading } = useTransactions(
    account?.id ?? null,
  );

  const sections = useMemo(() => groupByDay(transactions), [transactions]);
  const loading = accountLoading || transactionsLoading;

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <View className={"px-4 pb-2 pt-4"}>
        <Text className={"text-2xl font-bold text-black dark:text-white"}>
          {i18n.t("transactionsPage.title")}
        </Text>
      </View>

      {loading ? (
        <View className={"flex-1 items-center justify-center"}>
          <ActivityIndicator />
        </View>
      ) : transactions.length === 0 ? (
        <View className={"flex-1 items-center justify-center px-8"}>
          <Text
            className={
              "text-center text-base text-secondary dark:text-secondary-dark"
            }
          >
            {i18n.t("transactionsPage.empty")}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(transaction) => transaction.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text
              className={
                "mb-2 mt-4 text-sm font-semibold text-secondary dark:text-secondary-dark"
              }
            >
              {section.title}
            </Text>
          )}
          renderItem={({ item, index, section }) => (
            <View
              className={
                index === 0
                  ? "rounded-t-2xl bg-surface dark:bg-surface-dark px-4"
                  : index === section.data.length - 1
                    ? "rounded-b-2xl bg-surface dark:bg-surface-dark px-4"
                    : "bg-surface dark:bg-surface-dark px-4"
              }
            >
              {index > 0 ? (
                <View
                  className={"h-[0.5px] bg-black/10 dark:bg-white/10"}
                />
              ) : null}
              <TransactionRow transaction={item} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
