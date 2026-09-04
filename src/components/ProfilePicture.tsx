import React, { useState } from "react";
import { Alert, Pressable, Text } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { i18n } from "@/lib/i18n";
import { setProfilePicture, useProfilePicture } from "@/lib/local-storage";

interface ProfilePictureProps {
  name?: string;
}

function initialsFrom(name?: string) {
  if (!name) {
    return "";
  }
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfilePicture({ name }: ProfilePictureProps) {
  const { uri } = useProfilePicture();
  const [busy, setBusy] = useState(false);

  async function pickImage() {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          i18n.t("profilePicture.permissionTitle"),
          i18n.t("profilePicture.permissionMessage"),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      if (asset?.uri) {
        await setProfilePicture(asset.uri);
      }
    } catch (error) {
      console.warn("Failed to update profile picture", error);
      Alert.alert(i18n.t("profilePicture.errorTitle"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable
      onPress={pickImage}
      accessibilityRole="button"
      accessibilityLabel={i18n.t("profilePicture.accessibilityLabel")}
      className={
        "w-12 h-12 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700 items-center justify-center"
      }
    >
      {uri ? (
        <Image
          source={{ uri }}
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Text className={"text-xs font-bold text-white"}>
          {initialsFrom(name)}
        </Text>
      )}
    </Pressable>
  );
}
