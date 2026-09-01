import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { i18n } from "@/lib/i18n";
import { accentColor, placeholderColor } from "@/constants/colors";
import { accountTypeLabelKeys } from "@/lib/account-type-labels";
import {
  createAccount,
  deleteAccount,
  useAccountBalance,
  useAccounts,
} from "@/lib/local-storage";
import { Account, AccountType } from "@/types/models";

const accountTypes: AccountType[] = ["CHECKING", "SAVINGS"];

function AccountCard({ account }: { account: Account }) {
  const currentBalance = useAccountBalance(account);
  const balance = new Intl.NumberFormat(i18n.locale, {
    style: "currency",
    currency: "EUR",
  }).format(currentBalance);

  return (
    <Pressable
      onPress={() => {
        deleteAccount(account.id);
      }}
    >
      <Text>+</Text>
      <View
        className={
          "flex-row items-center justify-between rounded-2xl bg-surface dark:bg-surface-dark px-4 py-4"
        }
      >
        <Text className={"text-base text-black dark:text-white"}>
          {`${account.name} (${i18n.t(accountTypeLabelKeys[account.account_type])})`}
        </Text>
        <Text className={"text-base font-semibold text-black dark:text-white"}>
          {balance}
        </Text>
      </View>
    </Pressable>
  );
}

export default function Accounts() {
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const placeholder = isDark ? placeholderColor.dark : placeholderColor.light;
  const { accounts, loading } = useAccounts();

  const [accountType, setAccountType] = useState<AccountType>("CHECKING");
  const [balance, setBalance] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setAccountType("CHECKING");
  };

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <ScrollView
        className={"flex-1"}
        contentContainerClassName={"gap-6 px-4 pb-8 pt-2"}
        keyboardShouldPersistTaps={"handled"}
      >
        <Text className={"text-2xl font-bold text-black dark:text-white"}>
          {i18n.t("accounts.title")}
        </Text>

        {loading ? (
          <ActivityIndicator />
        ) : accounts.length === 0 ? (
          <Text className={"text-base text-secondary dark:text-secondary-dark"}>
            {i18n.t("accounts.empty")}
          </Text>
        ) : (
          <View className={"gap-3"}>
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </View>
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
