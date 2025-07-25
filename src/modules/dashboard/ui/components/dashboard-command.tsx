import { GeneratedAvatar } from "@/components/generated-avater";
import { CommandResponsiveDialog, CommandInput, CommandItem, CommandList, CommandGroup, CommandEmpty } from "@/components/ui/command"
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dispatch,SetStateAction, useState } from "react";

interface Props{
    open:boolean;
    setOpen: Dispatch<SetStateAction<boolean>>
}
export const DashboardCommand=({open, setOpen}:Props)=>{
    const router= useRouter()
    const [search, setSearch]= useState('')
    const trpc= useTRPC()
    const meetings= useQuery(
        trpc.meetings.getMany.queryOptions({
            search,
            pageSize: 100
        })
    )
    const agents= useQuery(
        trpc.agent.getMany.queryOptions({
            search,
            pageSize: 100
        })
    )

    return (
        <CommandResponsiveDialog shouldFilter={false} open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="find a meeting or agent..."
                value={search}
                onValueChange={(value)=>setSearch(value)}
            />
            <CommandList>
                <CommandGroup heading='Meetings'>
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No Meetings found
                        </span>
                    </CommandEmpty>
                    {meetings.data?.items.map((meeting)=>(
                        <CommandItem 
                            onSelect={()=>{
                                router.push(`/meetings/${meeting.id}`)
                                setOpen(false)
                            }}
                            key={meeting.id}
                        >
                            {meeting.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading='Agents'>
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No Agent found
                        </span>
                    </CommandEmpty>
                    {agents.data?.items.map((agent)=>(
                        <CommandItem 
                            onSelect={()=>{
                                router.push(`/agent/${agent.id}`)
                                setOpen(false)
                            }}
                            key={agent.id}
                        >
                            <GeneratedAvatar
                                seed={agent.name}
                                variant="botttsNeutral"
                                className="size-5"
                            />
                            {agent.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandResponsiveDialog>
    )
}