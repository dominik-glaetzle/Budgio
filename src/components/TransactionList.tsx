import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Transaction } from "@/types/models";
import { i18n } from "@/lib/i18n";
import { TransactionRow } from "@/components/TransactionRow";

interface TransactionsListProps {
  transactions: Transaction[];
  accountId?: string | null;
}

export function TransactionList({
  transactions,
  accountId,
}: TransactionsListProps) {
  return (
    <View>
      <View className={"mb-1 flex-row items-center justify-between"}>
        <Text className={"text-[17px] font-bold text-black dark:text-white"}>
          {i18n.t("transactions.title")}
        </Text>
        <Pressable
          onPress={() =>
            router.navigate({
              pathname: "/transactions",
              params: accountId ? { accountId } : undefined,
            })
          }
        >
          <Text
            className={"text-sm font-medium text-accent dark:text-accent-dark"}
          >
            {i18n.t("transactions.viewAll")}
          </Text>
        </Pressable>
      </View>
      <View>
        {transactions.map((transaction, index) => (
          <View key={transaction.id}>
            {index > 0 ? (
              <View className={"h-[0.5px] bg-black/10 dark:bg-white/10"} />
            ) : null}
            <TransactionRow transaction={transaction} />
          </View>
        ))}
      </View>
    </View>
  );
}
