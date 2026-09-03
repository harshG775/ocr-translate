import { useThemeContext } from "@/components/contexts/theme-provider";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

type MediaType = "manga" | "manhwa" | "manhua";

const mediaTypes: MediaType[] = ["manga", "manhwa", "manhua"];

const items = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    title: `Manga title ${index + 1}`,
    chapter: index + 1,
    updatedAt: `${(index + 1) * 3}m ago`,
    mediaType: mediaTypes[index % mediaTypes.length],
}));

const NUM_COLUMNS = 2;

export default function Index() {
    const { radius, spacing } = useThemeContext();
    const styles = createListStyles({ radius, spacing });

    return (
        <ThemedView style={styles.container}>
            <FlashList
                data={items}
                keyExtractor={(item) => String(item.id)}
                drawDistance={1500}
                numColumns={NUM_COLUMNS}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => <HistoryItem item={item} />}
            />
        </ThemedView>
    );
}

type HistoryItemProps = {
    item: (typeof items)[number];
};

function HistoryItem({ item }: HistoryItemProps) {
    const { colors, radius, spacing } = useThemeContext();
    const styles = createItemStyles({ radius, spacing });

    return (
        <Link
            href={{
                pathname: "/media/[media_id]",
                params: { media_id: `${item.id}-${item.title}` },
            }}
            asChild
            style={styles.item}
        >
            <Pressable>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={[styles.thumbnail, { backgroundColor: colors.border }]}>
                        <IconSymbol name="photo" size={32} color={colors.text} style={styles.thumbnailIcon} />
                        <View style={[styles.badge, { backgroundColor: colors.background }]}>
                            <ThemedText style={styles.badgeText}>{item.mediaType}</ThemedText>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.metaRow}>
                            <ThemedText style={styles.metaText}>Ch.{item.chapter}</ThemedText>
                            <ThemedText style={styles.metaText}>{item.updatedAt}</ThemedText>
                        </View>
                        <ThemedText style={styles.title} numberOfLines={2}>
                            {item.title}
                        </ThemedText>
                    </View>
                </View>
            </Pressable>
        </Link>
    );
}

type StyleTheme = Pick<ReturnType<typeof useThemeContext>, "radius" | "spacing">;

function createListStyles({ spacing }: StyleTheme) {
    return StyleSheet.create({
        container: {
            flex: 1,
        },
        list: {
            padding: spacing.md - spacing.sm / 2,
        },
    });
}

function createItemStyles({ radius, spacing }: StyleTheme) {
    return StyleSheet.create({
        item: {
            flex: 1 / NUM_COLUMNS,
            margin: spacing.sm / 2,
        },
        card: {
            borderRadius: radius.lg,
            overflow: "hidden",
            gap: spacing.xxs,
        },
        thumbnail: {
            aspectRatio: 3 / 4,
            alignItems: "center",
            justifyContent: "center",
        },
        thumbnailIcon: {
            opacity: 0.5,
        },
        badge: {
            position: "absolute",
            top: spacing.xxs,
            left: spacing.xxs,
            paddingHorizontal: spacing.xs,
            paddingVertical: 2,
            borderRadius: radius.sm,
        },
        badgeText: {
            fontSize: 10,
            fontWeight: "600",
            textTransform: "uppercase",
        },
        info: {
            paddingHorizontal: spacing.xs,
            paddingBottom: spacing.xs,
            gap: spacing.xxs,
        },
        metaRow: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        metaText: {
            fontSize: 11,
            opacity: 0.6,
        },
        title: {
            fontSize: 13,
            fontWeight: "600",
        },
    });
}
