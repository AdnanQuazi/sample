export type Message = {
    role: "user" | "assistant";
    content: string;
    type?: "text" | "image";
  };
  
  export type Chat = {
    id: string;
    title: string;
  };
  
  export type CurrentPrompt = {
    prompt: string;
    history: Message[];
  };