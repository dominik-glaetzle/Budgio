import { i18n } from "@/lib/i18n";
import { presetCategories } from "@/lib/category-icons";
import { Transaction } from "@/types/models";

function rankByFrequency(values: Array<string | null | undefined>): string[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) {
      continue;
    }
    const key = trimmed.toLowerCase();
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label: trimmed, count: 1 });
    }
  }
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((entry) => entry.label);
}

export function getInstitutionSuggestions(transactions: Transaction[]): string[] {
  return rankByFrequency(transactions.map((transaction) => transaction.institution));
}

// Previously used categories first (most frequent first), then any preset
// category the user hasn't typed yet, so the list is useful from the very
// first transaction.
export function getCategorySuggestions(transactions: Transaction[]): string[] {
  const used = rankByFrequency(transactions.map((transaction) => transaction.category));
  const usedKeys = new Set(used.map((label) => label.toLowerCase()));

  const presets = presetCategories
    .map((preset) => i18n.t(preset.labelKey))
    .filter((label) => !usedKeys.has(label.toLowerCase()));

  return [...used, ...presets];
}
