import React from "react";
import { Form, Button } from "react-bootstrap";
import { CircleStop, Image, Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  isImageLoading: boolean;
  handleImageClick: (e: React.MouseEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  inputRef,
  isImageLoading,
  handleImageClick,
}) => {


  return (
    <Form
      onSubmit={onSubmit}
      className="d-flex gap-2 position-fixed bottom-0 start-0 end-0 p-3 bg-[#252525]"
    >
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 rounded-lg bg-transparent text-white placeholder:text-gray-400 border-none focus:outline-none focus:ring-0"
        disabled={isLoading || isImageLoading}
        autoFocus
      />
      <Button
        variant="none"
        type="submit"
        disabled={isLoading || isImageLoading || !input.trim()}
        className="px-2 py-2 cursor-pointer bg-white text-black rounded-full border-none disabled:bg-gray-200 hover:bg-gray-100 transition-colors d-flex align-items-center gap-2"
      >
        {isLoading ? <CircleStop size={25} /> : <Send size={25} />}
      </Button>
      <Button
        variant="none"
        type="button"
        onClick={handleImageClick}
        disabled={isLoading || isImageLoading || !input.trim()}
        className="px-2 py-2 cursor-pointer bg-white text-black rounded-full border-none disabled:bg-gray-200 hover:bg-gray-100 transition-colors d-flex align-items-center gap-2"
      >
        {isImageLoading ? <CircleStop size={25} /> : <><Image size={25} /></>}
      </Button>
    </Form>
  );
};