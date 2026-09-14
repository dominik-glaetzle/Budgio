import type { ReactNode } from "react";
import { Text, View, useColorScheme } from "react-native";
import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";
import { Transaction } from "@/types/models";
import { i18n } from "@/lib/i18n";
import { categoryTint } from "@/lib/category-icons";
import { getTransactionLabel } from "@/components/TransactionRow";

interface InsightsGridProps {
  monthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  monthStart: Date;
}

const currencyFormatter = new Intl.NumberFormat(i18n.locale, {
  style: "currency",
  currency: "EUR",
});

function outgoingTotal(transactions: Transaction[]) {
  return transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
}

function topCategory(transactions: Transaction[]) {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.category) {
      continue;
    }
    const current = totals.get(transaction.category) ?? 0;
    totals.set(transaction.category, current + Math.abs(transaction.amount));
  }
  let best: { category: string; total: number } | null = null;
  for (const [category, total] of totals) {
    if (!best || total > best.total) {
      best = { category, total };
    }
  }
  return best;
}

// Cumulative outgoing spend across the elapsed days of the month, sampled
// into a handful of points — a real, if coarse, pace-of-spending curve
// rather than an invented trend line.
function buildSpendingCurve(transactions: Transaction[], monthStart: Date) {
  const pointCount = 6;
  const now = new Date();
  const daysElapsed = Math.max(
    1,
    Math.round((now.getTime() - monthStart.getTime()) / 86_400_000) + 1,
  );

  const byDay = transactions
    .filter((transaction) => transaction.amount < 0)
    .map((transaction) => ({
      day: Math.floor(
        (new Date(transaction.occurred_at).getTime() - monthStart.getTime()) /
          86_400_000,
      ),
      amount: Math.abs(transaction.amount),
    }));

  const points: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    const cutoff = Math.round(((i + 1) / pointCount) * daysElapsed);
    const total = byDay
      .filter((entry) => entry.day <= cutoff)
      .reduce((sum, entry) => sum + entry.amount, 0);
    points.push(total);
  }
  return points;
}

function InsightCard({
  iconTint,
  icon,
  label,
  children,
}: {
  iconTint: { bg: string; fg: string };
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <View
      className={
        "min-h-[98px] flex-1 basis-[47%] justify-between gap-2 rounded-2xl bg-surface dark:bg-surface-dark p-3.5"
      }
    >
      <View className={"flex-row items-center gap-2"}>
        <View
          className={"h-[26px] w-[26px] items-center justify-center rounded-full"}
          style={{ backgroundColor: iconTint.bg }}
        >
          {icon}
        </View>
        <Text
          className={
            "text-[12.5px] font-semibold text-secondary dark:text-secondary-dark"
          }
        >
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function InsightsGrid({
  monthTransactions,
  previousMonthTransactions,
  monthStart,
}: InsightsGridProps) {
  const isDark = useColorScheme() === "dark";
  const neutralTint = {
    bg: isDark ? "#2C2C2E" : "#EDEDF2",
    fg: isDark ? "#8E8E93" : "#6C6C70",
  };

  const spentThisMonth = outgoingTotal(monthTransactions);
  const spentLastMonth = outgoingTotal(previousMonthTransactions);
  const trendPct =
    spentLastMonth > 0
      ? Math.round(((spentThisMonth - spentLastMonth) / spentLastMonth) * 100)
      : null;

  const best = topCategory(monthTransactions);
  const bestTint = best
    ? categoryTint(best.category, isDark) ?? neutralTint
    : neutralTint;
  const bestShare =
    best && spentThisMonth > 0 ? best.total / spentThisMonth : 0;

  const biggestExpense = monthTransactions
    .filter((transaction) => transaction.amount < 0)
    .sort((a, b) => a.amount - b.amount)[0];
  const biggestExpenseTint = biggestExpense
    ? categoryTint(biggestExpense.category, isDark) ?? neutralTint
    : neutralTint;

  const curve = buildSpendingCurve(monthTransactions, monthStart);
  const curveMax = Math.max(...curve, 1);
  const curvePoints = curve
    .map((value, index) => {
      const x = (index / (curve.length - 1)) * 86;
      const y = 32 - (value / curveMax) * 30;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View className={"flex-row flex-wrap gap-2.5"}>
      <InsightCard
        iconTint={bestTint}
        label={i18n.t("home.topCategory")}
        icon={
          <Svg width={15} height={15} viewBox={"0 0 24 24"} fill={"none"} stroke={bestTint.fg} strokeWidth={1.8} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <Path d={"M4 12V5a1 1 0 0 1 1-1h7l8 8-8 8-8-8z"} />
            <Circle cx={8.5} cy={8.5} r={1.4} fill={bestTint.fg} stroke={"none"} />
          </Svg>
        }
      >
        {best ? (
          <View className={"flex-row items-center gap-2.5"}>
            <View style={{ width: 34, height: 34 }}>
              <Svg width={34} height={34} viewBox={"0 0 36 36"}>
                <Circle
                  cx={18}
                  cy={18}
                  r={14}
                  stroke={isDark ? "#242427" : "#eceef2"}
                  strokeWidth={6}
                  fill={"none"}
                />
                <Circle
                  cx={18}
                  cy={18}
                  r={14}
                  stroke={bestTint.fg}
                  strokeWidth={6}
                  fill={"none"}
                  strokeDasharray={[2 * Math.PI * 14 * bestShare, 2 * Math.PI * 14]}
                  rotation={-90}
                  originX={18}
                  originY={18}
                />
              </Svg>
            </View>
            <View>
              <Text
                numberOfLines={1}
                className={"text-[15px] font-semibold text-black dark:text-white"}
              >
                {best.category}
              </Text>
              <Text className={"text-[12.5px] text-secondary dark:text-secondary-dark"}>
                {currencyFormatter.format(best.total)}
              </Text>
            </View>
          </View>
        ) : (
          <Text className={"text-[13px] text-secondary dark:text-secondary-dark"}>
            {i18n.t("home.noSpendingYet")}
          </Text>
        )}
      </InsightCard>

      <InsightCard
        iconTint={{ bg: isDark ? "rgba(42,120,214,0.18)" : "#E8F1FC", fg: isDark ? "#5B9EEE" : "#2A78D6" }}
        label={i18n.t("home.spendingPace")}
        icon={
          <Svg width={15} height={15} viewBox={"0 0 24 24"} fill={"none"} stroke={isDark ? "#5B9EEE" : "#2A78D6"} strokeWidth={1.8} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <Path d={"M4 16l5-5 3 3 7-8"} />
            <Path d={"M15 6h5v5"} />
          </Svg>
        }
      >
        <View className={"flex-row items-end justify-between gap-2.5"}>
          <Svg width={86} height={34} viewBox={"0 0 86 34"}>
            <Polyline
              points={curvePoints}
              fill={"none"}
              stroke={isDark ? "#5B9EEE" : "#2A78D6"}
              strokeWidth={2}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
            />
          </Svg>
          <View className={"items-end"}>
            <Text className={"text-[15px] font-semibold text-black dark:text-white"}>
              {trendPct === null ? "—" : `${trendPct > 0 ? "+" : ""}${trendPct}%`}
            </Text>
            <Text className={"text-xs text-secondary dark:text-secondary-dark"}>
              {i18n.t("home.vsLastMonth")}
            </Text>
          </View>
        </View>
      </InsightCard>

      <InsightCard
        iconTint={biggestExpenseTint}
        label={i18n.t("home.biggestExpense")}
        icon={
          <Svg width={15} height={15} viewBox={"0 0 24 24"} fill={"none"} stroke={biggestExpenseTint.fg} strokeWidth={1.8} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <Path d={"M4 11l8-6 8 6"} />
            <Path d={"M6 10v9h12v-9"} />
            <Path d={"M10 19v-5h4v5"} />
          </Svg>
        }
      >
        {biggestExpense ? (
          <View>
            <Text className={"text-xl font-bold text-black dark:text-white"}>
              {currencyFormatter.format(Math.abs(biggestExpense.amount))}
            </Text>
            <Text
              numberOfLines={1}
              className={"text-[12.5px] text-secondary dark:text-secondary-dark"}
            >
              {getTransactionLabel(biggestExpense)}
            </Text>
          </View>
        ) : (
          <Text className={"text-[13px] text-secondary dark:text-secondary-dark"}>
            {i18n.t("home.noSpendingYet")}
          </Text>
        )}
      </InsightCard>

      <InsightCard
        iconTint={{ bg: isDark ? "rgba(201,138,18,0.18)" : "#FBF1DD", fg: isDark ? "#E0A83D" : "#C98A12" }}
        label={i18n.t("home.activity")}
        icon={
          <Svg width={15} height={15} viewBox={"0 0 24 24"} fill={"none"} stroke={isDark ? "#E0A83D" : "#C98A12"} strokeWidth={1.8} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <Rect x={4} y={4} width={16} height={16} rx={3} />
            <Path d={"M8 10h8M8 14h5"} />
          </Svg>
        }
      >
        <View>
          <Text className={"text-xl font-bold text-black dark:text-white"}>
            {monthTransactions.length}
          </Text>
          <Text className={"text-[12.5px] text-secondary dark:text-secondary-dark"}>
            {i18n.t("home.transactionsLogged")}
          </Text>
        </View>
      </InsightCard>
    </View>
  );
}
