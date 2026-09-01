import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { SFSymbol } from "expo-symbols";
import { i18n } from "@/lib/i18n";
import {
  setCategoryIcon,
  useAccount,
  useCategoryIconOverrides,
  useTransactions,
} from "@/lib/local-storage";
import {
  canonicalizeCategory,
  presetCategories,
  resolveCategoryIcon,
} from "@/lib/category-icons";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CategoryIconPickerModal } from "@/components/CategoryIconPickerModal";

interface CategoryRowData {
  key: string;
  label: string;
}

function CategoryIconRow({
  category,
  overrides,
  onPress,
}: {
  category: CategoryRowData;
  overrides: Record<string, string>;
  onPress: () => void;
}) {
  const icon = resolveCategoryIcon(category.label, overrides);

  return (
    <Pressable onPress={onPress} className={"flex-row items-center gap-3 py-3"}>
      <CategoryIcon icon={icon} size={34} />
      <Text className={"flex-1 text-base text-black dark:text-white"}>
        {category.label}
      </Text>
    </Pressable>
  );
}

export function CategoryIconSettings() {
  const { account } = useAccount();
  const { transactions } = useTransactions(account?.id ?? null);
  const { overrides } = useCategoryIconOverrides();
  const [editingCategory, setEditingCategory] =
    useState<CategoryRowData | null>(null);

  const presetRows: CategoryRowData[] = presetCategories.map((preset) => ({
    key: preset.key,
    label: i18n.t(preset.labelKey),
  }));

  const customRows: CategoryRowData[] = useMemo(() => {
    const presetKeys = new Set(presetCategories.map((preset) => preset.key));
    const seen = new Map<string, string>();

    for (const transaction of transactions) {
      if (!transaction.category) {
        continue;
      }
      const canonicalKey = canonicalizeCategory(transaction.category);
      if (presetKeys.has(canonicalKey) || seen.has(canonicalKey)) {
        continue;
      }
      seen.set(canonicalKey, transaction.category);
    }

    return Array.from(seen, ([key, label]) => ({ key, label }));
  }, [transactions]);

  const currentIcon: SFSymbol | null = editingCategory
    ? resolveCategoryIcon(editingCategory.label, overrides)
    : null;

  const handleSelectIcon = async (icon: string) => {
    if (!editingCategory) {
      return;
    }
    await setCategoryIcon(editingCategory.key, icon);
    setEditingCategory(null);
  };

  return (
    <View className={"gap-6"}>
      <View className={"gap-2"}>
        <Text
          className={
            "px-1 text-sm font-semibold text-secondary dark:text-secondary-dark"
          }
        >
          {i18n.t("settings.categoryIcons")}
        </Text>
        <View className={"rounded-2xl bg-surface dark:bg-surface-dark px-4"}>
          {presetRows.map((category, index) => (
            <View key={category.key}>
              {index > 0 ? (
                <View className={"h-[0.5px] bg-black/10 dark:bg-white/10"} />
              ) : null}
              <CategoryIconRow
                category={category}
                overrides={overrides}
                onPress={() => setEditingCategory(category)}
              />
            </View>
          ))}
        </View>
      </View>

      {customRows.length > 0 ? (
        <View className={"gap-2"}>
          <Text
            className={
              "px-1 text-sm font-semibold text-secondary dark:text-secondary-dark"
            }
          >
            {i18n.t("settings.customCategoryIcons")}
          </Text>
          <View className={"rounded-2xl bg-surface dark:bg-surface-dark px-4"}>
            {customRows.map((category, index) => (
              <View key={category.key}>
                {index > 0 ? (
                  <View className={"h-[0.5px] bg-black/10 dark:bg-white/10"} />
                ) : null}
                <CategoryIconRow
                  category={category}
                  overrides={overrides}
                  onPress={() => setEditingCategory(category)}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <CategoryIconPickerModal
        visible={editingCategory !== null}
        title={editingCategory?.label ?? ""}
        currentIcon={currentIcon ?? "creditcard"}
        onSelect={handleSelectIcon}
        onClose={() => setEditingCategory(null)}
      />
    </View>
  );
}
