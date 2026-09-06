import { fetchSeriesDetails } from "@/lib/asurascans";
import { useQuery } from "@tanstack/react-query";

export function useSeriesDetails(mediaId: string) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["series", mediaId],
        queryFn: ({ signal }) => fetchSeriesDetails(mediaId, signal),
        staleTime: 1000 * 60 * 60,
    });

    return { details: data?.details, chapters: data?.chapters, isLoading, error };
}
