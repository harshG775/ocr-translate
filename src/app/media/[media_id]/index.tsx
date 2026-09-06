import { useThemeContext } from "@/components/contexts/theme-provider";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useSeriesDetails } from "@/hooks/use-series-details";
import type { SeriesChapter } from "@/lib/asurascans";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

function formatCount(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return String(count);
}

export default function Index() {
    const { media_id } = useLocalSearchParams<{ media_id: string }>();
    const { colors, radius, spacing } = useThemeContext();
    const styles = createStyles({ colors, radius, spacing });
    const { details, chapters, isLoading, error } = useSeriesDetails(media_id);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    if (isLoading) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText>Loading…</ThemedText>
            </ThemedView>
        );
    }

    if (error || !details || !chapters) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText>Couldn't load this title.</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <FlashList
                data={chapters}
                keyExtractor={(chapter) => String(chapter.id)}
                renderItem={({ item }) => <ChapterRow chapter={item} mediaId={media_id} />}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Image source={{ uri: details.cover }} style={styles.cover} contentFit="cover" cachePolicy="memory-disk" />

                        <ThemedText style={styles.title}>{details.title}</ThemedText>

                        <Pressable onPress={() => setDescriptionExpanded((prev) => !prev)}>
                            <ThemedText style={styles.description} numberOfLines={descriptionExpanded ? undefined : 3}>
                                {details.description}
                            </ThemedText>
                            <ThemedText color={colors.primary} style={styles.showMore}>
                                {descriptionExpanded ? "Show less" : "Show more"}
                            </ThemedText>
                        </Pressable>

                        <Link
                            href={{
                                pathname: "/media/[media_id]/reader",
                                params: { media_id, chapter: String(Math.min(...chapters.map((c) => c.number))) },
                            }}
                            asChild
                            style={styles.readButton}
                        >
                            <Pressable>
                                <ThemedText color={colors.background} style={styles.readButtonText}>
                                    Start Reading
                                </ThemedText>
                            </Pressable>
                        </Link>

                        <View style={styles.statsRow}>
                            <Stat label="Rating" value={details.rating.toFixed(1)} />
                            <Stat label="Chapters" value={String(details.chapterCount)} />
                            <Stat label="Bookmarks" value={formatCount(details.bookmarkCount)} />
                        </View>

                        <View style={styles.metaGrid}>
                            <MetaField label="Status" value={details.status} />
                            <MetaField label="Type" value={details.type} />
                            <MetaField label="Author" value={details.author} />
                            <MetaField label="Artist" value={details.artist} />
                        </View>

                        <View style={styles.genres}>
                            {details.genres.map((genre) => (
                                <View key={genre.id} style={[styles.genreChip, { backgroundColor: colors.card }]}>
                                    <ThemedText style={styles.genreText}>{genre.name}</ThemedText>
                                </View>
                            ))}
                        </View>

                        <ThemedText style={styles.chaptersHeading}>{chapters.length} Chapters</ThemedText>
                    </View>
                }
                contentContainerStyle={styles.list}
            />
        </ThemedView>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    const { spacing } = useThemeContext();
    return (
        <View style={{ alignItems: "center", gap: spacing.xxs }}>
            <ThemedText style={{ fontSize: 16, fontWeight: "700" }}>{value}</ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.6 }}>{label}</ThemedText>
        </View>
    );
}

function MetaField({ label, value }: { label: string; value: string }) {
    const { spacing } = useThemeContext();
    return (
        <View style={{ gap: spacing.xxs / 2 }}>
            <ThemedText style={{ fontSize: 11, opacity: 0.6 }}>{label}</ThemedText>
            <ThemedText style={{ fontSize: 13, fontWeight: "600", textTransform: "capitalize" }}>{value}</ThemedText>
        </View>
    );
}

function ChapterRow({ chapter, mediaId }: { chapter: SeriesChapter; mediaId: string }) {
    const { colors, radius, spacing } = useThemeContext();

    return (
        <Link
            href={{
                pathname: "/media/[media_id]/reader",
                params: { media_id: mediaId, chapter: String(chapter.number) },
            }}
            asChild
        >
            <Pressable
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: colors.card,
                    marginBottom: spacing.xxs,
                }}
            >
                <ThemedText style={{ fontWeight: "600" }}>Chapter {chapter.number}</ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>{chapter.timeAgo}</ThemedText>
            </Pressable>
        </Link>
    );
}

type StyleTheme = Pick<ReturnType<typeof useThemeContext>, "colors" | "radius" | "spacing">;

function createStyles({ colors, radius, spacing }: StyleTheme) {
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
            padding: spacing.md,
        },
        header: {
            gap: spacing.sm,
            marginBottom: spacing.md,
        },
        cover: {
            width: "100%",
            aspectRatio: 2 / 3,
            borderRadius: radius.lg,
        },
        title: {
            fontSize: 22,
            fontWeight: "700",
        },
        description: {
            fontSize: 13,
            lineHeight: 19,
            opacity: 0.8,
        },
        showMore: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: spacing.xxs,
        },
        readButton: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: colors.primary,
        },
        readButtonText: {
            fontWeight: "600",
        },
        statsRow: {
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: colors.card,
        },
        metaGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.md,
        },
        genres: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.xs,
        },
        genreChip: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xxs,
            borderRadius: radius.sm,
        },
        genreText: {
            fontSize: 12,
            fontWeight: "600",
        },
        chaptersHeading: {
            fontSize: 16,
            fontWeight: "700",
            marginTop: spacing.xs,
        },
    });
}
