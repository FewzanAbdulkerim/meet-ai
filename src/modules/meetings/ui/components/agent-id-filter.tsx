import { useTRPC } from "@/trpc/client"
import { useMeetingsFilters } from "../../hook/use-meetings-filter"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CommandSelect } from "@/components/command-select"
import { GeneratedAvatar } from "@/components/generated-avater"

export const AgentIdFilter=()=>{
    const [filter,setFilter]= useMeetingsFilters()
    const trpc= useTRPC()

    const [agentSearch, setAgentSearch]= useState('')
    const {data}= useQuery(
        trpc.agent.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch
        })
    )

    return (
        <CommandSelect
            className='h-9'
            placeholder="Agent"
            options = {(data?.items ?? []).map((agent)=>({
                id: agent.id,
                value: agent.id,
                children: (
                    <div className='flex items-center gap-x-2:'>
                        <GeneratedAvatar
                            seed= {agent.name}
                            variant="botttsNeutral"
                            className='size-4'
                        />
                        [agent.name]
                    </div>
                )
            }))}
            onSelect= {(value)=>setFilter({agentId: value})}
            onSearch= {setAgentSearch}
            value={filter.agentId ?? ''}
        />
    )
}