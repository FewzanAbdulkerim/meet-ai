'use client'

import { DataTable } from "@/components/data-table"
import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { columns } from "../components/columns"
import { EmptyState } from "@/components/empty-state"
import { useRouter } from "next/navigation"
import { useMeetingsFilters } from "../../hook/use-meetings-filter"
import { DataPagination } from "@/components/data-pagination"

export const MeetingsView=()=>{
    const trpc= useTRPC()
    const router= useRouter()
    const [filter, setFilter]=useMeetingsFilters()
    const {data} = useSuspenseQuery(trpc.meetings.getMany.queryOptions({
        ...filter
    }))

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable data={data.items} columns={columns} onRowClick={(row)=>router.push(`/meetings/${row.id}`)}/>
            <DataPagination
                page={filter.page}
                totalPages={data.totalPages}
                onPageChange={(page)=>setFilter({page})}
            />
            {data.items.length===0 && (
                <EmptyState
                     title='Create your First Meeting'
                     description='Schedule a meeting to connect with others. Each meeting lets you collaborate, share ideas, and interact  with participants in real time.'   
                 />
            )}
        </div>
    )
} 

export const MeetingsViewLoading=()=>{
    return (
        <LoadingState
            title="Loading Meetings"
            description="Please wait while we load the meetings"
        />
    )
}

export const MeetingsViewError=()=>{
    return (
        <ErrorState
            title="Error loading meetings"
            description="something went wrong"
        />
    )
}

