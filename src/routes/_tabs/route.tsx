import { Button } from "#/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "#/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "#/components/ui/input-group"
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router"
import { Compass, History, ListFilter, MoreVertical, Search, Settings, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { LucideIcon } from "lucide-react"
import { Badge } from "#/components/ui/badge"

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
        to: "/history",
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
                <Sheet>
                    <SheetTrigger
                        className="flex-1 flex items-center gap-1 rounded-full bg-muted px-2 text-left"
                        render={<Button variant={"ghost"} />}
                    >
                        <Search className="size-5 shrink-0 text-muted-foreground" />
                        <div className="w-full bg-transparent text-base font-semibold text-muted-foreground outline-none">
                            Search manga
                        </div>
                    </SheetTrigger>
                    <SheetContent side="top" showCloseButton={false}>
                        <SheetHeader className="sr-only">
                            <SheetTitle>Search manga</SheetTitle>
                            <SheetDescription>Search for manga by title, author, or genre.</SheetDescription>
                        </SheetHeader>
                        <div className="px-4 py-3 flex items-center gap-2">
                            <InputGroup className="flex-1 rounded-full border-0 bg-muted">
                                <InputGroupAddon>
                                    <Search className="size-5 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    type="text"
                                    placeholder="Search manga"
                                    className="text-base font-semibold"
                                />
                            </InputGroup>
                            <DropdownMenu>
                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                                    <MoreVertical />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Clear history</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="ghost" size="icon-sm">
                                <X />
                            </Button>
                        </div>
                        <div className="px-4 py-3">
                            <div className="flex gap-2">
                                {["chips", "chips", "chips", "chips"].map((item, idx) => (
                                    <Badge key={idx} variant={"secondary"}>
                                        {item}
                                    </Badge>
                                ))}
                            </div>
                            <div>{/* result */}</div>
                            <div>{/* search History */}</div>
                        </div>
                    </SheetContent>
                </Sheet>
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
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

            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>

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
