'use server';

import { prismaClient } from "@/lib/prismaClient";
import { AttendanceData } from "@/lib/types";
import { AttendedTypeEnum, CallStatusEnum, CtaTypeEnum } from "@prisma/client";
import { revalidatePath } from "next/cache";

const getWebinarAttendance = async (
    webinarId: string,
    options: {
        includedUsers?: boolean;
        userLimit?: number;
    } = { includedUsers: true, userLimit: 10 }
) => {
    try {
        const webinar = await prismaClient.webinar.findUnique({
            where: {
                id: webinarId  
            },
            select: {
                id: true,
                ctaType: true,
                tags: true,
                presenter: true,
                _count: {
                    select: {
                        attendances: true
                    }
                }
            }
        })

        if(!webinar){
            return {
                success: false,
                status: 400,
                error: 'Webinar not found',
            }
        }

        const attendanceCounts = await prismaClient.attendance.groupBy({
            by: ['attendedType'],
            where: {
                webinarId,
            },
            _count: {
                attendedType: true
            }
        })

        const result: Record<AttendedTypeEnum, AttendanceData> = {} as Record<AttendedTypeEnum, AttendanceData>;

        for (const type of Object.values(AttendedTypeEnum)){
            if(type===AttendedTypeEnum.ADDED_TO_CART && webinar.ctaType===CtaTypeEnum.BOOK_A_CALL){
                continue;
            }

            if(type===AttendedTypeEnum.BREAKOUT_ROOM && webinar.ctaType!==CtaTypeEnum.BOOK_A_CALL){
                continue;
            }

            const countItem = attendanceCounts.find((item) => {
                if(webinar.ctaType===CtaTypeEnum.BOOK_A_CALL && type===AttendedTypeEnum.BREAKOUT_ROOM && item.attendedType===AttendedTypeEnum.ADDED_TO_CART){
                    return true;
                }
                return item.attendedType === type;
            })

            result[type] = {
                count: countItem ? countItem._count.attendedType : 0,
                users: [],
            }
        }

        if(options.includedUsers){
            for(const attendanceType of Object.values(AttendedTypeEnum)){
                if((attendanceType===AttendedTypeEnum.ADDED_TO_CART && webinar.ctaType===CtaTypeEnum.BOOK_A_CALL) || 
                   (attendanceType===AttendedTypeEnum.BREAKOUT_ROOM && webinar.ctaType!==CtaTypeEnum.BOOK_A_CALL)){
                    continue;
                }

                const queryType = webinar.ctaType===CtaTypeEnum.BOOK_A_CALL && attendanceType===AttendedTypeEnum.BREAKOUT_ROOM ? 
                    AttendedTypeEnum.ADDED_TO_CART : attendanceType;

                if(result[attendanceType] && result[attendanceType].count > 0){
                    const attendances = await prismaClient.attendance.findMany({
                        where: {
                            webinarId,
                            attendedType: queryType,
                        },
                        include: {
                            user: true,
                        },
                        take: options.userLimit,
                        orderBy: {
                            joinedAt: 'desc',
                        }
                    })

                    result[attendanceType].users = attendances.map((attendance) => ({
                        id: attendance.user.id,
                        name: attendance.user.name,
                        email: attendance.user.email,
                        attendedAt: attendance.joinedAt,
                        createdAt: attendance.user.createdAt,
                        updatedAt: attendance.user.updatedAt,
                        callStatus: attendance.user.callStatus,
                    }))
                }
            }
        }

        return {
            success: true,
            data: result,
            ctaType: webinar.ctaType,
            webinarTags: webinar.tags || [],
            presenter: webinar.presenter,
        }
    } catch (error) {
        console.error('Error fetching webinar attendance:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to fetch webinar attendance',
        }
    }
}

const registerAttendee = async (
    {
        webinarId,
        email,
        name,
    }: {
        webinarId: string;
        email: string;
        name: string;
    }
) => {
    try {
        if (!webinarId || !email || !name) {
            return {
                success: false,
                status: 400,
                message: 'Missing required parameters',
            };
        }

        const webinar = await prismaClient.webinar.findUnique({
            where: { id: webinarId },
        });

        if (!webinar) {
            return {
                success: false,
                status: 404,
                message: 'Webinar not found'
            };
        }

        // Find or create the attendee by email
        let attendee = await prismaClient.attendee.findUnique({
            where: { email },
        });

        if (!attendee) {
            attendee = await prismaClient.attendee.create({
                data: { email, name },
            });
        }

        // Check for existing attendance
        const existingAttendance = await prismaClient.attendance.findFirst({
            where: {
                attendeeId: attendee.id,
                webinarId: webinarId,
            },
            include: {
                user: true, // Assuming you want to include attendee details
            },
        });

        if (existingAttendance) {
            return {
                success: true,
                status: 200,
                data: existingAttendance,
                message: 'You are already registered for this webinar',
            };
        }

        // Create attendance record
        const attendance = await prismaClient.attendance.create({
            data: {
                attendedType: AttendedTypeEnum.REGISTERED,
                attendeeId: attendee.id,
                webinarId: webinarId,
            },
            include: {
                user: true, // Assuming you want to include attendee details
            },
        });

        console.log('Created attendance record:', {
            attendanceId: attendance.id,
            attendeeId: attendance.attendeeId,
            webinarId: attendance.webinarId,
            userIncluded: !!attendance.user,
            userId: attendance.user?.id
        });

        revalidatePath(`/${webinarId}`);

        return {
            success: true,
            status: 200,
            data: attendance,
            message: 'Successfully Registered',
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            status: 500,
            message: 'Something went wrong',
            error: error,
        };
    }
};

export const changeAttendanceType = async (
    attendeeId: string,
    webinarId: string,
    attendedType: AttendedTypeEnum
  ) => {
    try {
      const attendance = await prismaClient.attendance.update({
        where: {
          attendeeId_webinarId: {
            attendeeId,
            webinarId,
          },
        },
        data: {
          attendedType,
        },
      })
  
      return {
        success: true,
        status: 200,
        message: 'Attendance type updated successfully',
        data: attendance,
      }
    } catch (error) {
      console.error('Error updating attendance type:', error)
      return {
        success: false,
        status: 500,
        message: 'Failed to update attendance type',
        error,
      }
    }
}

export const getAttendeeById = async (id: string, webinarId: string) => {
    try {
      console.log('getAttendeeById called with:', { id, webinarId });
      
      // First, let's see what attendees actually exist in the database
      const allAttendees = await prismaClient.attendee.findMany({
        select: {
          id: true,
          email: true,
          name: true,
        },
        take: 10 // Limit to 10 for debugging
      });
      console.log('All attendees in database (first 10):', allAttendees);
      
      const attendee = await prismaClient.attendee.findUnique({
        where: {
          id,
        },
      })
      
      console.log('Attendee found:', attendee ? 'Yes' : 'No', attendee ? `(${attendee.email})` : '');
  
      const attendance = await prismaClient.attendance.findFirst({
        where: {
          attendeeId: id,
          webinarId: webinarId,
        },
      })
      
      console.log('Attendance found:', attendance ? 'Yes' : 'No', attendance ? `(ID: ${attendance.id})` : '');
  
      if (!attendee) {
        console.log('Attendee not found in database');
        return {
          status: 404,
          success: false,
          message: 'Attendee not found',
        }
      }
      
      if (!attendance) {
        console.log('Attendance record not found for attendee:', id, 'webinar:', webinarId);
        // Let's try to find any attendance records for this attendee
        const allAttendances = await prismaClient.attendance.findMany({
          where: {
            attendeeId: id,
          },
        })
        console.log('All attendance records for this attendee:', allAttendances.map(a => ({ id: a.id, webinarId: a.webinarId })));
        
        return {
          status: 404,
          success: false,
          message: 'Attendee not found',
        }
      }
  
      return {
        status: 200,
        success: true,
        message: 'Get attendee details successful',
        data: attendee,
      }
    } catch (error) {
      console.log('Error in getAttendeeById:', error)
      return {
        status: 500,
        success: false,
        message: 'Something went wrong!',
      }
    }
}

export const changeCallStatus = async (
    attendeeId: string,
    callStatus: CallStatusEnum
  ) => {
    try {
      const attendee = await prismaClient.attendee.update({
        where: {
          id: attendeeId,
        },
        data: {
          callStatus: callStatus,
        },
      })
  
      return {
        success: true,
        status: 200,
        message: 'Call status updated successfully',
        data: attendee,
      }
    } catch (error) {
      console.error('Error updating call status:', error)
      return {
        success: false,
        status: 500,
        message: 'Failed to update call status',
        error,
      }
    }
}

export { getWebinarAttendance, registerAttendee };