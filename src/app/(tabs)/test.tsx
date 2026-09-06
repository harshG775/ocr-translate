import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useChapterPages, type Page } from "@/hooks/use-chapter-pages";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, useWindowDimensions } from "react-native";

const chapterUrl = "https://asurascans.com/comics/the-regressed-mercenarys-machinations-08677664/chapter/4";

function ReaderPage({ page, referer, screenWidth }: { page: Page; referer: string; screenWidth: number }) {
    const height = screenWidth * (page.height / page.width);
    const [loading, setLoading] = useState(true);

    return (
        <ThemedView style={{ width: screenWidth, height }}>
            <Image
                source={{ uri: page.uri, headers: { Referer: referer } }}
                style={{ width: screenWidth, height }}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={page.uri}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
            />
            {loading && <ActivityIndicator style={{ position: "absolute", top: 24, left: 0, right: 0 }} size="large" />}
        </ThemedView>
    );
}

export default function Test() {
    const { width: screenWidth } = useWindowDimensions();
    const { pages, referer, isLoading, error } = useChapterPages(chapterUrl);

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ThemedText>Loading chapter…</ThemedText>
            </ThemedView>
        );
    }

    if (error || !pages?.length) {
        return (
            <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ThemedText>Couldn't load this chapter.</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <FlashList
                data={pages}
                keyExtractor={(page) => page.uri}
                renderItem={({ item }) => <ReaderPage page={item} referer={referer} screenWidth={screenWidth} />}
                contentContainerStyle={{ gap: 2 }}
                showsVerticalScrollIndicator={false}
            />
        </ThemedView>
    );
}
