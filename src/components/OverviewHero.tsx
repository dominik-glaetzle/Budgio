import { Text, View, useColorScheme } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { i18n } from "@/lib/i18n";
import { accentColor } from "@/constants/colors";

interface OverviewHeroProps {
  totalIn: number;
  totalOut: number;
  monthLabel: string;
}

const SIZE = 214;
const STROKE = 13;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const currencyFormatter = new Intl.NumberFormat(i18n.locale, {
  style: "currency",
  currency: "EUR",
});

// The account-centric read on the inspiration ring: Budgio has no budget or
// allocation concept, only accounts and transactions, so the ring plots
// this month's spend against this month's income instead of against a set
// budget — full circle means "spent everything that came in".
export function OverviewHero({
  totalIn,
  totalOut,
  monthLabel,
}: OverviewHeroProps) {
  const isDark = useColorScheme() === "dark";
  const net = totalIn - totalOut;
  const progress =
    totalIn > 0 ? Math.min(totalOut / totalIn, 1) : totalOut > 0 ? 1 : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const track = isDark ? "#242427" : "#eceef2";
  const gradientFrom = isDark ? "#63b3ff" : "#5cb0ff";
  const gradientTo = isDark ? accentColor.dark : accentColor.light;

  return (
    <View className={"items-center"}>
      <Text
        className={
          "mb-2 text-xs font-bold uppercase tracking-widest text-secondary dark:text-secondary-dark"
        }
      >
        {monthLabel}
      </Text>

      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id={"ring"} x1={"0"} y1={"0"} x2={"1"} y2={"1"}>
              <Stop offset={"0"} stopColor={gradientFrom} />
              <Stop offset={"1"} stopColor={gradientTo} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={track}
            strokeWidth={STROKE}
            fill={"none"}
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={"url(#ring)"}
            strokeWidth={STROKE}
            fill={"none"}
            strokeLinecap={"round"}
            strokeDasharray={[CIRCUMFERENCE, CIRCUMFERENCE]}
            strokeDashoffset={dashOffset}
            rotation={-90}
            originX={SIZE / 2}
            originY={SIZE / 2}
          />
        </Svg>
        <View
          pointerEvents={"none"}
          className={
            "absolute top-0 bottom-0 left-0 right-0 items-center justify-center gap-1"
          }
        >
          <Text className={"text-[34px] font-bold text-black dark:text-white"}>
            {currencyFormatter.format(totalOut)}
          </Text>
          <Text className={"text-[13px] text-secondary dark:text-secondary-dark"}>
            {i18n.t("home.spentThisMonth")}
          </Text>
        </View>
      </View>

      <View className={"mt-4 w-full flex-row px-4"}>
        <View className={"flex-1 items-center gap-1"}>
          <Text
            className={
              "text-[11px] font-bold uppercase tracking-widest text-secondary dark:text-secondary-dark"
            }
          >
            {i18n.t("home.flowIn")}
          </Text>
          <Text className={"text-[17px] font-semibold text-black dark:text-white"}>
            {currencyFormatter.format(totalIn)}
          </Text>
        </View>
        <View className={"w-px bg-black/10 dark:bg-white/10"} />
        <View className={"flex-1 items-center gap-1"}>
          <Text
            className={
              "text-[11px] font-bold uppercase tracking-widest text-secondary dark:text-secondary-dark"
            }
          >
            {i18n.t("home.flowOut")}
          </Text>
          <Text className={"text-[17px] font-semibold text-black dark:text-white"}>
            {currencyFormatter.format(totalOut)}
          </Text>
        </View>
        <View className={"w-px bg-black/10 dark:bg-white/10"} />
        <View className={"flex-1 items-center gap-1"}>
          <Text
            className={
              "text-[11px] font-bold uppercase tracking-widest text-secondary dark:text-secondary-dark"
            }
          >
            {i18n.t("home.flowNet")}
          </Text>
          <Text
            className={
              net >= 0
                ? "text-[17px] font-semibold text-green-600 dark:text-green-400"
                : "text-[17px] font-semibold text-black dark:text-white"
            }
          >
            {net >= 0 ? "+" : "−"}
            {currencyFormatter.format(Math.abs(net))}
          </Text>
        </View>
      </View>
    </View>
  );
}
