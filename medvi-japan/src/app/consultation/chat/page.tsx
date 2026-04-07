"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { ChatMessage } from "@/types/database";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "こんにちは。Medvi Japanの予診アシスタントです。本日はどのようなご相談でしょうか？\n\n以下からお選びください：\n\n1. **AGA（薄毛治療）**\n2. **ED（勃起不全の治療）**\n3. **メディカルダイエット（GLP-1）**\n\nお気軽にお話しください。",
  timestamp: new Date().toISOString(),
};

export default function ConsultationChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Generate a consultation ID for this session
  const consultationIdRef = useRef(crypto.randomUUID());

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/consultation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultationIdRef.current,
          messages: updatedMessages.filter((m) => m.role !== "system"),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "申し訳ございません。エラーが発生しました。もう一度お試しください。",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleCompletePreconsultation = async () => {
    setIsSummarizing(true);

    try {
      const response = await fetch("/api/consultation/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultationIdRef.current,
          messages: messages.filter((m) => m.role !== "system"),
        }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");

      const data = await response.json();

      // Store summary in sessionStorage for the booking page
      sessionStorage.setItem(
        "consultationSummary",
        JSON.stringify({
          consultationId: consultationIdRef.current,
          ...data,
        })
      );

      router.push("/consultation/booking");
    } catch {
      alert("サマリーの生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div>
          <h1 className="text-base font-semibold">AI予診</h1>
          <p className="text-xs text-muted-foreground">
            AIが事前に症状をお伺いします
          </p>
        </div>
        {userMessageCount >= 3 && (
          <Button
            size="sm"
            onClick={handleCompletePreconsultation}
            disabled={isSummarizing}
          >
            {isSummarizing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <CheckCircle className="size-3.5" />
                予診を完了する
              </>
            )}
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="flex flex-col gap-3 p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[10px] mt-1 ${
                    msg.role === "user"
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="size-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="size-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-white p-3">
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-h-32"
            style={{
              height: "auto",
              minHeight: "2.5rem",
            }}
            disabled={isLoading || isSummarizing}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || isSummarizing}
            className="shrink-0 rounded-xl"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
