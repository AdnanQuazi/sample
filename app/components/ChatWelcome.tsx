import React from "react";

interface ChatWelcomeProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({
  onSuggestionClick,
}) => {
  const suggestions = [
    { text: "📝 Summarize Text", value: "Summarize" },
    { text: "📊 Analyze Data", value: "Help me" },
    { text: "💡 Get Advice", value: "Get advice" },
    { text: "🎁 Surprise Me", value: "Surprise me" },
  ];

  return (
    <div
      className="w-100 d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: "60vh" }}
    >
      <h2 className="text-white mb-4">What can I help with?</h2>

      <div className="d-flex flex-wrap justify-content-center gap-3 w-300px">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.value}
            className="btn btn-outline-light rounded-pill d-flex align-items-center gap-2 px-4 py-2"
            onClick={() => onSuggestionClick?.(suggestion.value)}
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
};