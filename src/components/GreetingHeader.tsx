import { i18n } from "@/lib/i18n";
import { Text, View } from "react-native";
import ProfilePicture from "@/components/ProfilePicture";

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
    <View className={"flex-row items-center justify-between px-4 py-2"}>
      <View className={"gap-1"}>
        <Text className={"text-base text-secondary dark:text-secondary-dark"}>
          {formatGreetingString()}
        </Text>
        <Text className={"text-3xl font-bold text-black dark:text-white"}>
          {name}
        </Text>
      </View>
      <ProfilePicture name={name} />
    </View>
  );
}
