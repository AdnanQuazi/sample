import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { Menu } from "lucide-react";

interface ChatNavbarProps {
  onToggleSidebar: () => void;
}

export const ChatNavbar: React.FC<ChatNavbarProps> = ({ onToggleSidebar }) => {
  return (
    <Navbar
      expand="lg"
      fixed="top"
      className="bg-[#121212] py-3 text-white"
      style={{ minHeight: "70px" }}
    >
      <Container>
        <Button
          variant="none"
          onClick={onToggleSidebar}
          className="text-white"
          aria-label="Toggle navigation"
        >
          <Menu size={30} className="text-white" />
        </Button>
        <Navbar.Brand href="#home" className="text-white">
          Chat GPT Clone
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};