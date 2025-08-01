import { ChevronDown } from 'lucide-react'
import React from 'react'

type Props = {
  value: string
  placeholder?: string
}

const DropdownSelect = ({ value, placeholder }: Props) => {
  const displayText = value || placeholder
  const textClass = value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'

  return (
    <div className="relative">
      <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
        <span className={textClass}>{displayText}</span>
        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
    </div>
  )
}

export default DropdownSelect
