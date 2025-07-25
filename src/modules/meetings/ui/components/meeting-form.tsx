import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { meetingsInsertSchema } from "../../schemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MeetingGetOne } from "../../types";
import { useState } from "react";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avater";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
import { useRouter } from "next/navigation";

interface MeetingFormProps{
    onSuccess?: (id?: string)=>void;
    onCancel?: ()=>void;
    initialValues? : MeetingGetOne
}

export const MeetingForm= ({
    onSuccess,
    onCancel,
    initialValues,
}:MeetingFormProps)=>{
    const trpc= useTRPC()
    const queryClient= useQueryClient()
    const router= useRouter()

    const [openAgentDialog,setOpenAgentDialog]=useState(false)
    const[agentSearch,setAgentSearch]=useState('')

    const agents=useQuery(
        trpc.agent.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch
        })
    )

    const createMeetings= useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: async(data)=>{
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({}),
                )
                await queryClient.invalidateQueries(
                    trpc.premium.getFreeUsage.queryOptions(),
                )
                onSuccess?.(data.id)
            },
            onError: (error)=>{
                toast.error(error.message)

            if(error.data?.code==='FORBIDDEN'){
                router.push('/upgrade')
            }
            },
        })
    )

    const updateMeetings= useMutation(
        trpc.meetings.update.mutationOptions({
            onSuccess: async()=>{
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({}),
                )
                if(initialValues?.id){
                    await queryClient.invalidateQueries(
                        trpc.meetings.getOne.queryOptions({id: initialValues.id})
                    )
                }
                onSuccess?.()
            },
            onError: (error)=>{
                toast.error(error.message)
            },
        })
    )

    const form= useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues: {
            name: initialValues?. name??'',
            agentId: initialValues?. agent_Id ?? ''
        }
    })
    const isEdit= !!initialValues?. id
    const isPending= createMeetings.isPending || updateMeetings.isPending

    const onSubmit= (values: z.infer<typeof meetingsInsertSchema>)=>{
        if(isEdit){
            updateMeetings.mutate({...values, id: initialValues.id})
        }else {
            createMeetings.mutate(values)
        }
    }
    return (

        <>
            <NewAgentDialog open={openAgentDialog} onOpenChange={setOpenAgentDialog}/>
            <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField 
                    name='name'
                    control={form.control}
                    render={
                        ({field})=>
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="eg. Math tutor"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    }
                />

                <FormField 
                    name='agentId'
                    control={form.control}
                    render={
                        ({field})=>
                        <FormItem>
                            <FormLabel>Agent</FormLabel>
                            <FormControl>
                                <CommandSelect
                                    options={(agents.data?.items ?? []).map((agent)=>({
                                        id: agent.id,
                                        value: agent.id,
                                        children: (
                                            <div className="flex items-center gap-x-2">
                                                <GeneratedAvatar
                                                    seed={agent.name}
                                                    variant="botttsNeutral"
                                                    className="border size-6"
                                                />
                                                <span>{agent.name}</span>
                                            </div>
                                        )
                                    }))}
                                    onSelect={field.onChange}
                                    onSearch={setAgentSearch}
                                    value={field.value}
                                    placeholder="Select an agent"
                                />
                            </FormControl>
                            <FormDescription>
                                Not Found what you&apos;re looking for {' '}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={()=>setOpenAgentDialog(true)}
                                >
                                    Create new Agent
                                </button>
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    }
                />
                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button 
                            variant='ghost'
                            disabled={isPending}
                            type='button'
                            onClick={()=>onCancel()}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button disabled={isPending} type='submit'>
                        {isEdit ? 'Update': 'Create'}
                    </Button>
                </div>
            </form>
        </Form>
        </>
        
    )
}