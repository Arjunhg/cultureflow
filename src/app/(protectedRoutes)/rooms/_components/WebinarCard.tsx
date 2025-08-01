import { Webinar } from '@prisma/client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Calendar, GitFork, Play, Eye, Clock } from 'lucide-react'

type Props = {
  webinar: Webinar
}

const WebinarCard = ({ webinar }: Props) => {
  return (
    <div className="group flex gap-4 flex-col items-start w-full">
      <Link href={`/live-webinar/${webinar?.id}`} className="w-full max-w-[400px] relative overflow-hidden rounded-3xl">
        <div className="relative">
          <Image
            src="/LiveTalent.png"
            alt="webinar"
            width={400}
            height={300}
            className="w-full h-[200px] object-cover rounded-3xl group-hover:scale-105 transition-all duration-300 shadow-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Play className="w-6 h-6 text-white" fill="white"/>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="w-full flex justify-between gap-4 items-start">
        <Link href={`/live-webinar/${webinar?.id}`} className="flex flex-col gap-3 items-start flex-1">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              {webinar?.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {webinar?.description}
            </p>
          </div>

          <div className="flex gap-3 justify-start items-center">
            <div className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              <Calendar size={14} />
              <p>{format(new Date(webinar?.startTime), 'dd/MM/yyyy')}</p>
            </div>
            <div className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              <Clock size={14} />
              <p>{format(new Date(webinar?.startTime), 'HH:mm')} UTC</p>
            </div>
            <div className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              <Eye size={14} />
              <p>1.2K views</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/webinars/${webinar?.id}/pipeline`}
          className="flex p-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <GitFork className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </Link>
      </div>
    </div>
  )
}

export default WebinarCard
