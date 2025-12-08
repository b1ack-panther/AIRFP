/**
 * Create RFP Screen (CreateRFP.tsx)
 * Purpose: Convert natural language input into structured RFP using AI
 * 
 * Layout: Two-column
 * - Left: Chat interface for natural language input
 * - Right: Structured RFP preview (read-only)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Package, DollarSign, Truck, CreditCard, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface StructuredRFP {
  items: { name: string; quantity: number; specifications: string }[];
  budget: string;
  deliveryTimeline: string;
  paymentTerms: string;
  warranty: string;
}

const CreateRFP = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Hello! I\'m your AI procurement assistant. Describe what you need to procure, and I\'ll help you create a structured RFP.\n\nFor example: "I need 50 laptops for our engineering team with 16GB RAM and 512GB SSD, delivery within 30 days, budget around $100,000"',
    },
  ]);
  const [structuredRFP, setStructuredRFP] = useState<StructuredRFP | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    // TODO: API call to AI service for RFP generation
    // Simulating AI response with mock data
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'I\'ve analyzed your requirements and created a structured RFP. You can see the details on the right panel. Would you like to make any adjustments?',
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      
      // Mock structured RFP data
      setStructuredRFP({
        items: [
          { name: 'Dell XPS 15 Laptop', quantity: 50, specifications: '16GB RAM, 512GB SSD, Intel i7' },
          { name: '27" 4K Monitor', quantity: 50, specifications: 'USB-C, Height adjustable' },
          { name: 'Wireless Keyboard & Mouse', quantity: 50, specifications: 'Bluetooth, Ergonomic' },
        ],
        budget: '$150,000',
        deliveryTimeline: '30 days from order',
        paymentTerms: 'Net 30 after delivery',
        warranty: '3 years manufacturer warranty',
      });
      
      setIsGenerating(false);
    }, 1500);
  };

  const handleConfirmRFP = () => {
    // TODO: Save RFP to backend
    navigate('/rfp/rfp-new');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex animate-fade-in">
      {/* Left Column - Chat Interface */}
      <div className="flex-1 flex flex-col border-r border-border">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI RFP Assistant</h2>
            <p className="text-sm text-muted-foreground">Describe your procurement needs</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  message.role === 'user'
                    ? 'bg-chat-user text-chat-user-foreground rounded-br-md'
                    : 'bg-chat-ai text-chat-ai-foreground rounded-bl-md'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-chat-ai text-chat-ai-foreground rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Generating RFP...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Describe what you need to procure..."
              className="flex-1 min-h-[60px] max-h-[120px] px-4 py-3 bg-secondary border-0 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
            />
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="self-end h-[60px] px-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Right Column - Structured RFP Preview */}
      <div className="hidden lg:flex lg:w-[480px] flex-col bg-muted/30">
        {/* Preview Header */}
        <div className="px-6 py-4 border-b border-border bg-card">
          <h2 className="font-semibold text-foreground">Structured RFP Preview</h2>
          <p className="text-sm text-muted-foreground">AI-extracted requirements</p>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {structuredRFP ? (
            <div className="space-y-6 animate-fade-in">
              {/* Items */}
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground">Items</h3>
                </div>
                <div className="space-y-3">
                  {structuredRFP.items.map((item, i) => (
                    <div key={i} className="pl-4 border-l-2 border-primary/30">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} • {item.specifications}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground">Budget</h3>
                </div>
                <p className="text-lg font-semibold text-accent">{structuredRFP.budget}</p>
              </div>

              {/* Delivery Timeline */}
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground">Delivery Timeline</h3>
                </div>
                <p className="text-sm text-foreground">{structuredRFP.deliveryTimeline}</p>
              </div>

              {/* Payment Terms */}
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground">Payment Terms</h3>
                </div>
                <p className="text-sm text-foreground">{structuredRFP.paymentTerms}</p>
              </div>

              {/* Warranty */}
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground">Warranty</h3>
                </div>
                <p className="text-sm text-foreground">{structuredRFP.warranty}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-foreground mb-2">No RFP generated yet</h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Describe your procurement requirements in the chat, and the AI will generate a structured RFP
              </p>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        {structuredRFP && (
          <div className="p-4 border-t border-border bg-card">
            <button
              onClick={handleConfirmRFP}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors"
            >
              <Check className="h-5 w-5" />
              Confirm & Save RFP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRFP;
