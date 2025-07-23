'use client'

import {  useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentFilters } from "../../hook/use-agent-filter";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";

export const AgentsView=()=>{
    const router= useRouter()
    const [filter,setFilter] = useAgentFilters()
    const trpc= useTRPC()
    const {data} = useSuspenseQuery(trpc.agent.getMany.queryOptions({
        ...filter,
    }))


    return ( 
        <div className="flex pb-4 px-4 md:px-8  flex-col gap-y-4">
            <DataTable
                data={data.items}
                columns={columns}
                onRowClick={(row)=>router.push(`/agent/${row.id}`)} 
                />
            <DataPagination
                page={filter.page}
                totalPages={data.totalPages}
                onPageChange={(page)=>setFilter({page})}
            />
            {data.items.length===0 && (
                <EmptyState
                    title='Create your First Agent'
                    description='Create an agent to join your meetings. each agent will follow your instructions and can interact with participants during the call'

                />
            )}
        </div> 
    )
}  

export const AgentsViewLoading=()=>{
    return (
        <LoadingState
            title="Loading agents"
            description="Please wait while we load the agents"
        />
    )
}

export const AgentsViewError=()=>{
    return (
        <ErrorState
            title="Error loading agents"
            description="something went wrong"
        />
    )
}