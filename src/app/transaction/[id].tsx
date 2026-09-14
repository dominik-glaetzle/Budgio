import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { i18n } from "@/lib/i18n";
import { accentColor, placeholderColor } from "@/constants/colors";
import {
  deleteTransaction,
  setCategoryIcon,
  updateTransaction,
  useAllTransactions,
  useCategoryIconOverrides,
  useTransaction,
} from "@/lib/local-storage";
import { transactionTypeLabelKeys } from "@/lib/transaction-type-labels";
import { TransactionType } from "@/types/models";
import {
  canonicalizeCategory,
  resolveCategoryIcon,
} from "@/lib/category-icons";
import {
  getCategorySuggestions,
  getInstitutionSuggestions,
} from "@/lib/suggestions";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CategoryIconPickerModal } from "@/components/CategoryIconPickerModal";
import { AutocompleteInput } from "@/components/AutocompleteInput";

const transactionTypes: TransactionType[] = [
  "OUTGOING",
  "INCOMING",
  "SELF_TRANSFER",
];

export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const placeholder = isDark ? placeholderColor.dark : placeholderColor.light;

  const { transaction, loading } = useTransaction(id ?? null);
  const { overrides } = useCategoryIconOverrides();
  const { transactions: allTransactions } = useAllTransactions();
  const categorySuggestions = getCategorySuggestions(allTransactions);
  const institutionSuggestions = getInstitutionSuggestions(allTransactions);

  const [transactionType, setTransactionType] =
    useState<TransactionType>("OUTGOING");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [institution, setInstitution] = useState("");
  const [occurredAt, setOccurredAt] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIconPickerVisible, setIsIconPickerVisible] = useState(false);

  useEffect(() => {
    if (!transaction) {
      return;
    }
    setTransactionType(transaction.transaction_type);
    setAmount(Math.abs(transaction.amount).toString());
    setCategory(transaction.category ?? "");
    setInstitution(transaction.institution ?? "");
    setOccurredAt(new Date(transaction.occurred_at));
  }, [transaction]);

  const icon = resolveCategoryIcon(category || null, overrides);

  const handleSave = async () => {
    if (!transaction) {
      return;
    }

    const parsedAmount = Number(amount.replace(",", "."));

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(i18n.t("add.amountError"));
      return;
    }

    const signedAmount =
      transactionType === "INCOMING" ? parsedAmount : -parsedAmount;

    setError(null);
    setIsSubmitting(true);

    await updateTransaction(transaction.id, {
      amount: signedAmount,
      transaction_type: transactionType,
      category: category.trim() || null,
      institution: institution.trim() || null,
      occurred_at: occurredAt.toISOString(),
    });

    setIsSubmitting(false);
    router.back();
  };

  const handleDelete = () => {
    if (!transaction) {
      return;
    }
    Alert.alert(
      i18n.t("transactionDetail.deleteConfirmTitle"),
      i18n.t("transactionDetail.deleteConfirmBody"),
      [
        { text: i18n.t("common.cancel"), style: "cancel" },
        {
          text: i18n.t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteTransaction(transaction.id);
            router.back();
          },
        },
      ],
    );
  };

  const handleSelectIcon = async (selectedIcon: string) => {
    const canonicalKey = canonicalizeCategory(category || "");
    if (canonicalKey) {
      await setCategoryIcon(canonicalKey, selectedIcon);
    }
    setIsIconPickerVisible(false);
  };

  if (loading || !transaction) {
    return (
      <SafeAreaView
        className={"flex-1 items-center justify-center bg-white dark:bg-black"}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={"flex-1 bg-white dark:bg-black"}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className={"flex-1"}
      >
        <View
          className={
            "flex-row items-center justify-between px-4 pb-2 pt-2"
          }
        >
          <Pressable onPress={() => router.back()}>
            <Text className={"text-base"} style={{ color: tint }}>
              {i18n.t("common.cancel")}
            </Text>
          </Pressable>
          <Text className={"text-base font-semibold text-black dark:text-white"}>
            {i18n.t("transactionDetail.title")}
          </Text>
          <Pressable onPress={handleSave} disabled={isSubmitting}>
            <Text
              className={"text-base font-semibold"}
              style={{ color: tint, opacity: isSubmitting ? 0.5 : 1 }}
            >
              {i18n.t("common.save")}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className={"flex-1"}
          contentContainerClassName={"gap-6 px-4 pb-8 pt-4"}
          keyboardShouldPersistTaps={"handled"}
        >
          <View className={"items-center gap-2"}>
            <Pressable
              onPress={() => setIsIconPickerVisible(true)}
              className={"relative"}
            >
              <CategoryIcon icon={icon} category={category} size={72} />
              <View
                className={"absolute -bottom-0.5 -right-0.5 h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white dark:border-black"}
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
            <Text
              className={"text-sm text-secondary dark:text-secondary-dark"}
            >
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
            <AutocompleteInput
              label={i18n.t("add.category")}
              value={category}
              onChangeText={setCategory}
              suggestions={categorySuggestions}
              placeholder={i18n.t("add.categoryPlaceholder")}
              placeholderTextColor={placeholder}
              containerClassName={
                "rounded-xl bg-surface dark:bg-surface-dark px-4 py-3"
              }
              className={"text-base text-black dark:text-white"}
            />
            <AutocompleteInput
              label={i18n.t("add.institution")}
              value={institution}
              onChangeText={setInstitution}
              suggestions={institutionSuggestions}
              placeholder={i18n.t("add.institutionPlaceholder")}
              placeholderTextColor={placeholder}
              containerClassName={
                "rounded-xl bg-surface dark:bg-surface-dark px-4 py-3"
              }
              className={"text-base text-black dark:text-white"}
            />
            <View>
              <Text
                className={
                  "mb-1.5 text-sm text-secondary dark:text-secondary-dark"
                }
              >
                {i18n.t("transactionDetail.date")}
              </Text>
              <View
                className={
                  "rounded-xl bg-surface dark:bg-surface-dark px-4 py-2"
                }
              >
                <DateTimePicker
                  value={occurredAt}
                  onValueChange={(_, date) => setOccurredAt(date)}
                  mode={"date"}
                  display={"compact"}
                  accentColor={tint}
                  themeVariant={isDark ? "dark" : "light"}
                />
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleDelete}
            className={
              "items-center rounded-2xl bg-surface dark:bg-surface-dark py-3.5"
            }
          >
            <Text className={"text-base font-semibold text-red-500"}>
              {i18n.t("transactionDetail.delete")}
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
