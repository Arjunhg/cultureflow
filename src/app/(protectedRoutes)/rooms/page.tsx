import { onAuthenticateUser } from '@/actions/auth'
import { getWebinarByPresenterId } from '@/actions/webinar'
import PageHeader from '@/components/ui/ReusableComponents/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HomeIcon from '@/icons/HomeIcon'
import LeadIcon from '@/icons/LeadIcon'
import { Webcam } from 'lucide-react'
import { redirect } from 'next/navigation'
import React from 'react'
import WebinarCard from './_components/WebinarCard'
import { Webinar, WebinarStatusEnum } from '@prisma/client'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{
    webinarStatus: string
  }>
}

const Page = async ({ searchParams }: Props) => {
  const { webinarStatus } = await searchParams
  const checkUser = await onAuthenticateUser()
  if (!checkUser.user) {
    redirect('/')
  }

  const webinars = await getWebinarByPresenterId(
    checkUser?.user?.id,
    webinarStatus as WebinarStatusEnum
  )

  return (
    <div className="w-full flex flex-col gap-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900 min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20">
          <Webcam className="w-16 h-16 text-emerald-600 rotate-12" />
        </div>
        <div className="absolute top-40 right-32">
          <HomeIcon className="w-12 h-12 text-teal-600 -rotate-12" />
        </div>
        <div className="absolute bottom-40 right-20">
          <LeadIcon className="w-18 h-18 text-teal-500 -rotate-12" />
        </div>
      </div>
      
      <div className="relative z-10 p-6">
      <PageHeader
        leftIcon={<HomeIcon className="w-4 h-4" />}
        mainIcon={<Webcam className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />}
        rightIcon={<LeadIcon className="w-4 h-4" />}
        heading="The home to all your virtual meetings"
      >
      </PageHeader>

      <Tabs
        defaultValue="all"
        className="w-full flex flex-col gap-8"
      >
        <TabsList className="bg-emerald-50/50 dark:bg-emerald-900/20 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-700/30 rounded-2xl p-2 space-x-2">
          <TabsTrigger
            value="all"
            className="bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/30 data-[state=active]:to-teal-500/30 px-6 py-3 rounded-xl data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 transition-all duration-300"
          >
            <Link href="/webinars?webinarStatus=all">All Webinars</Link>
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30 px-6 py-3 rounded-xl data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 transition-all duration-300"
          >
            <Link href="/webinars?webinarStatus=upcoming">Upcoming</Link>
          </TabsTrigger>
          <TabsTrigger
            value="ended"
            className="bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30 px-6 py-3 rounded-xl data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 transition-all duration-300"
          >
            <Link href="/webinars?webinarStatus=ended">Ended</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="all"
          className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 place-items-start place-content-start gap-x-8 gap-y-12"
        >
          {webinars?.length > 0 ? (
            webinars.map((webinar: Webinar, index: number) => (
              <WebinarCard
                key={index}
                webinar={webinar}
              />
            ))
          ) : (
            <div className="w-full h-[400px] flex flex-col justify-center items-center text-center col-span-full space-y-4">
              <div className="p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20">
                <Webcam className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No Rooms Found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Create your first webinar to get started with your audience engagement journey.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="upcoming">
          {webinars?.length > 0 ? (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 place-items-start place-content-start gap-x-8 gap-y-12">
              {webinars.map((webinar: Webinar, index: number) => (
                <WebinarCard
                  key={index}
                  webinar={webinar}
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-[400px] flex flex-col justify-center items-center text-center col-span-full space-y-4">
              <div className="p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20">
                <Webcam className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No Upcoming Webinars</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Schedule your next webinar to start engaging with your audience.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ended">
          {webinars?.length > 0 ? (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 place-items-start place-content-start gap-x-8 gap-y-12">
              {webinars.map((webinar: Webinar, index: number) => (
                <WebinarCard
                  key={index}
                  webinar={webinar}
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-[400px] flex flex-col justify-center items-center text-center col-span-full space-y-4">
              <div className="p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20">
                <Webcam className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No Ended Webinars</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Your completed webinars will appear here for review and analytics.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

export default Page
