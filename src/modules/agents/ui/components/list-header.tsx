'use client'

import { Button } from "@/components/ui/button"
import { PlusIcon, XCircleIcon } from "lucide-react"
import { NewAgentDialog } from "./new-agent-dialog"
import { useState } from "react"
import { useAgentFilters } from "../../hook/use-agent-filter"
import { SearchFilter } from "./agents-search-filter"
import { DEFAULT_PAGE } from "@/constants"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const AgentListHeader = () => {
    const [filter, setFilter] = useAgentFilters()
    const [isDialogOpen, setIsDialogOpen]= useState(false)

    const isAnyFilterdModified=!!filter.search
    const onClearFilter=()=>{
        setFilter({
            search:'',
            page: DEFAULT_PAGE
        })
    }
  return (
    <>
        <NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}/>
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <h5 className="font-medium text-xl">My Agents</h5>
                <Button onClick={()=>setIsDialogOpen(true)}>
                    <PlusIcon/>
                    New Agent
                </Button>
            </div>
            <ScrollArea>
                <div className="flex itemsc gap-x-2 p-1">
                    <SearchFilter/>
                    {isAnyFilterdModified && (
                        <Button variant='outline' size='sm' onClick={onClearFilter}>
                            <XCircleIcon/>
                            Clear
                        </Button>
                    )}
                </div>
                <ScrollBar orientation='horizontal' />
            </ScrollArea>
        </div>
    </>

  )
}

export  {AgentListHeader}