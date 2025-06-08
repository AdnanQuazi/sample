// server/trpc/context.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { createSupabaseClient } from '@/lib/supabase';
import { auth0 } from '@/lib/auth0';

export interface Context {
  supabase: ReturnType<typeof createSupabaseClient>;
  user_id: string | null;
}

export async function createTRPCContext(): Promise<Context> {
  // Get Auth0 session
  const session = await auth0.getSession();
  const userId : string | null = session?.user?.sub ?? null;

  // Initialize Supabase client with Auth0 token
  const supabase = createSupabaseClient(userId);

  return { 
    supabase,
    user_id: userId
  };
}

const t = initTRPC.context<typeof createTRPCContext>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user_id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user_id: ctx.user_id, // TypeScript will know this is not null
    },
  });
});