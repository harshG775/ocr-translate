import { createFileRoute, useRouter } from "@tanstack/react-router"
import { ArrowLeft, Download, ImageIcon, MoreVertical, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const Route = createFileRoute("/media/$slug/$chapterSlug/")({
    component: RouteComponent,
})

const pages = Array.from({ length: 10 }, (_, index) => index + 1)

function RouteComponent() {
    const router = useRouter()
    const { slug, chapterSlug } = Route.useParams()
    const [, ...titleParts] = slug.split("-")
    const [, chapter] = chapterSlug.split("-")
    const title = titleParts.join("-")

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="flex items-center gap-2 px-4 py-3">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                        router.history.canGoBack()
                            ? router.history.back()
                            : router.navigate({ to: "/media/$slug", params: { slug } })
                    }
                >
                    <ArrowLeft />
                </Button>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">Chapter {chapter}</p>
                </div>
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
                        <DropdownMenuItem>Report</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
