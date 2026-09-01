import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp02Icon,
  Cancel02FreeIcons,
  ChatBotFreeIcons,
} from "@hugeicons/core-free-icons";
import React, { useState, useRef, useEffect } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import Markdown from "react-markdown";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

interface FloatingWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function FloatingWidget({
  isOpen: externalIsOpen,
  onToggle,
}: FloatingWidgetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentFabIcon: IconSvgElement = (
    externalIsOpen && !isClosing ? Cancel02FreeIcons : ChatBotFreeIcons
  ) as IconSvgElement;

  // Auto-scroll to the bottom when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onToggle();
      setIsClosing(false);
    }, 300); // match bubble-down duration
  };

  const handleToggle = () => {
    onToggle();
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const userMessage = prompt.trim();
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setPrompt("");

    try {
      const res = await fetch("http://127.0.0.1:8000/testing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server responded with ${res.status}`);
      }

      // Add an empty AI message that we'll stream into
      setMessages((prev) => [...prev, { role: "ai", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Hide loading dots once the first chunk arrives
        setIsLoading(false);

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === "ai") {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: lastMsg.content + chunk,
            };
          }
          return updated;
        });
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Error: Could not connect to backend. ${(err as Error).message}`,
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") void handleSend();
  };

  return (
    <div className="fixed bottom-7 right-7 z-50 flex flex-col items-end gap-3">
      {/* Popup */}
      {externalIsOpen && (
        <div
          className={`${isClosing ? "bubble-down" : "bubble-up"} flex h-96 w-80 flex-col rounded-3xl border border-white/10 bg-neutral-800 shadow-none`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500" />
              <span className="text-sm font-semibold text-white">
                AI Assistant
              </span>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 overflow-x-hidden flex flex-col gap-3">
            {messages.length === 0 && !isLoading && (
              <p className="text-sm text-neutral-400!">
                How can I help you today?
              </p>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`py-2! text-sm ${
                    msg.role === "user"
                      ? "px-3! max-w-[75%] bg-[#302f5e] text-white! rounded-2xl rounded-br-sm"
                      : "min-w-full bg-transparent text-white!"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <Markdown>{msg.content}</Markdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="min-w-full bg-transparent text-sm text-neutral-400!">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="size-2 bg-white/30 rounded-full animate-bounce"
                        style={{ animationDelay: `${dot * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#1f1f1e] px-3 py-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="flex-1 bg-transparent! text-sm text-white placeholder-neutral-500 outline-none! border-none!"
              />
              <button
                onClick={() => void handleSend()}
                disabled={isLoading || !prompt.trim()}
                className="rounded-2xl! bg-[#302f5e]! p-1! text-xs font-medium text-white hover:bg-[#2b2952]! transition-colors"
              >
                <HugeiconsIcon icon={ArrowUp02Icon} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      {/* <button
        onClick={handleToggle}
        className="fab-glow w-12! h-12! rounded-full! flex items-center justify-center text-xl shadow-lg transition-colors"
      >
        <HugeiconsIcon icon={currentFabIcon} color="#547ea2" size={32} />
      </button> */}
    </div>
  );
}
