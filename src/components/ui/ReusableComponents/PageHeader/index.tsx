
import PurpleIcon from "../PurpleIcon"

type Props = {
    heading?: string
    mainIcon: React.ReactNode
    leftIcon: React.ReactNode
    rightIcon: React.ReactNode
    children?: React.ReactNode
    placeholder?: string
    
}

const PageHeader = ({ heading, mainIcon, leftIcon, rightIcon}: Props) => {
    return (
        <div className="w-full flex flex-col gap-8">
            <div className="w-full flex justify-center sm:justify-between items-center gap-8 flex-wrap">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent">
                    {heading}
                </h1>

                <div className="relative md:mr-28">
                    <PurpleIcon className='absolute -left-4 -top-3 -z-10 -rotate-45 py-3'>
                        {leftIcon}
                    </PurpleIcon>
                    <PurpleIcon className='z-10 backdrop-blur'>
                        {mainIcon}
                    </PurpleIcon>
                    <PurpleIcon className='absolute -right-4 -top-3 -z-10 rotate-45 py-3'>
                        {rightIcon}
                    </PurpleIcon>
                </div>
            </div>

            {/* <div className="w-full flex flex-wrap gap-6 items-center justify-between">
                <div className="w-full md:max-w-3/4 relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"/>
                    <Input
                        type="text"
                        placeholder={placeholder || 'Search...'}
                        className="pl-12 py-3 rounded-2xl border-white/20 bg-white/10 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50"
                    />
                </div>
                <div className="md:max-w-1/2 w-full overflow-x-auto">
                    {children}
                </div>
            </div> */}
        </div>
    )
}

export default PageHeader;