import { createFileRoute } from "@tanstack/react-router"
import { ImageIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export const Route = createFileRoute("/_tabs/history")({
    component: RouteComponent,
})

const items = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    title: `Manga title ${index + 1}`,
}))

function RouteComponent() {
    return (
        <main className="px-4 py-3">
            <section className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {items.map((item) => (
                    <Card key={item.id} className="gap-2 pt-0">
                        <div className="flex aspect-2/3 items-center justify-center rounded-t-xl bg-muted">
                            <ImageIcon className="size-8 text-muted-foreground" />
                        </div>
                        <CardContent className="px-2">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </main>
    )
}
