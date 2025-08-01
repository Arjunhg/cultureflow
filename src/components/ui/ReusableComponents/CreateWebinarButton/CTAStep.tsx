import React, { useState } from 'react'
import { useWebinarStore } from '@/store/useWebinarStore'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CtaTypeEnum } from '@prisma/client'
import { Assistant } from '@vapi-ai/server-sdk/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

type Props = {
  assistants: Assistant[] | []
}

const CTAStep = ({ assistants }: Props) => {
  const {
    formData,
    updateCtaField,
    addTag,
    removeTag,
    getStepValidationErrors,
  } = useWebinarStore()
  const [tagInput, setTagInput] = useState('')
  const { ctaLabel, tags, aiAgent, ctaType } = formData.cta
  const errors = getStepValidationErrors('cta')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateCtaField(name as keyof typeof formData.cta, value)
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput.trim())
      setTagInput('')
    }
  }

  const handleSelectCTAType = (value: string) => {
    updateCtaField('ctaType', value as CtaTypeEnum)
  }

  const handleSelectAgent = (value: string) => {
    updateCtaField('aiAgent', value)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="ctalabel"
          className={errors.ctaLabel ? 'text-red-400' : ''}
        >
          CTA Label <span className="text-red-400">*</span>
        </Label>
        <Input
          id="ctalabel"
          name="ctaLabel"
          value={ctaLabel || ''}
          onChange={handleChange}
          placeholder="Let's Get Started"
          className={cn(
            'bg-background/50 border border-input',
            errors.ctaLabel && 'border-red-400 focus-visible:ring-red-400'
          )}
        />
        {errors.ctaLabel && (
          <p className="text-sm text-red-400">{errors.ctaLabel}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tags and press Enter"
          className="bg-background/50 border border-input"
        />
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-md"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 w-full">
        <Label>CTA Type</Label>
        <Tabs defaultValue={CtaTypeEnum.BOOK_A_CALL} className="w-full">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger
              value={CtaTypeEnum.BOOK_A_CALL}
              className="w-1/2 data-[state=active]:!bg-background/50"
              onClick={() => handleSelectCTAType(CtaTypeEnum.BOOK_A_CALL)}
            >
              Book a Call
            </TabsTrigger>
            <TabsTrigger
              value={CtaTypeEnum.BUY_NOW}
              className="w-1/2"
              onClick={() => handleSelectCTAType(CtaTypeEnum.BUY_NOW)}
            >
              Buy Now
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {ctaType === CtaTypeEnum.BOOK_A_CALL && (
        <div className="space-y-2">
          <Label>Attach an Ai Agent</Label>
          <div className="relative">
            <div className="mb-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search agents"
                  className="pl-9 !bg-background/50 border border-input"
                />
              </div>
            </div>
            <Select
              value={aiAgent}
              onValueChange={handleSelectAgent}
            >
              <SelectTrigger className="w-full !bg-background/50 border border-input">
                <SelectValue placeholder="Select an Agent" />
              </SelectTrigger>

              <SelectContent className="bg-background border border-input max-h-48">
                {assistants?.length > 0 ? (
                  assistants.map((assistant) => (
                    <SelectItem
                      key={assistant.id}
                      value={assistant.id}
                      className="!bg-background/50 hover:!bg-white/10"
                    >
                      {assistant.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value="No Agent Available"
                    disabled
                  >
                    No agents available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

export default CTAStep