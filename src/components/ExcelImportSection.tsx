import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { i18n } from "@/lib/i18n";
import { accentColor } from "@/constants/colors";
import { importTransactions, useAccounts } from "@/lib/local-storage";
import { parseWorkbookTransactions } from "@/lib/xlsx-import";
import { useColorScheme } from "react-native";

export function ExcelImportSection() {
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const { accounts } = useAccounts();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (accounts.length === 0) {
      Alert.alert(i18n.t("settings.import.noAccountTitle"));
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    setIsImporting(true);
    try {
      const file = new File(result.assets[0].uri);
      const buffer = await file.arrayBuffer();
      const parsed = parseWorkbookTransactions(buffer);

      const checkingAccount = accounts.find(
        (account) => account.account_type === "CHECKING",
      );
      const savingsAccount = accounts.find(
        (account) => account.account_type === "SAVINGS",
      );

      if (parsed.checking.length === 0 && parsed.savings.length === 0) {
        Alert.alert(i18n.t("settings.import.emptyTitle"));
        return;
      }

      let importedCount = 0;
      let skippedCount = 0;

      if (parsed.checking.length > 0) {
        if (checkingAccount) {
          importedCount += await importTransactions(
            checkingAccount.id,
            parsed.checking,
          );
        } else {
          skippedCount += parsed.checking.length;
        }
      }

      if (parsed.savings.length > 0) {
        if (savingsAccount) {
          importedCount += await importTransactions(
            savingsAccount.id,
            parsed.savings,
          );
        } else {
          skippedCount += parsed.savings.length;
        }
      }

      Alert.alert(
        i18n.t("settings.import.successTitle"),
        skippedCount > 0
          ? i18n.t("settings.import.successBodyWithSkipped", {
              count: importedCount,
              skipped: skippedCount,
            })
          : i18n.t("settings.import.successBody", { count: importedCount }),
      );
    } catch {
      Alert.alert(i18n.t("settings.import.errorTitle"));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View className={"gap-3"}>
      <View className={"rounded-2xl bg-surface dark:bg-surface-dark p-4"}>
        <Text className={"text-base text-black dark:text-white"}>
          {i18n.t("settings.import.description")}
        </Text>
      </View>
      <Pressable
        onPress={handleImport}
        disabled={isImporting}
        className={"items-center rounded-2xl py-4"}
        style={{ backgroundColor: tint, opacity: isImporting ? 0.7 : 1 }}
      >
        {isImporting ? (
          <ActivityIndicator color={"#FFFFFF"} />
        ) : (
          <Text className={"text-base font-semibold text-white"}>
            {i18n.t("settings.import.button")}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
