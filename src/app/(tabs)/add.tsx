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
import { i18n } from "@/lib/i18n";
import { accentColor, placeholderColor } from "@/constants/colors";
import { addTransaction, useAccount } from "@/lib/local-storage";
import { transactionTypeLabelKeys } from "@/lib/transaction-type-labels";
import { TransactionType } from "@/types/models";

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
  const { account } = useAccount();

  const [transactionType, setTransactionType] =
    useState<TransactionType>("OUTGOING");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsedAmount = Number(amount.replace(",", "."));

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(i18n.t("add.amountError"));
      return;
    }

    if (!account) {
      setError(i18n.t("home.noAccount"));
      return;
    }

    const signedAmount =
      transactionType === "INCOMING" ? parsedAmount : -parsedAmount;

    setError(null);
    setIsSubmitting(true);

    await addTransaction({
      account_id: account.id,
      target_account_id: null,
      amount: signedAmount,
      transaction_type: transactionType,
      category: category.trim() || null,
      institution: institution.trim() || null,
      occurred_at: new Date().toISOString(),
    });

    setIsSubmitting(false);
    setTransactionType("OUTGOING");
    setAmount("");
    setCategory("");
    setInstitution("");
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
          <Text className={"text-2xl font-bold text-black dark:text-white"}>
            {i18n.t("add.title")}
          </Text>

          <View className={"items-center gap-1"}>
            <Text
              className={"text-sm text-secondary dark:text-secondary-dark"}
            >
              {i18n.t("add.amountLabel")}
            </Text>
            <View className={"flex-row items-center"}>
              <Text
                className={"text-4xl font-bold text-black dark:text-white"}
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
                  "min-w-[80px] text-4xl font-bold text-black dark:text-white"
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
                {i18n.t("add.category")}
              </Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder={i18n.t("add.categoryPlaceholder")}
                placeholderTextColor={placeholder}
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
                {i18n.t("add.institution")}
              </Text>
              <TextInput
                value={institution}
                onChangeText={setInstitution}
                placeholder={i18n.t("add.institutionPlaceholder")}
                placeholderTextColor={placeholder}
                className={
                  "rounded-xl bg-surface dark:bg-surface-dark px-4 py-3 text-base text-black dark:text-white"
                }
              />
            </View>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={"items-center rounded-2xl py-4"}
            style={{ backgroundColor: tint, opacity: isSubmitting ? 0.7 : 1 }}
          >
            <Text className={"text-base font-semibold text-white"}>
              {isSubmitting ? i18n.t("common.submitting") : i18n.t("add.submit")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
