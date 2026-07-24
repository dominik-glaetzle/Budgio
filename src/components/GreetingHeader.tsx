import { i18n } from "@/lib/i18n";
import { Text, View } from "react-native";

interface GreetingHeaderProps {
  name: string;
}

function formatGreetingString() {
  return new Date().getHours() < 12
    ? i18n.t("header.morning")
    : i18n.t("header.afternoon");
}

export function GreetingHeader({ name }: GreetingHeaderProps) {
  return (
    <View className={"gap-1"}>
      <Text className={"text-base text-secondary dark:text-secondary-dark"}>
        {formatGreetingString()}
      </Text>
      <Text className={"text-3xl font-bold text-black dark:text-white"}>
        {name}
      </Text>
    </View>
  );
}
