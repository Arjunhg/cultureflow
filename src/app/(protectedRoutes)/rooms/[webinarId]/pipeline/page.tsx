import { getWebinarAttendance } from "@/actions/attendance";
import PageHeader from "@/components/ui/ReusableComponents/PageHeader";
import { AttendedTypeEnum } from "@prisma/client";
import { Users, GitFork, HomeIcon } from "lucide-react";
import PipelineLayout from "./_components/PipelineLayout";
import { formatColumnTitle } from "./_components/utils";

type Props = {
    params: Promise<{
        webinarId: string
    }>
}

const page = async ({params}: Props) => {
    const {webinarId} = await params;

    const pipelineData = await getWebinarAttendance(webinarId)

    if(!pipelineData.success || !pipelineData.data) {
        return (
            <div className="text-3xl h-[400px] flex justify-center items-center">
                <p className="text-red-500">No Pipelines Found</p>
            </div>
        )
    }

    return(
         <div className="w-full flex flex-col gap-8">
            <PageHeader
                leftIcon={<Users className="w-4 h-4" />}
                mainIcon={<GitFork className="w-12 h-12" />}
                rightIcon={<HomeIcon className="w-3 h-3" />}
                heading="Keep track of all of your customers"
                placeholder="Search Name, Tag or Email"
            />
            <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6 px-6 md:px-8 lg:px-10 xl:px-12">
                {Object.entries(pipelineData.data).map(([columnType, columnData]) => (
                    <PipelineLayout
                    key={columnType}
                    title={formatColumnTitle(columnType as AttendedTypeEnum)}
                    count={columnData.count}
                    users={columnData.users}
                    tags={pipelineData.webinarTags}
                    />
                ))}
            </div>
        </div>
    )
}

export default page;