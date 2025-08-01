
'use client'
import { useWebinarStore } from '@/store/useWebinarStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import React from 'react'
import { cn, convertToUTC, convertToIST } from '@/lib/utils'
import { CalendarIcon, Clock, Upload } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'


const BasicInfoForm = () => {

    const{formData, updateBasicInfoField, getStepValidationErrors}=useWebinarStore();

    const {webinarName, description, date} = formData.basicInfo;

    const errors = getStepValidationErrors('basicInfo');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        updateBasicInfoField(name as keyof typeof formData.basicInfo, value);
    }

    const handleDateChange = (newDate: Date | undefined) => {
        // Store date in YYYY-MM-DD format to avoid timezone issues
        if (newDate) {
            const year = newDate.getFullYear();
            const month = String(newDate.getMonth() + 1).padStart(2, '0');
            const day = String(newDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            updateBasicInfoField('date', dateString);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if(newDate < today){
                toast.error('Selected date is in the past. Please select a future date.');
                console.log('Selected date is in the past. Please select a future date.');
            }
        } else {
            updateBasicInfoField('date', undefined);
        }
    }

    const handleTimeFormatChange = (value: string) => {
        updateBasicInfoField('timeFormat', value as 'AM' | 'PM')
    }

  return (
        <div className="space-y-6">
            {/* Timezone notice */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                    <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <div className="font-medium mb-1">Timezone Information</div>
                        <div className="space-y-1">
                            <p>• Times are stored in UTC (Coordinated Universal Time)</p>
                            <p>• When you select a time, it will be converted to UTC for storage</p>
                            <p>• The system will show you both UTC and your local time (IST) for reference</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
            <Label
                htmlFor="webinarName"
                className={errors.webinarName ? 'text-red-400' : ''}
            >
                Room name <span className="text-red-400">*</span>
            </Label>
            <Input
                id="webinarName"
                name="webinarName"
                value={webinarName || ''}
                onChange={handleChange}
                placeholder="Introduction to Repify"
                className={cn(
                'bg-background/50 border border-input',
                errors.webinarName && 'border-red-400 focus-visible:ring-red-400'
                )}
            />
            {errors.webinarName && (
                <p className="text-sm text-red-400">{errors.webinarName}</p>
            )}
            </div>

            {/* Description FIeld */}
            <div className="space-y-2">
                <Label
                    htmlFor="description"
                    className={errors.description ? 'text-red-400' : ''}
                >
                    Description <span className="text-red-400">*</span>
                </Label>
                <Textarea
                    id="description"
                    name="description"
                    value={description || ''}
                    onChange={handleChange}
                    placeholder="Tell customers about your webinar"
                    className={cn(
                    'bg-background/50 border border-input',
                    errors.description && 'border-red-400 focus-visible:ring-red-400'
                    )}
                />
                {errors.description && (
                    <p className="text-sm text-red-400">{errors.description}</p>
                )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                    <Label className={errors.date ? 'text-red-400' : ''}>
                        Room Date <span className="text-red-400">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal !bg-background/50 border border-input',
                                    !date && 'text-gray-500',
                                    errors.date && 'border-red-400 focus-visible:ring-red-400'
                                )}
                            >
                                <CalendarIcon className='mr-2 h-4 w-4'/>
                                {
                                    date ? format(new Date(date), 'PPP') : 'Select a date'
                                }
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto o-0 !bg-background/50 border border-input">
                            <Calendar
                                mode="single"
                                selected={date ? new Date(date + 'T00:00:00') : undefined}
                                onSelect={handleDateChange}
                                initialFocus
                                className="bg-background"
                                disabled={(date) => {
                                    const today = new Date()
                                    today.setHours(0, 0, 0, 0)
                                    // Allow today's date for immediate scheduling
                                    return date < today
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {
                        errors.date && <p className='text-sm text-red-400'>{errors.date}</p>
                    }
                </div>

                <div className='space-y-2'>
                    <Label className={errors.time ? 'text-red-400' : ""}>
                        Room Time <span className="text-red-400">*</span>
                    </Label>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-foreground" />
                            <Input
                            name="time"
                            value={formData.basicInfo.time || ''}
                            onChange={handleChange}
                            placeholder="12:00"
                            className={cn(
                                'pl-9 !bg-background/50 border border-input',
                                errors.time && 'border-red-400 focus-visible:ring-red-400'
                            )}
                            />
                        </div>
                        <Select
                            value={formData.basicInfo.timeFormat || 'AM'}
                            onValueChange={handleTimeFormatChange}
                            >
                            <SelectTrigger className="w-20 !bg-background/50 border border-input">
                                <SelectValue placeholder="AM" />
                            </SelectTrigger>
                            <SelectContent className="!bg-background border border-input">
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Timezone indicator */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <div className="flex items-center gap-1">
                            <span>🌍</span>
                            <span>Times are stored in UTC</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <span>🇮🇳</span>
                            <span>Your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                        </div>
                    </div>
                    
                    {/* Local time reference */}
                    {formData.basicInfo.time && formData.basicInfo.date && (
                        <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 p-2 rounded-md">
                            <div className="font-medium mb-1">Local Time Reference:</div>
                            <div className="space-y-1">
                                <div>UTC: {convertToUTC(formData.basicInfo.time, formData.basicInfo.timeFormat || 'AM')}</div>
                                <div>IST: {convertToIST(formData.basicInfo.time, formData.basicInfo.timeFormat || 'AM')}</div>
                            </div>
                        </div>
                    )}
                    
                    {errors.time && <p className='text-sm text-red-400'>{errors.time}</p>}
                </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
            <div className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Uploading a video makes this room pre-recorded.
            </div>
            <Button
                variant="outline"
                className="ml-auto relative border border-input hover:bg-background"
            >
                Upload File
                <Input
                className="absolute inset-0 opacity-0 cursor-pointer"
                type="file"
                />
            </Button>
                </div>
            </div>
    )
}

export default BasicInfoForm
