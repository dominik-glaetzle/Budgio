import { View, useColorScheme } from "react-native";
import { SymbolView, type SFSymbol } from "expo-symbols";
import { accentColor, surfaceColor } from "@/constants/colors";
import { categoryTint } from "@/lib/category-icons";

interface CategoryIconProps {
  icon: SFSymbol;
  category?: string | null;
  size?: number;
}

export function CategoryIcon({ icon, category, size = 38 }: CategoryIconProps) {
  const isDark = useColorScheme() === "dark";
  const tint = categoryTint(category, isDark);
  const background = tint
    ? tint.bg
    : isDark
      ? "#2C2C2E"
      : surfaceColor.light;
  const iconColor = tint ? tint.fg : isDark ? accentColor.dark : accentColor.light;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SymbolView
        name={icon}
        size={size * 0.5}
        tintColor={iconColor}
        resizeMode={"scaleAspectFit"}
      />
    </View>
  );
}
