import { db } from "@/db";
import { agent, meetings } from "@/db/schema";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema, agentsUpdateSchema } from "../schemas";
import z from "zod";
import { and, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";
export const agentsRouter = createTRPCRouter({

    update:protectedProcedure
        .input(agentsUpdateSchema)
        .mutation(async ({ctx , input})=>{
            const [updatedAgent] = await db
                .update(agent)
                .set(input)
                .where(
                    and(
                        eq(agent.id, input.id),
                        eq(agent.user, ctx.auth.user.id)
                    )
                )

                 .returning()

                if(!updatedAgent){
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Agent not found'
                    })
                }

                return updatedAgent
        }),
    remove:protectedProcedure
        .input(z.object({id: z.string()}))
        .mutation(async ({ctx, input})=>{
            const [removedAgent]= await db
                .delete(agent)
                .where(
                    and(
                        eq(agent.id, input.id),
                        eq(agent.user, ctx.auth.user.id )
                    )
                )
                .returning()

                if(!removedAgent){
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Agent not found'
                    })
                }

            return removedAgent
        }),
    getOne: protectedProcedure
        .input(z.object({id: z.string()}))
        .query(async ({input,ctx})=>{
            const [existingAgent]= await db
            .select({
                ...getTableColumns(agent),
                meetingCount: db.$count(meetings,eq(agent.id, meetings.agent_Id))
            })
            .from(agent)
            .where(
                and(
                    eq(agent.id, input.id),
                    eq(agent.user , ctx.auth.user.id)
                )
            )
            if(!existingAgent){
                throw new TRPCError({code: 'NOT_FOUND',message: 'Agent not found'})
            }

            return existingAgent
        }
        ),
    getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(DEFAULT_PAGE),
                pageSize: z
                    .number()
                    .min(MIN_PAGE_SIZE)
                    .max(MAX_PAGE_SIZE)
                    .default(DEFAULT_PAGE_SIZE),
                search: z.string().nullish()
            })
        )
        .query(async ({ctx,input={}})=>{
            const { 
                page = DEFAULT_PAGE, 
                pageSize = DEFAULT_PAGE_SIZE, 
                search 
            } = input
            const data= await db
            .select({
                ...getTableColumns(agent),
                meetingCount: db.$count(meetings,eq(agent.id, meetings.agent_Id))
            })
            .from(agent)
            .where(
                and(
                    eq(agent.user, ctx.auth.user.id),
                    search ? ilike(agent.name,`%${search}`): undefined, )
                )
            .orderBy(desc(agent.createdAt),desc(agent.id))
            .limit(pageSize)
            .offset((page-1) * pageSize)

            const [total]= await db
                .select({count: count()})
                .from(agent)
                .where(
                    and(
                        eq(agent.user, ctx.auth.user.id),
                        search ? ilike(agent.name,`%${search}`): undefined, )
                )

                const totalPages= Math.ceil(total.count/ pageSize)

            
            return {
                items: data,
                total: total.count,
                totalPages
            }
    }),
    create: premiumProcedure('agent')
    .input(agentsInsertSchema)
    .mutation(async ({input, ctx}) => {
        try {
            const [createdAgent] = await db
                .insert(agent)
                .values({
                    ...input,
                    user: ctx.auth.user.id
                })
                .returning();

            if (!createdAgent) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create agent'
                });
            }

            return createdAgent;
        } catch (error) {
            console.error('Error creating agent:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                cause: error
            });
        }
    })
    }
)