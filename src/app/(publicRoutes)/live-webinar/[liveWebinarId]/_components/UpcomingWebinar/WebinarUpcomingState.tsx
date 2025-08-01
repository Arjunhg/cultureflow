'use client'
import React, { useState } from 'react'
import CountdownTimer from './CountdownTimer'
import { User, WebinarStatusEnum } from '@prisma/client'
import { Webinar } from '@prisma/client'
import Image from 'next/image'
import WaitlistComponent from './WaitlistComponent'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Loader2 } from 'lucide-react'
import { changeWebinarStatus } from '@/actions/webinar'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { createAndStartStream } from '@/actions/streamIo'

type Props = { webinar: Webinar; currentUser: User | null }

const WebinarUpcomingState = ({ webinar, currentUser }: Props) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStartWebinar = async () => {
    setLoading(true)
    try {
      if (!currentUser?.id) {
        throw new Error('User not authenticated')
      }

      await createAndStartStream(webinar)
      const res = await changeWebinarStatus(webinar.id, 'LIVE')
      if (!res.success) {
        throw new Error(res.message)
      }

      toast.success('Webinar started successfully')
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen mx-auto max-w-[400px] flex flex-col justify-center items-center gap-8 py-20">
      <div className="space-y-6">
        <p className="text-3xl font-semibold text-primary text-center">
          Seems Like you are a little early
        </p>
        <CountdownTimer
          targetDate={new Date(webinar.startTime)}
          className="text-center"
          webinarId={webinar.id}
          webinarStatus={webinar.webinarStatus}
        />
      </div>
      <div className="space-y-6 w-full h-full flex justify-center items-center flex-col">
        <div className="w-full max-w-md aspect-video relative rounded-2xl overflow-hidden mb-6 flex justify-center items-center">
          <Image
            src={'/LiveTalent.png'}
            alt={webinar.title}
            width={200}
            height={100}
            className="object-cover"
            priority
          />
        </div>
        {webinar?.webinarStatus === WebinarStatusEnum.SCHEDULED ? (
          <WaitlistComponent
            webinarId={webinar.id}
            webinarStatus="SCHEDULED"
          />
        ) : webinar?.webinarStatus === WebinarStatusEnum.WAITING_ROOM ? (
          <>
            {currentUser?.id === webinar?.presenterId ? (
              <Button
                className="w-full max-w-[300px] font-semibold"
                onClick={handleStartWebinar}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  'Start Meeting'
                )}
              </Button>
            ) : (
              <WaitlistComponent
                webinarId={webinar.id}
                webinarStatus="WAITING_ROOM"
              />
            )}
          </>
        ) : webinar?.webinarStatus === WebinarStatusEnum.LIVE ? (
          <WaitlistComponent
            webinarId={webinar.id}
            webinarStatus="LIVE"
          />
        ) : webinar?.webinarStatus === WebinarStatusEnum.CANCELLED ? (
          <p className="text-xl text-foreground text-center font-semibold">
            Webinar is cancelled
          </p>
        ) : (
          <Button>Ended</Button>
        )}
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold text-primary">
          {webinar?.title}
        </h3>
        <p className="text-muted-foreground text-xs">{webinar.description}</p>
        
        <div className="w-full justify-center flex gap-2 flex-wrap items-center">
          <Button
            variant={'outline'}
            className="rounded-md bg-secondary backdrop-blur-2xl"
          >
            <Calendar className="mr-2" />
            {format(new Date(webinar.startTime), 'dd MMMM yyyy')}
          </Button>

          <Button variant={'outline'}>
            <Clock className="mr-2" />
            {format(new Date(webinar.startTime), 'hh:mm a')}
          </Button>
        </div>
        
        {/* Timezone information */}
        <div className="text-xs text-gray-500 space-y-1 mt-2">
          <div className="flex items-center gap-2 justify-center">
            <span>🌍 UTC: {format(new Date(webinar.startTime), 'HH:mm')} UTC</span>
            <span>•</span>
            <span>🇮🇳 IST: {format(new Date(webinar.startTime.getTime() + (5.5 * 60 * 60 * 1000)), 'HH:mm')} IST</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebinarUpcomingState
