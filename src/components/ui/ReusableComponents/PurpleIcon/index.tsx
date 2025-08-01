import { cn } from "@/lib/utils";
import React from "react";

type Props = {
    className?: string;
    children: React.ReactNode;
}

const PurpleIcon = ({ className, children }: Props) => {
    return (
        <div className={cn('p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-300', className)}>
            {children}
        </div>
    )
}

export default PurpleIcon;