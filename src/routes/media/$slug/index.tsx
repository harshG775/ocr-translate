import { Button } from "#/components/ui/button"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/media/$slug/")({
    component: RouteComponent,
})

function RouteComponent() {
    const { slug } = Route.useParams()
    const [id, ...rest] = slug.split("-")
    const title = rest.join("-")

    return (
        <main className="px-4 py-3">
            <p className="text-sm text-muted-foreground">ID: {id}</p>
            <h1 className="text-lg font-semibold">{title}</h1>
            <Button render={<Link to="/media/$slug/$chapterSlug" params={{ slug, chapterSlug: "chapter-1" }} />}>
                Read
            </Button>
        </main>
    )
}
