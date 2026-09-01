import { Modal, Pressable, Text, View } from "react-native";
import { SymbolView, type SFSymbol } from "expo-symbols";
import { useColorScheme } from "react-native";
import { accentColor } from "@/constants/colors";
import { categoryIconChoices } from "@/lib/category-icons";
import { i18n } from "@/lib/i18n";

interface CategoryIconPickerModalProps {
  visible: boolean;
  title: string;
  currentIcon: SFSymbol;
  onSelect: (icon: SFSymbol) => void;
  onClose: () => void;
}

export function CategoryIconPickerModal({
  visible,
  title,
  currentIcon,
  onSelect,
  onClose,
}: CategoryIconPickerModalProps) {
  const isDark = useColorScheme() === "dark";
  const tint = isDark ? accentColor.dark : accentColor.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={"slide"}
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className={"flex-1 justify-end bg-black/40"}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className={"rounded-t-3xl bg-white dark:bg-[#1C1C1E] px-5 pb-10 pt-4"}
        >
          <View className={"mb-4 h-1 w-9 self-center rounded-full bg-secondary/40"} />
          <Text
            className={"mb-4 text-center text-base font-semibold text-black dark:text-white"}
          >
            {title}
          </Text>
          <View className={"flex-row flex-wrap justify-between gap-y-3"}>
            {categoryIconChoices.map((icon) => {
              const isSelected = icon === currentIcon;
              return (
                <Pressable
                  key={icon}
                  onPress={() => onSelect(icon)}
                  className={"h-14 w-14 items-center justify-center rounded-full"}
                  style={{
                    backgroundColor: isSelected ? tint : "transparent",
                  }}
                >
                  <SymbolView
                    name={icon}
                    size={22}
                    tintColor={isSelected ? "#FFFFFF" : tint}
                    resizeMode={"scaleAspectFit"}
                  />
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={onClose} className={"mt-6 items-center py-2"}>
            <Text className={"text-base font-semibold"} style={{ color: tint }}>
              {i18n.t("common.done")}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
