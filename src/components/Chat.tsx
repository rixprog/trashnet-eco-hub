// Chat.tsx
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Gift,
  Wifi, // Added for connection status icon
  WifiOff // Added for connection status icon
} from 'lucide-react'

// Assuming your backend URL
const API_BASE_URL = 'http://localhost:8000'; // Make sure this matches your FastAPI server

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your TrashNet AI Assistant, powered by Gemini 1.5 Flash. I can help you with questions about your EcoCredits, trash bins, recycling tips, and more. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isApiConnected, setIsApiConnected] = useState<boolean | null>(null); // null for initial, true/false after attempt
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Hardcode a user ID for demonstration with the backend
  const userId = "user1";

  // Effect to scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Initial connection check to the API
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Attempt to fetch a simple endpoint to check connectivity
        const response = await fetch(`${API_BASE_URL}/admin/bins-data`); // Use an existing, light endpoint
        if (response.ok) {
          setIsApiConnected(true);
        } else {
          setIsApiConnected(false);
        }
      } catch (error) {
        console.error("API connection check failed:", error);
        setIsApiConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage: Message = {
      id: String(messages.length + 1),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/gemini-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, message: newUserMessage.content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse: Message = {
        id: String(messages.length + 2),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantResponse]);
      setIsApiConnected(true); // Confirm connection if successful
    } catch (error) {
      console.error('Error fetching from Gemini API:', error);
      const errorMessage: Message = {
        id: String(messages.length + 2),
        type: 'assistant',
        content: "I'm sorry, I couldn't connect to the AI assistant right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsApiConnected(false); // Mark as disconnected if error
    } finally {
      setIsTyping(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isTyping) {
      handleSendMessage();
    }
  };

  // Keep quickQuestions but remove their direct mock responses, now AI handles
  const quickQuestions = [
    { icon: TrendingUp, text: "How many credits do I have?", category: "Credits" },
    { icon: HelpCircle, text: "Where is the nearest trash bin?", category: "Bins" },
    { icon: Gift, text: "What rewards can I claim?", category: "Rewards" },
    { icon: Sparkles, text: "How do I earn more credits?", category: "Tips" }
  ]

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
    inputRef.current?.focus()
  }

  // No longer needed since we are fetching from backend
  // const getResponse = (message: string): string => { ... }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background"> {/* Adjusted height */}
      <div className="max-w-4xl mx-auto flex-1 w-full p-4 flex flex-col">
        <Card className="flex-1 flex flex-col shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <span>AI Assistant</span>
            </CardTitle>
            {isApiConnected !== null && (
              <Badge variant={isApiConnected ? "success" : "destructive"}>
                {isApiConnected ? (
                  <Wifi className="h-4 w-4 mr-1" />
                ) : (
                  <WifiOff className="h-4 w-4 mr-1" />
                )}
                {isApiConnected ? "Online" : "Offline"}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 pt-0">
            <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={ `max-w-[70%] p-3 rounded-lg shadow-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p>{message.content}</p>
                      <span className="block text-xs text-right opacity-75 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] p-3 rounded-lg shadow-sm bg-muted text-muted-foreground">
                      <p className="animate-pulse">Assistant is typing...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                placeholder="Ask me anything about TrashNet..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping || !isApiConnected}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={isTyping || !isApiConnected}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* This div will hold the main content areas (cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Quick Questions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Quick Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question.text)}
                    className="w-full text-left p-3 rounded-lg border hover:shadow-card transition-smooth bg-gradient-card"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <question.icon className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="text-xs">
                        {question.category}
                      </Badge>
                    </div>
                    <p className="text-sm">{question.text}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">AI Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Credit balance & history</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Nearest bin locations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Available rewards</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Recycling tips & guides</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Environmental impact</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Scheme recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Connection Status */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">Gemini 1.5 Flash</span> {/* Updated to 1.5 Flash */}
                </div>
                <p className="text-xs text-muted-foreground">
                  Connected and ready to help with all your TrashNet queries
                </p>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

export default Chat;