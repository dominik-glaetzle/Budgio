import { Pressable, ScrollView, Text } from "react-native";
import { Account } from "@/types/models";
import { i18n } from "@/lib/i18n";
import { useAccountBalance } from "@/lib/local-storage";

interface AccountSwitcherProps {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function AccountPill({
  account,
  isSelected,
  onPress,
}: {
  account: Account;
  isSelected: boolean;
  onPress: () => void;
}) {
  const balance = useAccountBalance(account);
  const formatted = new Intl.NumberFormat(i18n.locale, {
    style: "currency",
    currency: "EUR",
  }).format(balance);

  return (
    <Pressable
      onPress={onPress}
      className={
        isSelected
          ? "rounded-2xl bg-accent dark:bg-accent-dark px-4 py-2.5"
          : "rounded-2xl bg-surface dark:bg-surface-dark px-4 py-2.5"
      }
    >
      <Text
        className={
          isSelected
            ? "text-xs font-medium text-white/70"
            : "text-xs font-medium text-secondary dark:text-secondary-dark"
        }
      >
        {account.name}
      </Text>
      <Text
        className={
          isSelected
            ? "text-base font-semibold text-white"
            : "text-base font-semibold text-black dark:text-white"
        }
      >
        {formatted}
      </Text>
    </Pressable>
  );
}

// Only worth showing once there is something to switch between — a single
// account is already named in context by the hero below it.
export function AccountSwitcher({
  accounts,
  selectedId,
  onSelect,
}: AccountSwitcherProps) {
  if (accounts.length <= 1) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName={"gap-2 px-4"}
    >
      {accounts.map((account) => (
        <AccountPill
          key={account.id}
          account={account}
          isSelected={account.id === selectedId}
          onPress={() => onSelect(account.id)}
        />
      ))}
    </ScrollView>
  );
}
