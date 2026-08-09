import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel02FreeIcons,
  ChatBotFreeIcons,
} from "@hugeicons/core-free-icons";
import React from "react";
import { useState } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { requestUrl } from "obsidian";
import Markdown from "react-markdown";

interface GenerateResponse {
  prompt: string;
  response: string;
}

export default function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentFabIcon: IconSvgElement = (
    isOpen && !isClosing ? Cancel02FreeIcons : ChatBotFreeIcons
  ) as IconSvgElement;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // match bubble-down duration
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse("");
    setPrompt("");

    try {
      const res = await requestUrl({
        url: `http://127.0.0.1:8000/generate?request=${encodeURIComponent(prompt)}`,
        method: "POST",
      });
      const data = res.json as GenerateResponse;
      setResponse(data.response);
    } catch (err) {
      console.error(err);
      setResponse(
        `Error: Could not connect to backend. ${(err as Error).message}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") void handleSend();
  };

  return (
    <div className="fixed bottom-7 right-7 z-50 flex flex-col items-end gap-3">
      {/* Popup */}
      {isOpen && (
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
          <div className="flex-1 overflow-y-auto p-4 overflow-x-hidden">
            {response ? (
              <div className="text-sm text-white!">
                <Markdown>{response}</Markdown>
              </div>
            ) : isLoading ? (
              <p className="text-sm text-neutral-400!">Thinking...</p>
            ) : (
              <p className="text-sm text-neutral-400!">
                How can I help you today?
              </p>
            )}
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
                className="rounded-[14px]! bg-[#302f5e]! px-3 py-1 text-xs font-medium text-white hover:bg-[#2b2952]! transition-colors"
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={handleToggle}
        className="fab-glow w-12! h-12! rounded-full! flex items-center justify-center text-xl shadow-lg transition-colors"
      >
        <HugeiconsIcon icon={currentFabIcon} color="#547ea2" size={32} />
      </button>
    </div>
  );
}
