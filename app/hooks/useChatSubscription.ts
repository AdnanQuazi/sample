import { trpc } from "@/trpc/client";
import { CurrentPrompt, Message } from "../types/chat";

interface UseChatSubscriptionProps {
  currentPrompt: CurrentPrompt | null;
  updateLastMessage: (chunk: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsLoading: (loading: boolean) => void;
  setCurrentPrompt: (prompt: CurrentPrompt | null) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  currentMessageRef: React.MutableRefObject<string>;
  chatId: string | null;
  storeMessageMutation: ReturnType<typeof trpc.storeMessagePair.useMutation>;
  refetch: () => void;
}

export const useChatSubscription = ({
  currentPrompt,
  updateLastMessage,
  setMessages,
  setIsLoading,
  setCurrentPrompt,
  inputRef,
  currentMessageRef,
  chatId,
  storeMessageMutation,
  refetch,
}: UseChatSubscriptionProps) => {
  const subscription = trpc.chat.useSubscription(
    {
      prompt: currentPrompt?.prompt || "",
      history: currentPrompt?.history || [],
    },
    {
      enabled: !!currentPrompt,
      onData: updateLastMessage,
      onError: (error) => {
        console.error("Streaming error:", error);
        setMessages((prev) => prev.slice(0, -1));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
            type: "text",
          },
        ]);
        setIsLoading(false);
        setCurrentPrompt(null);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      },
      onComplete: async () => {
        setIsLoading(false);
        setCurrentPrompt(null);

        const prompt = currentPrompt?.prompt;
        const response = currentMessageRef.current;

        if (prompt && response && chatId) {
          try {
            await storeMessageMutation.mutateAsync({
              chat_id: chatId,
              prompt,
              response,
              type: "text",
            });
            await refetch();
          } catch (err) {
            console.error("Failed to save messages:", err);
          }
        }

        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      },
    }
  );

  return subscription;
};
