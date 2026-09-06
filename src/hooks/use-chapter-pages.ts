import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { fetch } from "expo/fetch";
import { parse } from "node-html-parser";
import { Image as RNImage } from "react-native";

export type Page = { uri: string; width: number; height: number };

export function useChapterPages(chapterUrl: string) {
    const referer = `${new URL(chapterUrl).origin}/`;
    const { data, isLoading, error } = useQuery({
        queryKey: ["chapter", chapterUrl],
        queryFn: ({ signal }) => getChapterPages(chapterUrl, signal),
        staleTime: 1000 * 60 * 60,
    });

    return { pages: data, referer, isLoading, error };
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
