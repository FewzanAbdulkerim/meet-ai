'use client'

import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { MeetingIdViewHeader } from "../components/meeting-id-view-header"
import { useRouter } from "next/navigation"
import { useConfirm } from "@/hooks/use-confirm"
import { UpdateMeetingDialog } from "../components/update-meeting-dialog copy"
import { useState } from "react"
import { UpcomingState } from "../components/upcoming-state"
import { ActiveState } from "../components/active-state"
import { CancelState } from "../components/cancelled-state"
import { ProcessingState } from "../components/processing-state"
import { CompletedState } from "../components/completed-state"
// import { toast } from "sonner"

interface Props{
    meetingId: string
}

export const MeetingsIdView=({meetingId}:Props)=>{
    const trpc= useTRPC()
    const queryClient= useQueryClient()
    const router= useRouter()

    const [UpdateMeetingDialogOpen,setUpdateMeetingDialogOpen]=useState(false)

    const [RemoveConfirmation, confirmRemove]= useConfirm(
        'Are you sure?',
        'The following action will remove this meeting'
    )
    const {data} = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({id: meetingId})
    )

    const removeMeeting= useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: async()=>{
                await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))
                await queryClient.invalidateQueries(
                    trpc.premium.getFreeUsage.queryOptions(),
                )
                router.push('/meetings')
            },
        
        })
    )

    const handleRemoveMeeting=async ()=>{
        const ok=await confirmRemove()

        if (!ok) return

        await removeMeeting.mutateAsync({id: meetingId})
    }
    const isActive= data.status==='active'
    const isUpcoming= data.status==='upcoming'
    const isCancelled= data.status==='cancelled'
    const isCompleted= data.status==='completed'
    const isProcessing= data.status==='processing'

    return (
        <>  
            <RemoveConfirmation/>
            <UpdateMeetingDialog
                open={UpdateMeetingDialogOpen}
                onOpenChange={setUpdateMeetingDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={meetingId}
                    meetingName={data.name}
                    onEdit={()=>setUpdateMeetingDialogOpen(true)}
                    onRemove={handleRemoveMeeting}
                />
                {isCancelled && <CancelState/>}
                {isProcessing && <ProcessingState/>}
                {isCompleted && <CompletedState data={data}/>}
                {isActive && <ActiveState
                                meetingId={meetingId}
                            />
                }
                {isUpcoming && <UpcomingState
                                    meetingId={meetingId}
                                    />
                }
            </div>
        </>
    )
}

export const MeetingsIdViewLoading=()=>{
    return (
        <LoadingState
            title="Loading Meetings"
            description="Please wait while we load the meetings"
        />
    )
}

export const MeetingsIdViewError=()=>{
    return (
        <ErrorState
            title="Error loading Meetings"
            description="something went wrong"
        />
    )
}