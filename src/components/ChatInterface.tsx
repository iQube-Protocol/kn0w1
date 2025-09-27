import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Bot, User, Search, BookOpen, Play, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  isExpanded: boolean;
  onToggle: () => void;
  onVoiceSearch?: (query: string) => void;
  onTextSearch?: (query: string) => void;
  onScreenToggle?: () => void;
  isFullscreen?: boolean;
}

export function ChatInterface({ 
  isExpanded, 
  onToggle, 
  onVoiceSearch, 
  onTextSearch,
  onScreenToggle,
  isFullscreen = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Welcome to myamiKNYT! I can help you discover content through natural language. Try asking me about specific topics or media types.",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    onTextSearch?.(inputValue);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm searching for content related to "${inputValue}". Here are some results I found...`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      // In a real implementation, you'd stop the speech recognition here
    } else {
      // Start listening
      setIsListening(true);
      // In a real implementation, you'd start speech recognition here
      // For now, simulate voice input after 3 seconds
      setTimeout(() => {
        setIsListening(false);
        const voiceQuery = "Show me educational content about blockchain";
        setInputValue(voiceQuery);
        onVoiceSearch?.(voiceQuery);
      }, 3000);
    }
  };

  if (!isExpanded) {
    // Collapsed view - show robot icon with player controls
    return (
      <>
        {/* Action Buttons - Centered above player bar */}
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" className="glass hover-glow text-xs px-2 py-1 h-7">
              <BookOpen className="h-3 w-3 mr-1" />
              Read
            </Button>
            <Button variant="outline" size="sm" className="glass hover-glow text-xs px-2 py-1 h-7">
              <Play className="h-3 w-3 mr-1" />
              Watch
            </Button>
            <Button
              onClick={onScreenToggle}
              variant="ghost" 
              size="sm" 
              className="glass hover-glow h-7 w-7 p-0"
            >
              <Maximize className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Chat and Player Controls */}
        <div className="fixed bottom-6 left-6 z-30">
          <div className="flex items-center gap-6">
            <Button
              onClick={onToggle}
              className="w-12 h-12 rounded-full glass hover-glow p-0"
              variant="outline"
            >
              <Bot className="h-6 w-6 text-primary" />
            </Button>
            
            {/* Player Controls */}
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-primary glow"></div>
              <div className="w-32 h-1 bg-muted/30 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-gradient-to-r from-primary to-accent"></div>
              </div>
              <div className="w-4 h-4 rounded-full bg-primary/50"></div>
              <div className="w-4 h-4 rounded-full bg-muted/30"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
        "h-[60vh]"
      )}
    >
      <Card className="h-full glass-card border-t-2 border-primary/20 rounded-t-3xl">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">KNYT AI Agent</h3>
              <p className="text-xs text-muted-foreground">
                {isListening ? "Listening..." : "Ask me anything"}
              </p>
            </div>
          </div>
          <div className={cn(
            "w-6 h-1 rounded-full bg-muted transition-all duration-200",
            isExpanded && "rotate-180"
          )} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 max-h-[40vh]">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/20">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Search content with natural language..."
                className="glass border-primary/20 focus:border-primary/40 pr-12"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              onClick={handleVoiceToggle}
              variant="outline"
              size="sm"
              className={cn(
                "glass hover-glow transition-all duration-200",
                isListening && "bg-neon-magenta/20 border-neon-magenta/40"
              )}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-neon-magenta animate-pulse" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button 
              onClick={handleSend}
              className="hover-glow"
              disabled={!inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isBot = message.sender === 'bot';

  return (
    <div className={cn(
      "flex gap-3",
      !isBot && "flex-row-reverse"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isBot ? "bg-primary/20" : "bg-accent/20"
      )}>
        {isBot ? (
          <Bot className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4 text-accent" />
        )}
      </div>
      <div className={cn(
        "max-w-[70%] p-3 rounded-2xl glass",
        isBot ? "bg-card-glass" : "bg-primary/10 border-primary/20"
      )}>
        <p className="text-sm text-foreground">{message.content}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}