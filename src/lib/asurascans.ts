import { fetch } from "expo/fetch";
import { parse } from "node-html-parser";

const BASE_URL = "https://asurascans.com";

export type LatestChapter = {
    id: number;
    number: number;
    name: string;
    timeAgo: string;
    publishedAt: string;
};

export type LatestSeries = {
    id: string;
    slug: string;
    title: string;
    cover: string;
    type: string;
    publicUrl: string;
    chapters: LatestChapter[];
};

export type SeriesGenre = {
    id: number;
    name: string;
    slug: string;
};

export type SeriesDetails = {
    id: string;
    slug: string;
    title: string;
    description: string;
    cover: string;
    rating: number;
    bookmarkCount: number;
    status: string;
    type: string;
    author: string;
    artist: string;
    genres: SeriesGenre[];
    chapterCount: number;
};

export type SeriesChapter = {
    id: number;
    number: number;
    slug: string;
    pageCount: number;
    isPremium: boolean;
    publishedAt: string;
    timeAgo: string;
    url: string;
};

type RawLatestChapter = {
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

type RawSeriesDescription = {
    title: string;
    description: string;
    coverUrl: string;
    rating: number;
    bookmarkCount: number;
    status: string;
    type: string;
    author: string;
    artist: string;
    genres: SeriesGenre[];
    chapterCount: number;
};

type RawChapterList = {
    chapters: {
        id: number;
        number: number;
        slug: string;
        page_count: number;
        is_premium: boolean;
        published_at: string;
        time_ago: string;
    }[];
    seriesSlug: string;
    totalChapters: number;
    coverUrl: string;
    publicUrl: string;
};

function defaultHeaders() {
    return {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36",
        Referer: `${BASE_URL}/`,
    };
}

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

// Finds the <astro-island> that hydrates the given component and decodes its props.
function extractIslandProps(html: string, componentName: string): any {
    const marker = `component-url="/_astro/${componentName}`;
    const markerIndex = html.indexOf(marker);
    if (markerIndex === -1) return null;

    const islandStart = html.lastIndexOf("<astro-island", markerIndex);
    const islandEnd = html.indexOf("</astro-island>", markerIndex);
    const propsMatch = html.slice(islandStart, islandEnd).match(/props="([^"]*)"/);
    if (!propsMatch) return null;

    const props: Record<string, unknown> = JSON.parse(propsMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));

    const decoded: Record<string, unknown> = {};
    for (const key of Object.keys(props)) decoded[key] = decodeAstroValue(props[key]);
    return decoded;
}

// The props attribute is HTML-escaped once for the attribute itself, but the
// description field inside it is HTML source that was escaped again for JSON storage
// (e.g. "&amp;lt;p&amp;gt;"), so after the outer unescape its markup is still literal text.
function decodeHtmlEntities(text: string): string {
    return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function stripHtml(html: string): string {
    const withBreaks = decodeHtmlEntities(html).replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n");
    return parse(withBreaks).textContent.trim();
}

// The last path segment of a comic's public URL (e.g. "the-former-supreme-08677664")
// doubles as the id the detail page is fetched by.
function idFromPublicUrl(publicUrl: string): string {
    return publicUrl.split("/").filter(Boolean).pop() ?? publicUrl;
}

export function chapterReaderUrl(mediaId: string, chapterNumber: number): string {
    return `${BASE_URL}/comics/${mediaId}/chapter/${chapterNumber}`;
}

export async function fetchLatestUpdates(page: number, signal?: AbortSignal): Promise<LatestSeries[]> {
    const url = page > 1 ? `${BASE_URL}/?page=${page}` : `${BASE_URL}/`;
    const res = await fetch(url, { signal, headers: defaultHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching latest updates`);

    const html = await res.text();
    const chapters = extractIslandProps(html, "LatestUpdates")?.chapters as RawLatestChapter[] | undefined;
    if (!chapters) return [];

    const seriesBySlug = new Map<string, LatestSeries>();
    for (const chapter of chapters) {
        let series = seriesBySlug.get(chapter.comic_slug);
        if (!series) {
            series = {
                id: idFromPublicUrl(chapter.comic_public_url),
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

export async function fetchSeriesDetails(
    mediaId: string,
    signal?: AbortSignal,
): Promise<{ details: SeriesDetails; chapters: SeriesChapter[] }> {
    const url = `${BASE_URL}/comics/${mediaId}`;
    const res = await fetch(url, { signal, headers: defaultHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching series details`);

    const html = await res.text();
    const description = extractIslandProps(html, "DescriptionModal") as RawSeriesDescription | null;
    const chapterList = extractIslandProps(html, "ChapterListReact") as RawChapterList | null;
    if (!description || !chapterList) throw new Error("Couldn't find series data on the page");

    const details: SeriesDetails = {
        id: mediaId,
        slug: chapterList.seriesSlug,
        title: description.title,
        description: stripHtml(description.description),
        cover: description.coverUrl,
        rating: description.rating,
        bookmarkCount: description.bookmarkCount,
        status: description.status,
        type: description.type,
        author: description.author,
        artist: description.artist,
        genres: description.genres,
        chapterCount: description.chapterCount,
    };

    const chapters: SeriesChapter[] = chapterList.chapters.map((chapter) => ({
        id: chapter.id,
        number: chapter.number,
        slug: chapter.slug,
        pageCount: chapter.page_count,
        isPremium: chapter.is_premium,
        publishedAt: chapter.published_at,
        timeAgo: chapter.time_ago,
        url: chapterReaderUrl(mediaId, chapter.number),
    }));

    return { details, chapters };
}
