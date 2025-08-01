/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Chat, Channel, MessageList, MessageInput } from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'
import {
  ParticipantView,
  useCallStateHooks,
  type Call,
} from '@stream-io/video-react-sdk'
import { Users, MessageSquare, Loader2, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CtaTypeEnum } from '@prisma/client'
import { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import CTADialogBox from './CTADialogBox'
import { WebinarWithPresenter } from '@/lib/types'
import { changeWebinarStatus } from '@/actions/webinar'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ObsDialogBox from './ObsDialogBox'
import { SharedLiveTranscription } from '@/components/ui/SharedLiveTranscription'

type Props = {
  showChat: boolean
  setShowChat: (show: boolean) => void
  webinar: WebinarWithPresenter
  isHost?: boolean
  username: string
  userId: string
  call: Call
  userToken: string
}

const LiveWebinarView = ({
  showChat,
  setShowChat,
  webinar,
  isHost = false,
  username,
  userId,
  userToken,
  call,
}: Props) => {
  console.log('LiveWebinarView received userId:', userId);
  
  const { useParticipants, useParticipantCount } = useCallStateHooks()
  const participants = useParticipants()
  const hostParticipant = participants.length > 0 ? participants[0] : null
  const viewerCount = useParticipantCount()
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [channel, setChannel] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)
  const router = useRouter()
  const [obsDialogBox, setObsDialogBox] = useState(false)

  const handleEndStream = async () => {
    setLoading(true)
    try {
      call.stopLive({
        continue_recording: false,
      })
      call.endCall()

      const res = await changeWebinarStatus(webinar.id, 'ENDED')
      if (!res.success) {
        throw new Error(res.message)
      }
      toast.success('Webinar ended successfully')
      router.push('/')
    } catch (error) {
      console.error('Error ending stream', error)
      toast.error('Error ending stream')
    } finally {
      setLoading(false)
    }
  }

  const handleCTAButtonClick = async () => {
    if (!channel) return
    console.log('CTA button clicked', channel)
    await channel.sendEvent({
      type: 'open_cta_dialog',
    })
  }

  useEffect(() => {
    const initChat = async () => {
      const client = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!
      )

      await client.connectUser(
        {
          id: userId,
          name: username,
        },
        userToken
      )

      const channel = client.channel('livestream', webinar.id, {
        name: webinar.title,
      })

      await channel.watch()

      setChatClient(client)
      setChannel(channel)
    }

    initChat()

    return () => {
      if (chatClient) {
        chatClient.disconnectUser()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, username, userToken, webinar.id, webinar.title])

  useEffect(() => {
    if (chatClient && channel) {
      channel.on((event: any) => {
        if (event.type === 'open_cta_dialog' && !isHost) {
          setDialogOpen(true)
        }
        if (event.type === 'start_live') {
          window.location.reload()
        }

        // console.log("New message:", event);s
      })
    }
  }, [chatClient, channel, isHost])

  // useEffect(() => {
  //   call.on("call.rtmp_broadcast_started", () => {
  //       toast.success("Webinar started successfully");
  //       router.refresh();
  //   })

  //   call.on("call.rtmp_broadcast_failed", () => {
  //       toast.error('Stream failed to start. Please try again');
  //   })
  // }, [call])


  if (!chatClient || !channel) return null

  return (
    <div className="flex flex-col w-full h-screen max-h-screen overflow-hidden bg-background text-foreground">
      {/* Header - responsive */}
      <div className="py-2 px-2 md:px-4 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="bg-accent-primary/10 text-primary px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium flex items-center">
            <span className="relative flex h-2 w-2 mr-1 md:mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive animate-pulse"></span>
            </span>
            LIVE
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-3">
          <div className="flex items-center space-x-1 bg-muted/50 px-2 md:px-3 py-1 rounded-full">
            <Users size={14} className="md:w-4 md:h-4" />
            <span className="text-xs md:text-sm">{viewerCount}</span>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 ${
              showChat
                ? 'bg-accent-primary text-primary-foreground'
                : 'bg-muted/50'
            }`}
          >
            <MessageSquare size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={() => setShowTranscription(!showTranscription)}
            className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 ${
              showTranscription
                ? 'bg-accent-primary text-primary-foreground'
                : 'bg-muted/50'
            }`}
          >
            <FileText size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Transcript</span>
          </button>
        </div>
      </div>

      {/* Main content - responsive layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: side-by-side layout */}
        <div className="hidden lg:flex flex-1 p-2 gap-2 overflow-hidden">
          {/* Video area */}
          <div className="flex-1 rounded-lg overflow-hidden border border-border flex flex-col bg-card min-w-0">
            <div className="flex-1 relative overflow-hidden">
              {hostParticipant ? (
                <div className="w-full h-full">
                  <ParticipantView
                    participant={hostParticipant}
                    className="w-full h-full object-cover !max-w-full"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col space-y-4">
                  <div className="w-16 md:w-24 h-16 md:h-24 rounded-full bg-muted flex items-center justify-center">
                    <Users
                      size={32}
                      className="text-muted-foreground md:w-10 md:h-10"
                    />
                  </div>
                  <p className="text-sm md:text-base text-center px-4">Waiting for stream to start...</p>
                </div>
              )}

              {isHost && (
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  Host
                </div>
              )}
            </div>

            <div className="p-2 border-t border-border flex items-center justify-between py-2">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="text-sm font-medium capitalize truncate">
                  {webinar?.title}
                </div>
              </div>

              {isHost && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button
                    onClick={() => setObsDialogBox(true)}
                    variant="outline"
                    size="sm"
                    className="hidden xl:flex"
                  >
                    Get OBS Creds
                  </Button>

                  <Button
                    onClick={async () => {
                      await channel.sendEvent({
                        type: 'start_live',
                      })
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Go Live
                  </Button>

                  <Button
                    onClick={handleEndStream}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> 
                        <span className="hidden sm:inline">Loading...</span>
                      </>
                    ) : (
                      'End Stream'
                    )}
                  </Button>
                  <Button onClick={handleCTAButtonClick} size="sm" className="hidden lg:flex">
                    {webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
                      ? 'Book a Call'
                      : 'Buy Now'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Chat panel - desktop */}
          {showChat && (
            <Chat client={chatClient}>
              <Channel channel={channel}>
                <div className="w-64 xl:w-72 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                  <div className="py-2 text-primary px-3 border-b border-border font-medium flex items-center justify-between">
                    <span>Chat</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {viewerCount} viewers
                    </span>
                  </div>

                  <MessageList />

                  <div className="p-2 border-t border-border">
                    <MessageInput />
                  </div>
                </div>
              </Channel>
            </Chat>
          )}

          {/* Transcription panel - desktop */}
          {showTranscription && (
            <div className="w-64 xl:w-80 min-w-0">
              <SharedLiveTranscription 
                className="h-full"
                isHost={isHost}
                channel={channel}
                hostId={webinar.presenterId}
                hostName={webinar.presenter.name}
                onTranscriptUpdate={(transcript) => {
                  console.log('Transcript updated:', transcript)
                }}
              />
            </div>
          )}
        </div>

        {/* Mobile/Tablet: stacked layout */}
        <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
          {/* Video area - mobile */}
          <div className="flex-1 rounded-lg overflow-hidden border border-border flex flex-col bg-card m-2 mb-1">
            <div className="flex-1 relative overflow-hidden">
              {hostParticipant ? (
                <div className="w-full h-full">
                  <ParticipantView
                    participant={hostParticipant}
                    className="w-full h-full object-cover !max-w-full"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Users size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-center px-4">Waiting for stream to start...</p>
                </div>
              )}

              {isHost && (
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                  Host
                </div>
              )}
            </div>

            <div className="p-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium capitalize truncate min-w-0 mr-2">
                  {webinar?.title}
                </div>

                {isHost && (
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Button
                      onClick={async () => {
                        await channel.sendEvent({
                          type: 'start_live',
                        })
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs px-2"
                    >
                      Go Live
                    </Button>

                    <Button
                      onClick={handleEndStream}
                      disabled={loading}
                      size="sm"
                      className="text-xs px-2"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-3 w-3" />
                      ) : (
                        'End'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat panel - mobile (bottom sheet style) */}
          {showChat && (
            <div className="h-48 sm:h-64 m-2 mt-1">
              <Chat client={chatClient}>
                <Channel channel={channel}>
                  <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                    <div className="py-1 sm:py-2 text-primary px-2 sm:px-3 border-b border-border font-medium flex items-center justify-between">
                      <span className="text-sm">Chat</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {viewerCount}
                        </span>
                        <button
                          onClick={() => setShowChat(false)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0">
                      <MessageList />
                    </div>

                    <div className="p-1 sm:p-2 border-t border-border">
                      <MessageInput />
                    </div>
                  </div>
                </Channel>
              </Chat>
            </div>
          )}

          {/* Transcription panel - mobile */}
          {showTranscription && (
            <div className="h-48 sm:h-64 m-2 mt-1">
              <SharedLiveTranscription 
                className="h-full"
                isHost={isHost}
                channel={channel}
                hostId={webinar.presenterId}
                hostName={webinar.presenter.name}
                showCloseButton={true}
                onClose={() => setShowTranscription(false)}
                onTranscriptUpdate={(transcript) => {
                  console.log('Transcript updated:', transcript)
                }}
              />
            </div>
          )}

          {/* Floating toggle buttons for mobile when panels are hidden */}
          {!showChat && !showTranscription && (
            <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => setShowChat(true)}
                className="bg-accent-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <MessageSquare size={20} />
              </button>
              <button
                onClick={() => setShowTranscription(true)}
                className="bg-muted text-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <FileText size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      {dialogOpen && (
        <CTADialogBox
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          webinar={webinar}
          userId={userId}
        />
      )}
      {obsDialogBox && (
        <ObsDialogBox
          open={obsDialogBox}
          onOpenChange={setObsDialogBox}
          rtmpURL={`rtmps://ingress.stream-io-video.com:443/${process.env.NEXT_PUBLIC_STREAM_API_KEY}.livestream.${webinar.id}`}
          streamKey={userToken}
        />
      )}
    </div>
  )
}

export default LiveWebinarView
