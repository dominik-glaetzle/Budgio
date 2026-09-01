import { View, useColorScheme } from "react-native";
import { SymbolView, type SFSymbol } from "expo-symbols";
import { accentColor, surfaceColor } from "@/constants/colors";

interface CategoryIconProps {
  icon: SFSymbol;
  size?: number;
}

export function CategoryIcon({ icon, size = 38 }: CategoryIconProps) {
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;
  const background = isDark ? "#2C2C2E" : surfaceColor.light;

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
        tintColor={tint}
        resizeMode={"scaleAspectFit"}
      />
    </View>
  );
}
