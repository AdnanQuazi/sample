import React from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "../types/chat";

interface ChatMessageProps {
  message: Message;
  index: number;
  isLoading?: boolean;
  isImageLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  index,
  isLoading,
  isImageLoading,
}) => {
  console.log(isImageLoading);
  return (
    <div
      key={`message-${index}`}
      className={`p-2 rounded-lg ${
        message.role === "user"
          ? "bg-[#3b3b3b] ml-auto text-white"
          : "bg-transparent text-white"
      } max-w-[80%] w-fit ${
        message.role === "user" ? "text-right" : "text-left"
      }`}
    >
      <div className="break-words">
        {message.type === "image" ? (
          (isImageLoading && message.content === "") ? (
            <div className="animate-pulse bg-gray-700 rounded-lg" style={{ width: '512px', height: '512px' }} />
          ) : (
            <img 
              src={message.content} 
              alt="Generated" 
              className="max-w-full rounded-lg"
            />
          )
        ) : (
          <ReactMarkdown>
            {message.content ||
              (message.role === "assistant" && isLoading ? "Thinking..." : "")}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};
