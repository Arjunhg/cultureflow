import { useWebinarStore } from '@/store/useWebinarStore'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, ChevronRight, Loader2 } from 'lucide-react'
import {Separator} from '@/components/ui/separator'
import {Button} from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { createWebinar } from '@/actions/webinar'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Step = {
    id: string
    title: string
    description: string
    component: React.ReactNode
}

type Props = {
    steps: Step[]
    onComplete: (id: string) => void
}

const MultipStepForm = ({steps, onComplete}: Props) => {

   const {formData, validationStep, isSubmitting, setSubmitting, setModelOpen} = useWebinarStore();

   const router = useRouter();

   const [completedSteps, setCompletedSteps] = React.useState<string[]>([]);
   const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
   const [validationErrors, setValidationErrors] = React.useState<string | null>(null);

   const currentStep = steps[currentStepIndex];
   const isLastStep = currentStepIndex === steps.length - 1;
   const isFirstStep = currentStepIndex === 0;

   const handleBack = () => {
    if(isFirstStep) {
        setModelOpen(false);
    } else {
        setCurrentStepIndex(currentStepIndex - 1);
    }
   }

   const handleNext = async () => {
    setValidationErrors(null);
    const isValid = validationStep(currentStep.id as keyof typeof formData);

    if(!isValid){
        setValidationErrors('Please fill in all required fields.');
        return;
    }

    if(!completedSteps.includes(currentStep.id)){
        setCompletedSteps([...completedSteps, currentStep.id]);
    }

    if(isLastStep){
        try {
            setSubmitting(true);
            const result = await createWebinar(formData);
            if(result.status === 200 && result.webinarId){
                toast.success('Your meeting has been created successfully!');
                onComplete(result.webinarId);
            }else{
                toast.error(result.message || 'Failed to create room.');
                setValidationErrors(result.message);
            }
            router.refresh();
        } catch (error) {
            console.error('Error creating webinar:', error);
            toast.error('An error occurred while creating the webinar. Please try again later.');
            setValidationErrors('An error occurred while creating the webinar. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    } else {
        setCurrentStepIndex(currentStepIndex + 1);
    }
   }

  return (
    // <div className='bg-muted text-primary rounded-lg p-6 overflow-hidden'>
    //   <h2 className="text-lg font-semibold mb-4">MultiStepForm</h2>
    //   {/* Your form content will go here */}
    // </div>

    <div className='flex flex-col justify-center items-center bg-[#27272A]/20 border border-border rounded-3xl overflow-hidden max-w-6xl mx-auto backdrop-blur-[106px]'>
        <div className='flex items-center jusify-start'>
            <div className='w-full md:w-1/3 p-6'>
                <div className='space-y-6'>
                    {
                        steps.map((step, index) => {
                            const isCompleted = completedSteps.includes(step.id);
                            const isCurrent = index === currentStepIndex;
                            const isPast = index < currentStepIndex;

                            return <div key={step.id} className='relative'>
                                <div className='flex items-start gap-4'>
                                    <div className='relative'>
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                backgroundColor: isCurrent || isCompleted ? 'rgb(147, 51, 234' : 'rgb(31, 41, 55)',
                                                scale: [isCurrent && !isCompleted ? 0.8 : 1, 1],
                                                transition: {duration:0.3}
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '2rem',
                                                height: '2rem',
                                                borderRadius: '50%',
                                                zIndex: 10
                                            }}
                                            
                                        >
                                            <AnimatePresence mode="wait">
                                                {
                                                    isCompleted ? (
                                                        <motion.div
                                                            key="check"
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.5 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Check className='w-5 h-5 text-white'/>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="number"
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.5 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Check className='w-5 h-5 text-white/50'/>
                                                        </motion.div>
                                                    )
                                                }
                                            </AnimatePresence>
                                        </motion.div>

                                        {/* Steps */}
                                        {
                                            index<steps.length-1 && (
                                                <div className='absolute top-8 left-4 w-0.5 h-16 bg-gray-700 overflow-hidden'>
                                                    <motion.div
                                                        initial={{
                                                            height: isPast || isCompleted ? '100px' : '0%'
                                                        }}
                                                        animate={{
                                                            height: isPast || isCompleted ? '100px' : '0%',
                                                            backgroundColor: 'rgb(147, 51, 234)',
                                                        }}
                                                        transition={{duration: 0.5, ease: 'easeInOut'}}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%'
                                                        }}
                                                    />
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className='pt-1'>
                                        <motion.h3
                                            animate={{
                                                color: isCurrent || isCompleted ? 'rgb(255, 255, 255)' : 'rgb(156, 163, 175)',
                                            }}
                                            transition={{duration: 0.3}}
                                            style={{
                                                fontWeight: '500'
                                            }}
                                        >
                                            {step.title}
                                        </motion.h3>
                                        <p className='text-sm text-gray-500'>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
            <Separator
                orientation='vertical'
                className='data-[orientation=vertical]:h-1/2'
            />

            <div className='w-full md:w-2/3'>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{x: 20, opacity: 0}}
                            animate={{x: 0, opacity: 1}}
                            exit={{x: -20, opacity: 0}}
                            transition={{duration: 0.3}}
                            style={{
                                padding: '1.5rem'
                            }}
                        >
                            <div className='mb-6'>
                                <h2 className='text-xl font-semibold'>
                                    {currentStep.title}
                                </h2>
                                <p className='text-gray-400'>
                                    {currentStep.description}
                                </p>
                            </div>

                            {/* Render current step component */}
                            {currentStep.component}

                            {/* Validation Error */}
                            {
                                validationErrors && (
                                    <div className='mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-start gap-2 text-red-300'>
                                        <AlertCircle className='h-5 w-5 mt-0.5 flex-shrink-0'/>
                                        <p>{validationErrors}</p>
                                    </div>
                                )
                            }
                        </motion.div>
                    </AnimatePresence>
            </div>
        </div>

        {/* Navigation Button */}
        <div className='w-full p-6 flex justify-between'>
            <Button
                variant='outline'
                onClick={handleBack}
                disabled={isSubmitting}
                className={cn(
                    'border-gray-700 text-white hovewr:bg-gray-800',
                    isFirstStep && 'opacity-50 cursor-not-allowed'
                )}
            >
                {
                    isFirstStep ? 'Cancel' : 'Back'
                }
            </Button>

            <Button
                onClick={handleNext}
                disabled={isSubmitting}
            >
                {
                    isLastStep ? (
                        isSubmitting ? (
                            <>
                                <Loader2 className='animate-spin' />
                                Creating...
                            </>
                        ) : (
                            'Complete'
                        )
                    ) : (
                        'Next'
                    )
                }
                {
                    !isLastStep && <ChevronRight className='ml-1 w-4 h-4'/>
                }
            </Button>
        </div>
    </div>
  )
}

export default MultipStepForm
