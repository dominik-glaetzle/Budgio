import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Transaction } from "@/types/models";
import { i18n } from "@/lib/i18n";
import { transactionTypeLabelKeys } from "@/lib/transaction-type-labels";
import { resolveCategoryIcon } from "@/lib/category-icons";
import { useCategoryIconOverrides } from "@/lib/local-storage";
import { CategoryIcon } from "@/components/CategoryIcon";

export function getTransactionLabel(transaction: Transaction) {
  return (
    transaction.institution ??
    transaction.category ??
    i18n.t(transactionTypeLabelKeys[transaction.transaction_type])
  );
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat(i18n.locale, {
    style: "currency",
    currency: "EUR",
    signDisplay: "always",
  }).format(amount);
}

export function formatDate(occurredAt: string) {
  return new Intl.DateTimeFormat(i18n.locale, {
    day: "numeric",
    month: "short",
  }).format(new Date(occurredAt));
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const router = useRouter();
  const { overrides } = useCategoryIconOverrides();
  const isPositive = transaction.amount > 0;
  const icon = resolveCategoryIcon(transaction.category, overrides);

  return (
    <Pressable
      onPress={() => router.push(`/transaction/${transaction.id}`)}
      className={"flex-row items-center justify-between py-3"}
    >
      <View className={"flex-1 flex-row items-center gap-3 pr-3"}>
        <CategoryIcon icon={icon} category={transaction.category} size={40} />
        <View className={"flex-1"}>
          <Text
            numberOfLines={1}
            className={"text-base text-black dark:text-white"}
          >
            {getTransactionLabel(transaction)}
          </Text>
          <Text className={"text-sm text-secondary dark:text-secondary-dark"}>
            {formatDate(transaction.occurred_at)}
          </Text>
        </View>
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
    </Pressable>
  );
}
