import { getAttendeeById, changeCallStatus } from '@/actions/attendance'
import { getWebinarById } from '@/actions/webinar'
import { WebinarWithPresenter } from '@/lib/types'
import { CallStatusEnum, WebinarStatusEnum } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'
import AutoConnectCall from './AutoConnectCall'

type Props = {
  params: Promise<{
    liveWebinarId: string
  }>
  searchParams: Promise<{
    attendeeId: string
  }>
}

const page = async ({ params, searchParams }: Props) => {
  const { liveWebinarId } = await params
  const { attendeeId } = await searchParams

  console.log('Call page accessed with:', { liveWebinarId, attendeeId });

  if (!liveWebinarId || !attendeeId) {
    console.log('Missing parameters, redirecting to 404');
    redirect('/404')
  }
  
  const attendee = await getAttendeeById(attendeeId, liveWebinarId)
  console.log('getAttendeeById result:', attendee);

  if (!attendee.data) {
    console.log('Redirecting due to attendee not found');
    redirect(`/live-webinar/${liveWebinarId}?error=attendee-not-found`)
  }

  const webinar = await getWebinarById(liveWebinarId)
  if (!webinar) {
    redirect('/404')
  }

  if (
    webinar.webinarStatus === WebinarStatusEnum.WAITING_ROOM ||
    webinar.webinarStatus === WebinarStatusEnum.SCHEDULED
  ) {
    redirect(`/live-webinar/${liveWebinarId}?error=webinar-not-started`)
  }
  
  if (
    webinar.ctaType !== 'BOOK_A_CALL' ||
    !webinar.aiAgentId ||
    webinar.aiAgentId.trim() === ''
  ) {
    redirect(`/live-webinar/${liveWebinarId}?error=cannot-book-a-call`)
  }

  console.log(
    '______________________________________',
    webinar.ctaType,
    webinar.aiAgentId
  )

  // Allow attendees to book new calls even if they had previous calls
  // Only block if there's an active/ongoing call
  if (attendee.data.callStatus === CallStatusEnum.InProgress) {
    redirect(`/live-webinar/${liveWebinarId}?error=call-already-active`)
  }

  // If the call status is COMPLETED, reset it to PENDING for a new call
  if (attendee.data.callStatus === CallStatusEnum.COMPLETED) {
    await changeCallStatus(attendeeId, CallStatusEnum.PENDING)
  }

  return (
    <AutoConnectCall
      userName={attendee.data.name}
      assistantId={webinar.aiAgentId}
      webinar={webinar as WebinarWithPresenter}
      userId={attendeeId}
    />
  )
}

export default page
