import { useRouterState } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Progress } from "#/components/ui/progress"

export function TopLoader() {
    const isNavigating = useRouterState({ select: (state) => state.status === "pending" })

    const [progress, setProgress] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (isNavigating) {
            setIsVisible(true)
            setProgress(15)

            interval = setInterval(() => {
                setProgress((prev) => {
                    const step = Math.max(1, (85 - prev) / 10)
                    return Math.min(prev + step, 85)
                })
            }, 200)
        } else {
            setProgress(100)

            const timeout = setTimeout(() => {
                setIsVisible(false)
                setTimeout(() => setProgress(0), 200)
            }, 300)

            return () => clearTimeout(timeout)
        }

        return () => clearInterval(interval)
    }, [isNavigating])

    if (!isVisible && progress === 0) return null

    return (
        <div className="fixed left-0 top-0 z-100 w-full pointer-events-none">
            <Progress
                value={progress}
                className={`h-1 w-full rounded-none bg-transparent transition-opacity ${
                    isVisible ? "opacity-100 duration-300" : "opacity-0 duration-500"
                }`}
            />
        </div>
    )
}
