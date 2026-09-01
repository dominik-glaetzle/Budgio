import { useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
  useColorScheme,
} from "react-native";
import { Account } from "@/types/models";
import { BalanceCard } from "@/components/SummaryCard";
import { accentColor } from "@/constants/colors";

interface AccountCarouselProps {
  accounts: Account[];
  onIndexChange?: (index: number) => void;
}

export function AccountCarousel({
  accounts,
  onIndexChange,
}: AccountCarouselProps) {
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const [containerWidth, setContainerWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!containerWidth) {
      return;
    }
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / containerWidth,
    );
    setIndex(nextIndex);
    onIndexChange?.(nextIndex);
  };

  return (
    <View onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {accounts.map((account) => (
          <View key={account.id} style={{ width: containerWidth || undefined }}>
            <BalanceCard account={account} />
          </View>
        ))}
      </ScrollView>

      {accounts.length > 1 ? (
        <View className={"mt-3 flex-row justify-center gap-1.5"}>
          {accounts.map((account, accountIndex) => (
            <View
              key={account.id}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  accountIndex === index
                    ? tint
                    : isDark
                      ? "#48484A"
                      : "#D1D1D6",
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
