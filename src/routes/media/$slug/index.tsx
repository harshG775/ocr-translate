import { Button } from "#/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "#/components/ui/dropdown-menu"
import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { ArrowLeft, Download, MoreVertical, Share2 } from "lucide-react"

export const Route = createFileRoute("/media/$slug/")({
    component: RouteComponent,
})

function RouteComponent() {
    const router = useRouter()
    const { slug } = Route.useParams()
    const [id, ...rest] = slug.split("-")
    const title = rest.join("-")

    return (
        <>
            <header className="flex items-center gap-2 px-4 py-3">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/" }))}
                >
                    <ArrowLeft />
                </Button>
                <div className="min-w-0 flex-1"></div>
                <Button variant="ghost" size="icon-sm">
                    <Share2 />
                </Button>
                <Button variant="ghost" size="icon-sm">
                    <Download />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <MoreVertical />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Tracking</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main className="px-4 py-3">
                <p className="text-sm text-muted-foreground">ID: {id}</p>
                <h1 className="text-lg font-semibold">{title}</h1>
                <Button
                    nativeButton={false}
                    render={<Link to="/media/$slug/$chapterSlug" params={{ slug, chapterSlug: "chapter-1" }} />}
                >
                    Read
                </Button>
            </main>
        </>
    )
}
