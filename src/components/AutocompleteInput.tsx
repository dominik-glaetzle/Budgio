import { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Text,
  TextInput,
  TextInputProps,
  View,
  useColorScheme,
} from "react-native";
import { secondaryColor } from "@/constants/colors";

interface AutocompleteInputProps extends Omit<TextInputProps, "value"> {
  value: string;
  suggestions: string[];
  label?: string;
  labelClassName?: string;
  /** Classes for the surrounding box: background/border/rounding/padding. */
  containerClassName?: string;
}

// Inline, Safari-address-bar-style autocomplete: the best prefix match is
// shown as greyed-out "ghost" text right after what the user typed, and
// typing a space accepts it — no popover, so it works the same as typing
// normally and never steals focus or blocks the keyboard.
export function AutocompleteInput({
  value,
  onChangeText,
  suggestions,
  className,
  label,
  labelClassName,
  containerClassName,
  ...textInputProps
}: AutocompleteInputProps) {
  // TextInput centers its text vertically using native font metrics that a
  // plain Text with the same className doesn't reproduce exactly, so two
  // full-string Text layers never line up pixel-perfectly. Instead we
  // measure the typed prefix's rendered width and place the ghost suffix
  // right after it in its own layer, centered the same way the row itself
  // is — no line-metric matching required.
  const [typedWidth, setTypedWidth] = useState(0);
  const isDark = useColorScheme() === "dark";

  const trimmed = value.trim();

  const suggestion = useMemo(() => {
    if (!trimmed) {
      return null;
    }
    const lower = trimmed.toLowerCase();
    return (
      suggestions.find((candidate) => {
        const candidateLower = candidate.toLowerCase();
        return candidateLower !== lower && candidateLower.startsWith(lower);
      }) ?? null
    );
  }, [suggestions, trimmed]);

  const completion = suggestion ? suggestion.slice(value.length) : "";

  const handleChangeText = (text: string) => {
    // A space typed right after a pending suggestion accepts it instead of
    // just inserting a space.
    if (
      suggestion &&
      completion &&
      text.length === value.length + 1 &&
      text.endsWith(" ") &&
      text.slice(0, -1) === value
    ) {
      onChangeText?.(`${suggestion} `);
      return;
    }
    onChangeText?.(text);
  };

  return (
    <View>
      {label ? (
        <Text
          className={
            labelClassName ??
            "mb-1.5 text-sm text-secondary dark:text-secondary-dark"
          }
        >
          {label}
        </Text>
      ) : null}
      {/* Padding/background live on this outer box; the inner box below is
          padding-free so the absolutely positioned layers line up with the
          TextInput without guessing at padding-box vs. border-box insets. */}
      <View className={containerClassName}>
        <View style={{ position: "relative" }}>
          <TextInput
            value={value}
            onChangeText={handleChangeText}
            className={className}
            style={{ lineHeight: undefined }}
            {...textInputProps}
          />
          <Text
            pointerEvents={"none"}
            numberOfLines={1}
            className={className}
            style={{ position: "absolute", opacity: 0, lineHeight: undefined }}
            onLayout={(event: LayoutChangeEvent) =>
              setTypedWidth(event.nativeEvent.layout.width)
            }
          >
            {value}
          </Text>
          {completion ? (
            <View
              pointerEvents={"none"}
              style={{
                position: "absolute",
                left: typedWidth,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={1}
                className={className}
                style={{
                  lineHeight: undefined,
                  color: isDark ? secondaryColor.dark : secondaryColor.light,
                }}
              >
                {completion}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
