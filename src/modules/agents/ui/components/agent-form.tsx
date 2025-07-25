import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { agentsInsertSchema } from "../../schemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GeneratedAvatar } from "@/components/generated-avater";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AgentGetOne } from "../../types";
import { useRouter } from "next/navigation";

interface AgentFormProps{
    onSuccess?: ()=>void;
    onCancel?: ()=>void;
    initialValues? : AgentGetOne
}

export const AgentForm= ({
    onSuccess,
    onCancel,
    initialValues,
}:AgentFormProps)=>{
    const trpc= useTRPC()
    const queryClient= useQueryClient()
    const router=useRouter()

    const createAgent= useMutation(
        trpc.agent.create.mutationOptions({
            onSuccess: async()=>{
                await queryClient.invalidateQueries(
                    trpc.agent.getMany.queryOptions({}),
                )
               await queryClient.invalidateQueries(
                    trpc.premium.getFreeUsage.queryOptions(),
                )
                onSuccess?.()
            },
            onError: (error)=>{
                toast.error(error.message)

                if(error.data?.code==='FORBIDDEN'){
                    router.push('/upgrade')
                }
            },
        })
    )

    const updateAgent= useMutation(
        trpc.agent.update.mutationOptions({
            onSuccess: async()=>{
                await queryClient.invalidateQueries(
                    trpc.agent.getMany.queryOptions({}),
                )
                if(initialValues?.id){
                    await queryClient.invalidateQueries(
                        trpc.agent.getOne.queryOptions({id: initialValues.id})
                    )
                }
                onSuccess?.()
            },
            onError: (error)=>{
                toast.error(error.message)
            },
        })
    )

    const form= useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
        defaultValues: {
            name: initialValues?. name??'',
            instructions: initialValues?. instructions ?? ''
        }
    })
    const isEdit= !!initialValues?. id
    const isPending= createAgent.isPending || updateAgent.isPending

    const onSubmit= (values: z.infer<typeof agentsInsertSchema>)=>{
        if(isEdit){
            updateAgent.mutate({...values, id: initialValues.id})
        }else {
            createAgent.mutate(values)
        }
    }
    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <GeneratedAvatar 
                    seed={form.watch('name')}
                    variant="botttsNeutral"
                />
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
                    name='instructions'
                    control={form.control}
                    render={
                        ({field})=>
                        <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="You are a helpful math assistant that can answet questions and help with tasks."/>
                            </FormControl>
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
    )
}