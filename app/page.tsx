"use client";

import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useUser } from "@auth0/nextjs-auth0";

import { ChatNavbar } from "./components/ChatNavbar";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import { useChat } from "./hooks/useChat";
import { useChatSubscription } from "./hooks/useChatSubscription";
import Link from "next/link";;

export default function Home() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [showSidebar, setShowSidebar] = useState(false);
  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    chatId,
    chats,
    messagesByChatId,
    inputRef,
    messagesEndRef,
    scrollToBottom,
    handleChatClick,
    createNewChat,
    handleSubmit,
    // Add these for subscription
    currentPrompt,
    updateLastMessage,
    setIsLoading,
    setCurrentPrompt,
    currentMessageRef,
    storeMessageMutation,
    refetch,
    isImageLoading,
    handleImageClick,
  } = useChat();
  console.log(messages);

  // const [isImageLoading, setIsImageLoading] = useState(false);

  // Initialize chat subscription with required props
  useChatSubscription({
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
  });


  // Handle sidebar
  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);

  // Handle logout
  const handleLogout = () => {
    window.location.href = "/auth/logout";
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
    // handleImageGeneration("A beautiful sunset over a calm ocean");
  };

  // Update messages when chat data changes
  useEffect(() => {
    if (messagesByChatId) {
      setMessages(messagesByChatId);
    }
  }, [messagesByChatId, setMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (isLoadingUser) {
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100 bg-[#121212] text-white"
      >
        <div className="spinner-grow" style={{width: "3rem", height: "3rem"}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center vh-100 bg-[#121212] text-white"
      >
        <h2 className="mb-4">Please login to continue</h2>
        <Link href="/auth/login" className="btn btn-light">
          Login
        </Link>
      </div>
    );
  }

  return (
    <Container
      fluid
      className="d-flex flex-column min-h-screen p-0 bg-[#121212]"
    >
      <ChatNavbar onToggleSidebar={handleShowSidebar} />
      <ChatSidebar
        show={showSidebar}
        onHide={handleCloseSidebar}
        chats={chats}
        selectedChatId={chatId}
        onChatClick={handleChatClick}
        onNewChat={createNewChat}
        onLogout={handleLogout}
        user={user}
      />

      <Container className="flex flex-grow-1 flex-col items-center p-0">
        <Container fluid className="d-flex flex-column flex-grow-1 p-0 relative">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            onSuggestionClick={handleSuggestionClick}
            isImageLoading={isImageLoading}
          />

          <ChatInput
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            inputRef={inputRef}
            isImageLoading={isImageLoading}
            handleImageClick={handleImageClick}
          />
        </Container>
      </Container>
    </Container>
  );
}
