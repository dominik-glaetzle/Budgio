import { Text, View } from "react-native";
import { Transaction } from "@/types/models";
import { i18n } from "@/lib/i18n";
import { TransactionRow } from "@/components/TransactionRow";

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionsListProps) {
  return (
    <View>
      <Text className={"mb-2 text-lg font-bold text-black dark:text-white"}>
        {i18n.t("transactions.title")}
      </Text>
      <View className={"rounded-2xl bg-surface dark:bg-surface-dark px-4"}>
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </View>
    </View>
  );
}
