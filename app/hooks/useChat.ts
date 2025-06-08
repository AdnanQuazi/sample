import { useState, useRef, useCallback } from "react";
import { trpc } from "@/trpc/client";
import { Message, CurrentPrompt } from "../types/chat";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<CurrentPrompt | null>(
    null
  );
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatIdForQuery, setChatIdForQuery] = useState<string | null>(null);

  const currentMessageRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<
    HTMLInputElement
  >;
  const messagesEndRef = useRef<HTMLDivElement>(null) as React.RefObject<
    HTMLDivElement
  >;
 

  const createChatMutation = trpc.createChatIfNotExists.useMutation();
  const storeMessageMutation = trpc.storeMessagePair.useMutation();
  const uploadBase64Mutation = trpc.uploadBase64.useMutation();
  const { data: chats, refetch } = trpc.getAllChats.useQuery();
  const {
    data: messagesByChatId,
    refetch: fetchMessages,
    isFetching,
  } = trpc.getMessagesByChatId.useQuery(
    { chat_id: chatIdForQuery ?? "" },
    {
      enabled: !!chatIdForQuery,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: generateImage, isPending: isImageLoading } = trpc.generateImageProcedure.useMutation({
    onSuccess: async (data) => {
      console.log("Data", data);
      if (data.image) {
        setMessages(prev => prev.slice(0, -1));
        const result = await uploadBase64Mutation.mutateAsync({
          base64: data.image
        });
        console.log("Image uploaded", result);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: result.publicUrl ?? "",
          type: "image"
        }]);
        
        const prompt = input.trim();
        const response = result.publicUrl ?? "";
        console.log("Prompt", prompt);
        console.log("Response", response);
        console.log("ChatId", chatId);
        if (prompt && response && chatId) {
          try {
            await storeMessageMutation.mutateAsync({
              chat_id: chatId,
              prompt,
              response,
              type: "image"
            });
            await refetch();
          } catch (err) {
            console.error("Failed to save messages:", err);
          }
        }
        setInput("");
      }
    },
    onMutate: () => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "",
        type: "image"
      }]);
    },
    onError: () => {
  
    }
  });

  const updateLastMessage = useCallback((chunk: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastMessage = updated[updated.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        const newContent = lastMessage.content + chunk;
        updated[updated.length - 1] = {
          ...lastMessage,
          content: newContent,
        };
        currentMessageRef.current = newContent;
      }
      return updated;
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const handleChatClick = async (newChatId: string) => {
    setChatId(newChatId);
    setChatIdForQuery(newChatId);
  };

  const createNewChat = async () => {
    setChatId(null);
    setMessages([]);
  };
  const handleImageGeneration = (prompt: string) => {
    generateImage({ prompt: prompt });
  };

  const handleImageClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (userMessage) {
      const newMessages = [...messages, { role: "user", content: userMessage }];
      setMessages(newMessages as Message[]);
    }
    if (!chatId) {
      try {
        const result = await createChatMutation.mutateAsync({
          prompt: userMessage,
        });
        console.log("Chat created", result.chatId);
        setChatId(result.chatId);
      } catch (error) {
        console.error("Failed to create chat:", error);
      }
    }
    // setCurrentPrompt({
    //   prompt: userMessage,
    //   history: messages,
    // });
      handleImageGeneration(input.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages as Message[]);
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    if (!chatId) {
      try {
        const result = await createChatMutation.mutateAsync({
          prompt: userMessage,
        });
        console.log("Chat created", result.chatId);
        setChatId(result.chatId);
      } catch (error) {
        console.error("Failed to create chat:", error);
      }
    }

    setCurrentPrompt({
      prompt: userMessage,
      history: messages,
    });
  };

  return {
    // State
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    currentPrompt,
    setCurrentPrompt,
    chatId,
    setChatId,
    chatIdForQuery,
    setChatIdForQuery,
    isImageLoading,

    // Refs
    currentMessageRef,
    inputRef,
    messagesEndRef,

    // Data
    chats,
    messagesByChatId,
    refetch,
    fetchMessages,
    isFetching,

    // Mutations
    createChatMutation,
    storeMessageMutation,
    uploadBase64Mutation,

    // Functions
    updateLastMessage,
    scrollToBottom,
    handleChatClick,
    createNewChat,
    handleSubmit,
    handleImageClick,
  };
};
