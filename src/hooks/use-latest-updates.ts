import { fetchLatestUpdates } from "@/lib/asurascans";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useLatestUpdates() {
    const query = useInfiniteQuery({
        queryKey: ["latest-updates"],
        queryFn: ({ pageParam, signal }) => fetchLatestUpdates(pageParam, signal),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length === 0) return undefined;

            // Out-of-range pages silently fall back to page 1's data instead of
            // erroring, so detect the wraparound instead of trusting an empty page.
            const firstPage = allPages[0];
            if (lastPageParam > 1 && firstPage[0]?.slug === lastPage[0]?.slug) return undefined;

            return lastPageParam + 1;
        },
        staleTime: 1000 * 60 * 5,
    });

    const series = query.data?.pages.flat() ?? [];

    return { ...query, series };
}
