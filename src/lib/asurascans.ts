import { fetch } from "expo/fetch";

const BASE_URL = "https://asurascans.com";

export type LatestChapter = {
    id: number;
    number: number;
    name: string;
    timeAgo: string;
    publishedAt: string;
};

export type LatestSeries = {
    slug: string;
    title: string;
    cover: string;
    type: string;
    publicUrl: string;
    chapters: LatestChapter[];
};

type RawChapter = {
    id: number;
    number: number;
    name: string;
    published_at: string;
    time_ago: string;
    comic_name: string;
    comic_slug: string;
    comic_public_url: string;
    comic_cover: string;
    type: string;
};

// Astro serializes island props as [tag, payload] pairs instead of plain JSON values:
// tag 0 is a raw value (or undefined when the payload is omitted), tag 1 is an array
// whose entries are themselves [tag, payload] pairs.
function decodeAstroValue(node: unknown): any {
    if (!Array.isArray(node)) return node;
    if (node.length === 1) return undefined;

    const [tag, payload] = node;
    if (tag === 1 && Array.isArray(payload)) return payload.map(decodeAstroValue);

    if (tag === 0 && payload && typeof payload === "object" && !Array.isArray(payload)) {
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(payload)) out[key] = decodeAstroValue((payload as Record<string, unknown>)[key]);
        return out;
    }

    return payload;
}

export async function fetchLatestUpdates(page: number, signal?: AbortSignal): Promise<LatestSeries[]> {
    const url = page > 1 ? `${BASE_URL}/?page=${page}` : `${BASE_URL}/`;
    const res = await fetch(url, {
        signal,
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36",
            Referer: `${BASE_URL}/`,
        },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} fetching latest updates`);

    const html = await res.text();
    const markerIndex = html.indexOf("LatestUpdates");
    if (markerIndex === -1) return [];

    const islandStart = html.lastIndexOf("<astro-island", markerIndex);
    const islandEnd = html.indexOf("</astro-island>", markerIndex);
    const propsMatch = html.slice(islandStart, islandEnd).match(/props="([^"]*)"/);
    if (!propsMatch) return [];

    const props = JSON.parse(propsMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
    const chapters = decodeAstroValue(props.chapters) as RawChapter[];

    const seriesBySlug = new Map<string, LatestSeries>();
    for (const chapter of chapters) {
        let series = seriesBySlug.get(chapter.comic_slug);
        if (!series) {
            series = {
                slug: chapter.comic_slug,
                title: chapter.comic_name,
                cover: chapter.comic_cover,
                type: chapter.type,
                publicUrl: chapter.comic_public_url,
                chapters: [],
            };
            seriesBySlug.set(chapter.comic_slug, series);
        }
        series.chapters.push({
            id: chapter.id,
            number: chapter.number,
            name: chapter.name,
            timeAgo: chapter.time_ago,
            publishedAt: chapter.published_at,
        });
    }

    return [...seriesBySlug.values()];
}
