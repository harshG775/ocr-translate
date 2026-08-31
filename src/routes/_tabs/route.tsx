import { createFileRoute, Link, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_tabs")({
    component: RouteComponent,
})

type NavItem = {
    label: string
    to: string
    badge?: number
}

const navItems: NavItem[] = [
    { label: "History", to: "/home" },
    { label: "Favourites", to: "/favourites" },
    { label: "Explore", to: "/explore" },
    { label: "Feed", to: "/feed", badge: 6 },
    { label: "Suggestions", to: "/suggestions" },
]

function RouteComponent() {
    return (
        <>
            <nav>
                {navItems.map((item) => (
                    // `to` is cast because most of these routes don't exist yet
                    <Link key={item.to} to={item.to as "/home"}>
                        <span>{item.label}</span>
                        {item.badge != null && <span>{item.badge}</span>}
                    </Link>
                ))}
            </nav>
            <Outlet />
        </>
    )
}
