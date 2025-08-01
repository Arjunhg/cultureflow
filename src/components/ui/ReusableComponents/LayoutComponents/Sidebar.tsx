'use client';

import { Triangle } from "lucide-react";
import { sidebarData } from "@/lib/data";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const Sidebar = () => {

    const pathname = usePathname();

    return (
        <div
            className="w-20 sm:w-24 h-screen sticky top-0 py-8 px-3 sm:px-4 border-r border-white/20 bg-white/10 backdrop-blur-xl flex flex-col items-center justify-start gap-8"
        >

            <div className="cursor-pointer w-fit h-fit flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 border border-white/20 hover:scale-105 transition-all duration-300 hover:shadow-lg">
                <Triangle className="w-6 h-6 text-purple-600 dark:text-purple-400"/>
            </div>

            <div className="w-full h-full justify-between items-center flex flex-col">

                <div
                    className="w-full h-fit flex flex-col items-center justify-start gap-3"
                >
                    {
                    sidebarData.map((item) => (
                            <TooltipProvider key={item.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link 
                                            href={item.link}
                                            className={`flex hover:bg-white/20 items-center gap-3 cursor-pointer rounded-2xl p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                                                pathname.includes(item.link) 
                                                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-white/30 shadow-lg' 
                                                    : 'hover:border-white/20 border border-transparent'
                                            }`}
                                        >
                                            <item.icon
                                                className={`w-5 h-5 transition-all duration-300 ${
                                                    pathname.includes(item.link) 
                                                        ? 'text-purple-600 dark:text-purple-400' 
                                                        : 'text-gray-600 dark:text-gray-400 opacity-80'
                                                }`}
                                            />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side='right' className="bg-white/90 backdrop-blur-sm border border-white/20">
                                        <span className="text-sm font-medium text-gray-800">{item.title}</span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))
                    }
                </div>

                <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <UserButton appearance={{
                        elements: {
                            avatarBox: "w-10 h-10 rounded-xl"
                        }
                    }}/>
                </div>
            </div>
        </div>
    )
}


export default Sidebar;