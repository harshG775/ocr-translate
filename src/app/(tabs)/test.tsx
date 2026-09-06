import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { fetch } from "expo/fetch";
import { parse } from "node-html-parser";
import { Image as RNImage, useWindowDimensions } from "react-native";

const chapterUrl = "https://asurascans.com/comics/the-regressed-mercenarys-machinations-08677664/chapter/2";

type Page = { uri: string; width: number; height: number };

function ReaderPage({ page, referer, screenWidth }: { page: Page; referer: string; screenWidth: number }) {
    const height = screenWidth * (page.height / page.width);

    return (
        <Image
            source={{ uri: page.uri, headers: { Referer: referer } }}
            style={{ width: screenWidth, height }}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={page.uri}
        />
    );
}

export default function Test() {
    const referer = `${new URL(chapterUrl).origin}/`;
    const { width: screenWidth } = useWindowDimensions();
    const { data, isLoading, error } = useQuery({
        queryKey: ["chapter", chapterUrl],
        queryFn: ({ signal }) => getChapterPages(chapterUrl, signal),
        staleTime: 1000 * 60 * 60,
    });

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ThemedText>Loading chapter…</ThemedText>
            </ThemedView>
        );
    }

    if (error || !data?.length) {
        return (
            <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ThemedText>Couldn't load this chapter.</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <FlashList
                data={data}
                keyExtractor={(page) => page.uri}
                renderItem={({ item }) => <ReaderPage page={item} referer={referer} screenWidth={screenWidth} />}
                contentContainerStyle={{ gap: 2 }}
                showsVerticalScrollIndicator={false}
            />
        </ThemedView>
    );
}

async function getChapterPages(chapterUrl: string, signal: AbortSignal): Promise<Page[]> {
    const referer = `${new URL(chapterUrl).origin}/`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36",
        Referer: referer,
    };

    const res = await fetch(chapterUrl, { signal, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching chapter`);

    const root = parse(await res.text());
    const uris = root
        .querySelectorAll("img")
        .filter((img) => /^Page \d+/.test(img.getAttribute("alt") ?? ""))
        .map((img) => img.getAttribute("src") ?? "")
        .filter(Boolean);

    // Warm the cache so the actual render reads from disk instead of the network.
    Image.prefetch(uris, { headers, cachePolicy: "memory-disk" });

    const pages = await Promise.allSettled(
        uris.map(async (uri): Promise<Page> => {
            const { width, height } = await RNImage.getSizeWithHeaders(uri, headers);
            return { uri, width, height };
        }),
    );

    return pages.flatMap((page) => (page.status === "fulfilled" ? [page.value] : []));
}
