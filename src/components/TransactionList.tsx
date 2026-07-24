import { Text, View } from "react-native";
import { Transaction } from "@/types/models";
import { i18n } from "@/lib/i18n";
import { transactionTypeLabelKeys } from "@/lib/transaction-type-labels";

interface TransactionsListProps {
  transactions: Transaction[];
}

function getTransactionLabel(transaction: Transaction) {
  return (
    transaction.category ??
    transaction.institution ??
    i18n.t(transactionTypeLabelKeys[transaction.transaction_type])
  );
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat(i18n.locale, {
    style: "currency",
    currency: "EUR",
    signDisplay: "always",
  }).format(amount);
}

function formatDate(occurredAt: string) {
  return new Intl.DateTimeFormat(i18n.locale, {
    day: "numeric",
    month: "short",
  }).format(new Date(occurredAt));
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isPositive = transaction.amount > 0;

  return (
    <View className={"flex-row items-center justify-between py-3"}>
      <View>
        <Text className={"text-base text-black dark:text-white"}>
          {getTransactionLabel(transaction)}
        </Text>
        <Text className={"text-sm text-secondary dark:text-secondary-dark"}>
          {formatDate(transaction.occurred_at)}
        </Text>
      </View>
      <Text
        className={
          isPositive
            ? "text-base font-semibold text-green-600 dark:text-green-400"
            : "text-base font-semibold text-black dark:text-white"
        }
      >
        {formatAmount(transaction.amount)}
      </Text>
    </View>
  );
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
