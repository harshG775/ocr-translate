import { Button } from "#/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "#/components/ui/dropdown-menu"
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router"
import { Compass, History, ListFilter, MoreVertical, Search, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const Route = createFileRoute("/_tabs")({
    component: RouteComponent,
})

type MenuItem = {
    label: string
    icon: LucideIcon
}

type NavItem = {
    label: string
    to: string
    icon: LucideIcon
    menuItems: MenuItem[]
}

const navItems: NavItem[] = [
    {
        label: "History",
        to: "/History",
        icon: History,
        menuItems: [
            { label: "List options", icon: ListFilter },
            { label: "Settings", icon: Settings },
        ],
    },
    {
        label: "Explore",
        to: "/explore",
        icon: Compass,
        menuItems: [{ label: "Settings", icon: Settings }],
    },
]

function RouteComponent() {
    const location = useLocation()
    const menuItems = navItems.find((item) => item.to === location.pathname)?.menuItems ?? []

    return (
        <div className="h-dvh w-full flex flex-col">
            <header className="flex items-center gap-2 px-4 py-3">
                <div className="flex flex-1 items-center gap-3 rounded-full bg-muted px-4 py-2.5">
                    <Search className="size-5 shrink-0 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search manga"
                        className="w-full bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground outline-none"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                        <MoreVertical />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {menuItems.map((item) => (
                            <DropdownMenuItem key={item.label}>
                                <item.icon />
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <Outlet />

            <nav className="px-4 py-3 bg-muted">
                <div className="max-w-sm mx-auto flex items-center justify-evenly">
                    {navItems.map((item) => (
                        <Link key={item.to} to={item.to} className="relative flex flex-col items-center">
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}
