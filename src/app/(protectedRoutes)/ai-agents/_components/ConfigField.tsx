import { Info } from 'lucide-react'
import React, { ReactNode } from 'react'

type Props = {
  label: string
  showInfo?: boolean
  children: ReactNode
}

const ConfigField = ({ label, showInfo, children }: Props) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="font-semibold text-gray-900 dark:text-white">{label}</label>
        {showInfo && <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
      </div>
      {children}
    </div>
  )
}

export default ConfigField
