import { cn } from "@/lib/utils";
import { Attendee } from "@prisma/client";

type Props = {
    customer: Attendee
    tags: string[]
    className?: string
}

const UserInfoCard = ({ customer, tags, className }: Props) => {
  return (
    <div
      className={cn(
        'flex flex-col w-fit text-gray-900 dark:text-white p-6 pr-12 gap-4 rounded-3xl border border-white/20 backdrop-blur-sm bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl',
        className
      )}
    >
      <div className="space-y-2">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{customer.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs font-medium px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300"
          >
            {tag}
          </span>
        ))}
      </div>
   </div>
  );
};

export default UserInfoCard;