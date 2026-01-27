import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "default" | "lg"
}

export function Spinner({ size = "default", className, ...props }: SpinnerProps) {
    return (
        <div className={cn("flex items-center justify-center", className)} {...props}>
            <Loader2
                className={cn(
                    "animate-spin text-primary",
                    size === "sm" && "h-4 w-4",
                    size === "default" && "h-5 w-5",
                    size === "lg" && "h-8 w-8"
                )}
            />
        </div>
    )
}
