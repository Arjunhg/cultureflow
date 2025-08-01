'use client';

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
// import { User } from "@prisma/client";
import { User } from "@prisma/client"
import { ArrowLeft, Brain } from "lucide-react";
import CreateWebinarButton from "../CreateWebinarButton";
import { Assistant } from "@vapi-ai/server-sdk/api";
import { useEffect, useState } from "react";

type Props = {
    user: User
    assistants: Assistant[] | []
}

const Header = ( {assistants}: Props ) => {
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        }
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return(
        <div className={`w-full px-6 pt-8 sticky top-0 gap-6 flex flex-wrap items-center justify-between p-1 z-50 transition-all duration-300 ${
            scrolled 
                ? 'bg-purple-900/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-purple-200/20 dark:border-purple-700/30 shadow-lg' 
                : 'bg-transparent border-b border-transparent'
        }`}>
            {
                pathname.includes('pipeline') ? (
                    <Button
                        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-200/30 dark:border-purple-700/30 rounded-2xl hover:scale-105 transition-all duration-300 hover:shadow-lg backdrop-blur-sm"
                        variant={'outline'}
                        onClick={() => router.push('/webinar')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2"/> Back to Cultural Meetings
                    </Button>
                ) : (
                    <div className="px-6 py-3 flex justify-center text-bold items-center rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-200/30 dark:border-purple-700/30 text-slate-800 dark:text-purple-100 capitalize backdrop-blur-sm shadow-lg">
                        <Brain className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400"/>
                        {pathname.split('/')[1] === 'candidate' ? 'prospects' : pathname.split('/')[1]}
                    </div>
                )
            }

            <div className="flex gap-4 items-center flex-wrap">
                <CreateWebinarButton assistants={assistants}/>
            </div>
        </div>
    )
}

export default Header;