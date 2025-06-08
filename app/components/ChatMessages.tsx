import React from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatWelcome } from "./ChatWelcome";
import { Message } from "../types/chat";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSuggestionClick?: (suggestion: string) => void;
  isImageLoading: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  messagesEndRef,
  onSuggestionClick,
  isImageLoading,
}) => {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 scroll-smooth pl-0 pr-0 pb-20 pt-20 bg-[#121212]">
      {messages.length === 0 && (
        <ChatWelcome onSuggestionClick={onSuggestionClick} />
      )}
      
      {messages.map((message: Message, index: number) => (
        <ChatMessage
          key={`message-${index}`}
          message={message}
          index={index}
          isLoading={isLoading && index === messages.length - 1}
          isImageLoading={isImageLoading}
        />
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
