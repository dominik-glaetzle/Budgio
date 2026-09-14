import { Animated, Easing, Text, View, useColorScheme } from "react-native";
import { useEffect, useRef } from "react";
import { PieChartPro } from "react-native-gifted-charts";
import { Transaction } from "@/types/models";
import { i18n } from "@/lib/i18n";
import { categoricalPalette } from "@/constants/colors";

interface CategorySpendingChartProps {
  transactions: Transaction[];
}

function spendingByCategory(transactions: Transaction[]) {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.category) {
      continue;
    }
    const current = totals.get(transaction.category) ?? 0;
    totals.set(transaction.category, current + Math.abs(transaction.amount));
  }

  return Array.from(totals, ([category, total]) => ({ category, total })).sort(
    (a, b) => b.total - a.total,
  );
}

const currencyFormatter = new Intl.NumberFormat(i18n.locale, {
  style: "currency",
  currency: "EUR",
});

export function CategorySpendingChart({
  transactions,
}: CategorySpendingChartProps) {
  const isDark = useColorScheme() === "dark";
  const palette = isDark ? categoricalPalette.dark : categoricalPalette.light;

  const spending = spendingByCategory(transactions);
  const total = spending.reduce((sum, entry) => sum + entry.total, 0);

  const pieData = spending.map((entry, index) => ({
    value: entry.total,
    color: palette[index % palette.length],
  }));

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rotation.setValue(0);
    Animated.timing(rotation, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [rotation, transactions]);

  const ringStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };

  if (spending.length === 0) {
    return (
      <View
        className={
          "min-h-[220px] items-center justify-center rounded-2xl bg-surface dark:bg-surface-dark p-4"
        }
      >
        <Text className={"text-[13px] text-secondary dark:text-secondary-dark"}>
          {i18n.t("home.noSpendingYet")}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={"items-center rounded-2xl bg-surface dark:bg-surface-dark p-4"}
    >
      <View className={"items-center justify-center"}>
        <Animated.View style={ringStyle}>
          <PieChartPro data={pieData} donut radius={90} innerRadius={62} />
        </Animated.View>
        <View
          className={
            "absolute top-0 bottom-0 left-0 right-0 items-center justify-center"
          }
        >
          <Text className={"text-xl font-bold text-black dark:text-white"}>
            {currencyFormatter.format(total)}
          </Text>
          <Text className={"text-xs text-secondary dark:text-secondary-dark"}>
            {i18n.t("chart.total")}
          </Text>
        </View>
      </View>
      <View className={"mt-5 w-full flex-row flex-wrap justify-between gap-y-3"}>
        {spending.map((entry, index) => (
          <View
            key={entry.category}
            className={"w-[48%] flex-row items-center gap-2"}
          >
            <View
              className={"h-2.5 w-2.5 rounded-full"}
              style={{ backgroundColor: palette[index % palette.length] }}
            />
            <View>
              <Text
                numberOfLines={1}
                className={"text-sm text-black dark:text-white"}
              >
                {entry.category}
              </Text>
              <Text className={"text-xs text-secondary dark:text-secondary-dark"}>
                {currencyFormatter.format(entry.total)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
