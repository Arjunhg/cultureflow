import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Timezone utility functions
export const convertToUTC = (time: string, timeFormat: 'AM' | 'PM'): string => {
  const [hours, minutes] = time.split(':');
  let utcHours = parseInt(hours);
  
  if (timeFormat === 'PM' && utcHours < 12) {
    utcHours += 12;
  } else if (timeFormat === 'AM' && utcHours === 12) {
    utcHours = 0;
  }
  
  return `${utcHours.toString().padStart(2, '0')}:${minutes} UTC`;
};

export const convertToIST = (time: string, timeFormat: 'AM' | 'PM'): string => {
  const [hours, minutes] = time.split(':');
  let istHours = parseInt(hours);
  
  if (timeFormat === 'PM' && istHours < 12) {
    istHours += 12;
  } else if (timeFormat === 'AM' && istHours === 12) {
    istHours = 0;
  }
  
  // Add 5:30 hours for IST
  istHours += 5;
  const istMinutes = parseInt(minutes) + 30;
  
  if (istMinutes >= 60) {
    istHours += 1;
  }
  if (istHours >= 24) {
    istHours -= 24;
  }
  
  const finalMinutes = istMinutes >= 60 ? istMinutes - 60 : istMinutes;
  return `${istHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')} IST`;
};
