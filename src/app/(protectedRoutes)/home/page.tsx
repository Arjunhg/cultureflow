import {TrendingUp, Users, Brain, Target, Palette, Calendar, MessageSquare, Sparkles } from "lucide-react";
import FeatureCard from "./_components/FeatureCard";
import FeatureSectionLayout from "./_components/FeatureSectionLayout";
import Image from "next/image";
import { potentialCustomer } from "@/lib/data";
import UserInfoCard from "@/components/ui/ReusableComponents/UserInfoCard";

const HomePage = () => {
    return (
        <div className="w-full mx-auto h-full space-y-12 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden min-h-screen">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-20">
                    <Brain className="w-16 h-16 text-purple-600 rotate-12" />
                </div>
                <div className="absolute top-40 right-32">
                    <Target className="w-12 h-12 text-pink-600 -rotate-12" />
                </div>
                <div className="absolute top-60 left-1/4">
                    <Palette className="w-14 h-14 text-indigo-500 rotate-45" />
                </div>
                <div className="absolute bottom-40 right-20">
                    <MessageSquare className="w-18 h-18 text-purple-500 -rotate-12" />
                </div>
                <div className="absolute bottom-60 left-16">
                    <Sparkles className="w-10 h-10 text-pink-400 rotate-12" />
                </div>
            </div>
            
            <div className="relative z-10 p-6">
            {/* Hero Section */}
            <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-12">
                <div className="space-y-8 flex-1">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm">
                            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400"/>
                            <span className="text-sm font-medium text-slate-700 dark:text-purple-300">Cultural Intelligence Sales Platform</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-pink-600 dark:from-purple-100 dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent leading-tight">
                            Transform Sales Through Cultural Intelligence
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-purple-400 max-w-2xl">
                            Leverage AI-powered cultural insights and personalized sales conversations to understand prospect preferences and maximize conversion rates.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 place-content-center w-full lg:w-auto">
                    <FeatureCard
                        Icon={<Brain className="w-12 h-12 text-purple-600 dark:text-purple-400"/>}
                        heading="Cultural AI Agents"
                        description="Intelligent voice conversations that understand cultural nuances and preferences"
                        link="#"
                    />
                    <FeatureCard
                        Icon={<Palette className="w-12 h-12 text-pink-600 dark:text-pink-400"/>}
                        heading="Taste Intelligence"
                        description="AI-powered cultural profiling that adapts sales approaches to prospect preferences"
                        link="/ai-agents"
                    />
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-purple-500/20">
                            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400"/>
                        </div>
                        <div>
                            {/* <p className="text-2xl font-bold text-slate-800 dark:text-purple-100">250K+</p> */}
                            <p className="text-sm text-slate-600 dark:text-purple-300">Cultural Profiles</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-500/10 to-indigo-500/10 border border-pink-200/30 dark:border-pink-700/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-pink-500/20">
                            <Target className="w-6 h-6 text-pink-600 dark:text-pink-400"/>
                        </div>
                        <div>
                            {/* <p className="text-2xl font-bold text-slate-800 dark:text-pink-100">94%</p> */}
                            <p className="text-sm text-slate-600 dark:text-pink-300">Conversion Increase</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30 dark:border-indigo-700/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/20">
                            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/>
                        </div>
                        <div>
                            {/* <p className="text-2xl font-bold text-slate-800 dark:text-indigo-100">4.8x</p> */}
                            <p className="text-sm text-slate-600 dark:text-indigo-300">Cultural Engagement ROI</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FeatureSectionLayout
                    heading="Cultural Sales Intelligence"
                    link="/cultural-insights"
                >
                    <div className="p-6 flex flex-col gap-6 items-start border rounded-3xl border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300">
                        <div className="w-full flex justify-between items-center gap-3"> 
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">Cultural Conversions</p>
                            <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                                <p className="text-sm font-medium text-purple-700 dark:text-purple-400">147</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 items-start w-full">
                            {
                                Array.from({length: 3}).map((_, index) => (
                                    <div key={index} className="w-full group hover:scale-105 transition-all duration-300">
                                        <Image
                                            src='/featurecard.png'
                                            alt='Cultural intelligence card'
                                            width={250}
                                            height={250}
                                            className="w-full h-full object-cover rounded-2xl shadow-lg"
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </FeatureSectionLayout>

                <FeatureSectionLayout
                    heading='Cultural Sales Pipeline'
                    link='/sales-pipeline'
                >
                    <div className="flex gap-4 items-center h-full w-full justify-center relative flex-wrap">
                        {
                            potentialCustomer.slice(0, 2).map((customer, index) => (
                                <UserInfoCard
                                    customer={customer}
                                    tags={customer.tags}
                                    key={index}
                                />
                            ))
                        }

                        <Image
                            src={'/glowCard.png'}
                            alt='Info-card'
                            width={350}
                            height={350}
                            className="object-cover rounded-3xl absolute px-25 mb-28 hidden sm:flex backdrop-blur-[20px] shadow-2xl"
                        />
                    </div>
                </FeatureSectionLayout>
            </div>
            </div>
        </div>
    )
}

export default HomePage;