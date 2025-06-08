import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { streamGeminiResponse } from "@/gemini";
import { TRPCError } from "@trpc/server";
import { generateGeminiImage } from "@/geminiForImage";
import { v4 as uuidv4 } from 'uuid';
import { base64ToBlob } from "@/app/utils/utils";
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  generateImageProcedure: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      console.log("Generating image with prompt:", input.prompt);
      const result = await generateGeminiImage(input.prompt);
      return result; // { text, image }
    }),
  chat: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          )
          .optional(),
      })
    )
    .subscription(async function* ({ input }) {
      const stream = streamGeminiResponse(input.prompt, input.history);
      for await (const chunk of stream) {
        yield chunk;
      }
    }),
  uploadBase64: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
      })
    )
    .mutation(async ({ input , ctx}) => {
      const { base64 } = input;

      // Generate unique filename
      const fileName = `${uuidv4()}.png`; // assuming PNG for simplicity

      // Convert base64 to blob
      const blob = base64ToBlob(base64, "image/png");

      // Convert to ArrayBuffer for Supabase
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload to Supabase
      const { data, error } = await ctx.supabase.storage
        .from("uploads") // your bucket name
        .upload(fileName, uint8Array, {
          contentType: "image/png",
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = ctx.supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      return {
        success: true,
        fileName: fileName,
        publicUrl: urlData.publicUrl,
      };
    }),
  storeMessagePair: protectedProcedure
    .input(
      z.object({
        chat_id: z.string(),
        prompt: z.string(),
        response: z.string(),
        type: z.enum(["text", "image"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const now = new Date().toISOString();

        const { data, error } = await ctx.supabase.from("messages").insert([
          {
            chat_id: input.chat_id,
            role: "user",
            content: input.prompt,
            created_at: now,
            type: "text",
          },
          {
            chat_id: input.chat_id,
            role: "assistant",
            content: input.response,
            created_at: now,  
            type: input.type,
          },
        ]);

        if (error) {
          console.error("Supabase error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to store messages: ${error.message}`,
            cause: error,
          });
        }

        return {
          success: true,
          data,
          message: "Messages stored successfully",
        };
      } catch (error) {
        console.error("Error storing message pair:", error);

        // If it's already a TRPCError, re-throw it
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle unexpected errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while storing messages",
          cause: error,
        });
      }
    }),
  createChatIfNotExists: protectedProcedure
    .input(z.object({ chat_id: z.string().optional(), prompt: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.chat_id) return { chatId: input.chat_id };
      console.log("Creating chat with user_id:", ctx.user_id);
      // RLS will automatically filter based on x-user-id header
      const { data, error } = await ctx.supabase
        .from("chats")
        .insert({
          title: input.prompt,
          user_id: ctx.user_id, // This must match the x-user-id header
        })
        .select("id")
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create chat",
          cause: error,
        });
      }

      return { chatId: data.id };
    }),
  getAllChats: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("chats")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch chats",
        cause: error,
      });
    }

    return data;
  }),
  getMessagesByChatId: protectedProcedure
    .input(z.object({ chat_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("messages")
        .select("*")
        .eq("chat_id", input.chat_id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch messages",
          cause: error,
        });
      }

      return data;
    }),

  // createChat: baseProcedure
  //   .input(
  //     z.object({
  //       title: z.string(), // We'll pass first prompt here
  //     })
  //   )
  //   .mutation(async ({ input, ctx }) => {
  //     const { data, error } = await ctx.supabase
  //       .from("chats")
  //       .insert({
  //         title: input.title,
  //         user_id: ctx.user_id,
  //       })
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     return { chat_id: data.id };
  //   }),
  // getChats: baseProcedure.query(async ({ ctx }) => {
  //   const userId = ctx.user_id;
  //   if (!userId) throw new Error("Unauthorized");
  //   const { data, error } = await ctx.supabase
  //     .from("chats")
  //     .select("id, title, created_at")
  //     .eq("user_id", userId)
  //     .order("created_at", { ascending: false });
  //   if (error) throw error;
  //   return data;
  // }),

  // // Fetch all messages for a specific chat
  // getMessages: baseProcedure
  //   .input(z.object({ chat_id: z.string() }))
  //   .query(async ({ input, ctx }) => {
  //     const userId = ctx.user_id;
  //     if (!userId) throw new Error("Unauthorized");
  //     // verify chat belongs to user
  //     const { data: chats, error: chatErr } = await ctx.supabase
  //       .from("chats")
  //       .select("id")
  //       .eq("id", input.chat_id)
  //       .eq("user_id", userId)
  //       .single();
  //     if (chatErr || !chats) throw chatErr || new Error("Chat not found");

  //     const { data, error } = await ctx.supabase
  //       .from("messages")
  //       .select("role, content, created_at")
  //       .eq("chat_id", input.chat_id)
  //       .order("created_at", { ascending: true });
  //     if (error) throw error;
  //     // map to client Message type shape
  //     return data.map((m) => ({
  //       role: m.role as "user" | "model",
  //       content: m.content,
  //     }));
  //   }),

  // // Example procedure using Supabase
  // getMessages: baseProcedure.query(async ({ ctx }) => {
  //   const { data, error } = await ctx.supabase
  //     .from('messages')
  //     .select('*')
  //     .order('created_at', { ascending: false });

  //   if (error) throw error;
  //   return data;
  // }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
