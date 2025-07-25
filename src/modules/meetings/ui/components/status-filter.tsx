import { CircleCheckIcon, CircleXIcon, ClockArrowUpIcon, LoaderIcon, VideoIcon } from "lucide-react";
import { MeetingStatus } from "../../types";
import { useMeetingsFilters } from "../../hook/use-meetings-filter";
import { CommandSelect } from "@/components/command-select";

const options =[
    {
        id: MeetingStatus.UpComing,
        value: MeetingStatus.UpComing,
        children: (
            <div className='flex items-center gap-x-2 capitalize'>
                <ClockArrowUpIcon/>
                {MeetingStatus.UpComing}
            </div>
        )
    },
    {
        id: MeetingStatus.Completed,
        value: MeetingStatus.Completed,
        children: (
            <div className='flex items-center gap-x-2 capitalize'>
                <CircleCheckIcon/>
                {MeetingStatus.Completed}
            </div>
        )
    },
    {
        id: MeetingStatus.Active,
        value: MeetingStatus.Active,
        children: (
            <div className='flex items-center gap-x-2 capitalize'>
                <VideoIcon/>
                {MeetingStatus.Active}
            </div>
        )
    },
    {
        id: MeetingStatus.Processing,
        value: MeetingStatus.Processing,
        children: (
            <div className='flex items-center gap-x-2 capitalize'>
                <LoaderIcon/>
                {MeetingStatus.Processing}
            </div>
        )
    },
    {
        id: MeetingStatus.Cancelled,
        value: MeetingStatus.Cancelled,
        children: (
            <div className='flex items-center gap-x-2 capitalize'>
                <CircleXIcon/>
                {MeetingStatus.Cancelled}
            </div>
        )
    },
]

export const StatusFilter=()=>{
    const [filter, setFilter]=useMeetingsFilters()

    return (
        <CommandSelect
            placeholder="Status"
            className='h-9'
            options={options}
            onSelect={(value)=> setFilter({status: value as MeetingStatus})}
            value={filter.status ?? ''}
        />
    )
}