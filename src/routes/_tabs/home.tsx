import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_tabs/home")({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/_tabs/home"!</div>
}
