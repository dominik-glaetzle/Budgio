import { Pressable, Text, View } from "react-native";
import { Transaction } from "@/types/models";
import { i18n } from "@/lib/i18n";
import { TransactionRow } from "@/components/TransactionRow";
import { router } from "expo-router";

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionsListProps) {
  return (
    <View>
      <View className={"flex-row items-center justify-between mb-2"}>
        <Text className={"mb-2 text-lg font-bold text-black dark:text-white"}>
          {i18n.t("transactions.title")}
        </Text>
        <Pressable
          onPress={() => router.navigate("/transactions")}
          className={"px-2 py-1"}
        >
          <Text
            className={"text-sm font-medium text-accent dark:text-accent-dark"}
          >
            {i18n.t("transactions.viewAll")}
          </Text>
        </Pressable>
      </View>
      <View className={"rounded-2xl bg-surface dark:bg-surface-dark px-4"}>
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </View>
    </View>
  );
}
