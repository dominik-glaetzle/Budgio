import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { i18n } from "@/lib/i18n";
import { accentColor, categoryTintPalette, placeholderColor } from "@/constants/colors";
import { accountTypeLabelKeys } from "@/lib/account-type-labels";
import {
  createAccount,
  deleteAccount,
  useAccountBalance,
  useAccounts,
  useAllTransactions,
} from "@/lib/local-storage";
import { Account, AccountType } from "@/types/models";

const accountTypes: AccountType[] = ["CHECKING", "SAVINGS"];

// Reuses the app's category-tint language for account types: checking gets
// the blue slot, savings the green one — same swatches used everywhere
// else, not a new color introduced just for this screen.
function accountTint(type: AccountType, isDark: boolean) {
  const palette = isDark ? categoryTintPalette.dark : categoryTintPalette.light;
  return type === "SAVINGS" ? palette[2] : palette[0];
}

const currencyFormatter = new Intl.NumberFormat(i18n.locale, {
  style: "currency",
  currency: "EUR",
});

function AccountRow({
  account,
  onDelete,
}: {
  account: Account;
  onDelete: (account: Account) => void;
}) {
  const isDark = useColorScheme() === "dark";
  const balance = useAccountBalance(account);
  const tint = accountTint(account.account_type, isDark);

  return (
    <View
      className={
        "flex-row items-center gap-3 rounded-2xl bg-surface dark:bg-surface-dark p-3.5"
      }
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: tint.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SymbolView
          name={account.account_type === "SAVINGS" ? "banknote" : "creditcard"}
          size={20}
          tintColor={tint.fg}
          resizeMode={"scaleAspectFit"}
        />
      </View>
      <View className={"flex-1"}>
        <Text className={"text-base font-semibold text-black dark:text-white"}>
          {account.name}
        </Text>
        <Text className={"text-[12.5px] text-secondary dark:text-secondary-dark"}>
          {i18n.t(accountTypeLabelKeys[account.account_type])}
        </Text>
      </View>
      <Text className={"text-[17px] font-semibold text-black dark:text-white"}>
        {currencyFormatter.format(balance)}
      </Text>
      <Pressable
        hitSlop={8}
        onPress={() =>
          Alert.alert(
            i18n.t("accounts.deleteConfirmTitle"),
            i18n.t("accounts.deleteConfirmBody"),
            [
              { text: i18n.t("common.cancel"), style: "cancel" },
              {
                text: i18n.t("common.delete"),
                style: "destructive",
                onPress: () => onDelete(account),
              },
            ],
          )
        }
      >
        <SymbolView
          name={"xmark.circle.fill"}
          size={18}
          tintColor={isDark ? "#48484A" : "#C7C7CC"}
          resizeMode={"scaleAspectFit"}
        />
      </Pressable>
    </View>
  );
}

export default function Accounts() {
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const placeholder = isDark ? placeholderColor.dark : placeholderColor.light;
  const { accounts, loading } = useAccounts();
  const { transactions: allTransactions } = useAllTransactions();

  const [accountType, setAccountType] = useState<AccountType>("CHECKING");
  const [balance, setBalance] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalBalance = useMemo(
    () =>
      accounts.reduce((sum, account) => sum + account.balance, 0) +
      allTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    [accounts, allTransactions],
  );

  const monthNet = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return allTransactions
      .filter((transaction) => new Date(transaction.occurred_at) >= monthStart)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [allTransactions]);

  const handleCreate = async () => {
    const parsedBalance = balance ? Number(balance.replace(",", ".")) : 0;

    if (Number.isNaN(parsedBalance)) {
      setError(i18n.t("accounts.balanceError"));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    await createAccount({
      account_type: accountType,
      balance: parsedBalance,
      name: accountName,
    });

    setIsSubmitting(false);
    setBalance("");
    setAccountName("");
    setAccountType("CHECKING");
  };

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <ScrollView
        className={"flex-1"}
        contentContainerClassName={"gap-6 px-4 pb-8 pt-2"}
        keyboardShouldPersistTaps={"handled"}
      >
        <Text className={"text-[28px] font-bold text-black dark:text-white"}>
          {i18n.t("accounts.title")}
        </Text>

        {loading ? (
          <ActivityIndicator />
        ) : accounts.length === 0 ? (
          <Text className={"text-base text-secondary dark:text-secondary-dark"}>
            {i18n.t("accounts.empty")}
          </Text>
        ) : (
          <>
            <View
              className={
                "gap-1.5 rounded-2xl bg-surface dark:bg-surface-dark p-[18px]"
              }
            >
              <Text
                className={"text-[13px] font-semibold text-secondary dark:text-secondary-dark"}
              >
                {i18n.t("accounts.totalBalance")}
              </Text>
              <Text className={"text-[32px] font-bold text-black dark:text-white"}>
                {currencyFormatter.format(totalBalance)}
              </Text>
              {monthNet !== 0 ? (
                <View className={"flex-row items-center gap-1"}>
                  <SymbolView
                    name={monthNet >= 0 ? "arrow.up.right" : "arrow.down.right"}
                    size={11}
                    tintColor={monthNet >= 0 ? "#16A34A" : (isDark ? "#8E8E93" : "#6C6C70")}
                    resizeMode={"scaleAspectFit"}
                  />
                  <Text
                    className={
                      monthNet >= 0
                        ? "text-[13px] font-semibold text-green-600 dark:text-green-400"
                        : "text-[13px] font-semibold text-black dark:text-white"
                    }
                  >
                    {monthNet >= 0 ? "+" : "−"}
                    {currencyFormatter.format(Math.abs(monthNet))}
                  </Text>
                  <Text className={"text-[13px] text-secondary dark:text-secondary-dark"}>
                    {i18n.t("accounts.thisMonth")}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className={"gap-2.5"}>
              {accounts.map((account) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  onDelete={(entry) => deleteAccount(entry.id)}
                />
              ))}
            </View>
          </>
        )}

        <View className={"gap-4"}>
          <Text className={"text-lg font-bold text-black dark:text-white"}>
            {i18n.t("accounts.newAccountTitle")}
          </Text>

          <View
            className={
              "flex-row rounded-2xl bg-surface dark:bg-surface-dark p-1"
            }
          >
            {accountTypes.map((type) => {
              const isSelected = type === accountType;
              return (
                <Pressable
                  key={type}
                  onPress={() => setAccountType(type)}
                  className={"flex-1 items-center rounded-xl py-2.5"}
                  style={isSelected ? { backgroundColor: tint } : undefined}
                >
                  <Text
                    className={
                      isSelected
                        ? "text-sm font-semibold text-white"
                        : "text-sm font-semibold text-secondary dark:text-secondary-dark"
                    }
                  >
                    {i18n.t(accountTypeLabelKeys[type])}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View>
            <Text
              className={
                "mb-1.5 text-sm text-secondary dark:text-secondary-dark"
              }
            >
              {i18n.t("accounts.balanceLabel")}
            </Text>
            <TextInput
              value={balance}
              onChangeText={setBalance}
              placeholder={"0.00"}
              placeholderTextColor={placeholder}
              keyboardType={"decimal-pad"}
              className={
                "rounded-xl bg-surface dark:bg-surface-dark px-4 py-3 text-base text-black dark:text-white"
              }
            />
          </View>
          <View>
            <Text
              className={
                "mb-1.5 text-sm text-secondary dark:text-secondary-dark"
              }
            >
              {i18n.t("accounts.accountNameLabel")}
            </Text>
            <TextInput
              value={accountName}
              onChangeText={setAccountName}
              placeholder={"Personal Checking"}
              placeholderTextColor={placeholder}
              keyboardType={"default"}
              className={
                "rounded-xl bg-surface dark:bg-surface-dark px-4 py-3 text-base text-black dark:text-white"
              }
            />
          </View>

          {error ? (
            <Text className={"text-sm text-red-500"}>{error}</Text>
          ) : null}

          <Pressable
            onPress={handleCreate}
            disabled={isSubmitting}
            className={"items-center rounded-2xl py-4"}
            style={{
              backgroundColor: tint,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <Text className={"text-base font-semibold text-white"}>
              {isSubmitting
                ? i18n.t("common.submitting")
                : i18n.t("accounts.createCta")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
