import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Share,
  Text,
  View,
  useColorScheme,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import { i18n } from "@/lib/i18n";
import { accentColor } from "@/constants/colors";
import {
  BackupData,
  exportBackupData,
  importBackupData,
} from "@/lib/local-storage";

function isBackupData(value: unknown): value is BackupData {
  if (!value || typeof value !== "object") {
    return false;
  }
  const data = value as Partial<BackupData>;
  return Array.isArray(data.accounts) && Array.isArray(data.transactions);
}

export function BackupSection() {
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportBackupData();
      const json = JSON.stringify(data, null, 2);
      const fileName = `budgio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const file = new File(Paths.cache, fileName);
      if (file.exists) {
        file.delete();
      }
      file.create({ overwrite: true });
      file.write(json);

      await Share.share(
        Platform.OS === "ios"
          ? { url: file.uri }
          : { message: json, title: fileName },
      );
    } catch {
      Alert.alert(i18n.t("settings.backup.exportErrorTitle"));
    } finally {
      setIsExporting(false);
    }
  };

  const runImport = async (data: BackupData) => {
    setIsImporting(true);
    try {
      await importBackupData(data);
      Alert.alert(i18n.t("settings.backup.importSuccessTitle"));
    } catch (error) {
      console.error("[backup] importBackupData failed", error);
      Alert.alert(i18n.t("settings.backup.importErrorTitle"));
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/plain", "public.json"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    let data: unknown;
    try {
      const file = new File(result.assets[0].uri);
      data = JSON.parse(await file.text());
    } catch (error) {
      console.error("[backup] failed to read/parse picked file", error);
      Alert.alert(i18n.t("settings.backup.importErrorTitle"));
      return;
    }

    if (!isBackupData(data)) {
      console.error("[backup] picked file failed isBackupData shape check", data);
      Alert.alert(i18n.t("settings.backup.importErrorTitle"));
      return;
    }

    Alert.alert(
      i18n.t("settings.backup.importConfirmTitle"),
      i18n.t("settings.backup.importConfirmBody"),
      [
        { text: i18n.t("common.cancel"), style: "cancel" },
        {
          text: i18n.t("settings.backup.importConfirmAction"),
          style: "destructive",
          onPress: () => runImport(data),
        },
      ],
    );
  };

  return (
    <View className={"gap-3"}>
      <Text
        className={
          "px-1 text-sm font-semibold text-secondary dark:text-secondary-dark"
        }
      >
        {i18n.t("settings.backup.title")}
      </Text>
      <View className={"rounded-2xl bg-surface dark:bg-surface-dark p-4"}>
        <Text className={"text-base text-black dark:text-white"}>
          {i18n.t("settings.backup.description")}
        </Text>
      </View>

      <Pressable
        onPress={handleExport}
        disabled={isExporting}
        className={"items-center rounded-2xl py-4"}
        style={{ backgroundColor: tint, opacity: isExporting ? 0.7 : 1 }}
      >
        {isExporting ? (
          <ActivityIndicator color={"#FFFFFF"} />
        ) : (
          <Text className={"text-base font-semibold text-white"}>
            {i18n.t("settings.backup.exportButton")}
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={handleImport}
        disabled={isImporting}
        className={"items-center rounded-2xl bg-surface dark:bg-surface-dark py-4"}
        style={{ opacity: isImporting ? 0.7 : 1 }}
      >
        {isImporting ? (
          <ActivityIndicator />
        ) : (
          <Text className={"text-base font-semibold text-black dark:text-white"}>
            {i18n.t("settings.backup.importButton")}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
