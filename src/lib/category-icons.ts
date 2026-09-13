import type { SFSymbol } from "expo-symbols";
import { categoryTintPalette } from "@/constants/colors";

export const DEFAULT_CATEGORY_ICON: SFSymbol = "creditcard";

export interface PresetCategory {
  key: string;
  labelKey: string;
  icon: SFSymbol;
  aliases: string[];
}

export const presetCategories: PresetCategory[] = [
  {
    key: "groceries",
    labelKey: "category.groceries",
    icon: "basket",
    aliases: ["groceries", "lebensmittel", "einkauf"],
  },
  {
    key: "restaurant",
    labelKey: "category.restaurant",
    icon: "fork.knife",
    aliases: ["restaurant", "essen gehen", "dining", "food"],
  },
  {
    key: "coffee",
    labelKey: "category.coffee",
    icon: "cup.and.saucer",
    aliases: ["coffee", "kaffee"],
  },
  {
    key: "transport",
    labelKey: "category.transport",
    icon: "car",
    aliases: ["transport", "fahrtkosten", "verkehr", "öpnv"],
  },
  {
    key: "fuel",
    labelKey: "category.fuel",
    icon: "fuelpump",
    aliases: ["fuel", "gas", "tanken", "benzin"],
  },
  {
    key: "travel",
    labelKey: "category.travel",
    icon: "airplane",
    aliases: ["travel", "reisen", "urlaub"],
  },
  {
    key: "rent",
    labelKey: "category.rent",
    icon: "house",
    aliases: ["rent", "miete"],
  },
  {
    key: "utilities",
    labelKey: "category.utilities",
    icon: "bolt",
    aliases: ["utilities", "nebenkosten", "strom"],
  },
  {
    key: "phone",
    labelKey: "category.phone",
    icon: "wifi",
    aliases: ["phone", "internet", "handy"],
  },
  {
    key: "shopping",
    labelKey: "category.shopping",
    icon: "bag",
    aliases: ["shopping", "einkaufen", "kleidung"],
  },
  {
    key: "health",
    labelKey: "category.health",
    icon: "cross.case",
    aliases: ["health", "gesundheit", "arzt"],
  },
  {
    key: "fitness",
    labelKey: "category.fitness",
    icon: "figure.run",
    aliases: ["fitness", "sport"],
  },
  {
    key: "entertainment",
    labelKey: "category.entertainment",
    icon: "gamecontroller",
    aliases: ["entertainment", "unterhaltung", "freizeit"],
  },
  {
    key: "subscriptions",
    labelKey: "category.subscriptions",
    icon: "arrow.triangle.2.circlepath",
    aliases: ["subscriptions", "abos", "abo"],
  },
  {
    key: "education",
    labelKey: "category.education",
    icon: "book",
    aliases: ["education", "bildung"],
  },
  {
    key: "insurance",
    labelKey: "category.insurance",
    icon: "shield",
    aliases: ["insurance", "versicherung"],
  },
  {
    key: "gifts",
    labelKey: "category.gifts",
    icon: "gift",
    aliases: ["gifts", "geschenke"],
  },
  {
    key: "pets",
    labelKey: "category.pets",
    icon: "pawprint",
    aliases: ["pets", "haustiere"],
  },
  {
    key: "salary",
    labelKey: "category.salary",
    icon: "banknote",
    aliases: ["salary", "gehalt", "lohn"],
  },
];

// Curated symbol choices offered in the picker — broader than the preset
// defaults so custom categories aren't limited to a preset's icon.
export const categoryIconChoices: SFSymbol[] = [
  "basket",
  "cart",
  "fork.knife",
  "cup.and.saucer",
  "car",
  "bus",
  "airplane",
  "fuelpump",
  "house",
  "bolt",
  "wifi",
  "bag",
  "tshirt",
  "cross.case",
  "pills",
  "gamecontroller",
  "film",
  "music.note",
  "book",
  "graduationcap",
  "banknote",
  "creditcard",
  "gift",
  "pawprint",
  "figure.run",
  "shield",
  "arrow.triangle.2.circlepath",
  "phone",
  "tag",
  "briefcase",
];

const aliasToKey = new Map<string, string>();
for (const preset of presetCategories) {
  for (const alias of preset.aliases) {
    aliasToKey.set(alias.toLowerCase(), preset.key);
  }
}

export function canonicalizeCategory(category: string): string {
  const normalized = category.trim().toLowerCase();
  return aliasToKey.get(normalized) ?? normalized;
}

// Stable per-category tint, keyed by a hash of the canonical category name
// so a given category always lands on the same swatch — independent of
// how many categories exist or the order transactions were entered in.
export function categoryTint(
  category: string | null | undefined,
  isDark: boolean,
) {
  if (!category) {
    return null;
  }

  const palette = isDark ? categoryTintPalette.dark : categoryTintPalette.light;
  const key = canonicalizeCategory(category);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

export function resolveCategoryIcon(
  category: string | null | undefined,
  overrides: Record<string, string>,
): SFSymbol {
  if (!category) {
    return DEFAULT_CATEGORY_ICON;
  }

  const canonicalKey = canonicalizeCategory(category);
  const override = overrides[canonicalKey];
  if (override) {
    return override as SFSymbol;
  }

  const preset = presetCategories.find((entry) => entry.key === canonicalKey);
  return preset?.icon ?? DEFAULT_CATEGORY_ICON;
}
