'use server';

import { prismaClient } from "@/lib/prismaClient";

export const findAttendeeByEmail = async (email: string, webinarId: string) => {
    try {
        console.log('findAttendeeByEmail called with:', { email, webinarId });
        
        const attendee = await prismaClient.attendee.findUnique({
            where: {
                email,
            },
        });
        
        if (!attendee) {
            console.log('No attendee found with email:', email);
            return {
                status: 404,
                success: false,
                message: 'Attendee not found',
            };
        }
        
        console.log('Found attendee by email:', { id: attendee.id, name: attendee.name });
        
        // Check if they have attendance for this webinar
        const attendance = await prismaClient.attendance.findFirst({
            where: {
                attendeeId: attendee.id,
                webinarId: webinarId,
            },
        });
        
        if (!attendance) {
            console.log('No attendance record found for this webinar');
            return {
                status: 404,
                success: false,
                message: 'Not registered for this webinar',
            };
        }
        
        return {
            status: 200,
            success: true,
            message: 'Attendee found by email',
            data: attendee,
        };
    } catch (error) {
        console.log('Error in findAttendeeByEmail:', error);
        return {
            status: 500,
            success: false,
            message: 'Something went wrong!',
        };
    }
};
