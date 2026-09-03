import { useThemeContext } from "@/components/contexts/theme-provider";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

export default function Index() {
    const { media_id } = useLocalSearchParams<{ media_id: string }>();
    const { colors, radius, spacing } = useThemeContext();
    const styles = createStyles({ colors, radius, spacing });

    return (
        <ThemedView style={styles.container}>
            <ThemedText>src/app/media/[id]/index.tsx</ThemedText>
            <Link href={{ pathname: "/media/[media_id]/reader", params: { media_id } }} asChild>
                <Pressable style={styles.button}>
                    <ThemedText color={colors.background} style={styles.buttonText}>
                        Read
                    </ThemedText>
                </Pressable>
            </Link>
        </ThemedView>
    );
}

type StyleTheme = Pick<ReturnType<typeof useThemeContext>, "colors" | "radius" | "spacing">;

function createStyles({ colors, radius, spacing }: StyleTheme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            padding: spacing.md,
            gap: spacing.md,
        },
        button: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: colors.primary,
        },
        buttonText: {
            fontWeight: "600",
        },
    });
}
