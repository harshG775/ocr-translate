import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_tabs/history")({
    component: RouteComponent,
})

function RouteComponent() {
    return <main className="flex-1 px-4 py-3">Hello "/_tabs/history"!</main>
}
