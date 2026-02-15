import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
  isMine: boolean;
}

const initialMessages: Message[] = [
  { id: 1, user: "Ravi Kumar", text: "Hi everyone! Has anyone completed the Psychology mock test?", time: "10:30 AM", isMine: false },
  { id: 2, user: "Priya S", text: "Yes! I scored 78%. The questions on child development were tricky.", time: "10:32 AM", isMine: false },
  { id: 3, user: "You", text: "I'm preparing for it now. Any tips?", time: "10:35 AM", isMine: true },
  { id: 4, user: "Ravi Kumar", text: "Focus on Piaget's theory and Vygotsky. Those topics carry more marks! 📚", time: "10:37 AM", isMine: false },
  { id: 5, user: "Sneha M", text: "Also check the notes section, the EVS notes are really well organized 👍", time: "10:40 AM", isMine: false },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: "You",
        text: input,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
      },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-hero px-4 pt-4 pb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-2">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-xl text-primary-foreground">💬 Study Group Chat</h1>
        <p className="text-primary-foreground/70 text-xs mt-0.5">24 members online</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
              msg.isMine
                ? "gradient-primary text-primary-foreground rounded-br-md"
                : "bg-card shadow-card border border-border/50 rounded-bl-md"
            }`}>
              {!msg.isMine && (
                <div className="text-[10px] font-bold text-primary mb-0.5">{msg.user}</div>
              )}
              <p className="text-sm">{msg.text}</p>
              <div className={`text-[10px] mt-1 ${msg.isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border px-4 py-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={sendMessage}
            className="gradient-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center shadow-primary hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
