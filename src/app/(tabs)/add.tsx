import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { i18n } from "@/lib/i18n";
import { accentColor, placeholderColor } from "@/constants/colors";
import {
  addTransaction,
  addTransfer,
  setCategoryIcon,
  useAccounts,
  useCategoryIconOverrides,
} from "@/lib/local-storage";
import { transactionTypeLabelKeys } from "@/lib/transaction-type-labels";
import { TransactionType } from "@/types/models";
import {
  canonicalizeCategory,
  resolveCategoryIcon,
} from "@/lib/category-icons";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CategoryIconPickerModal } from "@/components/CategoryIconPickerModal";

const transactionTypes: TransactionType[] = [
  "OUTGOING",
  "INCOMING",
  "SELF_TRANSFER",
];

export default function Add() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const placeholder = isDark ? placeholderColor.dark : placeholderColor.light;
  const { accounts } = useAccounts();
  const { overrides } = useCategoryIconOverrides();

  const [transactionType, setTransactionType] =
    useState<TransactionType>("OUTGOING");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [institution, setInstitution] = useState("");
  const [occurredAt, setOccurredAt] = useState(new Date());
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [targetAccountId, setTargetAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIconPickerVisible, setIsIconPickerVisible] = useState(false);

  const isTransfer = transactionType === "SELF_TRANSFER";

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) ??
    accounts[0] ??
    null;

  const targetAccounts = accounts.filter(
    (account) => account.id !== selectedAccount?.id,
  );
  const targetAccount =
    targetAccounts.find((account) => account.id === targetAccountId) ?? null;

  const icon = resolveCategoryIcon(category || null, overrides);

  const handleSelectIcon = async (selectedIcon: string) => {
    const canonicalKey = canonicalizeCategory(category || "");
    if (canonicalKey) {
      await setCategoryIcon(canonicalKey, selectedIcon);
    }
    setIsIconPickerVisible(false);
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount.replace(",", "."));

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(i18n.t("add.amountError"));
      return;
    }

    if (!selectedAccount) {
      setError(i18n.t("home.noAccount"));
      return;
    }

    if (isTransfer && !targetAccount) {
      setError(i18n.t("add.toAccountError"));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    if (isTransfer && targetAccount) {
      await addTransfer({
        from_account_id: selectedAccount.id,
        to_account_id: targetAccount.id,
        amount: parsedAmount,
        category: category.trim() || null,
        institution: institution.trim() || null,
        occurred_at: occurredAt.toISOString(),
      });
    } else {
      const signedAmount =
        transactionType === "INCOMING" ? parsedAmount : -parsedAmount;

      await addTransaction({
        account_id: selectedAccount.id,
        target_account_id: null,
        amount: signedAmount,
        transaction_type: transactionType,
        category: category.trim() || null,
        institution: institution.trim() || null,
        occurred_at: occurredAt.toISOString(),
      });
    }

    setIsSubmitting(false);
    setTransactionType("OUTGOING");
    setAmount("");
    setCategory("");
    setInstitution("");
    setOccurredAt(new Date());
    setSelectedAccountId(selectedAccount.id);
    setTargetAccountId(null);
    router.push("/");
  };

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className={"flex-1"}
      >
        <ScrollView
          className={"flex-1"}
          contentContainerClassName={"gap-6 px-4 pb-8 pt-2"}
          keyboardShouldPersistTaps={"handled"}
        >
          <Text className={"text-[28px] font-bold text-black dark:text-white"}>
            {i18n.t("add.title")}
          </Text>

          <View className={"items-center"}>
            <Pressable
              onPress={() => setIsIconPickerVisible(true)}
              className={"relative"}
            >
              <CategoryIcon icon={icon} category={category} size={64} />
              <View
                className={
                  "absolute -bottom-0.5 -right-0.5 h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white dark:border-black"
                }
                style={{ backgroundColor: tint }}
              >
                <SymbolView
                  name={"pencil"}
                  size={10}
                  tintColor={"#FFFFFF"}
                  resizeMode={"scaleAspectFit"}
                />
              </View>
            </Pressable>
          </View>

          <View className={"items-center gap-1"}>
            <Text className={"text-sm text-secondary dark:text-secondary-dark"}>
              {i18n.t("add.amountLabel")}
            </Text>
            <View className={"flex-row items-center"}>
              <Text
                className={"text-[40px] font-bold text-black dark:text-white"}
              >
                €
              </Text>
              <TextInput
                value={amount}
                onChangeText={(value) => {
                  setAmount(value);
                  setError(null);
                }}
                placeholder={"0.00"}
                placeholderTextColor={placeholder}
                keyboardType={"decimal-pad"}
                className={
                  "min-w-[80px] text-[40px] font-bold text-black dark:text-white"
                }
              />
            </View>
            {error ? (
              <Text className={"text-sm text-red-500"}>{error}</Text>
            ) : null}
          </View>

          <View
            className={
              "flex-row rounded-2xl bg-surface dark:bg-surface-dark p-1"
            }
          >
            {transactionTypes.map((type) => {
              const isSelected = type === transactionType;
              return (
                <Pressable
                  key={type}
                  onPress={() => setTransactionType(type)}
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
                    {i18n.t(transactionTypeLabelKeys[type])}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className={"gap-3"}>
            <View>
              <Text
                className={
                  "mb-1.5 text-sm text-secondary dark:text-secondary-dark"
                }
              >
                {isTransfer ? i18n.t("add.fromAccount") : i18n.t("add.account")}
              </Text>
              <View
                className={
                  "flex-row flex-wrap gap-2 rounded-2xl bg-surface dark:bg-surface-dark p-1"
                }
              >
                {accounts.map((account) => {
                  const isSelected = account.id === selectedAccount?.id;
                  return (
                    <Pressable
                      key={account.id}
                      onPress={() => {
                        setSelectedAccountId(account.id);
                        if (account.id === targetAccountId) {
                          setTargetAccountId(null);
                        }
                        setError(null);
                      }}
                      className={"rounded-xl px-3 py-2"}
                      style={isSelected ? { backgroundColor: tint } : undefined}
                    >
                      <Text
                        className={
                          isSelected
                            ? "text-sm font-semibold text-white"
                            : "text-sm font-semibold text-secondary dark:text-secondary-dark"
                        }
                      >
                        {account.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {isTransfer ? (
              <View>
                <Text
                  className={
                    "mb-1.5 text-sm text-secondary dark:text-secondary-dark"
                  }
                >
                  {i18n.t("add.toAccount")}
                </Text>
                {targetAccounts.length > 0 ? (
                  <View
                    className={
                      "flex-row flex-wrap gap-2 rounded-2xl bg-surface dark:bg-surface-dark p-1"
                    }
                  >
                    {targetAccounts.map((account) => {
                      const isSelected = account.id === targetAccount?.id;
                      return (
                        <Pressable
                          key={account.id}
                          onPress={() => {
                            setTargetAccountId(account.id);
                            setError(null);
                          }}
                          className={"rounded-xl px-3 py-2"}
                          style={
                            isSelected ? { backgroundColor: tint } : undefined
                          }
                        >
                          <Text
                            className={
                              isSelected
                                ? "text-sm font-semibold text-white"
                                : "text-sm font-semibold text-secondary dark:text-secondary-dark"
                            }
                          >
                            {account.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text
                    className={
                      "text-sm text-secondary dark:text-secondary-dark"
                    }
                  >
                    {i18n.t("add.toAccountUnavailable")}
                  </Text>
                )}
              </View>
            ) : null}

            <View
              className={
                "gap-3 rounded-2xl bg-surface dark:bg-surface-dark p-4"
              }
            >
              <View>
                <Text
                  className={
                    "mb-1.5 text-sm text-secondary dark:text-secondary-dark"
                  }
                >
                  {i18n.t("add.category")}
                </Text>
                <TextInput
                  value={category}
                  onChangeText={setCategory}
                  placeholder={i18n.t("add.categoryPlaceholder")}
                  placeholderTextColor={placeholder}
                  className={"text-base text-black dark:text-white"}
                />
              </View>
              <View className={"h-[0.5px] bg-black/10 dark:bg-white/10"} />
              <View>
                <Text
                  className={
                    "mb-1.5 text-sm text-secondary dark:text-secondary-dark"
                  }
                >
                  {i18n.t("add.institution")}
                </Text>
                <TextInput
                  value={institution}
                  onChangeText={setInstitution}
                  placeholder={i18n.t("add.institutionPlaceholder")}
                  placeholderTextColor={placeholder}
                  className={"text-base text-black dark:text-white"}
                />
              </View>
              <View className={"h-[0.5px] bg-black/10 dark:bg-white/10"} />
              <View className={"flex-row items-center justify-between"}>
                <Text
                  className={"text-sm text-secondary dark:text-secondary-dark"}
                >
                  {i18n.t("transactionDetail.date")}
                </Text>
                <DateTimePicker
                  value={occurredAt}
                  onValueChange={(_, date) => setOccurredAt(date)}
                  mode={"date"}
                  display={"compact"}
                  accentColor={tint}
                  themeVariant={isDark ? "dark" : "light"}
                  style={{ minWidth: 130 }}
                />
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={"items-center rounded-2xl py-4"}
            style={{ backgroundColor: tint, opacity: isSubmitting ? 0.7 : 1 }}
          >
            <Text className={"text-base font-semibold text-white"}>
              {isSubmitting
                ? i18n.t("common.submitting")
                : i18n.t("add.submit")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <CategoryIconPickerModal
        visible={isIconPickerVisible}
        title={category.trim() || i18n.t("add.category")}
        currentIcon={icon}
        onSelect={handleSelectIcon}
        onClose={() => setIsIconPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
