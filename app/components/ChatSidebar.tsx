import React from "react";
import {
  Offcanvas,
  Button,
  ListGroup,
  Dropdown,
  Image,
  InputGroup,
} from "react-bootstrap";
import { LogOut, Search, SquarePen, X } from "lucide-react";
import { Chat } from "../types/chat";

interface ChatSidebarProps {
  show: boolean;
  onHide: () => void;
  chats?: Chat[];
  selectedChatId: string | null;
  onChatClick: (chatId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
  user?: {
    name?: string;
    nickname?: string;
    picture?: string;
    email?: string;
  } | null;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  show,
  onHide,
  chats,
  selectedChatId,
  onChatClick,
  onNewChat,
  onLogout,
  user,
}) => {
  // Get user display name (prefer name, fallback to nickname, then email)
  const displayName = user?.name || user?.nickname || user?.email || "User";
  
  // Get user avatar (prefer Auth0 picture, fallback to default)
  const avatarUrl = user?.picture || "https://previews.123rf.com/images/pandavector/pandavector1901/pandavector190105561/126045782-vector-illustration-of-avatar-and-dummy-sign-collection-of-avatar-and-image-stock-symbol-for-web.jpg";
  return (
    <Offcanvas show={show} onHide={onHide} className="bg-[#121212] text-white">
      <Offcanvas.Header className="bg-[#121212] text-white d-flex justify-content-between align-items-center">
        <InputGroup className="rounded-pill overflow-hidden bg-[#252525] p-2">
          <InputGroup.Text className="bg-transparent border-0 ps-3">
            <Search size={25} color="white" className="text-muted text-white" />
          </InputGroup.Text>
          <input
            type="text"
            placeholder="Search..."
            className="border-0 shadow-none bg-transparent text-white placeholder:text-white focus:outline-none focus:ring-0"
          />
        </InputGroup>
        <Button
          variant=""
          className="p-2 rounded-full bg-transparent text-white hover:bg-gray-800"
          aria-label="Close"
          onClick={onHide}
        >
          <X size={30} />
        </Button>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column bg-[#121212]">
        <Button
          variant="dark"
          onClick={onNewChat}
          className="w-full text-white p-2 rounded-full d-flex align-items-center justify-content-center gap-3 mb-3"
        >
          <SquarePen size={20} color="white" /> New Chat
        </Button>
        
        <div
          className="flex-grow-1 overflow-auto hide-scrollbar pb-6"
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          <ListGroup variant="flush">
            {chats?.map((chat) => (
              <ListGroup.Item
                action
                key={chat.id}
                onClick={() => onChatClick(chat.id)}
                active={chat.id === selectedChatId}
                className="bg-transparent border-0 text-white py-3 pl-0 pr-0 font-semibold hover:bg-[#8b8b8b] fs-5 truncate-text"
              >
                {chat.title}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        <div
          className="position-absolute start-0 bottom-0 d-flex align-items-center justify-content-start py-4 px-3 bg-[#121212]/90 border-none w-100 text-white"
          style={{ zIndex: 3 }}
        >
          <Dropdown align="end">
            <Dropdown.Toggle
              as="div"
              className="d-flex align-items-center user-select-none gap-2"
              style={{ cursor: "pointer" }}
            >
              <Image
                src={avatarUrl}
                roundedCircle
                width={40}
                height={40}
                className="me-2"
                alt={`${displayName}'s avatar`}
                onError={(e) => {
                  // Fallback to default image if user's picture fails to load
                  e.currentTarget.src = "https://previews.123rf.com/images/pandavector/pandavector1901/pandavector190105561/126045782-vector-illustration-of-avatar-and-dummy-sign-collection-of-avatar-and-image-stock-symbol-for-web.jpg";
                }}
              />
              <span className="me-2 fw-semibold">{displayName}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="bg-dark-custom w-100">
              <Dropdown.Item
                onClick={onLogout}
                className="text-red-custom d-flex align-items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};