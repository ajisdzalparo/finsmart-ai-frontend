import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  User,
  Send,
  Sparkles,
  MessageSquare,
  PlusCircle,
  Trash2,
  TrendingUp,
  DollarSign,
  Target,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Budget Planning Help',
    lastMessage: 'Let me help you create a budget plan...',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '2',
    title: 'Investment Advice',
    lastMessage: 'Based on your risk profile...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    title: 'Expense Analysis',
    lastMessage: "I notice you're spending a lot on...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hi! I'm your AI financial assistant. I can help you with budgeting, investment advice, expense tracking, and financial planning. What would you like to know?",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
];

const suggestedPrompts = [
  {
    icon: TrendingUp,
    text: 'Analyze my spending patterns',
    category: 'Analysis',
  },
  { icon: Target, text: 'Help me set a savings goal', category: 'Goals' },
  { icon: DollarSign, text: 'Create a monthly budget', category: 'Budget' },
  { icon: Sparkles, text: 'Investment recommendations', category: 'Invest' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] =
    useState<string>('current');

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(messageContent),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();

    if (lowercaseMessage.includes('budget')) {
      return "I'd be happy to help you create a budget! Based on your transaction history, I can see your monthly income and expenses. Let me suggest a 50/30/20 budget rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment. Would you like me to create a personalized budget based on your spending patterns?";
    } else if (lowercaseMessage.includes('invest')) {
      return "Great question about investing! Based on your current financial situation, I'd recommend starting with an emergency fund (3-6 months of expenses) before investing. For beginners, consider index funds or ETFs for diversification. Your risk tolerance and timeline are important factors. Would you like me to analyze your readiness for investing?";
    } else if (
      lowercaseMessage.includes('save') ||
      lowercaseMessage.includes('goal')
    ) {
      return "Setting savings goals is excellent for financial health! I can help you create SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). Based on your income and expenses, I can calculate how much you should save monthly to reach your target. What's your savings goal?";
    } else if (
      lowercaseMessage.includes('spending') ||
      lowercaseMessage.includes('expense')
    ) {
      return "I've analyzed your spending patterns from your transaction history. Your top spending categories are: Food & Dining (35%), Transportation (25%), and Shopping (20%). I notice some areas where you could potentially save money. Would you like specific recommendations for reducing expenses?";
    } else {
      return "I understand you're looking for financial guidance. I can help with budgeting, saving strategies, investment basics, expense tracking, and goal setting. Could you be more specific about what financial area you'd like assistance with?";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Conversation Sidebar */}
      <div className="w-80 flex flex-col">
        <Card className="h-full shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Conversations
              </CardTitle>
              <Button size="sm" variant="ghost">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {/* Current Conversation */}
                <div
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeConversation === 'current'
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveConversation('current')}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">Current Chat</h4>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {messages[messages.length - 1]?.content ||
                      'New conversation'}
                  </p>
                </div>

                {/* Previous Conversations */}
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                      activeConversation === conversation.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {conversation.title}
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(conversation.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="h-full shadow-card flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="bg-background">
                <AvatarFallback className="bg-background text-primary">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  AI Financial Assistant
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your personal finance advisor powered by AI
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-success/10 text-success"
                >
                  <div className="w-2 h-2 bg-success rounded-full mr-1" />
                  Online
                </Badge>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar
                      className={
                        message.role === 'user' ? 'bg-muted' : 'bg-background'
                      }
                    >
                      <AvatarFallback
                        className={
                          message.role === 'user'
                            ? 'bg-muted'
                            : 'bg-primary text-primary'
                        }
                      >
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] ${
                        message.role === 'user' ? 'text-right' : ''
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-background text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="bg-background">
                      <AvatarFallback className="bg-background text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {messages.length === 1 && (
                  <div className="space-y-4 mt-8">
                    <h3 className="text-sm font-medium text-muted-foreground text-center">
                      Suggested prompts to get started:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {suggestedPrompts.map((prompt, index) => {
                        const Icon = prompt.icon;
                        return (
                          <Button
                            key={index}
                            variant="outline"
                            className="h-auto p-4 justify-start hover:shadow-md transition-shadow"
                            onClick={() => handleSendMessage(prompt.text)}
                          >
                            <Icon className="h-4 w-4 mr-3 text-primary" />
                            <div className="text-left">
                              <div className="text-sm font-medium">
                                {prompt.text}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {prompt.category}
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me about your finances..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-primary shadow-primary hover:shadow-elevated"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI can make mistakes. Verify important financial decisions.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
