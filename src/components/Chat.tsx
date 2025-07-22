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
  Gift
} from 'lucide-react'

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
      content: 'Hello! I\'m your TrashNet AI Assistant. I can help you with questions about your EcoCredits, trash bins, recycling tips, and available reward schemes. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const quickQuestions = [
    { icon: TrendingUp, text: "How many credits do I have?", category: "Credits" },
    { icon: HelpCircle, text: "Where is the nearest trash bin?", category: "Bins" },
    { icon: Gift, text: "What rewards can I claim?", category: "Rewards" },
    { icon: Sparkles, text: "How do I earn more credits?", category: "Tips" }
  ]

  const mockResponses: { [key: string]: string } = {
    'credits': 'You currently have 2,847 EcoCredits! This month you\'ve earned 247 credits, which is a 12% increase from last month. You\'re doing great! 🌱',
    'bins': 'The nearest available trash bin is "Central Park Bin" (ID: A01) located just 0.2 km away. It has a 45% fill level and you can earn 15 credits for using it. Would you like directions?',
    'rewards': 'Great news! With your 2,847 credits, you can claim:\n• Bus Pass Discount (500 credits) - 20% off\n• Grocery Voucher (800 credits) - ₹100 off\n• Plant a Tree (300 credits) - Get a certificate\n\nYou need 1,353 more credits for the Movie Ticket offer.',
    'earn': 'Here are the best ways to earn more EcoCredits:\n• Plastic bottles: 15 credits each\n• Aluminum cans: 20 credits each\n• Glass bottles: 25 credits each\n• Paper items: 10 credits each\n\nBonus tip: Complete your monthly goal (200 items) for a 200 credit bonus! 🎯',
    'recycling': 'Here are some recycling tips:\n• Clean containers before disposal\n• Separate materials properly\n• Check the recycling codes\n• Remove caps and lids when required\n• Avoid contaminated items\n\nProper sorting earns you bonus credits!',
    'impact': 'Your environmental impact so far:\n• 12.3 trees saved 🌳\n• 234L water conserved 💧\n• 89 kWh energy saved ⚡\n• 48.2 kg CO₂ prevented 🌍\n\nEvery item you recycle makes a difference!'
  }

  const getResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('credit')) return mockResponses.credits
    if (lowerMessage.includes('bin') || lowerMessage.includes('nearest') || lowerMessage.includes('location')) return mockResponses.bins
    if (lowerMessage.includes('reward') || lowerMessage.includes('scheme') || lowerMessage.includes('claim')) return mockResponses.rewards
    if (lowerMessage.includes('earn') || lowerMessage.includes('more')) return mockResponses.earn
    if (lowerMessage.includes('recycle') || lowerMessage.includes('tip')) return mockResponses.recycling
    if (lowerMessage.includes('impact') || lowerMessage.includes('environment')) return mockResponses.impact
    
    return 'I understand you\'re asking about TrashNet! I can help with information about EcoCredits, trash bins, rewards, and recycling tips. Could you please be more specific about what you\'d like to know?'
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getResponse(inputMessage),
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <span>TrashNet AI Assistant</span>
        </h1>
        <p className="text-muted-foreground">
          Powered by Gemini 2.0 Flash • Get instant help with credits, bins, and rewards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="shadow-card h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span>Chat</span>
                <Badge variant="outline" className="ml-auto">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
            </CardHeader>

            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-primary text-primary-foreground' 
                        : 'bg-secondary'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${
                      message.type === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-primary text-primary-foreground ml-auto'
                          : 'bg-gradient-card border'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="p-3 rounded-lg bg-gradient-card border">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask me about your credits, nearby bins, or rewards..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isTyping}
                  className="shadow-eco"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                <span className="text-sm font-medium">Gemini 2.0 Flash</span>
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

export default Chat