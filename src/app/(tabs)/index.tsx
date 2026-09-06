import { useThemeContext } from "@/components/contexts/theme-provider";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useLatestUpdates } from "@/hooks/use-latest-updates";
import type { LatestSeries } from "@/lib/asurascans";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

const NUM_COLUMNS = 2;

export default function Index() {
    const { radius, spacing } = useThemeContext();
    const styles = createListStyles({ radius, spacing });
    const { series, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useLatestUpdates();

    if (isLoading) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText>Loading latest updates…</ThemedText>
            </ThemedView>
        );
    }

    if (error || !series.length) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText>Couldn't load latest updates.</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <FlashList
                data={series}
                keyExtractor={(item) => item.slug}
                numColumns={NUM_COLUMNS}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => <SeriesItem item={item} />}
                onEndReached={() => hasNextPage && fetchNextPage()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null}
            />
        </ThemedView>
    );
}

type SeriesItemProps = {
    item: LatestSeries;
};

function SeriesItem({ item }: SeriesItemProps) {
    const { colors, radius, spacing } = useThemeContext();
    const styles = createItemStyles({ radius, spacing });
    const latest = item.chapters[0];

    return (
        <Link
            href={{
                pathname: "/media/[media_id]",
                params: { media_id: item.slug },
            }}
            asChild
            style={styles.item}
        >
            <Pressable>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={[styles.thumbnail, { backgroundColor: colors.border }]}>
                        <Image
                            source={{ uri: item.cover }}
                            style={styles.thumbnailImage}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                        />
                        <View style={[styles.badge, { backgroundColor: colors.background }]}>
                            <ThemedText style={styles.badgeText}>{item.type}</ThemedText>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.metaRow}>
                            <ThemedText style={styles.metaText}>Ch.{latest.number}</ThemedText>
                            <ThemedText style={styles.metaText}>{latest.timeAgo}</ThemedText>
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
        centered: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        list: {
            padding: spacing.md - spacing.sm / 2,
        },
        footer: {
            paddingVertical: spacing.md,
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
        thumbnailImage: {
            width: "100%",
            height: "100%",
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
