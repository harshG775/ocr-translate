import { createFileRoute, Link } from "@tanstack/react-router"
import { ImageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export const Route = createFileRoute("/_tabs/history")({
    component: RouteComponent,
})

type MediaType = "manga" | "manhwa" | "manhua"

const mediaTypes: MediaType[] = ["manga", "manhwa", "manhua"]

const items = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    title: `Manga title ${index + 1}`,
    chapter: index + 1,
    updatedAt: `${(index + 1) * 3}m ago`,
    mediaType: mediaTypes[index % mediaTypes.length],
}))

function RouteComponent() {
    return (
        <main className="px-4 py-3">
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {items.map((item) => (
                    <Link key={item.id} to={`/media/${encodeURIComponent(`${item.id}-${item.title}`)}` as "/"}>
                        <Card className="gap-2 pt-0">
                            <div className="relative flex aspect-3/4 items-center justify-center rounded-t-xl bg-muted">
                                <ImageIcon className="size-8 text-muted-foreground" />
                                <Badge className="absolute top-1.5 left-1.5 uppercase" variant="secondary">
                                    {item.mediaType}
                                </Badge>
                            </div>
                            <CardContent className="flex flex-col gap-1 px-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Ch.{item.chapter}</span>
                                    <span>{item.updatedAt}</span>
                                </div>
                                <p className="line-clamp-2 text-sm font-semibold">{item.title}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </section>
        </main>
    )
}
