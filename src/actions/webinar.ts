'use server';

import { WebinarFormState } from "@/store/useWebinarStore";
import { onAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";
import { WebinarStatusEnum } from "@prisma/client";

function combinedDateTime(
    dateStr: string,
    timeStr: string,
    timeFormat: 'AM' | 'PM'
): Date {
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = Number.parseInt(hoursStr, 10);
    const minutes = Number.parseInt(minutesStr || '0', 10);

    // Convert to 24-hour format
    if (timeFormat === 'PM' && hours < 12) {
        hours += 12;
    } else if (timeFormat === 'AM' && hours === 12) {
        hours = 0;
    }

    // Create the date string with the specified time
    // This will be interpreted as the user's local time
    const dateTimeStr = `${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    
    return new Date(dateTimeStr);
}

export const createWebinar = async (formData: WebinarFormState) => {

    try {
        const user = await onAuthenticateUser();

        if(!user || !user.user?.id){
            return {
                status: 401,
                message: 'Unauthorized - User not found'
            }
        }

        // Check if he has a stripe account: TODO

        const presenterId = user.user.id; 

        console.log('formData:', formData, presenterId);

        if(!formData.basicInfo.webinarName){
            return {
                status: 400,
                message: 'Room name is required.'
            }
        }

        if(!formData.basicInfo.date){
            return {
                status: 400,
                message: 'Room date is required.'
            }
        }

        if(!formData.basicInfo.time){
            return {
                status: 400,
                message: 'Room time is required.'
            }
        }

        const combineDateTime = combinedDateTime(
            formData.basicInfo.date,
            formData.basicInfo.time,
            formData.basicInfo.timeFormat || 'AM'
        )

        // Get current time
        const now = new Date();

        // Debug logging
        console.log('Room creation debug:', {
            selectedDate: formData.basicInfo.date,
            selectedTime: formData.basicInfo.time,
            timeFormat: formData.basicInfo.timeFormat,
            combinedDateTime: combineDateTime.toISOString(),
            combinedDateTimeLocal: combineDateTime.toString(),
            currentTime: now.toISOString(),
            isInFuture: combineDateTime > now,
            serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        if(combineDateTime <= now){
            return {
                status: 400,
                message: 'Room date and time must be in the future.'
            }
        }

        const webinar = await prismaClient.webinar.create({
            data: {
                title: formData.basicInfo.webinarName,
                description: formData.basicInfo.description || '',
                startTime: combineDateTime,
                tags: formData.cta.tags || [],
                ctaLabel: formData.cta.ctaLabel,
                ctaType: formData.cta.ctaType,
                aiAgentId: formData.cta.aiAgent || null,
                priceId: formData.cta.priceId || null,
                lockChat: formData.additionalInfo.lockChat || false,
                couponCode: formData.additionalInfo.couponCode ? formData.additionalInfo.couponCode : null,
                couponEnabled: formData.additionalInfo.couponEnabled || false,
                presenterId: presenterId, 
            }
        })

        revalidatePath('/');

        return {
            status: 200,
            message: 'Room created successfully.',
            webinarId: webinar.id,
            webinarLink: `/webinar/${webinar.id}`
        }

    } catch (error) {
        console.error('Error creating room:', error);
        return {
            status: 500,
            message: 'Internal server error. Please try again later.'
        }
    }
}

export const getWebinarByPresenterId = async (
    presenterId: string,
    webinarStatus?: string
  ) => {
    try {
      let statusFilter: WebinarStatusEnum | undefined
  
      switch (webinarStatus) {
        case 'upcoming':
          statusFilter = WebinarStatusEnum.SCHEDULED
          break
        case 'ended':
          statusFilter = WebinarStatusEnum.ENDED
          break
        default:
          statusFilter = undefined
      }
  
      const webinars = await prismaClient.webinar.findMany({
        where: { presenterId, webinarStatus: statusFilter },
        include: {
          presenter: {
            select: {
              name: true,
              stripeConnectId: true,
              id: true,
            },
          },
        },
      })
      return webinars
    } catch (error) {
      console.error('Error getting rooms:', error)
      return []
    }
}
  

export const getWebinarById = async (webinarId: string) => {
    try {
      const webinar = await prismaClient.webinar.findUnique({
        where: { id: webinarId },
        include: {
          presenter: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              stripeConnectId: true,
            },
          },
        },
      });
      return webinar;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw new Error('Failed to fetch room');
    }
  };

export const changeWebinarStatus = async (
    webinarId: string,
    status: WebinarStatusEnum
) => {
    try {
      const webinar = await prismaClient.webinar.update({
        where: {
          id: webinarId,
        },
        data: {
          webinarStatus: status,
        },
      });
      return {
        status: 200,
        success: true,
        message: "Room status updated successfully",
        data: webinar,
      };
    } catch (error) {
      console.error("Error updating room status:", error);
      return {
        status: 500,
        success: false,
        message: "Failed to update room status. Please try again.",
      };
    }
};
  