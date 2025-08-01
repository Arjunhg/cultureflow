import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
    Icon: React.ReactNode;
    heading: string;
    description?: string;
    link: string;
}

const FeatureCard = ({ Icon, heading, description, link }: Props) => {
    return (
        <Link
            href={link}
            className="group p-8 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
        >
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20 w-fit">
                    {Icon}
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                        {heading}
                    </h3>
                    {description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 group-hover:gap-3 transition-all duration-300">
                <span className="text-sm font-medium">Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"/>
            </div>
        </Link>
    );
}

export default FeatureCard;