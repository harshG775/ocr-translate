import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/media/$slug/$chapterSlug/")({
    component: RouteComponent,
})

const pages = Array.from({ length: 10 }, (_, index) => index + 1)

function RouteComponent() {
    const { slug, chapterSlug } = Route.useParams()
    const [, ...titleParts] = slug.split("-")
    const [, chapter] = chapterSlug.split("-")
    const title = titleParts.join("-")

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="flex items-center gap-3 px-4 py-3">
                <Button variant="ghost" size="icon" render={<Link to="/media/$slug" params={{ slug }} />}>
                    <ArrowLeft />
                </Button>
                <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">Chapter {chapter}</p>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-2 px-4 pb-4">
                {pages.map((page) => (
                    <div key={page} className="flex aspect-2/3 items-center justify-center rounded-lg bg-muted">
                        <ImageIcon className="size-8 text-muted-foreground" />
                    </div>
                ))}
            </main>
        </div>
    )
}
