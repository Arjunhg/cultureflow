import { ValidationErrors, validationAdditionalInfo, validationBasicInfo, validationCta } from '@/lib/types'
import { CtaTypeEnum } from '@prisma/client'
import { create } from 'zustand'

export type WebinarFormState = {
    basicInfo:{
        webinarName?: string
        description?: string
        date?: string // Format: YYYY-MM-DD (e.g., "2024-01-15")
        time?: string
        timeFormat?: 'AM' | 'PM'
    }
    cta: {
        ctaLabel?: string
        tags?: string[]
        ctaType: CtaTypeEnum
        aiAgent?: string
        priceId?: string
    }
    additionalInfo: {
        lockChat?: boolean
        couponCode?: string
        couponEnabled?: boolean
    }
}

type ValidationState = {
    basicInfo: {
        valid: boolean
        errors: ValidationErrors
    }
    cta: {
        valid: boolean
        errors: ValidationErrors
    }
    additionalInfo: {
        valid: boolean
        errors: ValidationErrors
    }
}

type WebinarStore = {
    isModelOpen: boolean
    isComplete: boolean
    isSubmitting: boolean
    formData: WebinarFormState
    validation: ValidationState

    setModelOpen: (open: boolean) => void
    setComplete: (complete: boolean) => void
    setSubmitting: (submitting: boolean) => void

    updateBasicInfoField: <K extends keyof WebinarFormState['basicInfo']>(
        field: K,
        value: WebinarFormState['basicInfo'][K]
    ) => void

    updateCtaField: <K extends keyof WebinarFormState['cta']>(
        field: K,
        value: WebinarFormState['cta'][K]
    ) => void

    updateAdditionalInfoField: <K extends keyof WebinarFormState['additionalInfo']>(
        field: K,
        value: WebinarFormState['additionalInfo'][K]
    ) => void

    addTag: (tag: string) => void //used in CTAStep.tsx
    removeTag: (tag: string) => void //used in CTAStep.tsx

    validationStep: (stepId: keyof WebinarFormState) => boolean

    getStepValidationErrors: (stepId: keyof WebinarFormState) => ValidationErrors

    resetForm: () => void
}

const initialState: WebinarFormState = {
    basicInfo: {
        webinarName: '',
        description: '',
        date: undefined,
        time: '',
        timeFormat: 'AM',
    },
    cta: {
        ctaLabel: '',
        tags: [],
        ctaType: "BOOK_A_CALL",
        aiAgent: '',
        priceId: '',
    },
    additionalInfo: {
        lockChat: false,
        couponCode: '',
        couponEnabled: false,
    }
}

const initialValidationState: ValidationState = {
    basicInfo: {
        valid: false,
        errors: {}
    },
    cta: {
        valid: false,
        errors: {}
    },
    additionalInfo: {
        valid: false,
        errors: {}
    }
}

export const useWebinarStore = create<WebinarStore>((set, get) => ({
    
    isModelOpen: false,
    isComplete: false,
    isSubmitting: false,
    formData: initialState,
    validation: initialValidationState,
    

    setModelOpen: (open) => set({ isModelOpen: open }),
    setComplete: (complete) => set({ isComplete: complete }),
    setSubmitting: (submitting) => set({ isSubmitting: submitting }),

    updateBasicInfoField: (field, value) => {
            set((state) => {
            const newBasicInfo = { ...state.formData.basicInfo, [field]: value }

            const validationResult = validationBasicInfo(newBasicInfo)

            return {
                formData: { ...state.formData, basicInfo: newBasicInfo },
                validation: { ...state.validation, basicInfo: validationResult }
            }
        })
    },

    updateCtaField: (field, value) => {
        set((state) => {
            const newCta = { ...state.formData.cta, [field]: value }
            const validationResult = validationCta(newCta)

            return {
                formData: { ...state.formData, cta: newCta },
                validation: { ...state.validation, cta: validationResult }
            }
        })
    },

    updateAdditionalInfoField: (field, value) => {
        set((state) => {
            const newAdditionalInfo = { ...state.formData.additionalInfo, [field]: value }
            const validationResult = validationAdditionalInfo(newAdditionalInfo)

            return {
                formData: { ...state.formData, additionalInfo: newAdditionalInfo },
                validation: { ...state.validation, additionalInfo: validationResult }
            }
        })
    },

    validationStep: (stepId: keyof WebinarFormState) => {
        const { formData } = get();
        let validationResult;

        switch(stepId){
            case 'basicInfo':
                validationResult = validationBasicInfo(formData.basicInfo);
                break;
            case 'cta':
                validationResult = validationCta(formData.cta);
                break;
            case 'additionalInfo':
                validationResult = validationAdditionalInfo(formData.additionalInfo);
                break;
        }

        set((state) => {
            return {
                validation: {
                    ...state.validation,
                    [stepId]: validationResult
                }
            }
        })

        return validationResult.valid;
    },

    getStepValidationErrors: (stepId: keyof WebinarFormState) => {
        return get().validation[stepId].errors;
    },

    resetForm: () => 
        set({
            isModelOpen: false,
            isComplete: false,
            isSubmitting: false,
            formData: initialState,
            validation: initialValidationState
        }),

    addTag: (tag: string) => {
        set((state) => {
        const newTags = [...(state.formData.cta.tags || []), tag]
        const newCTA = {
            ...state.formData.cta,
            tags: newTags,
        }
        return {
            formData: {
            ...state.formData,
            cta: newCTA,
            },
        }
        })
    },

    removeTag: (tagToRemove: string) => {
        set((state) => {
        const newTags = (state.formData.cta.tags || []).filter(
            (tag) => tag !== tagToRemove
        )
        const newCTA = {
            ...state.formData.cta,
            tags: newTags,
        }
        return {
            formData: {
            ...state.formData,
            cta: newCTA,
            },
        }
        })
    },


}))