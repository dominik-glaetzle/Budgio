import { Text, View } from "react-native";
import { Account } from "@/types/models";
import { i18n } from "@/lib/i18n";
import { useAccountBalance } from "@/lib/local-storage";

interface BalanceCardProps {
  account: Account;
}

export function BalanceCard({ account }: BalanceCardProps) {
  const currentBalance = useAccountBalance(account);
  const balance = new Intl.NumberFormat(i18n.locale, {
    style: "currency",
    currency: "EUR",
  }).format(currentBalance);

  return (
    <View className={"rounded-3xl bg-accent dark:bg-accent-dark p-6"}>
      <Text className={"text-sm font-medium text-white/70"}>
        {account.name}
      </Text>
      <Text className={"mt-2 text-4xl font-bold text-white"}>{balance}</Text>
    </View>
  );
}
