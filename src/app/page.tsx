import Link from "next/link";
import { ArrowRight, Play, Users, TrendingUp, Brain, Target, Palette, MessageSquare, Sparkles, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
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
        <div className="absolute top-1/3 right-1/4">
          <Users className="w-20 h-20 text-indigo-400 rotate-6" />
        </div>
        <div className="absolute bottom-1/3 left-1/3">
          <Zap className="w-8 h-8 text-purple-600 -rotate-45" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:p-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-200/30 dark:border-purple-700/30">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-purple-100">CultureFlow</span>
        </div>
        <Link 
          href="/sign-in"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-200/40 dark:border-purple-700/40 text-slate-800 dark:text-purple-100 font-medium hover:scale-105 transition-all duration-300 backdrop-blur-sm hover:from-purple-500/25 hover:to-pink-500/25"
        >
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 lg:px-20 text-center space-y-12 relative z-10">
        <div className="space-y-8 max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-200/40 dark:border-purple-700/40 backdrop-blur-sm">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-purple-200">Cultural Intelligence Sales & Business Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-pink-600 dark:from-purple-100 dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent leading-tight">
            Transform Sales Through
            <span className="block">Cultural Intelligence</span>
          </h1>

          {/* Description */}
          <p className="text-xl lg:text-2xl text-slate-600 dark:text-purple-300 max-w-3xl mx-auto leading-relaxed">
            Revolutionize your sales approach with AI-powered cultural insights. Understand prospects' tastes, preferences, and cultural contexts to create deeply personalized business conversations that drive results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/sign-up"
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
            >
              Start Selling Culturally
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <button className="group px-8 py-4 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 bg-purple-50/50 dark:bg-purple-900/30 backdrop-blur-sm text-slate-800 dark:text-purple-100 font-semibold hover:bg-purple-100/60 dark:hover:bg-purple-900/50 transition-all duration-300 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          <div className="text-center space-y-2 p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-slate-800 dark:text-purple-100">250K+</div>
            <div className="text-slate-600 dark:text-purple-300">Cultural Profiles Analyzed</div>
          </div>
          <div className="text-center space-y-2 p-6 rounded-2xl bg-pink-50/50 dark:bg-pink-900/20 border border-pink-200/30 dark:border-pink-700/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-slate-800 dark:text-pink-100">94%</div>
            <div className="text-slate-600 dark:text-pink-300">Sales Conversion Increase</div>
          </div>
          <div className="text-center space-y-2 p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200/30 dark:border-indigo-700/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-slate-800 dark:text-indigo-100">4.8x</div>
            <div className="text-slate-600 dark:text-indigo-300">Cultural Engagement ROI</div>
          </div>
        </div>

        {/* Waitlist */}
        {/* <div className="pt-12">
          <Waitlist />
        </div> */}
      </main>

      {/* Features Preview */}
      <section className="py-20 px-6 lg:px-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-purple-100">
              Cultural Intelligence Sales Experience
            </h2>
            <p className="text-lg text-slate-600 dark:text-purple-300 max-w-2xl mx-auto">
              From AI-powered cultural profiling to personalized sales conversations, we deliver the future of sales intelligence with deep understanding of cultural preferences and behaviors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-purple-50/60 dark:bg-purple-900/20 backdrop-blur-sm border border-purple-200/40 dark:border-purple-700/40 hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <div className="p-4 rounded-2xl bg-purple-500/15 dark:bg-purple-500/20 w-fit mb-6">
                <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-purple-100 mb-4">Cultural AI Agents</h3>
              <p className="text-slate-600 dark:text-purple-300">Intelligent voice conversations that understand cultural nuances and adapt sales approaches in real-time based on prospect preferences.</p>
            </div>

            <div className="p-8 rounded-3xl bg-pink-50/60 dark:bg-pink-900/20 backdrop-blur-sm border border-pink-200/40 dark:border-pink-700/40 hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <div className="p-4 rounded-2xl bg-pink-500/15 dark:bg-pink-500/20 w-fit mb-6">
                <Target className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-pink-100 mb-4">Taste Intelligence</h3>
              <p className="text-slate-600 dark:text-pink-300">AI-powered analytics that decode prospect preferences, cultural affinities, and behavioral patterns to optimize sales strategies.</p>
            </div>

            <div className="p-8 rounded-3xl bg-indigo-50/60 dark:bg-indigo-900/20 backdrop-blur-sm border border-indigo-200/40 dark:border-indigo-700/40 hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <div className="p-4 rounded-2xl bg-indigo-500/15 dark:bg-indigo-500/20 w-fit mb-6">
                <Palette className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-indigo-100 mb-4">Personalized Experiences</h3>
              <p className="text-slate-600 dark:text-indigo-300">Create deeply personalized sales experiences that resonate with each prospect&apos;s unique cultural background and preferences.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
