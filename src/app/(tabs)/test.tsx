import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { FlashList, useLayoutState } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { fetch } from "expo/fetch";
import { parse } from "node-html-parser";

const chapterUrl = "https://asurascans.com/comics/the-regressed-mercenarys-machinations-08677664/chapter/1";
const DEFAULT_PAGE_RATIO = 2 / 3; 
function ReaderPage({ uri, referer }: { uri: string; referer: string }) {
    const [aspectRatio, setAspectRatio] = useLayoutState(DEFAULT_PAGE_RATIO);

    return (
        <Image
            source={{ uri, headers: { Referer: referer } }}
            style={{ width: "100%", aspectRatio }}
            contentFit="cover"
            onLoad={(event) => {
                const { width, height } = event.source;
                if (width && height) setAspectRatio(width / height);
            }}
        />
    );
}

export default function Test() {
    const referer = `${new URL(chapterUrl).origin}/`;
    const { data, isLoading, error } = useQuery({
        queryKey: ["chapter", chapterUrl],
        queryFn: ({ signal }) => getChapterImages(chapterUrl, signal),
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
                keyExtractor={(uri) => uri}
                renderItem={({ item }) => <ReaderPage uri={item} referer={referer} />}
                contentContainerStyle={{ gap: 2 }}
                showsVerticalScrollIndicator={false}
            />
        </ThemedView>
    );
}

async function getChapterImages(chapterUrl: string, signal: AbortSignal): Promise<string[]> {
    const referer = `${new URL(chapterUrl).origin}/`;
    const res = await fetch(chapterUrl, {
        signal,
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36",
            Referer: referer,
        },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} fetching chapter`);

    const root = parse(await res.text());
    return root
        .querySelectorAll("img")
        .filter((img) => /^Page \d+/.test(img.getAttribute("alt") ?? ""))
        .map((img) => img.getAttribute("src") ?? "")
        .filter(Boolean);
}
